import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import DataGrid from '@/components/ui/DataGrid';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMonthlyBillingQuery, useSellersPerformanceQuery, useDetailedKPIsQuery } from '../../hooks/useSalesQueries';
import { useToast } from '../../context/ToastContext';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import {
    TrendingUp, RefreshCw, ArrowUpRight,
    DollarSign, Percent, CornerDownLeft, ShoppingCart,
    Tag, Truck, Hash, Users, BarChart2, Zap
} from 'lucide-react';

// MOCK DATA FOR 50k STRESS TEST
const MOCK_SALES_DATA = Array.from({ length: 50000 }).map((_, i) => ({
    id: `OP-${100000 + i}`,
    date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('pt-BR'),
    seller: `Vendedor ${Math.floor(Math.random() * 50) + 1}`,
    client: `Cliente Enterprise ${Math.floor(Math.random() * 1000) + 1}`,
    value: Math.random() * 50000 + 1000,
    status: Math.random() > 0.8 ? 'Cancelado' : (Math.random() > 0.3 ? 'Concluído' : 'Pendente'),
}));

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

const SalesAnalysis = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // React Query Hooks (Parallel non-blocking fetch with built-in cache)
    const { data: billingTotal, isPending: isLoadingBilling, isFetching: isFetchingBilling } = useMonthlyBillingQuery();
    const { data: sellersData, isPending: isLoadingSellers, isFetching: isFetchingSellers, isError: isSellersError, error: sellersError } = useSellersPerformanceQuery();
    const { data: kpisData, isPending: isLoadingKpis, isFetching: isFetchingKpis } = useDetailedKPIsQuery();

    const sellers = Array.isArray(sellersData) ? sellersData : [];
    const kpis = kpisData || {};

    // Global Loading state definition
    // isPending means there's no data yet (first mount), isFetching means background refetch
    const isPending = isLoadingBilling || isLoadingSellers || isLoadingKpis;
    const isFetching = isFetchingBilling || isFetchingSellers || isFetchingKpis;

    React.useEffect(() => {
        if (isSellersError) {
            toast.error('Falha de Sincronização', sellersError?.message || 'Erro ao comunicar com Oracle DB.');
        }
    }, [isSellersError, sellersError, toast]);

    const handleRefetch = () => {
        // Force refetch all sales queries and show toast
        queryClient.invalidateQueries({ queryKey: ['sales'] });
        toast.info('Sincronizando dados com o Oracle...');
    };

    const fmt = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
    const fmtNum = (val) => new Intl.NumberFormat('pt-BR').format(val || 0);

    const RANK_COLORS = [
        { bar: 'linear-gradient(90deg, #22d3ee, #06b6d4)', glow: 'rgba(34,211,238,0.3)' },
        { bar: 'linear-gradient(90deg, #818cf8, #6366f1)', glow: 'rgba(99,102,241,0.3)' },
        { bar: 'linear-gradient(90deg, #34d399, #10b981)', glow: 'rgba(52,211,153,0.3)' },
        { bar: 'linear-gradient(90deg, #fb923c, #f97316)', glow: 'rgba(249,115,22,0.3)' },
        { bar: 'linear-gradient(90deg, #f472b6, #ec4899)', glow: 'rgba(236,72,153,0.3)' },
    ];

    const topSeller = sellers[0];

    return (
        <PageContainer
            title="Análise de Vendas"
            subtitle={isFetching ? 'Sincronizando com Oracle DB...' : 'Dados em Cache Eficiente • Sincronizado'}
            isLoading={isPending}
            actions={
                <Button
                    onClick={handleRefetch}
                    disabled={isFetching}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
                        padding: '10px 20px', borderRadius: 'var(--space-3)', cursor: isFetching ? 'not-allowed' : 'pointer',
                        background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)',
                        color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-base)',
                        transition: 'all 0.2s', opacity: isFetching ? 0.6 : 1
                    }}
                >
                    <RefreshCw size={16} style={{ animation: isFetching ? 'spin 1s linear infinite' : 'none' }} />
                    Sincronizar Oracle
                </Button>
            }
        >

            {/* ── Top KPI Strip ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                {!isPending && (
                    [
                        { label: 'Faturamento Bruto', value: fmt(kpis.faturamento), icon: <DollarSign size={18} />, color: 'var(--color-primary)' },
                        { label: 'Lucro Bruto', value: fmt(kpis.lucro), icon: <TrendingUp size={18} />, color: 'var(--color-success)' },
                        { label: 'Margem', value: `${kpis.margem || 0}%`, icon: <Percent size={18} />, color: 'var(--color-info)' },
                        { label: 'Ticket Médio', value: fmt(kpis.ticketMedio), icon: <Zap size={18} />, color: 'var(--color-warning)' },
                    ].map((kpi, i) => (
                        <Card key={i} padding="24px" style={{
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.3s'
                        }}>
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
                    ))
                )}
            </div>

            {/* ── Main Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-4)', alignItems: 'start' }}>

                {/* LEFT: Sellers Ranking */}
                <Card padding="28px">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
<div>
                            <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ranking de Vendedores</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', margin: 0 }}>Faturamento bruto no mês atual</p>
                        </div>
                        {!isPending && topSeller && (
                            <div style={{
                                padding: '6px 14px', borderRadius: '100px', fontSize: 'var(--text-xs)', fontWeight: '800',
                                backgroundColor: 'var(--color-primary-dim)', color: 'var(--color-primary)',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                Líder: {topSeller.nome.split(' ')[0]}
                            </div>
                        )}
                    </div>

                    {isPending ? (
                        <Skeleton variant="table" />
                    ) : sellers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--text-muted)' }}>
                            Nenhum dado disponível
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', opacity: isFetchingSellers ? 0.7 : 1, transition: 'opacity 0.3s' }}>
{sellers.map((seller, index) => {
                                const color = RANK_COLORS[index % RANK_COLORS.length];
                                const initials = seller.nome.split(' ').map(n => n[0]).join('').substring(0, 2);
                                return (
                                    <div key={index} style={{
                                        padding: '12px 16px', borderRadius: 'var(--space-3)',
                                        background: index === 0 ? 'var(--bg-input)' : 'transparent',
                                        border: `1px solid ${index === 0 ? 'var(--border-color)' : 'transparent'}`,
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
<div style={{
                                                width: 'var(--space-6)', textAlign: 'center',
                                                fontSize: 'var(--text-xs)', fontWeight: '800',
                                                color: 'var(--text-muted)',
                                                opacity: 0.5
                                            }}>
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div style={{
                                                width: 'var(--space-8)', height: 'var(--space-8)', borderRadius: 'var(--space-2)', flexShrink: 0,
                                                background: 'var(--bg-input)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                                                    <div style={{
                                                        width: `${Math.min(seller.percent, 100)}%`,
                                                        height: '100%',
                                                        background: 'var(--color-primary)',
                                                        borderRadius: '2px',
                                                        transition: 'width 1s ease-out'
                                                    }} />
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
{isPending ? (
                        <>
                            <Skeleton variant="card" height="180px" />
                            <Skeleton variant="card" height="300px" />
                        </>
                    ) : (
                        <>
                            {/* Total Card */}
                            <div className="glass-card" style={{
                                padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', textAlign: 'center',
                                background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(99,102,241,0.06))',
                                border: '1px solid rgba(34,211,238,0.15)',
                                opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.3s'
                            }}>
                                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)', fontWeight: 'var(--font-medium)' }}>FATURAMENTO DO MÊS</p>
                                <h2 style={{ fontSize: '30px', fontWeight: 'var(--font-bold)', margin: '0 0 4px', letterSpacing: '-1px' }}>
                                    {fmt(kpis.faturamento || billingTotal)}
                                </h2>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', color: '#34d399', fontSize: '13px', fontWeight: 'var(--font-semibold)' }}>
<ArrowUpRight size={14} /> Valor Bruto
                                </div>
                            </div>

                            {/* KPI List */}
                            <div className="glass-card" style={{ padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.3s' }}>
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
                                                width: '36px', height: '36px', borderRadius: 'var(--radius)', flexShrink: 0,
                                                background: item.bg, color: item.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
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
                            <div className="glass-card" style={{ padding: '20px 24px', borderRadius: 'var(--radius-xl)', opacity: isFetching ? 0.7 : 1, transition: 'opacity 0.3s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
<Users size={16} color="var(--text-muted)" />
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-medium)' }}>Vendedores ativos</span>
                                    </div>
                                    <span style={{ fontWeight: '800', fontSize: 'var(--text-2xl)' }}>{sellers.length}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Enterprise Data Grid Stress Test ── */}
            <div style={{ marginTop: 'var(--space-8)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
<h2 style={{ fontSize: 'var(--text-xs)', fontWeight: '800', margin: 0, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Histórico Detalhado • <span style={{ color: 'var(--color-primary)' }}>Full Virtualization</span></h2>
                </div>
                <DataGrid
                    columns={gridColumns}
                    data={MOCK_SALES_DATA}
                    rowHeightMode="compact"
                    height="500px"
                />
            </div>
        </PageContainer>
    );
};

export default SalesAnalysis;
