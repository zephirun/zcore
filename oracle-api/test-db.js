const oracledb = require('oracledb');
require('dotenv').config();

async function test() {
    console.log('--- ORACLE CONNECTION TEST ---');
    console.log('User:', process.env.DB_USER);
    console.log('String:', process.env.DB_CONNECT_STRING);

    try {
        const conn = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });
        console.log('✅ SUCCESS! Connection established.');
        await conn.close();
    } catch (err) {
        console.error('❌ FAILED:', err.message);
    }
}

test();
