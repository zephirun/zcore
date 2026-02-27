import { cacheManager } from '../cache/cacheManager';

/**
 * Universal data fetcher with automatic failure detection.
 *
 * - LIVE mode: fetch from API, cache on success, call onFailure + fallback to cache on error.
 * - CACHE mode: read from localStorage immediately, no network call.
 *
 * onFailure and onSuccess are injected by useApiData — do not call manually.
 */
export async function fetchData({
    companyId,
    apiBase,
    endpoint,
    dbMode,
    onFailure,
    onSuccess,
}) {
    const cacheKey = endpoint
        .replace(/\//g, '_')
        .replace(/\?.*/, '');

    // ── CACHE MODE: DB already known to be offline ────────────────────────────
    if (dbMode === 'cache') {
        const cached = cacheManager.get(companyId, cacheKey);
        if (cached) {
            return { data: cached.data, fromCache: true, error: null };
        }
        return { data: null, fromCache: true, error: 'sem_cache' };
    }

    // ── LIVE MODE: try the real API ───────────────────────────────────────────
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const res = await fetch(`${apiBase}/${endpoint}`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        // Success → update cache + notify context
        cacheManager.set(companyId, cacheKey, data);
        onSuccess?.();

        return { data, fromCache: false, error: null };

    } catch (err) {
        // Failure → notify context to switch to cache mode
        onFailure?.(apiBase);

        // Try returning cached fallback — user sees stale but valid data
        const cached = cacheManager.get(companyId, cacheKey);
        if (cached) {
            return { data: cached.data, fromCache: true, error: null };
        }

        return { data: null, fromCache: false, error: err.message };
    }
}
