import { useState, useEffect } from 'react';
import { useCompany } from '../context/CompanyContext';
import { useDbMode } from '../context/DbModeContext';
import { fetchData } from '../services/api/index';

/**
 * Universal data hook — fully automatic cache handling.
 *
 * Usage:
 *   const { data, loading } = useApiData('faturamento/trimestral')
 *
 * fromCache is returned but intentionally not displayed in UI —
 * the system is fully transparent to the user.
 *
 * Re-fetches when: activeCompany, dbMode, endpoint, or extra deps change.
 */
export function useApiData(endpoint, deps = []) {
    const { activeCompany } = useCompany();
    const { dbMode, handleDbFailure, handleDbSuccess } = useDbMode();

    const [state, setState] = useState({
        data: null,
        loading: true,
        error: null,
        fromCache: false,
    });

    useEffect(() => {
        if (!endpoint) return;

        setState(s => ({ ...s, loading: true }));

        fetchData({
            companyId: activeCompany.id,
            apiBase: activeCompany.apiBase,
            endpoint,
            dbMode,
            onFailure: handleDbFailure, // auto-switch to cache on network error
            onSuccess: handleDbSuccess, // confirm live on success
        }).then(result => {
            setState({
                data: result.data,
                loading: false,
                // 'sem_cache' is an internal sentinel — don't surface to UI
                error: result.error === 'sem_cache' ? null : result.error,
                fromCache: result.fromCache,
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, activeCompany.id, dbMode, ...deps]);

    return state;
}
