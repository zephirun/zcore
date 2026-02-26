import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Enterprise defaults for perceived performance
            staleTime: 1000 * 60 * 2, // 2 minutes (consider fresh, don't refetch on window focus immediately)
            gcTime: 1000 * 60 * 30, // 30 minutes cache retention
            retry: (failureCount, error) => {
                // Don't retry on 401/403 or 404
                if (error.status === 401 || error.status === 403 || error.status === 404) return false;
                // Max 2 retries for other random network errors
                return failureCount < 2;
            },
            refetchOnWindowFocus: true, // Only if stale
            refetchOnMount: true,
            refetchOnReconnect: true,
        },
        mutations: {
            retry: 0, // Never auto-retry mutations to prevent duplicated destructive actions
        }
    }
});
