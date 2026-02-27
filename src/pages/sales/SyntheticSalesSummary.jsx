import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { useApiData } from '../../hooks/useApiData';
import { CacheBanner } from '../../components/CacheBanner';
import { Calendar, Search, Download, Filter, TrendingUp, DollarSign, PieChart, Users, AlertCircle, Loader2 } from 'lucide-react';

const SyntheticSalesSummary = () => {
    const { theme } = useData();

    const formatDateLocal = (d) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Default dates: current month
    const now = new Date();
    const firstDay = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
    const lastDay = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const [dates, setDates] = useState({ start: firstDay, end: lastDay });
    const [searchTerm, setSearchTerm] = useState('');

    // Unified data fetching with automatic cache/company/params handling
    const endpoint = `synthetic-sales-summary?dtini=${dates.start}&dtfim=${dates.end}`;
    const {
        data: results = [],
        loading,
        error,
        fromCache,
        savedAt
    } = useApiData(endpoint, [dates.start, dates.end]);

    const data = results || [];

    const handleShortcut = (type) => {
        const today = new Date();
        let start, end;

        switch (type) {
            case 'hoje':
                start = today;
                end = today;
                break;
            case 'mes':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'ultimo_mes':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'ano':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            case 'ultimo_ano':
                start = new Date(today.getFullYear() - 1, 0, 1);
                end = new Date(today.getFullYear() - 1, 11, 31);
                break;
            default:
                return;
        }

        setDates({
            start: formatDateLocal(start),
            end: formatDateLocal(end)
        });
    };

    const filteredData = useMemo(() => {
        if (!searchTerm) return data;
        return data.filter(item =>
            item.vendedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.idvendedorint?.toString().includes(searchTerm)
        );
    }, [data, searchTerm]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            revenue: acc.revenue + (curr.vdaliq || 0),
            profit: acc.profit + (curr.lucro || 0),
            cost: acc.cost + (curr.custoliq || 0),
            rep: acc.rep + (curr.representatividade || 0)
        }), { revenue: 0, profit: 0, cost: 0, rep: 0 });
    }, [filteredData]);

    const avgMargin = totals.revenue ? (totals.profit / totals.revenue) * 100 : 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.3s' }}>
            <div style={{ padding: '32px 40px' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.03em', marginBottom: '8px' }}>Resumo Sintético de Vendas</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Visão consolidada de performance por vendedor baseado no ERP Viasoft</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { label: 'Hoje', id: 'hoje' },
                                { label: 'Este Mês', id: 'mes' },
                                { label: 'Último Mês', id: 'ultimo_mes' },
                                { label: 'Este Ano', id: 'ano' },
                                { label: 'Último Ano', id: 'ultimo_ano' }
                            ].map(btn => (
                                <Button
                                    key={btn.id}
                                    onClick={() => handleShortcut(btn.id)}
                                    style={{
                                        padding: '4px 10px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                    className="date-shortcut-btn"
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                padding: '4px 8px'
                            }}>
                                <Calendar size={16} style={{ margin: '0 8px', color: 'var(--text-muted)' }} />
                                <Input
                                    type="date"
                                    value={dates.start}
                                    onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '12px', padding: '6px', outline: 'none' }}
                                />
                                <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>até</span>
                                <Input
                                    type="date"
                                    value={dates.end}
                                    onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '12px', padding: '6px', outline: 'none' }}
                                />
                            </div>

                            <Button
                                disabled={loading}
                                style={{
                                    padding: '10px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Filter size={18} />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Status Banner (visible only on cache/offline) */}
                <CacheBanner fromCache={fromCache} savedAt={savedAt} error={error} />

                {/* KPI Overview */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
                    <KPICard title="Faturamento Líquido" value={formatCurrency(totals.revenue)} icon={<DollarSign size={18} />} color="var(--color-primary)" />
                    <KPICard title="Lucro Bruto" value={formatCurrency(totals.profit)} icon={<TrendingUp size={18} />} color="var(--color-success)" />
                    <KPICard title="Margem Média" value={avgMargin.toFixed(2) + '%'} icon={<PieChart size={18} />} color="var(--color-info)" />
                    <KPICard title="Vendedores Ativos" value={filteredData.length.toString()} icon={<Users size={18} />} color="var(--color-warning)" />
                </div>

                {/* Main Content Area */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '320px' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <Input
                                type="text"
                                placeholder="Buscar vendedor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px 10px 40px',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    color: 'var(--text-main)',
                                    fontSize: '13px',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <Button style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '16px',
                            color: 'var(--text-main)',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer'
                        }}>
                            <Download size={16} /> Exportar
                        </Button>
                    </div>

                    {error && data.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-error)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{error}</h3>
                            <p style={{ fontSize: '13px', marginTop: '4px' }}>Verifique se o Gateway Oracle está online.</p>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Vendedor</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Faturamento Bruto</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Devoluções</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Frete</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Rel. Líquido</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Margem (%)</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Lucro</th>
                                    <th style={{ ...thStyle, textAlign: 'right' }}>Repr. (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading && data.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ padding: '100px', textAlign: 'center' }}>
                                            <Loader2 size={32} className="animate-spin" style={{ opacity: 0.3, margin: '0 auto' }} />
                                            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Carregando dados do Oracle...</p>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>Nenhum dado encontrado para o período.</td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, idx) => {
                                        const margin = row.vdaliq ? (row.lucro / row.vdaliq) * 100 : 0;
                                        return (
                                            <tr key={idx} className="hover-row" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td style={tdStyle}>{row.idvendedorint}</td>
                                                <td style={{ ...tdStyle, fontWeight: '700' }}>{row.vendedor}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.vlrvda)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-error)' }}>{formatCurrency(row.vlrdev)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.vlrfrete)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{formatCurrency(row.vdaliq)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{
                                                        background: margin > 12 ? 'var(--color-success-dim)' : 'var(--color-error-dim)',
                                                        color: margin > 12 ? 'var(--color-success)' : 'var(--color-error)',
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        fontWeight: '800'
                                                    }}>
                                                        {margin.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-success)', fontWeight: '600' }}>{formatCurrency(row.lucro)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                        <div style={{ width: '60px', height: '4px', background: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${Math.min(row.representatividade * 2, 100)}%`, height: '100%', background: 'var(--color-primary)' }} />
                                                        </div>
                                                        <span style={{ fontSize: '11px', minWidth: '35px' }}>{(row.representatividade || 0).toFixed(1)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-row:hover { background: var(--bg-hover); }
                .date-shortcut-btn:hover { 
                    border-color: var(--color-primary) !important; 
                    color: var(--text-main) !important;
                    background: var(--bg-hover) !important;
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

const KPICard = ({ title, value, icon, color }) => (
    <Card padding="24px" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</span>
            <div style={{ color }}>{icon}</div>
        </div>
        <div style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-0.02em', color }}>{value}</div>
    </Card>
);

const thStyle = {
    padding: '16px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: '800',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid var(--border-color)'
};

const tdStyle = {
    padding: '16px 24px',
    fontSize: '13px',
    color: 'var(--text-main)',
};

export default SyntheticSalesSummary;
