require('dotenv').config();
const db = require('./db');

async function testSearch() {
    try {
        await db.initialize();
        const q = 'mobilar';
        const sql = `
            SELECT idpess, nome
            FROM VIASOFTMCP.V_SIMPLEPESS
            WHERE (UPPER(nome) LIKE '%' || UPPER(TRIM(:q)) || '%')
               OR (TO_CHAR(idpess) = TRIM(:q))
            ORDER BY nome
            FETCH FIRST 5 ROWS ONLY
        `;
        const result = await db.execute(sql, { q });
        console.log('Results for "mobilar":');
        console.log(JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Search Test Error:', err);
    } finally {
        await db.close();
    }
}

testSearch();
