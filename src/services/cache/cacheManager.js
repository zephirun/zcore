const PREFIX = 'zcore_cache';

export const cacheManager = {
    set(companyId, endpoint, data) {
        const key = `${PREFIX}:${companyId}:${endpoint}`;
        localStorage.setItem(key, JSON.stringify({
            data,
            savedAt: new Date().toISOString(),
        }));
    },

    get(companyId, endpoint) {
        const raw = localStorage.getItem(`${PREFIX}:${companyId}:${endpoint}`);
        return raw ? JSON.parse(raw) : null;
    },

    has(companyId, endpoint) {
        return !!localStorage.getItem(`${PREFIX}:${companyId}:${endpoint}`);
    },

    clear(companyId) {
        Object.keys(localStorage)
            .filter(k => k.startsWith(`${PREFIX}:${companyId}:`))
            .forEach(k => localStorage.removeItem(k));
    },

    clearAll() {
        Object.keys(localStorage)
            .filter(k => k.startsWith(`${PREFIX}:`))
            .forEach(k => localStorage.removeItem(k));
    },

    list(companyId) {
        return Object.keys(localStorage)
            .filter(k => k.startsWith(`${PREFIX}:${companyId}:`))
            .map(k => ({
                key: k.replace(`${PREFIX}:${companyId}:`, ''),
                ...JSON.parse(localStorage.getItem(k)),
            }));
    },
};
