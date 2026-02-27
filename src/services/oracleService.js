const ORACLE_API_URL = 'http://localhost:3000/api';

/**
 * Executes a dynamic SQL query on the Oracle database via the API gateway.
 * @param {string} sql - The SQL query to execute.
 * @param {Array|Object} binds - Binds/parameters for the query.
 * @returns {Promise<Object>} - The query results.
 */
export const executeOracleQuery = async (sql, binds = [], companyId = 'madville') => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/${companyId}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql, binds })
        });

        const data = await response.json();

        if (data.success) {
            return {
                rows: data.rows,
                metaData: data.metaData
            };
        } else {
            throw new Error(data.error || 'Unknown Oracle error');
        }
    } catch (error) {
        console.error('Oracle Service Error:', error.message);
        throw error;
    }
};

/**
 * Checks the health and connectivity of the Oracle API.
 * @returns {Promise<Object>} - Health status.
 */
export const checkOracleHealth = async (companyId = 'madville') => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/${companyId}/health`);
        return await response.json();
    } catch (error) {
        return { status: 'offline', error: error.message };
    }
};

/**
 * Fetches the total monthly billing (faturamento líquido) from Oracle.
 * Net = VALCONT - DEVOLUCOES
 */
export const fetchMonthlyBilling = async (companyId = 'madville') => {
    const sql = `
        SELECT SUM(VALCONT) - SUM(DEVOLUCOES) as faturamento_total
        FROM VIASOFTFISCAL.FFATURAMENTO 
        WHERE ANO = EXTRACT(YEAR FROM SYSDATE) 
        AND MES = EXTRACT(MONTH FROM SYSDATE)
    `;
    const result = await executeOracleQuery(sql, [], companyId);
    return result.rows[0]?.faturamento_total || 0;
};

/**
 * Fetches the performance of sellers for the current month.
 * Uses dedicated API endpoint: GET /api/sellers-performance
 */
export const fetchSellersPerformance = async (companyId = 'madville') => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/${companyId}/sellers-performance`);
        return await response.json();
    } catch (error) {
        console.error('Sellers Performance Error:', error.message);
        throw error;
    }
};

/**
 * Fetches detailed KPIs. Uses dedicated API endpoint: GET /api/kpis
 */
export const fetchDetailedKPIs = async (companyId = 'madville') => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/${companyId}/kpis`);
        return await response.json();
    } catch (error) {
        console.error('KPIs Error:', error.message);
        throw error;
    }
};
/**
 * Fetches the synthetic sales summary. Uses dedicated API endpoint: GET /api/synthetic-sales-summary
 * @param {string} dtini - Start date (YYYY-MM-DD)
 * @param {string} dtfim - End date (YYYY-MM-DD)
 */
export const fetchSyntheticSalesSummary = async (dtini, dtfim, companyId = 'madville') => {
    try {
        const url = new URL(`${ORACLE_API_URL}/${companyId}/synthetic-sales-summary`);
        if (dtini) url.searchParams.append('dtini', dtini);
        if (dtfim) url.searchParams.append('dtfim', dtfim);

        const response = await fetch(url.toString());
        return await response.json();
    } catch (error) {
        console.error('Synthetic Sales Summary Error:', error.message);
        throw error;
    }
};
/**
 * Fetches the client summary (Financeiro).
 * @param {string|number} idpess - Client ID (optional)
 */
export const fetchClientSummary = async (idpess, companyId = 'madville') => {
    try {
        const url = new URL(`${ORACLE_API_URL}/${companyId}/client-summary`);
        if (idpess) url.searchParams.append('idpess', idpess);

        const response = await fetch(url.toString());
        return await response.json();
    } catch (error) {
        console.error('Client Summary Error:', error.message);
        throw error;
    }
};

/**
 * Searches for clients by name or ID.
 * @param {string} query - Name or ID to search for
 */
export const searchClients = async (query, companyId = 'madville') => {
    try {
        const url = new URL(`${ORACLE_API_URL}/${companyId}/search-clients`);
        url.searchParams.append('q', query);

        const response = await fetch(url.toString());
        return await response.json();
    } catch (error) {
        console.error('Search Clients Error:', error.message);
        throw error;
    }
};

/**
 * Fetches the cached dashboard data via n8n sync schedule.
 */
export const fetchCachedDashboard = async (companyId = 'madville') => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/${companyId}/cached-dashboard`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Cached Dashboard Fetch Error:", error);
        return { data: null, lastSync: null };
    }
};
