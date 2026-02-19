const ORACLE_API_URL = 'http://localhost:3001/api';

/**
 * Executes a dynamic SQL query on the Oracle database via the API gateway.
 * @param {string} sql - The SQL query to execute.
 * @param {Array|Object} binds - Binds/parameters for the query.
 * @returns {Promise<Object>} - The query results.
 */
export const executeOracleQuery = async (sql, binds = []) => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/query`, {
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
 * Net = VALCONT - DEVOLUCOES
 */
export const fetchMonthlyBilling = async () => {
    const sql = `
        SELECT SUM(VALCONT) - SUM(DEVOLUCOES) as faturamento_total
        FROM VIASOFTFISCAL.FFATURAMENTO 
        WHERE ANO = EXTRACT(YEAR FROM SYSDATE) 
        AND MES = EXTRACT(MONTH FROM SYSDATE)
    `;
    const result = await executeOracleQuery(sql);
    return result.rows[0]?.faturamento_total || 0;
};

/**
 * Fetches the performance of sellers for the current month.
 * Uses dedicated API endpoint: GET /api/sellers-performance
 */
export const fetchSellersPerformance = async () => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/sellers-performance`);
        return await response.json();
    } catch (error) {
        console.error('Sellers Performance Error:', error.message);
        throw error;
    }
};

/**
 * Fetches detailed KPIs. Uses dedicated API endpoint: GET /api/kpis
 */
export const fetchDetailedKPIs = async () => {
    try {
        const response = await fetch(`${ORACLE_API_URL}/kpis`);
        return await response.json();
    } catch (error) {
        console.error('KPIs Error:', error.message);
        throw error;
    }
};
