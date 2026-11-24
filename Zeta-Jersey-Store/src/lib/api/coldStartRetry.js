export const COLD_START_MAX_RETRIES = 3;
export const COLD_START_RETRY_DELAY_MS = 4500;
export const COLD_START_SLOW_NOTICE_DELAY_MS = 1500;
export const COLD_START_WAKING_MESSAGE =
  "Waking up the server, this may take a few seconds...";
export const RETRYABLE_STATUS_CODES = new Set([502, 503, 504]);

function createAbortError() {
  if (typeof DOMException !== "undefined") {
    return new DOMException("The operation was aborted.", "AbortError");
  }
  return Object.assign(new Error("Aborted"), { name: "AbortError" });
}

export function isAbortError(error) {
  return Boolean(error && error.name === "AbortError");
}

/**
 * Returns true for errors caused by a cold-starting or unreachable backend
 * (network errors, status 0, or 502/503/504 gateway errors).
 */
export function isRetryableColdStartError(error) {
  if (!error || isAbortError(error)) return false;

  if (typeof error.status === "number") {
    return error.status === 0 || RETRYABLE_STATUS_CODES.has(error.status);
  }

  return error instanceof TypeError || error.code === "network";
}

export function sleepWithSignal(ms, signal) {
  if (signal?.aborted) {
    return Promise.reject(createAbortError());
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

/**
 * Retries idempotent read tasks on cold-start network or 502/503/504 errors.
 */
export async function withColdStartRetry(
  task,
  {
    maxRetries = COLD_START_MAX_RETRIES,
    delayMs = COLD_START_RETRY_DELAY_MS,
    signal,
    onRetry,
  } = {},
) {
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    if (signal?.aborted) {
      throw createAbortError();
    }

    try {
      return await task(attempt);
    } catch (error) {
      // api.js maps aborted fetches to ApiError({ status: 0, code: "network" }),
      // so check signal.aborted before evaluating retryability.
      if (signal?.aborted || isAbortError(error)) {
        throw error;
      }

      if (attempt < maxRetries && isRetryableColdStartError(error)) {
        onRetry?.({
          attempt: attempt + 1,
          maxRetries,
          delayMs,
          error,
        });
        await sleepWithSignal(delayMs, signal);
        continue;
      }

      throw error;
    }
  }

  return undefined;
}

export async function fetchJsonWithRetry(
  url,
  {
    fetchOptions,
    maxRetries = COLD_START_MAX_RETRIES,
    delayMs = COLD_START_RETRY_DELAY_MS,
    signal,
    onRetry,
    errorMessage,
  } = {},
) {
  return withColdStartRetry(
    async () => {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
      });

      if (!response.ok) {
        throw Object.assign(
          new Error(errorMessage || `Request failed (${response.status})`),
          { status: response.status },
        );
      }

      return response.json();
    },
    { maxRetries, delayMs, signal, onRetry },
  );
}

export function getColdStartErrorMessage(
  error,
  fallback = "Unable to load products right now. Please try again.",
) {
  if (isRetryableColdStartError(error)) {
    return "Unable to reach the server right now. It may still be waking up — please try again.";
  }

  return error?.message || fallback;
}

export function getLoadingStatusMessage({
  isWakingUp = false,
  retryAttempt = 0,
  maxRetries = COLD_START_MAX_RETRIES,
  defaultMessage = "Loading products...",
} = {}) {
  if (retryAttempt > 0) {
    return `${COLD_START_WAKING_MESSAGE} (Retry ${retryAttempt}/${maxRetries})`;
  }

  if (isWakingUp) {
    return COLD_START_WAKING_MESSAGE;
  }

  return defaultMessage;
}
