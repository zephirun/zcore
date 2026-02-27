import { useApiData } from './useApiData';

export const useMonthlyBillingQuery = () => {
    const { data, loading, error, fromCache } = useApiData('monthly-billing');
    return { data, isPending: loading, error, isFetching: loading, fromCache };
};

export const useSellersPerformanceQuery = () => {
    const { data, loading, error, fromCache } = useApiData('sellers-performance');
    return { data, isPending: loading, error, isFetching: loading, fromCache };
};

export const useDetailedKPIsQuery = () => {
    const { data, loading, error, fromCache } = useApiData('kpis');
    return { data, isPending: loading, error, isFetching: loading, fromCache };
};
