const ORACLE_API_URL = 'http://localhost:3000/api';

const getCacheKey = (endpoint, params) => `zcore_cache_${endpoint}_${JSON.stringify(params || {})}`;

const saveToCache = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        localStorage.setItem('zcore_last_sync', new Date().toISOString());
    } catch (e) {
        console.warn('Cache save failed (Storage full?):', e);
    }
};

const getFromCache = (key) => {
    try {
        const cached = localStorage.getItem(key);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        return null;
    }
};

/**
 * Executes a dynamic SQL query on the Oracle database via the API gateway.
 */
export const executeOracleQuery = async (sql, binds = []) => {
    const cacheKey = getCacheKey('query', { sql, binds });
    try {
        const response = await fetch(`${ORACLE_API_URL}/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sql, binds })
        });
        const data = await response.json();
        if (data.success) {
            const result = { rows: data.rows, metaData: data.metaData };
            saveToCache(cacheKey, result);
            return result;
        } else {
            throw new Error(data.error || 'Unknown Oracle error');
        }
    } catch (error) {
        console.warn('Network fetch failed for executeOracleQuery, trying cache...', error.message);
        const cachedResult = getFromCache(cacheKey);
        if (cachedResult) {
            return { ...cachedResult, _isCached: true };
        }
        throw new Error('Offline and no cache available for this query.');
    }
};

/**
 * Checks the health and connectivity of the Oracle API.
 */
export const checkOracleHealth = async () => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/health`);
        return await response.json();
    } catch (error) {
        return { status: 'offline', error: error.message };
    }
};

/**
 * Fetches the total monthly billing (faturamento líquido) from Oracle.
 */
export const fetchMonthlyBilling = async () => {
    const sql = `
        SELECT SUM(VALCONT) - SUM(DEVOLUCOES) as faturamento_total
        FROM VIASOFTFISCAL.FFATURAMENTO 
        WHERE ANO = EXTRACT(YEAR FROM SYSDATE) 
        AND MES = EXTRACT(MONTH FROM SYSDATE)
    `;
    try {
        const result = await executeOracleQuery(sql);
        return result.rows[0]?.faturamento_total || 0;
    } catch (e) {
        return 0; // Fallback handled inside executeOracleQuery
    }
};

/**
 * Fetches the performance of sellers for the current month.
 */
export const fetchSellersPerformance = async (estab) => {
    const cacheKey = getCacheKey('sellers-performance', { estab });
    try {
        const url = new URL(`${ORACLE_API_URL}/sellers-performance`);
        if (estab) url.searchParams.append('estab', estab);

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        saveToCache(cacheKey, data);
        return data;
    } catch (error) {
        console.warn('Network fetch failed for fetchSellersPerformance, trying cache...', error.message);
        const cachedData = getFromCache(cacheKey);
        if (cachedData) return { ...cachedData, _isCached: true };
        throw error;
    }
};

/**
 * Fetches detailed KPIs.
 */
export const fetchDetailedKPIs = async (estab) => {
    const cacheKey = getCacheKey('kpis', { estab });
    try {
        const url = new URL(`${ORACLE_API_URL}/kpis`);
        if (estab) url.searchParams.append('estab', estab);

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        saveToCache(cacheKey, data);
        return data;
    } catch (error) {
        console.warn('Network fetch failed for fetchDetailedKPIs, trying cache...', error.message);
        const cachedData = getFromCache(cacheKey);
        if (cachedData) return { ...cachedData, _isCached: true };
        throw error;
    }
};

/**
 * Fetches the synthetic sales summary. Use dedicated API endpoint: GET /api/synthetic-sales-summary
 */
export const fetchSyntheticSalesSummary = async (dtini, dtfim, estab) => {
    const cacheKey = getCacheKey('synthetic', { dtini, dtfim, estab });
    try {
        const url = new URL(`${ORACLE_API_URL}/synthetic-sales-summary`);
        if (dtini) url.searchParams.append('dtini', dtini);
        if (dtfim) url.searchParams.append('dtfim', dtfim);
        if (estab) url.searchParams.append('estab', estab);

        const response = await fetch(url);
        if (!response.ok) throw new Error('API Error');
        const data = await response.json();
        saveToCache(cacheKey, data);
        return data;
    } catch (error) {
        console.warn('Network fetch failed for fetchSyntheticSalesSummary, trying cache...', error.message);
        const cachedData = getFromCache(cacheKey);
        if (cachedData) {
            // Se for array, injetamos um _isCached no array obj
            if (Array.isArray(cachedData)) cachedData._isCached = true;
            return cachedData;
        }
        throw new Error('Você está offline e os dados não estão em cache.');
    }
};
/**
 * Fetches the client summary (Financeiro).
 * @param {string|number} idpess - Client ID (optional)
 */
export const fetchClientSummary = async (idpess) => {
    try {
        const url = new URL(`${ORACLE_API_URL}/client-summary`);
        if (idpess) url.searchParams.append('idpess', idpess);

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Client Summary Error:', error.message);
        throw error;
    }
};

/**
 * Fetches the 360-degree client intelligence (Radar, Benchmarks, Churn).
 * @param {string|number} idpess - Client ID
 */
export const fetchClientIntelligence = async (idpess) => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/client-intelligence/${idpess}`);
        return await response.json();
    } catch (error) {
        console.error('Client Intelligence Error:', error.message);
        throw error;
    }
};

/**
 * Searches for clients by name or ID.
 * @param {string} query - Name or ID to search for
 */
export const searchClients = async (query) => {
    try {
        const url = new URL(`${ORACLE_API_URL}/search-clients`);
        url.searchParams.append('q', query);

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Search Clients Error:', error.message);
        throw error;
    }
};

/**
 * Searches for products by name, ID, barcode or brand.
 * @param {string|object} params - Query term or object with {q, brand, id}
 */
export const searchProducts = async (params) => {
    try {
        const url = new URL(`${ORACLE_API_URL}/search-products`);

        if (typeof params === 'string') {
            url.searchParams.append('q', params);
        } else if (params) {
            if (params.q) url.searchParams.append('q', params.q);
            if (params.brand) url.searchParams.append('brand', params.brand);
            if (params.id) url.searchParams.append('id', params.id);
        }

        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error('Search Products Error:', error.message);
        return [];
    }
};


/**
 * Fetches the cached dashboard data via n8n sync schedule.
 */
export const fetchCachedDashboard = async () => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/cached-dashboard`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Cached Dashboard Fetch Error:", error);
        return { data: null, lastSync: null };
    }
};
