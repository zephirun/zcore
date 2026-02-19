import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { fetchMonthlyBilling, fetchSellersPerformance, fetchDetailedKPIs } from '../../services/oracleService';
import {
    TrendingUp, RefreshCw, ArrowUpRight,
    DollarSign, Percent, CornerDownLeft, ShoppingCart,
    Tag, Truck, Hash, Users, BarChart2, Zap
} from 'lucide-react';

const SalesAnalysis = () => {
    const { theme } = useData();
    const [loading, setLoading] = useState(true);
    const [billingTotal, setBillingTotal] = useState(0);
    const [sellers, setSellers] = useState([]);
    const [kpis, setKpis] = useState({});
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [error, setError] = useState(null);

    useEffect(() => { loadData(); }, []);

    // Sequential loading avoids connection pool exhaustion on fresh API starts
    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const total = await fetchMonthlyBilling();
            setBillingTotal(total);

            const sellerData = await fetchSellersPerformance();
            setSellers(Array.isArray(sellerData) ? sellerData : []);

            const kpiData = await fetchDetailedKPIs();
            setKpis(kpiData || {});

            setLastUpdate(new Date());
        } catch (err) {
            console.error('Error loading sales analysis:', err);
            setError('Erro ao carregar dados. Verifique se o servidor Oracle está online.');
        } finally {
            setLoading(false);
        }
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
        <div style={{ padding: '28px', color: 'var(--text-main)', maxWidth: '1600px', margin: '0 auto' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(99,102,241,0.2))',
                            border: '1px solid rgba(34,211,238,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <BarChart2 size={20} color="var(--color-primary)" />
                        </div>
                        <h1 style={{ fontSize: '26px', fontWeight: '800', margin: 0 }}>
                            Análise de Vendas <span style={{ color: 'var(--color-primary)' }}>Real-Time</span>
                        </h1>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0, paddingLeft: '52px' }}>
                        Dados diretos do Oracle Viasoft • Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                    </p>
                </div>
                <button
                    onClick={loadData}
                    disabled={loading}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 20px', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                        background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)',
                        color: 'var(--color-primary)', fontWeight: '600', fontSize: '14px',
                        transition: 'all 0.2s', opacity: loading ? 0.6 : 1
                    }}
                >
                    <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
                    Atualizar
                </button>
            </div>

            {/* ── Error Banner ── */}
            {error && (
                <div style={{
                    padding: '14px 20px', borderRadius: '12px', marginBottom: '24px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171', fontSize: '14px'
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* ── Top KPI Strip ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                {[
                    { label: 'Faturamento Bruto', value: fmt(kpis.faturamento), icon: <DollarSign size={18} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
                    { label: 'Lucro Bruto', value: fmt(kpis.lucro), icon: <TrendingUp size={18} />, color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
                    { label: 'Margem', value: `${kpis.margem || 0}%`, icon: <Percent size={18} />, color: '#818cf8', bg: 'rgba(129,140,248,0.1)' },
                    { label: 'Ticket Médio', value: fmt(kpis.ticketMedio), icon: <Zap size={18} />, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
                ].map((kpi, i) => (
                    <div key={i} className="glass-card" style={{
                        padding: '20px', borderRadius: '20px',
                        display: 'flex', alignItems: 'center', gap: '16px'
                    }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                            background: kpi.bg, color: kpi.color,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: '0 0 4px', fontWeight: '500' }}>{kpi.label}</p>
                            <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>
                                {loading ? <span style={{ opacity: 0.4 }}>—</span> : kpi.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Main Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>

                {/* LEFT: Sellers Ranking */}
                <div className="glass-card" style={{ padding: '28px', borderRadius: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px' }}>Ranking de Vendedores</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: 0 }}>Faturamento bruto no mês atual</p>
                        </div>
                        {topSeller && (
                            <div style={{
                                padding: '6px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: '600',
                                background: 'rgba(34,211,238,0.1)', color: 'var(--color-primary)',
                                border: '1px solid rgba(34,211,238,0.2)'
                            }}>
                                🏆 {topSeller.nome.split(' ')[0]}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} style={{ height: '56px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s infinite' }} />
                            ))}
                        </div>
                    ) : sellers.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Nenhum dado disponível
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {sellers.map((seller, index) => {
                                const color = RANK_COLORS[index % RANK_COLORS.length];
                                const initials = seller.nome.split(' ').map(n => n[0]).join('').substring(0, 2);
                                return (
                                    <div key={index} style={{
                                        padding: '14px 16px', borderRadius: '16px',
                                        background: index === 0 ? 'rgba(34,211,238,0.05)' : 'rgba(255,255,255,0.02)',
                                        border: `1px solid ${index === 0 ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.04)'}`,
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            {/* Rank # */}
                                            <div style={{
                                                width: '28px', textAlign: 'center',
                                                fontSize: '13px', fontWeight: '700',
                                                color: index === 0 ? '#fbbf24' : 'var(--text-muted)'
                                            }}>
                                                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                            </div>
                                            {/* Avatar */}
                                            <div style={{
                                                width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
                                                background: color.bg ?? 'rgba(34,211,238,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '13px', fontWeight: '700', color: '#22d3ee'
                                            }}>
                                                {initials}
                                            </div>
                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                    <span style={{ fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                                                        {seller.nome}
                                                    </span>
                                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-primary)', flexShrink: 0, marginLeft: '8px' }}>
                                                        {fmt(seller.valor)}
                                                    </span>
                                                </div>
                                                {/* Progress bar */}
                                                <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${Math.min(seller.percent, 100)}%`,
                                                        height: '100%',
                                                        background: color.bar,
                                                        borderRadius: '3px',
                                                        transition: 'width 1s ease-out',
                                                        boxShadow: `0 0 8px ${color.glow}`
                                                    }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT: KPI Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Total Card */}
                    <div className="glass-card" style={{
                        padding: '24px', borderRadius: '24px', textAlign: 'center',
                        background: 'linear-gradient(135deg, rgba(34,211,238,0.06), rgba(99,102,241,0.06))',
                        border: '1px solid rgba(34,211,238,0.15)'
                    }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px', fontWeight: '500' }}>FATURAMENTO DO MÊS</p>
                        <h2 style={{ fontSize: '30px', fontWeight: '900', margin: '0 0 4px', letterSpacing: '-1px' }}>
                            {loading ? '—' : fmt(kpis.faturamento || billingTotal)}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#34d399', fontSize: '13px', fontWeight: '600' }}>
                            <ArrowUpRight size={14} /> Valor Bruto
                        </div>
                    </div>

                    {/* KPI List */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '24px' }}>
                        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 20px', color: 'var(--text-muted)' }}>DETALHES</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {[
                                { label: 'Devoluções', value: fmt(kpis.devolucoes), icon: <CornerDownLeft size={15} />, color: '#f87171', bg: 'rgba(248,113,113,0.1)' },
                                { label: 'Descontos', value: fmt(kpis.descontos), icon: <Tag size={15} />, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
                                { label: 'Frete Total', value: fmt(kpis.frete), icon: <Truck size={15} />, color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
                                { label: 'Qtd. Vendas', value: fmtNum(kpis.qtdVendas), icon: <ShoppingCart size={15} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
                                { label: 'Ticket Médio', value: fmt(kpis.ticketMedio), icon: <Percent size={15} />, color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                                        background: item.bg, color: item.color,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {item.icon}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>{item.label}</span>
                                        <span style={{ fontWeight: '700', fontSize: '14px' }}>
                                            {loading ? '—' : item.value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sellers Summary */}
                    <div className="glass-card" style={{ padding: '20px 24px', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Users size={16} color="var(--text-muted)" />
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>Vendedores ativos</span>
                            </div>
                            <span style={{ fontWeight: '800', fontSize: '20px' }}>{sellers.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesAnalysis;
