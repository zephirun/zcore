import { QueryClient } from '@tanstack/react-query';

// --- Enterprise Query Keys Factory ---
export const QUERY_KEYS = {
    auth: {
        session: ['auth', 'session'],
        user: (username) => ['auth', 'user', username],
    },
    users: {
        all: ['users', 'all'],
        detail: (username) => ['users', 'detail', username],
        presence: ['users', 'presence'],
    },
    sales: {
        all: (unit) => ['sales', 'all', unit],
        quarterly: (unit, quarterIndex) => ['sales', 'quarterly', unit, quarterIndex],
        synthetic: (unit) => ['sales', 'synthetic', unit],
        intelligence: (clientId) => ['sales', 'intelligence', clientId],
    },
    clients: {
        all: (unit) => ['clients', 'all', unit],
        summary: (clientId) => ['clients', 'summary', clientId],
    },
    logistics: {
        deliveries: (unit) => ['logistics', 'deliveries', unit],
        returns: (unit) => ['logistics', 'returns', unit],
    }
};

// --- Standardized Times ---
export const STALE_TIMES = {
    DYNAMIC_FAST: 1000 * 60, // 1 minute (for volatile status like deliveries)
    STANDARD: 1000 * 60 * 5, // 5 minutes (for sales data that updates but isn't real-time)
    STATIC_SLOW: 1000 * 60 * 60 * 24, // 24 hours (for things like economic groups, rarely changing catalogs)
    USER_PREFS: Infinity // Only invalidate on manual action
};

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Enterprise defaults for perceived performance
            staleTime: STALE_TIMES.STANDARD,
            gcTime: 1000 * 60 * 30, // 30 minutes cache retention
            retry: (failureCount, error) => {
                // Don't retry on 401/403 or 404
                if (error.status === 401 || error.status === 403 || error.status === 404) return false;
                // Max 2 retries for other random network errors
                return failureCount < 2;
            },
            refetchOnWindowFocus: true, // Auto-background fresh data if stale
            refetchOnMount: true,
            refetchOnReconnect: true,
            // Prevent suspense waterfall freeze issues by default unless explicitly required
            suspense: false
        },
        mutations: {
            retry: 0, // Never auto-retry mutations to prevent duplicated destructive actions
        }
    }
});
