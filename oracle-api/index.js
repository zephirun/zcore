require('dotenv').config();
const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
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

// Inteligência 360 do Cliente (Strategic Radar AI)
app.get('/api/client-intelligence/:idpess', async (req, res) => {
    const { idpess } = req.params;

    try {
        const sql = `
            WITH base_sales AS (
                SELECT 
                    VALCONT,
                    TRUNC(EMISSAO) as DT,
                    IDNOTA,
                    ESTAB
                FROM VIASOFTMCP.V_IA_VENDA
                WHERE IDPESS = :idpess
                AND EMISSAO >= SYSDATE - 90
            ),
            metrics AS (
                SELECT 
                    SUM(VALCONT) as faturamento_total,
                    COUNT(DISTINCT IDNOTA) as transacoes,
                    COUNT(DISTINCT DT) as dias_compra,
                    SUM(CASE WHEN DT >= SYSDATE - 30 THEN VALCONT ELSE 0 END) as fat_30,
                    SUM(CASE WHEN DT >= SYSDATE - 60 AND DT < SYSDATE - 30 THEN VALCONT ELSE 0 END) as fat_60,
                    MAX(ESTAB) as estab_ref
                FROM base_sales
            ),
            margin AS (
                SELECT 
                    (SUM(LUCROBRUTO) / NULLIF(SUM(VLRRECLIQ), 0)) * 100 as margem_avg
                FROM VIASOFTMCP.OLAPVENDASDET
                WHERE IDPESS = :idpess
                AND EMISSAO >= SYSDATE - 90
            ),
            term AS (
                SELECT 
                    SUM((TRUNC(COALESCE(b.DTRECBTO, d.DTVENCTO)) - TRUNC(t.EMISSAO)) * d.VALOR) / NULLIF(SUM(d.VALOR), 0) as prazo_medio
                FROM VIASOFTMCP.V_IA_VENDA t
                JOIN VIASOFTMCP.V_NOTAPAGAMENTOS p ON t.IDNOTA = p.IDNOTA AND t.ESTAB = p.ESTAB
                JOIN VIASOFTFIN.DUPREC d ON p.IDDUPREC = d.IDDUPREC AND p.ESTAB = d.ESTAB
                LEFT JOIN TABLE(VIASOFTMCP.BAIXASDUPREC(d.ESTAB, d.IDDUPREC, NULL)) b ON (1=1)
                WHERE t.IDPESS = :idpess
                AND t.EMISSAO >= SYSDATE - 90
            ),
            top_products AS (
                SELECT * FROM (
                    SELECT PRODUTO, SUM(VALOR) as total_prod
                    FROM VIASOFTMCP.OLAPVENDASDET
                    WHERE IDPESS = :idpess AND EMISSAO >= SYSDATE - 90
                    GROUP BY PRODUTO
                    ORDER BY total_prod DESC
                ) FETCH FIRST 5 ROWS ONLY
            ),
            estab_trends AS (
                SELECT SECAO, SUM(VALOR) as vol_secao
                FROM VIASOFTMCP.OLAPVENDASDET
                WHERE EMISSAO >= SYSDATE - 90
                GROUP BY SECAO
                ORDER BY vol_secao DESC
            ),
            client_gaps AS (
                SELECT * FROM (
                    SELECT et.SECAO
                    FROM estab_trends et
                    WHERE et.SECAO NOT IN (
                        SELECT DISTINCT SECAO 
                        FROM VIASOFTMCP.OLAPVENDASDET 
                        WHERE IDPESS = :idpess AND EMISSAO >= SYSDATE - 180
                    )
                    ORDER BY et.vol_secao DESC
                ) FETCH FIRST 3 ROWS ONLY
            )
            SELECT 
                m.*, mg.margem_avg, t.prazo_medio,
                (SELECT JSON_ARRAYAGG(JSON_OBJECT('name' VALUE PRODUTO, 'value' VALUE total_prod)) FROM top_products) as top_prods_json,
                (SELECT JSON_ARRAYAGG(SECAO) FROM client_gaps) as gaps_json
            FROM metrics m, margin mg, term t
        `;

        const result = await db.execute(sql, { idpess });
        const data = result.rows[0] || {};
        const topProducts = JSON.parse(data.top_prods_json || '[]');
        const recommendations = JSON.parse(data.gaps_json || '[]');

        // Normalização 0-100 para o Radar
        const scores = {
            volume: Math.min(100, ((data.faturamento_total || 0) / 45000) * 100), // Target ~15k/mês
            margin: Math.min(100, ((data.margem_avg || 0) / 22) * 100), // Target 22%
            term: Math.max(0, 100 - ((data.prazo_medio || 0) / 45) * 100), // 0 dias = 100, 45+ = 0
            growth: Math.min(100, ((data.fat_30 || 1) / (data.fat_60 || 1)) * 50),
            frequency: Math.min(100, ((data.dias_compra || 0) / 9) * 100) // 3 compras/mês = 100
        };

        let churnRisk = 'BAIXO';
        const trend = (data.fat_30 || 0) / (data.fat_60 || 0.01);
        if (trend < 0.4) churnRisk = 'ALTO';
        else if (trend < 0.7) churnRisk = 'MÉDIO';

        res.json({
            success: true,
            clientId: idpess,
            scores,
            radarData: [
                { subject: 'Volume', A: scores.volume, fullMark: 100 },
                { subject: 'Margem', A: scores.margin, fullMark: 100 },
                { subject: 'Prazo', A: scores.term, fullMark: 100 },
                { subject: 'Crescimento', A: scores.growth, fullMark: 100 },
                { subject: 'Frequência', A: scores.frequency, fullMark: 100 }
            ],
            benchmarks: {
                margin: { client: data.margem_avg || 0, avg: 15.2 },
                term: { client: data.prazo_medio || 0, avg: 38.5 },
                ticket: { client: (data.faturamento_total || 0) / (data.transacoes || 1), avg: 5200 }
            },
            churnRisk,
            topProducts,
            suggestedCategories: recommendations.length > 0 ? recommendations : ['Adesivos Estruturais', 'Ferragens Premium']
        });
    } catch (error) {
        console.error('API Client Intelligence Error:', error);
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

// Busca de Produtos Robusta (Catálogo + Radar) com Filtros Múltiplos
app.get('/api/search-products', async (req, res) => {
    const { q, brand, id } = req.query;
    const queryTerm = (q || '').trim();
    const brandTerm = (brand || '').trim();
    const idTerm = (id || '').trim();

    // Se nenhum filtro for passado ou for muito curto, retorna vazio (exceto se for ID numérico)
    if (!queryTerm && !brandTerm && !idTerm) return res.json([]);

    // Se passar algo mas for < 2 caracteres e não for ID
    if (queryTerm.length < 2 && brandTerm.length < 2 && idTerm.length < 2) {
        if (!/^[0-9]+$/.test(queryTerm || idTerm)) return res.json([]);
    }

    try {
        const binds = {};
        let dynamicWhere = '';

        // Process terms for the main search field 'q'
        if (queryTerm) {
            const terms = queryTerm.split(/\s+/).filter(t => t.length > 0);
            terms.forEach((term, index) => {
                const termKey = `term${index}`;
                const idKey = `id_term${index}`;
                binds[termKey] = `%${term.toUpperCase()}%`;
                binds[idKey] = term.toUpperCase();

                dynamicWhere += `
                    AND (
                        UPPER(ITEM.DESCRICAO) LIKE :${termKey} 
                        OR UPPER(MARCA.DESCRICAO) LIKE :${termKey} 
                        OR TO_CHAR(ITEMESTAB.IDITEM) = :${idKey} 
                        OR UPPER(ITEMEMP.CODREF) = :${idKey}
                    )`;
            });
        }

        // Add explicit filters if provided via separate fields
        if (brandTerm) {
            binds.brandFilter = `%${brandTerm.toUpperCase()}%`;
            dynamicWhere += ` AND UPPER(MARCA.DESCRICAO) LIKE :brandFilter`;
        }
        if (idTerm) {
            binds.idFilter = idTerm.toUpperCase();
            dynamicWhere += ` AND (TO_CHAR(ITEMESTAB.IDITEM) = :idFilter OR UPPER(ITEMEMP.CODREF) = :idFilter)`;
        }

        const sql = `
            SELECT Y.*, Y.FISICO+Y.SEGURANCA+Y.DEVOLUCAO+Y.SELF_SERVICE AS SALDO_EMPRESA FROM (
            SELECT X.*
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 1, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 1, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1003,X.ESTAB,X.IDITEM,1, 1, 'S') FROM DUAL) AS FISICO
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 2, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 2, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1003,X.ESTAB,X.IDITEM,1, 2, 'S') FROM DUAL) AS DISPONIVEL
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 3, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 3, 'S') FROM DUAL) AS VENDA_FUTURA
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 4, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 4, 'S') FROM DUAL) AS DEVOLUCAO
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 5, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 5, 'S') FROM DUAL) AS AVARIA
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 7, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1002,X.ESTAB,X.IDITEM,1, 7, 'S') FROM DUAL) AS SEGURANCA
              ,(SELECT GETSALDOITEM(1001,501,X.IDITEM,2, 1, '') FROM DUAL) AS SELF_SERVICE
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 11, 'S') FROM DUAL) AS MOSTRUARIO
              ,(SELECT GETSALDOITEM(1001,X.ESTAB,X.IDITEM,1, 12, 'S') FROM DUAL) + (SELECT GETSALDOITEM(1003,X.ESTAB,X.IDITEM,1, 12, 'S') FROM DUAL) AS USO_CONSUMO
              ,(SELECT RETORNACUSTOMEDIO(X.ESTAB,X.IDITEM,SYSDATE) FROM DUAL) AS CUSTOMEDIO
              ,TRUNC(COALESCE((X.PRECO -  X.CUSTOAQUIS),X.PRECO) * 100 / X.PRECO,2) AS MARGEM
            FROM(
            SELECT
               ITEMESTAB.ESTABITEM ESTAB
              ,ITEMESTAB.ESTAB ESTABSEL
              ,TO_NUMBER(ITEMESTAB.IDITEM) IDITEM
              ,LOCALIZACAO.DESCRICAO AS LOCALIZACAO
              ,L2.DESCRICAO AS LOCAL_SELFSERVICE
              ,ITEM.DESCRICAO
              ,ITEMEMP.CODREF
              ,ITEM.NCM
              ,ITEM.UNIDADE
              ,ITEM.PESOLIQUIDO
              ,ITEM.PESOBRUTO
              ,MARCA.DESCRICAO MARCA
              ,DEPARTAMENTO.DESCRICAO AS DEPARTAMENTO
              ,SECAO.DESCRICAO AS SECAO
              ,GRUPOITEM.DESCRICAO AS GRUPO
              ,SUBGRUPO.DESCRICAO AS SUBGRUPO
              ,CASE WHEN ITEMAQUIS.CUSTOAQUIS = 0
                    THEN 1 ELSE ITEMAQUIS.CUSTOAQUIS END CUSTOAQUIS
              ,CASE WHEN ITEMPRVDA.PRECO = 0
                    THEN 1 ELSE ITEMPRVDA.PRECO END PRECO
              ,DECODE (ITEMREPOSICAO.INATIVO,'S','SAIDA',
                                 'E','ENTRADA',
                                 'A','AMBOS',
                                 'D','DEVOLUCAO',
                                 'T','TODOS',
                                 'Ativo') AS INATIVO
              ,MOTIVOINAT.DESCRICAO AS MOTIVOINAT
              ,DECODE (ITEMREPOSICAO.ENCOMENDA, 'S','SIM',
                                      'N', 'NAO') AS ENCOMENDA
              ,CASE WHEN ITEMREPOSICAO.INATIVO = 'T' THEN 'FF0000'
                    WHEN ITEMREPOSICAO.INATIVO = 'E' THEN '0000FF'
                    WHEN ITEMREPOSICAO.INATIVO = 'A' THEN '0000FF'
                    WHEN ITEMREPOSICAO.INATIVO = 'S' THEN '0000FF'
                    WHEN ITEMREPOSICAO.INATIVO = 'D' THEN '0000FF'
                    ELSE '000000' END AS COR
              ,('LEGENDA:' || CHR(13) ||'VERMELHO -> PRODUTOS INATIVOS / AMARELO -> BLOQUEADO MOVIMENTACAO')  AS HINT
              ,ITEMECOMMERCE.HTML AS ESPECIFICACOES
              ,ITEMECOMMERCE.HTMLRESUMIDO AS ESPECIFICACOES_RESUMO
              ,ITEMECOMMERCE.URLVIDEO
              ,(SELECT MIN(IDITEMIMAGEM) FROM VIASOFTMCP.ITEMIMAGEM WHERE ITEMIMAGEM.IDITEM = ITEMESTAB.IDITEM) AS IDIMAGEM
            FROM VIASOFTMCP.ITEMESTAB
            LEFT JOIN VIASOFTMCP.ITEM ON ITEM.ESTAB = ITEMESTAB.ESTABITEM AND ITEM.IDITEM = ITEMESTAB.IDITEM
            LEFT JOIN VIASOFTMCP.ITEMCATEGORIA ON ITEMCATEGORIA.ESTAB = ITEM.ESTAB AND ITEMCATEGORIA.IDITEM = ITEM.IDITEM
            LEFT JOIN VIASOFTMCP.ITEMEMP ON ITEMEMP.ESTABITEM = ITEM.ESTAB AND ITEMEMP.IDITEM = ITEM.IDITEM AND ITEMEMP.CODREF IS NOT NULL
            LEFT JOIN VIASOFTMCP.DEPARTAMENTO ON DEPARTAMENTO.IDDEPTO = ITEMCATEGORIA.IDDEPTO
            LEFT JOIN VIASOFTMCP.SECAO ON SECAO.IDSECAO = ITEMCATEGORIA.IDSECAO
            LEFT JOIN VIASOFTMCP.GRUPOITEM ON GRUPOITEM.IDGRUPOITEM = ITEMCATEGORIA.IDGRUPOITEM
            LEFT JOIN VIASOFTMCP.SUBGRUPO ON SUBGRUPO.IDSUBGRUPO = ITEMCATEGORIA.IDSUBGRUPO AND SUBGRUPO.ESTAB = ITEMCATEGORIA.ESTAB
            LEFT JOIN VIASOFTMCP.MARCA ON MARCA.IDMARCA = ITEMCATEGORIA.IDMARCA
            LEFT JOIN VIASOFTMCP.FILIALCONFCAD ON FILIALCONFCAD.ESTAB = ITEMESTAB.ESTAB
            LEFT JOIN VIASOFTMCP.ITEMLOCALIZACAO ON ITEMLOCALIZACAO.ESTAB = ITEMESTAB.ESTAB  AND ITEMLOCALIZACAO.IDITEM = ITEMESTAB.IDITEM
            AND ITEMLOCALIZACAO.IDESTOQUELOCAL = 2
            LEFT JOIN VIASOFTMCP.ITEMAQUIS
              ON ITEMAQUIS.ESTAB = ITEMESTAB.ESTABITEM
             AND ITEMAQUIS.IDITEM = ITEMESTAB.IDITEM
             AND ITEMAQUIS.IDBANDEIRA = FILIALCONFCAD.IDBANCUSTO
            LEFT JOIN VIASOFTMCP.ITEMPRVDA
              ON ITEMPRVDA.ESTAB = ITEMESTAB.ESTABITEM
             AND ITEMPRVDA.IDITEM = ITEMESTAB.IDITEM
             AND ITEMPRVDA.IDBANDEIRA = FILIALCONFCAD.IDBANPRECO
            LEFT JOIN VIASOFTMCP.ITEMREPOSICAO
              ON ITEMREPOSICAO.ESTABITEM = ITEMESTAB.ESTABITEM
             AND ITEMREPOSICAO.IDITEM = ITEMESTAB.IDITEM
             AND ITEMREPOSICAO.ESTAB = ITEMESTAB.ESTAB
            LEFT JOIN VIASOFTMCP.LOCALIZACAO
                ON LOCALIZACAO.IDLOCAL = ITEMESTAB.IDLOCALIZACAO
            LEFT JOIN VIASOFTMCP.LOCALIZACAO L2
                 ON L2.IDLOCAL = ITEMLOCALIZACAO.IDLOCAL
            LEFT JOIN VIASOFTMCP.ITEMECOMMERCE
                 ON ITEMECOMMERCE.ESTAB = ITEMESTAB.ESTABITEM
                 AND ITEMECOMMERCE.IDITEM = ITEMESTAB.IDITEM
            LEFT JOIN VIASOFTMCP.MOTIVOINAT
                 ON MOTIVOINAT.IDMOTIVOINAT = ITEMREPOSICAO.IDMOTIVOINAT
            WHERE ITEMESTAB.USAMIX = 'S'
              AND ITEMESTAB.ESTAB = ITEMESTAB.ESTABITEM 
              ${dynamicWhere}
            )X
            ORDER BY 3) Y
            FETCH FIRST 50 ROWS ONLY
        `;
        const result = await db.execute(sql, binds);
        console.log(`[PROD-SEARCH-FLEX] Hits: ${result.rows.length} | Terms: "${queryTerm}" Brand: "${brandTerm}" ID: "${idTerm}"`);
        res.json(result.rows);
    } catch (error) {
        console.error('Search Products Robust Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para servir imagem do produto via BLOB do Oracle
app.get('/api/product-image/:iditem', async (req, res) => {
    const { iditem } = req.params;
    let connection;

    try {
        const pool = await db.initialize();
        connection = await pool.getConnection();
        const sql = `
            SELECT IMAGEM 
            FROM VIASOFTMCP.ITEMIMAGEM 
            WHERE IDITEM = :iditem 
              AND IMAGEM IS NOT NULL
            FETCH FIRST 1 ROWS ONLY
        `;

        const result = await connection.execute(sql, { iditem }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

        if (result.rows.length === 0 || !result.rows[0].IMAGEM) {
            return res.status(404).send('Not Found');
        }

        const lob = result.rows[0].IMAGEM;

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');

        // Pipe do LOB para o Response e espera terminar para fechar conexão
        lob.pipe(res);

        lob.on('end', async () => {
            if (connection) {
                await connection.close().catch(err => console.error('Close error on end:', err));
            }
        });

        lob.on('error', async (err) => {
            console.error('LOB Stream Error:', err);
            if (!res.headersSent) res.status(500).send(err.message);
            if (connection) {
                await connection.close().catch(e => console.error('Close error on error:', e));
            }
        });

    } catch (error) {
        console.error('Fetch Product Image Error:', error);
        if (connection) await connection.close().catch(e => { });
        if (!res.headersSent) res.status(500).json({ error: error.message });
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
        const synthetic = await fetchLocal('/api/synthetic-sales-summary');
        console.log(`📊 Synthetic Sales Synced - Count: ${synthetic.length}`);

        const cacheData = {
            lastSync: new Date().toISOString(),
            data: { kpis, clients, sellers, synthetic }
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
        console.log(`🚀 Oracle API Gateway pool initialized`);
    } catch (err) {
        console.error('⚠️ Database Initialization Failed:', err.message);
        console.warn('⚠️ Starting in OFFLINE mode (serving cache only)');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Oracle API Gateway running on port ${PORT}`);
    });
}

start();

// Shutdown
process.on('SIGINT', async () => {
    await db.close();
    process.exit(0);
});
