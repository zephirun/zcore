const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config();

try {
    oracledb.initOracleClient({ libDir: path.join(__dirname, 'client', 'instantclient_21_21') });
} catch (err) { }

async function run() {
    let conn;
    try {
        console.log('Connecting to Oracle...');
        conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        console.log('Connected.');

        const sql = `
            SELECT COUNT(*) FROM (
                SELECT 1 FROM VIASOFTMCP.DUPREC D
                INNER JOIN TABLE(VIASOFTMCP.BAIXASDUPREC(D.ESTAB, D.IDDUPREC, NULL)) SALDO ON (0=0)
                WHERE COALESCE(D.VALOR,0) + COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) - COALESCE(SALDO.VALREC,0) > 0
            ) 
        `;

        console.log('Running test query (counting DUPREC with balance)...');
        const start = Date.now();
        const result = await conn.execute(sql);
        console.log('Count:', result.rows[0][0]);
        console.log('Execution time:', (Date.now() - start) / 1000, 'seconds');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        if (conn) await conn.close();
    }
}

run();
