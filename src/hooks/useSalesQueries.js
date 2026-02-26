import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyBilling, fetchSellersPerformance, fetchDetailedKPIs } from '../services/oracleService';

export const useMonthlyBillingQuery = () => {
    return useQuery({
        queryKey: ['sales', 'monthly-billing'],
        queryFn: fetchMonthlyBilling,
        staleTime: 1000 * 60 * 5, // 5 minutes fresh
    });
};

export const useSellersPerformanceQuery = () => {
    return useQuery({
        queryKey: ['sales', 'sellers-performance'],
        queryFn: fetchSellersPerformance,
        staleTime: 1000 * 60 * 5,
    });
};

export const useDetailedKPIsQuery = () => {
    return useQuery({
        queryKey: ['sales', 'detailed-kpis'],
        queryFn: fetchDetailedKPIs,
        staleTime: 1000 * 60 * 5,
    });
};
