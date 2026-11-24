import test from "node:test";
import assert from "node:assert/strict";
import {
  COLD_START_WAKING_MESSAGE,
  fetchJsonWithRetry,
  getColdStartErrorMessage,
  getLoadingStatusMessage,
  sleepWithSignal,
  withColdStartRetry,
} from "./coldStartRetry.js";

test("withColdStartRetry retries network TypeError up to 3 times and succeeds on 4th attempt", async () => {
  let attempts = 0;
  const retryAttempts = [];

  const result = await withColdStartRetry(
    async () => {
      attempts += 1;
      if (attempts < 4) {
        throw new TypeError("Failed to fetch");
      }
      return { ok: true };
    },
    {
      delayMs: 1,
      onRetry: ({ attempt }) => retryAttempts.push(attempt),
    },
  );

  assert.deepEqual(result, { ok: true });
  assert.equal(attempts, 4);
  assert.deepEqual(retryAttempts, [1, 2, 3]);
});

test("fetchJsonWithRetry retries 502, 503, and 504 and stops after maxRetries", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  const statuses = [502, 503, 504, 503];
  const retryAttempts = [];

  globalThis.fetch = async () => {
    const status = statuses[calls];
    calls += 1;
    return {
      ok: false,
      status,
      json: async () => ({}),
    };
  };

  try {
    await assert.rejects(
      fetchJsonWithRetry("https://example.test/api/v1/products", {
        delayMs: 1,
        errorMessage: "Unable to load products",
        onRetry: ({ attempt }) => retryAttempts.push(attempt),
      }),
      (error) => error.message === "Unable to load products" && error.status === 503,
    );
    assert.equal(calls, 4);
    assert.deepEqual(retryAttempts, [1, 2, 3]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("withColdStartRetry does not retry 404 or 500 errors", async () => {
  for (const status of [404, 500]) {
    let calls = 0;
    let retried = false;

    await assert.rejects(
      withColdStartRetry(
        async () => {
          calls += 1;
          throw Object.assign(new Error(`HTTP ${status}`), { status });
        },
        {
          delayMs: 1,
          onRetry: () => {
            retried = true;
          },
        },
      ),
      (error) => error.status === status,
    );

    assert.equal(calls, 1);
    assert.equal(retried, false);
  }
});

test("withColdStartRetry stops immediately when aborted even if task wraps AbortError as status 0", async () => {
  const controller = new AbortController();
  let calls = 0;
  let retried = false;

  await assert.rejects(
    withColdStartRetry(
      async () => {
        calls += 1;
        controller.abort();
        throw Object.assign(
          new Error("Network error — check your connection and try again."),
          { status: 0, code: "network" },
        );
      },
      {
        delayMs: 100,
        signal: controller.signal,
        onRetry: () => {
          retried = true;
        },
      },
    ),
    (error) => error.code === "network",
  );

  assert.equal(calls, 1);
  assert.equal(retried, false);
});

test("sleepWithSignal aborts cleanly mid-sleep", async () => {
  const controller = new AbortController();
  const promise = sleepWithSignal(5000, controller.signal);
  controller.abort();

  await assert.rejects(promise, (error) => error.name === "AbortError");
});

test("getColdStartErrorMessage and getLoadingStatusMessage return friendly strings", () => {
  const wakingErrorMessage = getColdStartErrorMessage(new TypeError("Failed to fetch"));
  assert.equal(
    wakingErrorMessage,
    "Unable to reach the server right now. It may still be waking up — please try again.",
  );
  assert.equal(
    getColdStartErrorMessage(Object.assign(new Error("Product not found"), { status: 404 })),
    "Product not found",
  );

  assert.equal(getLoadingStatusMessage({ defaultMessage: "Loading..." }), "Loading...");
  assert.equal(
    getLoadingStatusMessage({ isWakingUp: true }),
    COLD_START_WAKING_MESSAGE,
  );
  assert.equal(
    getLoadingStatusMessage({ isWakingUp: true, retryAttempt: 2, maxRetries: 3 }),
    `${COLD_START_WAKING_MESSAGE} (Retry 2/3)`,
  );
});
