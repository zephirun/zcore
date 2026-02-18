require('dotenv').config();
const oracledb = require('oracledb');

// Configurações Globais
oracledb.autoCommit = true;

// Função para obter config atualizada do env
function getDbConfig() {
    return {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        connectString: process.env.DB_CONNECT_STRING,
        poolMin: 2,
        poolMax: 10,
        poolIncrement: 2
    };
}

let pool;

async function initialize() {
    try {
        if (pool) return pool;
        const config = getDbConfig();
        console.log(`🔗 Oracle: Attempting connection to ${config.connectString} as ${config.user}`);
        pool = await oracledb.createPool(config);
        console.log('✅ Oracle Database Connection Pool Started');
        return pool;
    } catch (err) {
        console.error('❌ Database Initialization Error:', err);
        throw err;
    }
}

async function close() {
    if (pool) {
        await pool.close();
        console.log('🛑 Oracle Pool Closed');
    }
}

/**
 * Executa uma consulta SQL no Oracle
 * @param {string} sql - Query SQL
 * @param {object|array} binds - Parâmetros da query
 * @param {object} opts - Opções do oracledb
 */
async function execute(sql, binds = [], opts = {}) {
    let connection;
    try {
        if (!pool) await initialize();
        connection = await pool.getConnection();

        // Padrão: Retornar objetos JSON amigáveis (OUT_FORMAT_OBJECT)
        const options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            ...opts
        };

        const result = await connection.execute(sql, binds, options);
        return result;
    } catch (err) {
        console.error('Execution Error:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

module.exports = {
    initialize,
    close,
    execute
};
