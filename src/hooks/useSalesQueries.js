import { useQuery } from '@tanstack/react-query';
import {
    fetchMonthlyBilling,
    fetchSellersPerformance,
    fetchDetailedKPIs,
    fetchClientIntelligence,
    searchProducts
} from '../services/oracleService';

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

export const useClientIntelligenceQuery = (idpess) => {
    return useQuery({
        queryKey: ['sales', 'client-intelligence', idpess],
        queryFn: () => fetchClientIntelligence(idpess),
        enabled: !!idpess,
        staleTime: 1000 * 60 * 5,
    });
};

export const useSearchProductsQuery = (params) => {
    const isString = typeof params === 'string';
    const q = isString ? params : params?.q;
    const brand = isString ? '' : params?.brand;
    const id = isString ? '' : params?.id;

    return useQuery({
        queryKey: ['sales', 'search-products', q, brand, id],
        queryFn: () => searchProducts(params),
        enabled: (q?.length >= 2) || (brand?.length >= 2) || (id?.length >= 2) || (!!q && /^[0-9]+$/.test(q)) || (!!id && /^[0-9]+$/.test(id)),
        staleTime: 1000 * 60 * 10,
    });
};

