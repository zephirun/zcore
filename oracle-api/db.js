require('dotenv').config();
const oracledb = require('oracledb');
const path = require('path');

// Initialize Oracle Thick Mode for native encryption support (ORA-12660)
try {
    oracledb.initOracleClient({ libDir: path.join(__dirname, 'client', 'instantclient_21_21') });
    console.log('💎 Oracle Thick Mode initialized with local Instant Client v21');
} catch (err) {
    console.warn('⚠️  Could not initialize Thick Mode. Falling back to Thin Mode.', err.message);
}

oracledb.autoCommit = true;

// ── Multi-company pool registry ───────────────────────────────────────────────
const pools = {};

const COMPANY_CONFIGS = {
    madville: {
        user: process.env.DB_MADVILLE_USER || process.env.DB_USER,
        password: process.env.DB_MADVILLE_PASSWORD || process.env.DB_PASSWORD,
        connectString: process.env.DB_MADVILLE_CONNECT || process.env.DB_CONNECT_STRING,
        poolMin: 2, poolMax: 10, poolIncrement: 2,
        poolAlias: 'pool_madville',
    },
    curitiba: {
        user: process.env.DB_CURITIBA_USER,
        password: process.env.DB_CURITIBA_PASSWORD,
        connectString: process.env.DB_CURITIBA_CONNECT,
        poolMin: 2, poolMax: 10, poolIncrement: 2,
        poolAlias: 'pool_curitiba',
    },
};

// ── Initialize a single company pool ─────────────────────────────────────────
async function initializeCompany(companyId) {
    const config = COMPANY_CONFIGS[companyId];
    if (!config) throw new Error(`Unknown company: ${companyId}`);
    if (pools[companyId]) return pools[companyId];

    // Skip if credentials missing (company not configured yet)
    if (!config.user || !config.password || !config.connectString) {
        console.warn(`⚠️  Company "${companyId}" not configured — skipping pool creation.`);
        return null;
    }

    try {
        console.log(`🔗 Oracle [${companyId}]: Connecting to ${config.connectString} as ${config.user}`);
        pools[companyId] = await oracledb.createPool(config);
        console.log(`✅ Oracle [${companyId}]: Pool ready`);
        return pools[companyId];
    } catch (err) {
        console.error(`❌ Oracle [${companyId}]: Pool creation failed —`, err.message);
        return null;
    }
}

// ── Initialize all configured companies ──────────────────────────────────────
async function initialize() {
    await Promise.allSettled(
        Object.keys(COMPANY_CONFIGS).map(id => initializeCompany(id))
    );
}

async function close() {
    for (const [id, pool] of Object.entries(pools)) {
        if (pool) {
            await pool.close();
            console.log(`🛑 Oracle [${id}]: Pool closed`);
        }
    }
}

// ── Health check for a company ────────────────────────────────────────────────
async function healthCheck(companyId) {
    const pool = pools[companyId];
    if (!pool) return false;
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.execute('SELECT 1 FROM DUAL');
        return true;
    } catch {
        return false;
    } finally {
        if (conn) await conn.close().catch(() => { });
    }
}

// ── Execute a query for a specific company ────────────────────────────────────
async function executeForCompany(companyId, sql, binds = [], opts = {}) {
    if (!pools[companyId]) {
        await initializeCompany(companyId);
    }
    const pool = pools[companyId];
    if (!pool) throw new Error(`No database pool available for company: ${companyId}`);

    return _executeOnPool(pool, sql, binds, opts);
}

// ── Legacy execute (uses Madville pool — backward compat) ─────────────────────
async function execute(sql, binds = [], opts = {}) {
    if (!pools.madville) await initializeCompany('madville');
    return _executeOnPool(pools.madville, sql, binds, opts);
}

// ── Internal: run query on given pool ────────────────────────────────────────
async function _executeOnPool(pool, sql, binds, opts) {
    let connection;
    try {
        connection = await pool.getConnection();
        const options = { outFormat: oracledb.OUT_FORMAT_OBJECT, ...opts };
        const result = await connection.execute(sql, binds, options);

        const normalizedRows = result.rows.map(row => {
            const out = {};
            for (const key in row) out[key.toLowerCase()] = row[key];
            return out;
        });

        return { rows: normalizedRows, metaData: result.metaData };
    } catch (err) {
        console.error('Oracle execution error:', err.message);
        throw err;
    } finally {
        if (connection) await connection.close().catch(() => { });
    }
}

module.exports = {
    initialize,
    close,
    execute,
    executeForCompany,
    healthCheck,
    pools,
};
