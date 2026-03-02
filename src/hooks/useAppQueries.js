import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS, STALE_TIMES } from '../lib/react-query';
import { useData } from '../context/DataContext';
import * as api from '../services/api';

/**
 * Enterprise Core Data Orchestrator Hooks
 * Centralizes data fetching logic, moving it away from DataContext.
 */

// --- USER QUERIES ---

export const useUsersQuery = () => {
    return useQuery({
        queryKey: QUERY_KEYS.users.all,
        queryFn: api.fetchUsers,
        staleTime: STALE_TIMES.STANDARD,
    });
};

export const useUserUpdateMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ username, updates }) => api.updateUserApi(username, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users.all });
        }
    });
};

// --- SALES QUERIES ---

/**
 * Fetches the raw sales data block for the active unit.
 * Simulates what loadServerData inside DataContext used to process,
 * but allows components to subscribe independently with automatic deduplication.
 */
export const useSalesDataQuery = (overrideUnit = null) => {
    const { activeUnit, userRole, allowedVendor } = useData();
    const targetUnit = overrideUnit || activeUnit;

    return useQuery({
        queryKey: QUERY_KEYS.sales.all(targetUnit),
        queryFn: async () => {
            const data = await api.fetchSalesData(targetUnit);

            // Client-side filtering logic migrated from Context
            if (userRole !== 'admin' && allowedVendor) {
                return data.filter(item => item.client?.vendor === allowedVendor);
            }
            return data || [];
        },
        enabled: !!targetUnit, // Only run if a unit is active
        staleTime: STALE_TIMES.STANDARD,
    });
};

/**
 * Derived hook: Provides processed quarterly data optimized by useQuery selection.
 * Prevent re-renders by doing transformation in React Query 'select'.
 */
export const useQuarterlySalesQuery = (quarterIndex) => {
    const { activeUnit } = useData();

    return useQuery({
        queryKey: QUERY_KEYS.sales.all(activeUnit), // Depends on the main sales query
        queryFn: async () => {
            // If the main query isn't cached yet, fetch it
            return await api.fetchSalesData(activeUnit);
        },
        enabled: !!activeUnit,
        staleTime: STALE_TIMES.STANDARD,
        select: (data) => {
            if (!data || data.length === 0) return [];

            const monthIndices = [
                quarterIndex * 3,
                quarterIndex * 3 + 1,
                quarterIndex * 3 + 2
            ];

            const numMonths = data[0]?.numMonths || data[0]?.months?.length || 3;

            return data.map(item => {
                let selectedMonths;

                if (numMonths >= 12) {
                    selectedMonths = [
                        item.months?.[monthIndices[0]] || { amount: 0, margin_percent: 0, deadline: 0 },
                        item.months?.[monthIndices[1]] || { amount: 0, margin_percent: 0, deadline: 0 },
                        item.months?.[monthIndices[2]] || { amount: 0, margin_percent: 0, deadline: 0 }
                    ];
                } else {
                    selectedMonths = item.months || [];
                }

                const totalAmount = selectedMonths.reduce((sum, m) => sum + (m.amount || 0), 0);
                const totalMarginRev = selectedMonths.reduce((sum, m) => sum + ((m.margin_percent || 0) * (m.amount || 0)), 0);
                const avgMargin = totalAmount ? totalMarginRev / totalAmount : 0;

                const monthsWithSales = selectedMonths.filter(m => (m.amount || 0) > 0);
                const avgDeadline = monthsWithSales.length > 0
                    ? monthsWithSales.reduce((sum, m) => sum + (m.deadline || 0), 0) / monthsWithSales.length
                    : 0;

                return {
                    client: item.client,
                    months: selectedMonths,
                    total: {
                        amount: totalAmount,
                        margin_percent: avgMargin,
                        deadline: avgDeadline
                    }
                };
            });
        }
    });
};

// --- CLIENT RECORDS QUERIES ---

export const useClientRecordsQuery = (overrideUnit = null) => {
    const { activeUnit } = useData();
    const targetUnit = overrideUnit || activeUnit;

    return useQuery({
        queryKey: QUERY_KEYS.clients.all(targetUnit),
        queryFn: () => api.fetchClientRecords(targetUnit),
        enabled: !!targetUnit,
        staleTime: STALE_TIMES.STATIC_SLOW, // Client metadata changes rarely
    });
};
