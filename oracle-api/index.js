require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

console.log('--- STARTING GATEWAY ---');
console.log('Environment Mode:', process.env.NODE_ENV || 'development');
console.log('Target Oracle Host:', process.env.DB_CONNECT_STRING || 'NOT SET (Defaults to localhost)');
console.log('------------------------');

const app = express();
const PORT = process.env.PORT || 3001; // Porta 3001 para não conflitar com outros serviços

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.execute('SELECT 1 FROM dual');
        res.json({
            status: 'online',
            database: 'connected',
            timestamp: new Date(),
            testResult: result.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Endpoint de Consulta Dinâmica (Uso restrito)
app.post('/api/query', async (req, res) => {
    const { sql, binds } = req.body;

    if (!sql) {
        return res.status(400).json({ error: 'SQL query is required' });
    }

    try {
        const result = await db.execute(sql, binds || []);
        res.json({
            success: true,
            rows: result.rows,
            metaData: result.metaData
        });
    } catch (error) {
        console.error('API Query Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

async function start() {
    try {
        await db.initialize();
        app.listen(PORT, () => {
            console.log(`🚀 Oracle API Gateway running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Critical Failure:', err);
        process.exit(1);
    }
}

start();

// Shutdown
process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});
