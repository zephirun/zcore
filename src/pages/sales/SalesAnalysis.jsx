import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import DataGrid from '@/components/ui/DataGrid';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';

import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import {
    TrendingUp, RefreshCw, ArrowUpRight,
    DollarSign, Percent, CornerDownLeft, ShoppingCart,
    Tag, Truck, Hash, Users, BarChart2, Zap, ArrowLeft, UploadCloud
} from 'lucide-react';

const gridColumns = [
    { key: 'id', label: 'ID Operação', width: 120, sortable: true },
    { key: 'date', label: 'Data', width: 100 },
    { key: 'seller', label: 'Vendedor', sortable: true },
    { key: 'client', label: 'Cliente' },
    {
        key: 'status', label: 'Status', width: 120, render: (row) => (
            <span style={{
                padding: '2px 8px', borderRadius: 'var(--space-3)', fontSize: 'var(--text-xs)', fontWeight: 'bold',
                background: row.status === 'Concluído' ? 'rgba(34,197,94,0.1)' : row.status === 'Cancelado' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                color: row.status === 'Concluído' ? 'var(--color-success)' : row.status === 'Cancelado' ? 'var(--color-error)' : 'var(--color-warning)',
            }}>
                {row.status}
            </span>
        )
    },
    { key: 'value', label: 'Valor', width: 120, align: 'right', sortable: true, render: (row) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(row.value) },
];

const AVAILABLE_UNITS = [
    { id: '1001', name: 'GMAD Madville', color: 'var(--color-primary)' },
    { id: '1003', name: 'Madville Soluções', color: 'var(--color-info)' },
    { id: '1000', name: 'GMAD Curitiba', color: 'var(--color-success)' }
];

const SalesAnalysis = () => {
    const { toast } = useToast();
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    // Load data when unit is selected
    useEffect(() => {
        if (selectedUnit) {
            const stored = localStorage.getItem(`gmad_trimestral_${selectedUnit}`);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setDashboardData(parsed);
                } catch (e) {
                    console.error("Local Storage parse error", e);
                    setDashboardData(null);
                }
            } else {
                setDashboardData(null);
            }
        }
    }, [selectedUnit]);

    const handleFileUpload = (unitId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const text = event.target.result;
                const lines = text.split(/\r?\n/);
                const rawData = [];

                let totalFaturamento = 0;
                let totalMarginRev = 0;
                let totalFrete = 0;
                let totalDevolucoes = 0;
                let totalDescontos = 0;
                let qttVendas = 0;

                const sellerMap = new Map();

                const parseNum = (str) => {
                    if (!str) return 0;
                    let cleaned = str.replace(/[^\d.,-]/g, '');
                    if (cleaned.includes(',') && (!cleaned.includes('.') || cleaned.indexOf(',') > cleaned.indexOf('.'))) {
                        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                    }
                    return parseFloat(cleaned) || 0;
                };

                // Helper to parse line respecting quotes
                const parseLine = (line) => {
                    const result = [];
                    let current = '';
                    let inQuotes = false;
                    for (let i = 0; i < line.length; i++) {
                        const char = line[i];
                        if (char === '"') {
                            inQuotes = !inQuotes;
                        } else if (char === ';' && !inQuotes) {
                            result.push(current.trim());
                            current = '';
                        } else {
                            current += char;
                        }
                    }
                    result.push(current.trim());
                    return result;
                };

                const cleanStr = (s) => s ? s.replace(/^"|"$/g, '').replace(/[\s\u00A0]+/g, ' ').trim() : '';

                // Assuming CSV Format: ID, VENDEDOR, CLIENTE, DATA, STATUS, VALOR, MARGEM(%), FRETE, DESCONTO, DEVOLUÇÃO
                // Simple parser adapted for summary logic as requested.
                // We will use standard indexing but adapt gracefully if headers mismatch typical formats.
                let dataStartIndex = 0;
                if (lines[0] && lines[0].toUpperCase().includes('VENDEDOR')) {
                    dataStartIndex = 1; // skip header
                }

                for (let i = dataStartIndex; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line || line.toUpperCase().includes('TOTAL')) continue;

                    const cols = parseLine(line);
                    if (cols.length < 6) continue;

                    // Depending on the exact CSV provided, we map columns. 
                    // Making assumptions based on typical report formats or a generic structure provided:
                    // 0: ID_OPERACAO, 1: VENDEDOR, 2: CLIENTE, 3: DATA, 4: STATUS, 5: VALOR, 6: MARGEM%, 7: FRETE, 8: DESCONTO, 9: DEVOLUCAO

                    const opId = cleanStr(cols[0]) || `OP-${1000 + i}`;
                    const vendedor = cleanStr(cols[1]) || 'N/A';
                    const cliente = cleanStr(cols[2]) || 'N/A';
                    const dataObj = cleanStr(cols[3]) || new Date().toLocaleDateString('pt-BR');
                    const statusObj = cleanStr(cols[4]) || 'Concluído';

                    const valor = parseNum(cols[5]);
                    const margemPercent = parseNum(cols[6]) || 20; // Default or parsed
                    const frete = parseNum(cols[7]) || 0;
                    const desconto = parseNum(cols[8]) || 0;
                    const devolucao = parseNum(cols[9]) || 0;

                    if (valor === 0) continue;

                    totalFaturamento += valor;
                    totalMarginRev += (valor * (margemPercent / 100));
                    totalFrete += frete;
                    totalDescontos += desconto;
                    totalDevolucoes += devolucao;
                    qttVendas++;

                    // Add to raw data for table
                    rawData.push({
                        id: opId,
                        date: dataObj,
                        seller: vendedor,
                        client: cliente,
                        status: statusObj,
                        value: valor
                    });

                    // Aggregate seller
                    const currentSellerTotal = sellerMap.get(vendedor) || 0;
                    sellerMap.set(vendedor, currentSellerTotal + valor);
                }

                const kpis = {
                    faturamento: totalFaturamento,
                    lucro: totalMarginRev,
                    margem: totalFaturamento ? parseFloat(((totalMarginRev / totalFaturamento) * 100).toFixed(2)) : 0,
                    devolucoes: totalDevolucoes,
                    descontos: totalDescontos,
                    frete: totalFrete,
                    qtdVendas: qttVendas,
                    ticketMedio: qttVendas ? parseFloat((totalFaturamento / qttVendas).toFixed(2)) : 0
                };

                // Sort Sellers
                const sortedSellers = Array.from(sellerMap.entries())
                    .map(([nome, valor]) => ({
                        nome,
                        valor,
                        percent: totalFaturamento ? parseFloat(((valor / totalFaturamento) * 100).toFixed(2)) : 0
                    }))
                    .sort((a, b) => b.valor - a.valor);

                const finalData = {
                    metadata: { unit: unitId, uploadedAt: new Date().toISOString() },
                    kpis,
                    sellers: sortedSellers,
                    rawData
                };

                localStorage.setItem(`gmad_trimestral_${unitId}`, JSON.stringify(finalData));

                toast.success(`Dados da filial ${unitId} importados com sucesso!`);

                if (selectedUnit === unitId) {
                    setDashboardData(finalData);
                }

            } catch (err) {
                console.error("Upload Error", err);
                toast.error("Falha ao processar arquivo CSV: Verifique a formatação.");
            } finally {
                setIsUploading(false);
                e.target.value = ''; // Reset file input
            }
        };

        reader.readAsText(file, 'ISO-8859-1'); // Common encoding for PT-BR CSVs from ERPs
    };

    const clearLocalData = (unitId) => {
        if (window.confirm(`Tem certeza que deseja apagar a análise da filial ${unitId}?`)) {
            localStorage.removeItem(`gmad_trimestral_${unitId}`);
            if (selectedUnit === unitId) {
                setDashboardData(null);
            }
            toast.info(`Estatísticas da filial ${unitId} limpas.`);
        }
    }


    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    const fmtNum = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);

    const RANK_COLORS = [
        { bar: 'linear-gradient(90deg, #22d3ee, #06b6d4)', glow: 'rgba(34,211,238,0.3)' },
        { bar: 'linear-gradient(90deg, #818cf8, #6366f1)', glow: 'rgba(99,102,241,0.3)' },
        { bar: 'linear-gradient(90deg, #34d399, #10b981)', glow: 'rgba(52,211,153,0.3)' },
        { bar: 'linear-gradient(90deg, #fb923c, #f97316)', glow: 'rgba(249,115,22,0.3)' },
        { bar: 'linear-gradient(90deg, #f472b6, #ec4899)', glow: 'rgba(236,72,153,0.3)' },
    ];

    // ============================================
    // SCREEN 1: LANDING & UNIT SELECTION
    // ============================================
    if (!selectedUnit) {
        return (
            <PageContainer title="Análise Trimestral de Vendas" subtitle="Selecione uma filial para analisar ou faça upload do extrato de vendas (CSV)">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)', marginTop: 'var(--space-8)' }}>
                    {AVAILABLE_UNITS.map(unit => {
                        const isUploaded = !!localStorage.getItem(`gmad_trimestral_${unit.id}`);

                        return (
                            <Card key={unit.id} padding="var(--space-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', borderTop: `4px solid ${unit.color}` }}>
                                <div>
                                    <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-black)', margin: 0, color: 'var(--text-main)' }}>Filial {unit.id}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: '4px 0 0 0' }}>{unit.name}</p>
                                </div>

                                <div style={{
                                    padding: 'var(--space-4)',
                                    background: isUploaded ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-input)',
                                    borderRadius: 'var(--space-3)',
                                    color: isUploaded ? 'var(--color-success)' : 'var(--text-muted)',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: 'var(--font-semibold)',
                                    display: 'flex', alignItems: 'center', gap: '8px'
                                }}>
                                    {isUploaded ? <><TrendingUp size={16} /> Base de Dados Analisada</> : <><Tag size={16} /> Base vazia</>}
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'auto' }}>
                                    {isUploaded ? (
                                        <>
                                            <Button variant="primary" fullWidth onClick={() => setSelectedUnit(unit.id)}>Abrir Análise</Button>
                                            <Button variant="ghost" onClick={() => clearLocalData(unit.id)} style={{ color: 'var(--color-error)' }}>Limpar</Button>
                                        </>
                                    ) : (
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <Input
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => handleFileUpload(unit.id, e)}
                                                disabled={isUploading}
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1 }}
                                            />
                                            <Button variant="secondary" fullWidth disabled={isUploading} style={{ pointerEvents: 'none' }}>
                                                <UploadCloud size={16} style={{ marginRight: '8px' }} /> Fazer Upload CSV
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )
                    })}
                </div>
            </PageContainer>
        );
    }

    // ============================================
    // SCREEN 2: DASHBOARD (AFTER SELECTION)
    // ============================================

    // If unit is selected but no data exists locally (safety check)
    if (!dashboardData) {
        return (
            <PageContainer title={`Análise: Filial ${selectedUnit}`} subtitle="Dados não encontrados.">
                <Button variant="primary" onClick={() => setSelectedUnit(null)}>Voltar para Seleção central</Button>
            </PageContainer>
        )
    }

    const { kpis, sellers, rawData, metadata } = dashboardData;
    const topSeller = sellers && sellers[0];

    return (
        <PageContainer
            title={`Análise de Vendas • Filial ${selectedUnit}`}
            subtitle={`Base processada localmente (${new Date(metadata.uploadedAt).toLocaleString('pt-BR')})`}
            actions={
                <Button
                    variant="ghost"
                    onClick={() => setSelectedUnit(null)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                        color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)'
                    }}
                >
                    <ArrowLeft size={16} /> Voltar à Seleção
                </Button>
            }
        >

            {/* ── Top KPI Strip ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {[
                    { label: 'Faturamento Bruto', value: fmt(kpis.faturamento), icon: <DollarSign size={18} />, color: 'var(--color-primary)' },
                    { label: 'Lucro Bruto', value: fmt(kpis.lucro), icon: <TrendingUp size={18} />, color: 'var(--color-success)' },
                    { label: 'Margem', value: `${kpis.margem || 0}% `, icon: <Percent size={18} />, color: 'var(--color-info)' },
                    { label: 'Ticket Médio', value: fmt(kpis.ticketMedio), icon: <Zap size={18} />, color: 'var(--color-warning)' },
                ].map((kpi, i) => (
                    <Card key={i} padding="24px" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: '0 0 16px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{kpi.label}</p>
                            <p style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', margin: 0, color: kpi.color, letterSpacing: '-0.02em' }}>
                                {kpi.value}
                            </p>
                        </div>
                        <div style={{ color: kpi.color, opacity: 0.8 }}>
                            {kpi.icon}
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Main Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-4)', alignItems: 'start' }}>

                {/* LEFT: Sellers Ranking */}
                <Card padding="28px">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                        <div>
                            <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ranking de Vendedores</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>Faturamento bruto do arquivo</p>
                        </div>
                        {topSeller && (
                            <div style={{
                                padding: '6px 14px', borderRadius: '100px', fontSize: 'var(--text-xs)', fontWeight: '800',
                                backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                Líder: {topSeller.nome.split(' ')[0]}
                            </div>
                        )}
                    </div>

                    {sellers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                            Nenhum vendedor encontrado.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {sellers.slice(0, 10).map((seller, index) => {
                                const initials = seller.nome.split(' ').map(n => n[0]).join('').substring(0, 2);
                                return (
                                    <div key={index} style={{
                                        padding: '12px 16px', borderRadius: 'var(--space-3)',
                                        background: index === 0 ? 'var(--bg-input)' : 'transparent',
                                        border: `1px solid ${index === 0 ? 'var(--border-color)' : 'transparent'} `,
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                            <div style={{
                                                width: 'var(--space-6)', textAlign: 'center',
                                                fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', opacity: 0.5
                                            }}>
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div style={{
                                                width: 'var(--space-8)', height: 'var(--space-8)', borderRadius: 'var(--space-2)', flexShrink: 0,
                                                background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-primary)'
                                            }}>
                                                {initials}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                                                    <span style={{ fontWeight: 'var(--font-semibold)', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                                        {seller.nome}
                                                    </span>
                                                    <span style={{ fontWeight: '800', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        {fmt(seller.valor)}
                                                    </span>
                                                </div>
                                                <div style={{ height: 'var(--space-1)', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${Math.min(seller.percent, 100)}% `, height: '100%', background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 1s ease-out' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                {/* RIGHT: KPI Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {/* Total Card */}
                    <div className="glass-card" style={{
                        padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(99,102,241,0.06))',
                        border: '1px solid rgba(34,211,238,0.15)'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)', fontWeight: 'var(--font-medium)' }}>FATURAMENTO ANALISADO</p>
                        <h2 style={{ fontSize: '30px', fontWeight: 'var(--font-bold)', margin: '0 0 4px', letterSpacing: '-1px' }}>
                            {fmt(kpis.faturamento)}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', color: '#34d399', fontSize: '13px', fontWeight: 'var(--font-semibold)' }}>
                            <ArrowUpRight size={14} /> Valor Bruto
                        </div>
                    </div>

                    {/* KPI List */}
                    <div className="glass-card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-bold)', margin: '0 0 20px', color: 'var(--text-muted)' }}>DETALHES</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {[
                                { label: 'Devoluções', value: fmt(kpis.devolucoes), icon: <CornerDownLeft size={15} />, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
                                { label: 'Descontos', value: fmt(kpis.descontos), icon: <Tag size={15} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
                                { label: 'Frete Total', value: fmt(kpis.frete), icon: <Truck size={15} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                                { label: 'Qtd. Vendas', value: fmtNum(kpis.qtdVendas), icon: <ShoppingCart size={15} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
                                { label: 'Ticket Médio', value: fmt(kpis.ticketMedio), icon: <Percent size={15} />, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: 'var(--radius)', flexShrink: 0, background: item.bg, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-medium)' }}>{item.label}</span>
                                        <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)' }}>
                                            {item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sellers Summary */}
                    <div className="glass-card" style={{ padding: '20px 24px', borderRadius: 'var(--radius-xl)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                <Users size={16} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-medium)' }}>Vendedores listados</span>
                            </div>
                            <span style={{ fontWeight: '800', fontSize: 'var(--text-2xl)' }}>{sellers.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Enterprise Data Grid ── */}
            <div style={{ marginTop: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                    <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: '800', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Histórico Bruto Importado • <span style={{ color: 'var(--color-primary)' }}>Full Virtualization</span>
                    </h2>
                </div>
                {rawData && rawData.length > 0 ? (
                    <DataGrid columns={gridColumns} data={rawData} rowHeightMode="compact" height="500px" />
                ) : (
                    <Card padding="var(--space-8)" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        Nenhum registro individual encontrado no CSV.
                    </Card>
                )}

            </div>
        </PageContainer>
    );
};

export default SalesAnalysis;
