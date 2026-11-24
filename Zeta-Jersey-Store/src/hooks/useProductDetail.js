import { useEffect, useState } from "react";
import { api } from "../lib/api/api.js";
import {
  COLD_START_SLOW_NOTICE_DELAY_MS,
  getColdStartErrorMessage,
  isRetryableColdStartError,
  withColdStartRetry,
} from "../lib/api/coldStartRetry.js";

/**
 * Fetch product details and variants by ID with cold-start retry handling and manual retry support.
 */
export function useProductDetail(id) {
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [canRetry, setCanRetry] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleRetry = () => {
    setError(null);
    setCanRetry(false);
    setRetryAttempt(0);
    setIsWakingUp(false);
    setLoading(true);
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    const controller = new AbortController();
    const slowTimer = setTimeout(() => {
      if (!controller.signal.aborted) {
        setIsWakingUp(true);
      }
    }, COLD_START_SLOW_NOTICE_DELAY_MS);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setCanRetry(false);
        setRetryAttempt(0);
        setIsWakingUp(false);
        const data = await withColdStartRetry(
          () => api.get(`/products/${id}`, { signal: controller.signal }),
          {
            signal: controller.signal,
            onRetry: ({ attempt }) => {
              if (!controller.signal.aborted) {
                setIsWakingUp(true);
                setRetryAttempt(attempt);
              }
            },
          },
        );
        if (controller.signal.aborted) return;
        setProduct(
          data.product
            ? {
                ...data.product,
                personalizationTemplate: data.personalizationTemplate,
              }
            : null,
        );
        setVariants(data.variants || []);
      } catch (err) {
        if (!controller.signal.aborted) {
          const retryable = isRetryableColdStartError(err);
          setCanRetry(retryable || (err?.status ?? 0) >= 500);
          setError(
            retryable
              ? getColdStartErrorMessage(
                  err,
                  "Unable to load this product right now. Please try again.",
                )
              : err.message || "Product not found",
          );
        }
      } finally {
        clearTimeout(slowTimer);
        if (!controller.signal.aborted) {
          setLoading(false);
          setIsWakingUp(false);
          setRetryAttempt(0);
        }
      }
    };

    if (id) fetchProduct();
    return () => {
      clearTimeout(slowTimer);
      controller.abort();
    };
  }, [id, reloadKey]);

  return {
    product,
    setProduct,
    variants,
    loading,
    error,
    retryAttempt,
    isWakingUp,
    canRetry,
    handleRetry,
  };
}
