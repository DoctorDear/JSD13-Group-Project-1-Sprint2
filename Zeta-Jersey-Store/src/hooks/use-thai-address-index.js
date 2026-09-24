'use client';
import { useCallback, useEffect, useState } from 'react';
import { getDefaultIndexIfLoaded, loadDefaultIndex } from 'thaizip/data';
/**
 * Loads the bundled Thai address index once and exposes loading/error state.
 * `retry()` re-attempts a failed load.
 */
export function useThaiAddressIndex() {
    // Seed from the cache synchronously: loadDefaultIndex() is async even on a hit,
    // so without this every remount of an already-warm page renders one frame of
    // loading skeleton before settling. Null on a cold start, so the effect below
    // still does the real work.
    const [index, setIndex] = useState(() => getDefaultIndexIfLoaded());
    const [error, setError] = useState(null);
    const [generation, setGeneration] = useState(0);
    useEffect(() => {
        let active = true;
        loadDefaultIndex()
            .then((loaded) => {
            if (active)
                setIndex(loaded);
        })
            .catch((cause) => {
            if (active)
                setError(cause instanceof Error ? cause : new Error(String(cause)));
        });
        return () => {
            active = false;
        };
    }, [generation]);
    const retry = useCallback(() => {
        setError(null);
        setGeneration((current) => current + 1);
    }, []);
    return { index, error, isLoading: index === null && error === null, retry };
}
