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

// === VENDAS E KPIs ===

// Ranking de Vendedores (Valor Bruto via V_IA_VENDA + COMISPREDOC_NOTAS + V_VENDEDORFUNCIONARIOFILIAL)
app.get('/api/sellers-performance', async (req, res) => {
    try {
        const sql = `
            SELECT vf.NOME as vendedor_nome, SUM(t.VALCONT) as faturamento
            FROM VIASOFTMCP.V_IA_VENDA t
            JOIN VIASOFTMCP.COMISPREDOC_NOTAS c ON t.IDNOTA = c.IDNOTA
            JOIN VIASOFTMCP.V_VENDEDORFUNCIONARIOFILIAL vf ON c.IDVENDEDOR = vf.IDPESS
            WHERE EXTRACT(YEAR FROM t.EMISSAO) = EXTRACT(YEAR FROM SYSDATE)
            AND EXTRACT(MONTH FROM t.EMISSAO) = EXTRACT(MONTH FROM SYSDATE)
            GROUP BY vf.NOME
            ORDER BY faturamento DESC
            FETCH FIRST 10 ROWS ONLY
        `;
        const result = await db.execute(sql);
        const rows = result.rows;
        const maxVal = rows.length > 0 ? rows[0].faturamento : 1;
        res.json(rows.map(row => ({
            nome: row.vendedor_nome,
            valor: row.faturamento,
            percent: (row.faturamento / maxVal) * 100
        })));
    } catch (error) {
        console.error('Sellers Performance Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// KPIs Gerais do Mês
app.get('/api/kpis', async (req, res) => {
    try {
        const sqlTotal = `
            SELECT 
                SUM(VALCONT) as faturamento,
                SUM(QUANTIDADE) as quantidade,
                COUNT(DISTINCT IDNOTA) as transacoes
            FROM VIASOFTMCP.V_IA_VENDA
            WHERE EXTRACT(YEAR FROM EMISSAO) = EXTRACT(YEAR FROM SYSDATE)
            AND EXTRACT(MONTH FROM EMISSAO) = EXTRACT(MONTH FROM SYSDATE)
        `;
        const sqlDetails = `
            SELECT 
                SUM(LUCROBRUTO) as lucro,
                AVG(PERCLUCROBRUTO) as margem,
                SUM(DESCONTO) as descontos,
                SUM(FRETE) as frete,
                SUM(CASE WHEN MOTIVODEV IS NOT NULL THEN VALOR ELSE 0 END) as devolucoes
            FROM VIASOFTMCP.OLAPVENDASDET
            WHERE EXTRACT(YEAR FROM EMISSAO) = EXTRACT(YEAR FROM SYSDATE)
            AND EXTRACT(MONTH FROM EMISSAO) = EXTRACT(MONTH FROM SYSDATE)
        `;
        const [r1, r2] = await Promise.all([db.execute(sqlTotal), db.execute(sqlDetails)]);
        const s = r1.rows[0] || {};
        const d = r2.rows[0] || {};
        res.json({
            faturamento: s.faturamento || 0,
            lucro: d.lucro || 0,
            margem: parseFloat((d.margem || 0).toFixed(2)),
            devolucoes: d.devolucoes || 0,
            descontos: d.descontos || 0,
            frete: d.frete || 0,
            qtdVendas: s.quantidade || 0,
            ticketMedio: s.faturamento / (s.transacoes || 1)
        });
    } catch (error) {
        console.error('KPIs Error:', error);
        res.status(500).json({ error: error.message });
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
