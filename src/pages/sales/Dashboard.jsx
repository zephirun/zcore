import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import KPICards from '../../components/KPICards';

const Dashboard = () => {
    const { salesData, refreshData, globalFilters, theme } = useData();
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue', 'margin', 'deadline'

    const isDark = theme === 'dark';

    // Filter data based on selections
    const filteredData = useMemo(() => {
        if (!salesData || !Array.isArray(salesData) || salesData.length === 0) return [];

        if (!globalFilters.vendor && !globalFilters.client) return [];

        let filtered = salesData.filter(row => {
            const vendorRow = row.client?.vendor || '';
            const clientName = row.client?.name || '';
            const clientId = row.client?.id || '';
            const clientFormatted = clientId ? `${clientName} - ${clientId}` : clientName;
            const representativeRow = row.client?.representative || '';

            const vendorMatch = !globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos' || vendorRow === globalFilters.vendor;
            const clientMatch = !globalFilters.client || globalFilters.client === 'Selecionar Todos' || clientFormatted === globalFilters.client;
            const representativeMatch = !globalFilters.representative || globalFilters.representative === 'Selecionar Todos' || representativeRow === globalFilters.representative;

            return vendorMatch && clientMatch && representativeMatch;
        });

        // Apply Ranking/Sorting
        if (globalFilters.ranking && globalFilters.ranking !== 'Sem Ordenação') {
            filtered = [...filtered].sort((a, b) => {
                switch (globalFilters.ranking) {
                    case 'Maior Faturamento': return b.total.amount - a.total.amount;
                    case 'Menor Faturamento': return a.total.amount - b.total.amount;
                    case 'Maior Margem': return b.total.margin_percent - a.total.margin_percent;
                    case 'Menor Margem': return a.total.margin_percent - b.total.margin_percent;
                    case 'Maior Prazo': return b.total.deadline - a.total.deadline;
                    case 'Menor Prazo': return a.total.deadline - b.total.deadline;
                    default: return 0;
                }
            });
        }

        return filtered;
    }, [salesData, globalFilters]);

    // Aggregate Metrics
    const metrics = useMemo(() => {
        if (!filteredData || filteredData.length === 0) return {
            totalBilling: 0,
            avgMargin: 0,
            avgTerm: 0
        };

        let totalBilling = 0;
        let totalMarginRevenue = 0;
        let totalTerm = 0;
        let count = filteredData.length;

        filteredData.forEach(item => {
            const amount = item.total?.amount || 0;
            const marginPercent = item.total?.margin_percent || 0;

            totalBilling += amount;
            totalMarginRevenue += marginPercent * amount;
            totalTerm += item.total?.deadline || 0;
        });

        return {
            totalBilling,
            avgMargin: totalBilling ? totalMarginRevenue / totalBilling : 0,
            avgTerm: count ? totalTerm / count : 0
        };
    }, [filteredData]);

    // Monthly Performance
    const monthlyPerformance = useMemo(() => {
        // Calculate dynamic month names (Last 3 completed months)
        const getMonthName = (subtractMonths) => {
            const d = new Date();
            d.setDate(1); // Go to first day to avoid edge cases
            d.setMonth(d.getMonth() - subtractMonths);
            return d.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
        };

        const monthNames = [
            getMonthName(3), // 3 months ago
            getMonthName(2), // 2 months ago
            getMonthName(1)  // 1 month ago
        ];

        return monthNames.map((monthName, idx) => {
            let revenue = 0;
            let marginRevenue = 0;
            let deadline = 0;
            let count = 0;

            filteredData.forEach(item => {
                if (item.months && item.months[idx]) {
                    const monthData = item.months[idx];
                    revenue += monthData.amount || 0;
                    marginRevenue += (monthData.margin_percent || 0) * (monthData.amount || 0);
                    deadline += monthData.deadline || 0;
                    if (monthData.amount > 0) count++;
                }
            });

            return {
                month: monthName,
                revenue,
                margin: revenue ? (marginRevenue / revenue) : 0,
                deadline: count ? deadline / count : 0
            };
        });
    }, [filteredData]);

    // Top Clients
    const topClients = useMemo(() => {
        const base = filteredData.map(item => ({
            id: item.client?.id || 'N/A',
            name: item.client?.name || 'N/A',
            vendor: item.client?.vendor || 'N/A',
            representative: item.client?.representative || 'N/A',
            revenue: item.total?.amount || 0,
            margin: item.total?.margin_percent || 0,
            deadline: item.total?.deadline || 0
        }));

        // If global ranking is 'Sem Ordenação', we force 'Top 10 Faturamento' for the dashboard lists
        if (!globalFilters.ranking || globalFilters.ranking === 'Sem Ordenação') {
            return base.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
        }

        // If a specific ranking is selected, we already have filteredData sorted, 
        // but we take the first 10 according to that sort.
        return base.slice(0, 10);
    }, [filteredData, globalFilters.ranking]);

    // Top Vendors
    const topVendors = useMemo(() => {
        const vendorMap = {};
        filteredData.forEach(item => {
            const vendor = item.client?.vendor || 'N/A';
            if (!vendorMap[vendor]) {
                vendorMap[vendor] = { revenue: 0, marginRevenue: 0, deadline: 0, count: 0 };
            }
            const amount = item.total?.amount || 0;
            const margin = item.total?.margin_percent || 0;
            vendorMap[vendor].revenue += amount;
            vendorMap[vendor].marginRevenue += margin * amount;
            vendorMap[vendor].deadline += item.total?.deadline || 0;
            vendorMap[vendor].count++;
        });

        const base = Object.keys(vendorMap)
            .map(vendor => ({
                name: vendor,
                revenue: vendorMap[vendor].revenue,
                margin: vendorMap[vendor].revenue ? vendorMap[vendor].marginRevenue / vendorMap[vendor].revenue : 0,
                deadline: vendorMap[vendor].count ? vendorMap[vendor].deadline / vendorMap[vendor].count : 0,
                clients: vendorMap[vendor].count
            }));

        // Apply same ranking logic to Vendors list
        if (globalFilters.ranking && globalFilters.ranking !== 'Sem Ordenação') {
            return base.sort((a, b) => {
                switch (globalFilters.ranking) {
                    case 'Maior Faturamento': return b.revenue - a.revenue;
                    case 'Menor Faturamento': return a.revenue - b.revenue;
                    case 'Maior Margem': return b.margin - a.margin;
                    case 'Menor Margem': return a.margin - b.margin;
                    case 'Maior Prazo': return b.deadline - a.deadline;
                    case 'Menor Prazo': return a.deadline - b.deadline;
                    default: return 0;
                }
            }).slice(0, 10);
        }

        return base.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    }, [filteredData, globalFilters.ranking]);

    // Top Representatives
    const topRepresentatives = useMemo(() => {
        const repMap = {};
        filteredData.forEach(item => {
            const rep = item.client?.representative || 'N/A';
            if (!repMap[rep]) {
                repMap[rep] = { revenue: 0, marginRevenue: 0, deadline: 0, count: 0 };
            }
            const amount = item.total?.amount || 0;
            const margin = item.total?.margin_percent || 0;
            repMap[rep].revenue += amount;
            repMap[rep].marginRevenue += margin * amount;
            repMap[rep].deadline += item.total?.deadline || 0;
            repMap[rep].count++;
        });

        const base = Object.keys(repMap)
            .map(rep => ({
                name: rep,
                revenue: repMap[rep].revenue,
                margin: repMap[rep].revenue ? repMap[rep].marginRevenue / repMap[rep].revenue : 0,
                deadline: repMap[rep].count ? repMap[rep].deadline / repMap[rep].count : 0,
                clients: repMap[rep].count
            }));

        if (globalFilters.ranking && globalFilters.ranking !== 'Sem Ordenação') {
            return base.sort((a, b) => {
                switch (globalFilters.ranking) {
                    case 'Maior Faturamento': return b.revenue - a.revenue;
                    case 'Menor Faturamento': return a.revenue - b.revenue;
                    case 'Maior Margem': return b.margin - a.margin;
                    case 'Menor Margem': return a.margin - b.margin;
                    case 'Maior Prazo': return b.deadline - a.deadline;
                    case 'Menor Prazo': return a.deadline - b.deadline;
                    default: return 0;
                }
            }).slice(0, 10);
        }

        return base.sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    }, [filteredData, globalFilters.ranking]);

    // Top 5 clients per month with multiple metrics
    const monthlyClientData = useMemo(() => {
        const getMonthName = (subtractMonths) => {
            const d = new Date();
            d.setDate(1);
            d.setMonth(d.getMonth() - subtractMonths);
            return d.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
        };

        return [0, 1, 2].map(monthIdx => {
            const clientStats = {};

            filteredData.forEach(item => {
                const name = item.client?.name || 'N/A';
                if (!item.months || !item.months[monthIdx]) return;

                const m = item.months[monthIdx];
                if (m.amount > 0) {
                    if (!clientStats[name]) {
                        clientStats[name] = { revenue: 0, marginSum: 0, deadlineSum: 0, count: 0 };
                    }
                    clientStats[name].revenue += m.amount;
                    clientStats[name].marginSum += (m.amount * (m.margin_percent || 0));
                    clientStats[name].deadlineSum += (m.deadline || 0);
                    clientStats[name].count += 1;
                }
            });

            const processedClients = Object.entries(clientStats).map(([name, stats]) => ({
                name,
                revenue: stats.revenue,
                margin: stats.revenue ? stats.marginSum / stats.revenue : 0,
                deadline: stats.count ? stats.deadlineSum / stats.count : 0
            }));

            // Top 5 by revenue for consistency
            const top5 = processedClients
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            return {
                name: getMonthName(3 - monthIdx),
                data: top5
            };
        });
    }, [filteredData]);


    const handleRefresh = async () => {
        setLoading(true);
        await refreshData();
        setLoading(false);
    };

    const hasData = salesData && salesData.length > 0;
    const isBlankState = !globalFilters.vendor && !globalFilters.client;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-main)',
            fontFamily: "'Inter', sans-serif",
            color: 'var(--text-main)',
            paddingBottom: '40px'
        }}>

            {/* Filters Bar */}
            {hasData && (
                <Filters />
            )}

            {hasData && !isBlankState && (
                <KPICards
                    totals={{
                        amount: metrics.totalBilling,
                        margin_percent: metrics.avgMargin,
                        deadline: metrics.avgTerm
                    }}
                    extraInfo={{ count: filteredData.length }}
                />
            )}

            <main style={{ padding: '24px 40px', maxWidth: '1600px', margin: '0 auto' }}>
                {!hasData && (
                    <div style={{
                        background: 'var(--bg-card)',
                        padding: '60px 40px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Nenhum dado disponível</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '20px' }}>
                            Faça o upload de um arquivo CSV na página de <strong>Admin</strong> para visualizar os dados aqui.
                        </p>
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: '12px 24px',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                boxShadow: '0 2px 5px rgba(52, 152, 219, 0.3)'
                            }}
                        >
                            🔄 Verificar se há dados novos
                        </button>
                    </div>
                )}

                {hasData && isBlankState && (
                    <div style={{
                        padding: '80px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <h1 style={{ color: 'var(--text-main)', marginBottom: '10px', fontWeight: '800' }}>Bem-vindo ao Dashboard</h1>
                        <p style={{ fontSize: '18px' }}>
                            Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                            ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                        </p>
                    </div>
                )}

                {hasData && !isBlankState && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                        {/* Monthly Performance Section */}
                        <ChartCard title="Performance Mensal">
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mês</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faturamento</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margem</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prazo Médio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyPerformance.map((month, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover-row">
                                                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{month.month}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(month.revenue)}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(month.margin)}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{month.deadline.toFixed(0)} dias</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </ChartCard>

                        {/* Monthly Comparison Charts */}
                        <ChartCard
                            title="Comparação por Clientes (Top 5)"
                            action={
                                <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px' }}>
                                    {[
                                        { id: 'revenue', label: 'Faturamento', color: '#3498db' },
                                        { id: 'margin', label: 'Margem %', color: '#2ecc71' },
                                        { id: 'deadline', label: 'Prazo', color: '#e74c3c' }
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveMetric(m.id)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: activeMetric === m.id ? 'var(--bg-card)' : 'transparent',
                                                color: activeMetric === m.id ? m.color : 'var(--text-muted)',
                                                boxShadow: activeMetric === m.id ? 'var(--shadow-sm)' : 'none'
                                            }}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            }
                        >
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                                gap: '24px'
                            }}>
                                {monthlyClientData.map((month, idx) => {
                                    const config = {
                                        revenue: { name: 'Faturamento', color: '#3498db', formatter: formatCurrency, axisFormatter: (val) => `R$${(val / 1000).toFixed(0)}k` },
                                        margin: { name: 'Margem', color: '#2ecc71', formatter: formatPercent, axisFormatter: (val) => `${(val * 100).toFixed(0)}%` },
                                        deadline: { name: 'Prazo Médio', color: '#e74c3c', formatter: (val) => `${val.toFixed(0)} dias`, axisFormatter: (val) => `${val.toFixed(0)}d` }
                                    }[activeMetric];

                                    return (
                                        <div key={idx} style={{
                                            background: 'var(--bg-input)',
                                            padding: '20px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                color: 'var(--text-muted)',
                                                marginBottom: '20px',
                                                textAlign: 'center',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {month.name}
                                            </h4>
                                            {month.data.length > 0 ? (
                                                <ResponsiveContainer width="100%" height={260}>
                                                    <BarChart
                                                        layout="vertical"
                                                        data={month.data}
                                                        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-color)" />
                                                        <XAxis
                                                            type="number"
                                                            tickFormatter={config.axisFormatter}
                                                            tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                                                            axisLine={{ stroke: 'var(--border-color)' }}
                                                        />
                                                        <YAxis
                                                            dataKey="name"
                                                            type="category"
                                                            width={90}
                                                            tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }}
                                                            axisLine={{ stroke: 'var(--border-color)' }}
                                                        />
                                                        <Tooltip
                                                            formatter={(value) => config.formatter(value)}
                                                            contentStyle={{
                                                                borderRadius: '8px',
                                                                border: '1px solid var(--border-color)',
                                                                boxShadow: 'var(--shadow-card)',
                                                                fontSize: '12px',
                                                                backgroundColor: 'var(--bg-card)',
                                                                color: 'var(--text-main)'
                                                            }}
                                                            itemStyle={{ fontWeight: 'bold', color: 'var(--text-main)' }}
                                                            cursor={{ fill: 'var(--bg-hover)' }}
                                                        />
                                                        <Bar
                                                            dataKey={activeMetric}
                                                            name={config.name}
                                                            fill={config.color}
                                                            radius={[0, 4, 4, 0]}
                                                            barSize={20}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '12px'
                                                }}>
                                                    Sem dados para este mês
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ChartCard>

                        {/* Top Lists Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                            gap: '24px'
                        }}>
                            {/* Top Clients */}
                            <ChartCard
                                title="Top 10 Clientes"
                                headerBorderColor="#3498db"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Cliente</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topClients.map((client, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <Link
                                                                to={`/sales/client-records?id=${client.id}`}
                                                                title="Ver Ficha"
                                                                style={{
                                                                    color: '#3498db',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    padding: '6px',
                                                                    background: 'rgba(52, 152, 219, 0.1)',
                                                                    borderRadius: '6px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="9" cy="7" r="4"></circle>
                                                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                                </svg>
                                                            </Link>
                                                            <div>
                                                                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{client.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                    {client.vendor} <span style={{ opacity: 0.5 }}>|</span> {client.representative} <span style={{ opacity: 0.5 }}>|</span> ID: {client.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(client.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(client.margin)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>

                            {/* Top Vendors */}
                            <ChartCard
                                title="Top 10 Vendedores"
                                headerBorderColor="#27ae60"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Vendedor</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topVendors.map((vendor, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: '800', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: '600' }}>{vendor.name}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(vendor.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(vendor.margin)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{vendor.clients}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>

                            {/* Top Representatives */}
                            <ChartCard
                                title="Top 10 Representantes"
                                headerBorderColor="#f39c12"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Representante</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topRepresentatives.map((rep, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: '800', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: '600' }}>{rep.name}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(rep.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(rep.margin)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{rep.clients}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </ChartCard>
                        </div>

                    </div>
                )}
            </main>

            <style>{`
                .hover-row:hover {
                    background-color: var(--bg-hover) !important;
                }
            `}</style>
        </div>
    );
};

const ChartCard = ({ title, children, action, headerBorderColor }) => (
    <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: headerBorderColor ? `2px solid ${headerBorderColor}` : 'none',
            paddingBottom: headerBorderColor ? '12px' : '0'
        }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{title}</h3>
            {action && action}
        </div>
        {children}
    </div>
);

export default Dashboard;
