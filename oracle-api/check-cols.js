require('dotenv').config();
const db = require('./db');
async function test() {
    try {
        await db.initialize();
        const tables = ['ITEM', 'ITEMECOMMERCE'];
        for (const table of tables) {
            const sql = `SELECT column_name FROM all_tab_cols WHERE table_name = '${table}' AND owner = 'VIASOFTMCP'`;
            const result = await db.execute(sql);
            console.log(`\n--- Columns for ${table} ---`);
            console.log(result.rows.map(r => r.column_name).join(', '));
        }
    } catch (e) { console.error(e); }
    finally { await db.close(); }
}
test();
