import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Calendar, Search, Download, Filter, TrendingUp, DollarSign, PieChart, Users, AlertCircle, Loader2 } from 'lucide-react';
import Skeleton from '../../components/ui/Skeleton';
import SearchableSelect from '../../components/SearchableSelect';

const SyntheticSalesSummary = () => {
    const { fetchSyntheticSummary, theme, activeUnit } = useData();

    const formatDateLocal = (d) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Default dates: current month
    const now = new Date();
    const firstDay = formatDateLocal(new Date(now.getFullYear(), now.getMonth(), 1));
    const lastDay = formatDateLocal(new Date(now.getFullYear(), now.getMonth() + 1, 0));

    const [dates, setDates] = useState({ start: firstDay, end: lastDay });
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

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

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await fetchSyntheticSummary(dates.start, dates.end);
            setData(results || []);
        } catch (err) {
            console.error("Error loading synthetic summary:", err);
            setError("Falha ao comunicar com a API Oracle. Verifique se o Gateway está online.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [dates, activeUnit]);

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
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)', transition: 'all 0.15s' }}>
            <div style={{ padding: '24px 40px' }}>
                {/* Header Section */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: 'var(--space-4)'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '20px',
                            fontWeight: 'var(--font-bold)',
                            color: 'var(--text-main)',
                            margin: '0 0 4px 0',
                            letterSpacing: '-0.01em'
                        }}>
                            Resumo Sintético de Vendas
                        </h1>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            margin: 0
                        }}>
                            Visão consolidada de performance por vendedor • ERP Viasoft
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-4)' }}>
                        <div style={{
                            display: 'flex',
                            background: 'var(--bg-input)',
                            padding: '2px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            gap: 'var(--space-4)'
                        }}>
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
                                        padding: '4px 12px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: 'var(--radius-xs)',
                                        color: 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.1s'
                                    }}
                                    className="date-shortcut-btn"
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0 8px',
                                height: '36px'
                            }}>
                                <Calendar size={14} style={{ margin: '0 6px', color: 'var(--text-muted)' }} />
                                <Input
                                    type="date"
                                    value={dates.start}
                                    onChange={(e) => setDates(prev => ({ ...prev, start: e.target.value }))}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-main)',
                                        fontSize: '12px',
                                        padding: '4px',
                                        outline: 'none',
                                        width: '120px'
                                    }}
                                />
                                <span style={{ color: 'var(--text-muted)', margin: '0 4px', fontSize: '12px' }}>—</span>
                                <Input
                                    type="date"
                                    value={dates.end}
                                    onChange={(e) => setDates(prev => ({ ...prev, end: e.target.value }))}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-main)',
                                        fontSize: '12px',
                                        padding: '4px',
                                        outline: 'none',
                                        width: '120px'
                                    }}
                                />
                            </div>

                            <Button
                                onClick={loadData}
                                disabled={loading}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    padding: '0',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--text-main)'
                                }}>
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Filter size={16} />}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* KPI Overview */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 'var(--space-4)',
                    marginBottom: 'var(--space-4)'
                }}>
                    {loading ? (
                        <>
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                        </>
                    ) : (
                        <>
                            <KPICard title="Faturamento Líquido" value={formatCurrency(totals.revenue)} icon={<DollarSign size={16} />} colorVar="--color-success-strong" />
                            <KPICard title="Lucro Bruto" value={formatCurrency(totals.profit)} icon={<TrendingUp size={16} />} colorVar="--color-success-strong" />
                            <KPICard title="Margem Média" value={avgMargin.toFixed(2) + '%'} icon={<PieChart size={16} />} colorVar="--color-info-strong" />
                            <KPICard title="Vendedores Ativos" value={filteredData.length.toString()} icon={<Users size={16} />} colorVar="--color-warning-strong" />
                        </>
                    )}
                </div>

                {/* Main Content Area */}
                <div style={{
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <div style={{
                        padding: '16px 24px',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: "var(--space-4)"
                    }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <Input
                                type="text"
                                placeholder="Buscar vendedor..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px 8px 36px',
                                    background: 'var(--bg-input)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-sm)',
                                    color: 'var(--text-main)',
                                    fontSize: '13px',
                                    outline: 'none',
                                    height: '36px'
                                }}
                            />
                        </div>
                        <Button style={{
                            padding: '0 16px',
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-main)',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            cursor: 'pointer',
                            height: '36px',
                            transition: 'all 0.15s'
                        }}>
                            <Download size={14} /> Exportar
                        </Button>
                    </div>

                    {error && (
                        <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--color-error)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <AlertCircle size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }}>{error}</h3>
                            <Button onClick={loadData} style={{ marginTop: 'var(--space-4)', background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '8px 24px', borderRadius: 'var(--space-4)', color: 'var(--text-main)', cursor: 'pointer' }}>Tentar Novamente</Button>
                        </div>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0 }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)' }}>
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
                                    [...Array(6)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan="9" style={{ padding: '12px 24px' }}>
                                                <Skeleton height={32} borderRadius="var(--radius-xs)" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>Nenhum dado encontrado para o período.</td>
                                    </tr>
                                ) : (
                                    filteredData.map((row, idx) => {
                                        const margin = row.vdaliq ? (row.lucro / row.vdaliq) * 100 : 0;
                                        const isLowMargin = margin <= 12;

                                        return (
                                            <tr key={idx} className="hover-row" style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.1s' }}>
                                                <td style={tdStyle}>{row.idvendedorint}</td>
                                                <td style={{ ...tdStyle, fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{row.vendedor}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.vlrvda)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-error-strong)' }}>{formatCurrency(row.vlrdev)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>{formatCurrency(row.vlrfrete)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: '600' }}>{formatCurrency(row.vdaliq)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                                    <span style={{
                                                        background: isLowMargin ? 'var(--color-error-light)' : 'var(--color-success-light)',
                                                        color: isLowMargin ? 'var(--color-error-strong)' : 'var(--color-success-strong)',
                                                        padding: '2px 10px',
                                                        borderRadius: 'var(--radius-full)',
                                                        fontSize: '11px',
                                                        fontWeight: 'var(--font-bold)',
                                                        display: 'inline-block',
                                                        minWidth: '55px',
                                                        textAlign: 'center'
                                                    }}>
                                                        {margin.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td style={{ ...tdStyle, textAlign: 'right', color: 'var(--color-success-strong)', fontWeight: '600' }}>{formatCurrency(row.lucro)}</td>
                                                <td style={{ ...tdStyle, textAlign: 'right', paddingRight: '24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
                                                        <div style={{
                                                            width: '60px',
                                                            height: '4px',
                                                            background: 'var(--bg-input)',
                                                            borderRadius: 'var(--radius-full)',
                                                            overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${Math.min(row.representatividade * 2, 100)}%`,
                                                                height: '100%',
                                                                background: 'var(--color-accent)',
                                                                opacity: 0.8
                                                            }} />
                                                        </div>
                                                        <span style={{
                                                            fontSize: '11px',
                                                            fontWeight: '600',
                                                            color: 'var(--text-muted)',
                                                            minWidth: '35px'
                                                        }}>
                                                            {(row.representatividade || 0).toFixed(1)}%
                                                        </span>
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

const KPICard = ({ title, value, icon, colorVar }) => {
    const color = `var(${colorVar}, var(--text-main))`;
    return (
        <Card style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
            padding: '20px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            minHeight: '120px',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                <span style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </span>
                <div style={{ color: color, opacity: 0.8 }}>{icon}</div>
            </div>
            <div style={{
                fontSize: '24px',
                fontWeight: 'var(--font-bold)',
                letterSpacing: '-0.02em',
                color: color,
                lineHeight: '1.2'
            }}>
                {value}
            </div>
        </Card>
    );
};

const thStyle = {
    padding: '12px 24px',
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 'var(--font-bold)',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
};

const tdStyle = {
    padding: '12px 24px',
    fontSize: '13px',
    color: 'var(--text-main)',
};

export default SyntheticSalesSummary;
