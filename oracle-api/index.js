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
                (SUM(LUCROBRUTO) / NULLIF(SUM(VLRRECLIQ), 0)) * 100 as margem,
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
            devolucoes: Math.abs(d.devolucoes || 0),
            descontos: d.descontos || 0,
            frete: d.frete || 0,
            qtdVendas: s.transacoes || 0,
            ticketMedio: s.faturamento / (s.transacoes || 1)
        });
    } catch (error) {
        console.error('KPIs Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Resumo do Cliente (Financeiro - SQL Completo)
app.get('/api/client-summary', async (req, res) => {
    const { idpess } = req.query;

    try {
        // Se idpess for fornecido, retorna o detalhamento completo (mais lento, mas específico)
        // Se idpess NÃO for fornecido, retorna um resumo por cliente para o Dashboard (mais rápido)
        const whereClause = idpess ? `AND LP.IDPESS = :idpess` : '';

        const sql = `
            SELECT
              X.*,
              'Vendedor: ' || COALESCE(V.NOME,'Sem Vendedor') || ' ' || V.IDPESS REPRE,
              C.NOME || ' - ' || C.IDPESS CLIENTE,
              LP.LIMITE
            FROM (
                SELECT
                  1 SEQ,
                  'Documentos' TIPO,
                  D.IDPESS,
                  P.IDREPRESENTANTE,
                  D.ESTAB,
                  D.IDDUPREC IDDOCTO,
                  D.DUPREC DOCTO,
                  TRUNC(D.DTEMISSAO) AS EMISSAO,
                  TRUNC(D.DTVENCTO) AS VENCTO,
                  COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) - COALESCE(SALDO.VALREC,0) VALOR,
                  ST.DESCRICAO AS HIST,
                  PARCELA.IDPARCELA AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.DUPREC D ON D.IDPESS = LP.IDPESS
                  INNER JOIN TABLE(VIASOFTMCP.BAIXASDUPREC(D.ESTAB, D.IDDUPREC, NULL)) SALDO ON (0=0)
                  LEFT JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = D.IDPESS
                  LEFT JOIN VIASOFTMCP.SITUACAO ST ON (ST.IDSITUACAO = D.IDSITUACAO)
                  LEFT JOIN VIASOFTMCP.PARCELA ON (PARCELA.IDPARCELA = D.IDPARCELA)
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND TRUNC(D.DTVENCTO) < TRUNC(SYSDATE)
                  AND COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) - COALESCE(SALDO.VALREC,0) > 0

                UNION ALL

                SELECT
                  2 SEQ,
                  'Documentos' TIPO,
                  D.IDPESS,
                  P.IDREPRESENTANTE,
                  D.ESTAB,
                  D.IDDUPREC IDDOCTO,
                  D.DUPREC DOCTO,
                  TRUNC(D.DTEMISSAO) AS EMISSAO,
                  TRUNC(D.DTVENCTO) AS VENCTO,
                  COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) - COALESCE(SALDO.VALREC,0) VALOR,
                  ST.DESCRICAO AS HIST,
                  PARCELA.IDPARCELA AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.DUPREC D ON D.IDPESS = LP.IDPESS
                  INNER JOIN TABLE(VIASOFTMCP.BAIXASDUPREC(D.ESTAB, D.IDDUPREC, NULL)) SALDO ON (0=0)
                  LEFT JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = D.IDPESS
                  LEFT JOIN VIASOFTMCP.SITUACAO ST ON (ST.IDSITUACAO = D.IDSITUACAO)
                  LEFT JOIN VIASOFTMCP.PARCELA ON (PARCELA.IDPARCELA = D.IDPARCELA)
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND TRUNC(D.DTVENCTO) >= TRUNC(SYSDATE)
                  AND COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) -  COALESCE(SALDO.VALREC,0) > 0

                UNION ALL

                SELECT
                  3 SEQ,
                  'Documentos' TIPO,
                  D.IDPESS,
                  P.IDREPRESENTANTE,
                  D.ESTAB,
                  D.IDCHEQREC IDDOCTO,
                  TO_CHAR(D.CHEQUE) DOCTO,
                  TRUNC(D.EMISSAO) AS EMISSAO,
                  TRUNC(D.BOMPARA) AS VENCTO,
                  D.VALOR,
                  'CHEQUES' AS HIST,
                  0 AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.CHEQREC D ON D.IDPESS = LP.IDPESS
                  LEFT JOIN TABLE(VIASOFTMCP.GETCHEQRECHIST(D.ESTAB, D.IDCHEQREC)) H ON 0=0
                  INNER JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = D.IDPESS
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND H.SITUACAO IN ('D','A')

                UNION ALL

                SELECT
                  4 SEQ,
                  'Documentos' TIPO,
                  P.IDPESS,
                  P.IDREPRESENTANTE,
                  0 ESTAB,
                  0 IDDOCTO,
                  '0' DOCTO,
                  TRUNC(SYSDATE) AS EMISSAO,
                  TRUNC(SYSDATE) AS VENCTO,
                  COALESCE(VIASOFTMCP.GETSALDOCONTAPESS(D.EMPRESA, P.IDPESS, NULL), 0),
                  'CARTEIRA' AS HIST,
                  0 AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = LP.IDPESS
                  LEFT JOIN VIASOFTMCP.PESSOADOCMCP D ON D.IDPESS = P.IDPESS
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND COALESCE(VIASOFTMCP.GETSALDOCONTAPESS(D.EMPRESA, P.IDPESS, NULL), 0) > 0
                    
                UNION ALL

                SELECT
                  5 SEQ,
                  'Crédito' TIPO,
                  P.IDPESS,
                  P.IDREPRESENTANTE,
                  0 ESTAB,
                  0 IDDOCTO,
                  '0' DOCTO,
                  TRUNC(SYSDATE) AS EMISSAO,
                  TRUNC(SYSDATE) AS VENCTO,
                  COALESCE(VIASOFTMCP.GETSALDOCONTAPESS(D.EMPRESA, P.IDPESS, NULL), 0),
                  'CREDITO' AS HIST,
                  0 AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = LP.IDPESS
                  LEFT JOIN VIASOFTMCP.PESSOADOCMCP D ON D.IDPESS = P.IDPESS
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND COALESCE(VIASOFTMCP.GETSALDOCONTAPESS(D.EMPRESA, P.IDPESS, NULL), 0) < 0	
                    
                UNION ALL

                SELECT
                  5 SEQ,
                  'Crédito' TIPO,
                  D.IDPESS,
                  P.IDREPRESENTANTE,
                  D.ESTAB,
                  D.IDDUPPAG IDDOCTO,
                  D.DUPPAG DOCTO,
                  TRUNC(D.DTEMISSAO) AS EMISSAO,
                  TRUNC(D.DTVENCTO) AS VENCTO,
                  -(COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) -  COALESCE(SALDO.VALREC,0)) VALOR,
                  'CREDITO' AS HIST,
                  0 AS PARCELA
                FROM VIASOFTMCP.PESSOADOCCREDSCORE LP
                  INNER JOIN VIASOFTMCP.DUPPAG D ON D.IDPESS = LP.IDPESS
                  INNER JOIN TABLE(VIASOFTMCP.BAIXASDUPPAG(D.ESTAB, D.IDDUPPAG, NULL)) SALDO ON (0=0)
                  LEFT JOIN VIASOFTMCP.PESSOADOC P ON P.IDPESS = D.IDPESS
                  LEFT JOIN VIASOFTMCP.SITUACAO ST ON (ST.IDSITUACAO = D.IDSITUACAO)
                WHERE LP.LIMITE > 0.01
                  ${whereClause}
                  AND COALESCE(D.IDSITUACAO,0) NOT IN(9, 11)
                  AND COALESCE(D.VALOR,0) +  COALESCE(D.JUROSPEND,0) - COALESCE(D.DESCPEND,0) -  COALESCE(SALDO.VALREC,0) > 0
            ) X
            LEFT JOIN VIASOFTMCP.V_SIMPLEPESS V ON V.IDPESS = X.IDREPRESENTANTE
            LEFT JOIN VIASOFTMCP.V_SIMPLEPESS C ON C.IDPESS = X.IDPESS
            LEFT JOIN VIASOFTMCP.PESSOADOCCREDSCORE LP ON C.IDPESS = LP.IDPESS
            ORDER BY 1, 9 ASC
            ${idpess ? '' : 'FETCH FIRST 100 ROWS ONLY'}
        `;
        const result = await db.execute(sql, idpess ? { idpess: parseInt(idpess) } : {});
        res.json(result.rows);
    } catch (error) {
        console.error('Client Summary Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Resumo Sintético de Vendas (SQL Completo)
app.get('/api/synthetic-sales-summary', async (req, res) => {
    const { dtini, dtfim } = req.query;

    // Default to current month if not provided
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const start = dtini || firstDay;
    const end = dtfim || lastDay;

    try {
        const sql = `
            WITH VENDAS_POR_VENDEDOR AS (
                SELECT
                    X.IDVENDEDORINT
                    ,V.NOME AS VENDEDOR
                    ,COALESCE(SUM(X.VLRVDA),0) AS VLRVDA
                    ,COALESCE(SUM(X.CUSTOVDA),0) AS CUSTOVDA
                    ,COALESCE(SUM(X.VLRDEV),0) AS VLRDEV
                    ,COALESCE(SUM(X.CUSTODEV),0) AS CUSTODEV
                    ,COALESCE(SUM(X.VLRFRETE),0) AS VLRFRETE
                    ,COALESCE(SUM(X.VLRVDA),0) - COALESCE(SUM(X.VLRDEV),0) AS VDALIQ
                    ,COALESCE(SUM(X.CUSTOVDA),0) - COALESCE(SUM(X.CUSTODEV),0) AS CUSTOLIQ
                    ,(COALESCE(SUM(X.VLRVDA),0) - COALESCE(SUM(X.VLRDEV),0)) - (COALESCE(SUM(X.CUSTOVDA),0) - COALESCE(SUM(X.CUSTODEV),0)) AS LUCRO
                    ,(COALESCE(SUM(X.VLRVDA),0) - COALESCE(SUM(X.VLRDEV),0)) - (COALESCE(SUM(X.CUSTOVDA),0) - COALESCE(SUM(X.CUSTODEV),0)) AS LUCROTOTAL
                FROM
                (
                    SELECT
                        N.ESTAB || ' - ' || FILIAL.REDUZIDO AS ESTAB
                        ,CASE WHEN N.IDTIPOOPER IN ('VD', 'EF') THEN (NI.VALCONT) END AS VLRVDA
                        ,CASE WHEN N.IDTIPOOPER IN ('VD', 'EF') THEN (NI.VALFRETE) END AS VLRFRETE
                        ,CASE WHEN N.IDTIPOOPER IN ('DV') THEN (NI.VALCONT) END AS VLRDEV
                        ,CASE WHEN N.IDTIPOOPER IN ('VD', 'EF')
                        THEN ((NI.CUSTOUNIT) * (NI.QTDTRIB)) END AS CUSTOVDA
                        ,CASE WHEN N.IDTIPOOPER IN ('DV')
                        THEN ((NI.CUSTOUNIT) * (NI.QTDTRIB)) END AS CUSTODEV
                        ,COALESCE(NULLIF(NI.IDVENDEDORCAR,0), (
                        SELECT NULLIF(NI2.IDVENDEDORCAR,0)
                        FROM NOTAREFITE RI
                        INNER JOIN NOTAITEM NI2
                            ON NI2.ESTAB = RI.ESTABREF
                            AND NI2.IDNOTA = RI.IDNOTAREF
                            AND NI2.SEQITEM = RI.SEQITEMREF
                        WHERE RI.ESTAB = NI.ESTAB
                            AND RI.IDNOTA = NI.IDNOTA
                            AND RI.SEQITEM = NI.SEQITEM
                        ), NI.IDVENDEDOR) AS IDVENDEDORINT
                    FROM VIASOFTMCP.NOTAITEM NI
                    LEFT JOIN VIASOFTMCP.NOTA N 
                        ON N.ESTAB = NI.ESTAB 
                        AND N.IDNOTA = NI.IDNOTA
                    LEFT JOIN VIASOFTMCP.USANDODE 
                        ON USANDODE.ESTAB = N.ESTAB 
                        AND USANDODE.TABELA = 'NOTACONF'
                    LEFT JOIN VIASOFTMCP.NOTACONF 
                        ON NOTACONF.ESTAB = USANDODE.USADE 
                        AND NOTACONF.IDNOTACONF = N.IDNOTACONF
                    LEFT JOIN VIASOFTMCP.FILIAL 
                        ON FILIAL.ESTAB = N.ESTAB
                    LEFT JOIN VIASOFTMCP.V_SIMPLEPESS V 
                        ON V.IDPESS = NI.IDVENDEDORCAR
                    LEFT JOIN VIASOFTMCP.ITEMESTAB 
                        ON ITEMESTAB.ESTAB = NI.ESTAB 
                        AND ITEMESTAB.IDITEM = NI.IDITEM
                    LEFT JOIN VIASOFTMCP.ITEM 
                        ON ITEM.ESTAB = ITEMESTAB.ESTABITEM 
                        AND ITEM.IDITEM = ITEMESTAB.IDITEM
                    LEFT JOIN VIASOFTMCP.FILIALCONFCAD 
                        ON FILIALCONFCAD.ESTAB = N.ESTAB
                    WHERE TRUNC(DECODE(N.OPERACAO,'E',N.ENTRADASAIDA,N.EMISSAO)) BETWEEN TO_DATE(:dtini, 'YYYY-MM-DD') AND TO_DATE(:dtfim, 'YYYY-MM-DD')
                    AND N.IDNOTACONF IN (1,3,100,154,174,260,261,262,263,305,311,315)
                    AND VIASOFTMCP.NOTAPASSOUCAIXA(N.ESTAB, N.IDNOTA, N.IDNOTACONF) = 'S'
                    AND N.SITUACAO IN (5,10)
                    AND (0 = :sql_flag)
                ) X
                LEFT JOIN VIASOFTMCP.V_SIMPLEPESS V ON V.IDPESS = X.IDVENDEDORINT
                GROUP BY X.IDVENDEDORINT,V.NOME
            )
            SELECT
                S.*,
                CASE
                    WHEN SUM(S.VDALIQ) OVER () > 0 THEN
                        (S.VDALIQ / SUM(S.VDALIQ) OVER ()) * 100
                    ELSE
                        0
                END AS REPRESENTATIVIDADE
            FROM
                VENDAS_POR_VENDEDOR S
            ORDER BY
                VDALIQ DESC
        `;
        const result = await db.execute(sql, {
            dtini: start,
            dtfim: end,
            sql_flag: 0
        });
        res.json(result.rows);
    } catch (error) {
        console.error('Synthetic Summary Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Busca de Clientes/Parceiros por nome ou ID
app.get('/api/search-clients', async (req, res) => {
    const { q } = req.query;
    const queryTerm = (q || '').trim();

    if (!queryTerm || queryTerm.length < 2) {
        if (!/^[0-9]+$/.test(queryTerm)) return res.json([]);
    }

    try {
        const sql = `
            SELECT idpess, nome
            FROM VIASOFTMCP.V_SIMPLEPESS
            WHERE (UPPER(nome) LIKE '%' || UPPER(:q) || '%')
               OR (TO_CHAR(idpess) = :q)
            ORDER BY nome
            FETCH FIRST 20 ROWS ONLY
        `;
        const result = await db.execute(sql, { q: queryTerm });
        console.log(`[SEARCH] Query: "${queryTerm}" | Hits: ${result.rows.length}`);
        res.json(result.rows);
    } catch (error) {
        console.error('Search Clients Error [NJS-533?]:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            code: error.code
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

// --- Cache System (Used by n8n) ---
const fs = require('fs');
const path = require('path');
const CACHE_FILE = path.join(__dirname, 'dashboard_cache.json');

app.post('/api/sync-cache', async (req, res) => {
    try {
        console.log('🔄 Sync Dashboard Cache (n8n)...');
        const fetchLocal = async (route) => {
            const response = await fetch(`http://127.0.0.1:${PORT}${route}`);
            return response.json();
        };
        const kpis = await fetchLocal('/api/kpis');
        console.log(`📊 KPIs Synced - Margin: ${kpis.margem}%`);
        const clients = await fetchLocal('/api/client-summary');
        console.log(`📊 Clients Synced - Count: ${clients.length}`);
        const sellers = await fetchLocal('/api/sellers-performance');
        console.log(`📊 Sellers Synced - Count: ${sellers.length}`);

        const cacheData = {
            lastSync: new Date().toISOString(),
            data: { kpis, clients, sellers }
        };
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2), 'utf-8');
        console.log('✅ Dashboard Cache updated successfully!');
        res.json({ success: true, lastSync: cacheData.lastSync });
    } catch (err) {
        console.error('Cache Sync Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/cached-dashboard', (req, res) => {
    if (fs.existsSync(CACHE_FILE)) {
        res.setHeader('Content-Type', 'application/json');
        res.send(fs.readFileSync(CACHE_FILE, 'utf-8'));
    } else {
        res.json({ lastSync: null, data: null });
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
