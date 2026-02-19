const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config();

// Inicializa o Thick Mode
try {
    oracledb.initOracleClient({ libDir: path.join(__dirname, 'client', 'instantclient_21_21') });
    console.log('✅ Thick Mode initialized');
} catch (err) {
    if (!err.message.includes('NJS-010')) { // NJS-010 is "Already initialized"
        console.error('❌ initOracleClient error:', err.message);
    }
}

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
