import Button from '@/components/ui/Button';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import KPICards from '../../components/KPICards';
import Skeleton from '../../components/ui/Skeleton';

const Dashboard = () => {
    const { salesData, refreshData, globalFilters, theme, isSalesDataLoading, salesDataError } = useData();
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
            paddingBottom: 'var(--space-10)'
        }}>

            {/* Filters Bar */}
            {hasData && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <Filters />
                </div>
            )}

            {isSalesDataLoading ? (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                        <Skeleton height={120} borderRadius="var(--radius-sm)" />
                        <Skeleton height={120} borderRadius="var(--radius-sm)" />
                        <Skeleton height={120} borderRadius="var(--radius-sm)" />
                        <Skeleton height={120} borderRadius="var(--radius-sm)" />
                    </div>
                </div>
            ) : hasData && !isBlankState && (
                <>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <KPICards
                            totals={{
                                amount: metrics.totalBilling,
                                margin_percent: metrics.avgMargin,
                                deadline: metrics.avgTerm
                            }}
                            extraInfo={{
                                count: filteredData.length
                            }}
                        />
                    </div>
                </>
            )}

            <PageContainer
                maxWidth="1600px"
                title="Dashboard Financeiro"
                subtitle="Visão executiva consolidada e análise comercial."
                actions={null}
            >
                {!isSalesDataLoading && !hasData && (
                    <Card style={{ padding: '60px 40px', textAlign: 'center' }}>
                        <h2 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>Nenhum dado disponível</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                            Faça o upload de um arquivo CSV na página de <strong>Admin</strong> para visualizar os dados aqui.
                        </p>
                        <Button
                            onClick={handleRefresh}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--text-main)',
                                color: 'var(--bg-main)',
                                border: 'none',
                                borderRadius: 'var(--space-2)',
                                cursor: 'pointer',
                                fontWeight: 'var(--font-semibold)',
                                fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            🔄 Verificar se há dados novos
                        </Button>
                    </Card>
                )}

                {!isSalesDataLoading && hasData && isBlankState && (
                    <Card style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <h1 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-4)', fontWeight: '800' }}>Bem-vindo ao Dashboard</h1>
                        <p style={{ fontSize: 'var(--text-xl)' }}>
                            Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                            ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                        </p>
                    </Card>
                )}

                {isSalesDataLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        <Skeleton height={200} borderRadius="var(--radius-sm)" />
                        <Skeleton height={400} borderRadius="var(--radius-sm)" />
                    </div>
                ) : hasData && !isBlankState && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {/* Monthly Performance Section */}
                        <ChartCard title="Performance Mensal">
                            <div style={{ overflowX: 'auto', width: '100%' }}>
                                <Table style={{ border: 'none', background: 'transparent', boxShadow: 'none', width: '100%', tableLayout: 'fixed' }}>
                                    <Thead style={{ background: 'var(--bg-main)' }}>
                                        <Tr>
                                            <Th style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', width: 'auto' }}>Mês</Th>
                                            <Th style={{ textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '25%' }}>Faturamento</Th>
                                            <Th style={{ textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '15%' }}>Margem</Th>
                                            <Th style={{ textAlign: 'right', borderBottom: '1px solid var(--border-color)', width: '20%' }}>Prazo Médio</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {monthlyPerformance.map((month, idx) => (
                                            <Tr key={idx} className="hover-row">
                                                <Td style={{ fontWeight: '600' }}>{month.month}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(month.revenue)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(month.margin)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{month.deadline.toFixed(0)} dias</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>
                            </div>
                        </ChartCard>

                        {/* Monthly Comparison Charts */}
                        <ChartCard
                            title="Comparação por Clientes (Top 5)"
                            action={
                                <div style={{
                                    display: 'flex',
                                    gap: 0,
                                    background: 'var(--bg-input)',
                                    padding: '2px',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    {[
                                        { id: 'revenue', label: 'Faturamento', color: 'var(--color-success-strong, #107e3e)' },
                                        { id: 'margin', label: 'Margem %', color: 'var(--color-info-strong, #005a9e)' },
                                        { id: 'deadline', label: 'Prazo', color: 'var(--color-error-strong, #bb0000)' }
                                    ].map((m, idx, arr) => (
                                        <Button
                                            key={m.id}
                                            onClick={() => setActiveMetric(m.id)}
                                            style={{
                                                padding: '8px 24px',
                                                borderRadius: '0',
                                                borderRight: idx < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                                                fontSize: '12px',
                                                fontWeight: '800',
                                                cursor: 'pointer',
                                                transition: 'all 0.1s',
                                                background: activeMetric === m.id ? 'var(--bg-card)' : 'transparent',
                                                color: activeMetric === m.id ? 'var(--color-accent)' : 'var(--text-muted)',
                                                boxShadow: activeMetric === m.id ? `inset 0 -2px 0 var(--color-accent), var(--shadow-sm)` : 'none',
                                                minWidth: '120px'
                                            }}
                                        >
                                            {m.label}
                                        </Button>
                                    ))}
                                </div>
                            }
                        >
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                                gap: 'var(--space-4)'
                            }}>
                                {monthlyClientData.map((month, idx) => {
                                    const config = {
                                        revenue: { name: 'Faturamento', color: 'var(--color-success-strong, #107e3e)', formatter: formatCurrency, axisFormatter: (val) => `R$${(val / 1000).toFixed(0)}k` },
                                        margin: { name: 'Margem', color: 'var(--color-info-strong, #005a9e)', formatter: formatPercent, axisFormatter: (val) => `${(val * 100).toFixed(0)}%` },
                                        deadline: { name: 'Prazo Médio', color: 'var(--color-error-strong, #bb0000)', formatter: (val) => `${val.toFixed(0)} dias`, axisFormatter: (val) => `${val.toFixed(0)}d` }
                                    }[activeMetric];

                                    return (
                                        <div key={idx} style={{
                                            background: 'var(--bg-input)',
                                            padding: 'var(--space-2)',
                                            borderRadius: 'var(--radius-sm)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            <h4 style={{
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                color: 'var(--text-muted)',
                                                marginBottom: 'var(--space-4)',
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
                                                        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
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
                                                            width={150}
                                                            tickFormatter={(val) => val.length > 22 ? `${val.substring(0, 20)}...` : val}
                                                            tick={{ fontSize: 10, fontWeight: '600', fill: 'var(--text-muted)' }}
                                                            axisLine={{ stroke: 'var(--border-color)' }}
                                                        />
                                                        <Tooltip
                                                            formatter={(value) => config.formatter(value)}
                                                            contentStyle={{
                                                                borderRadius: 'var(--space-2)',
                                                                border: '1px solid var(--border-color)',
                                                                boxShadow: 'var(--shadow-card)',
                                                                fontSize: 'var(--text-sm)',
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
                                                            barSize={activeMetric === 'deadline' ? 12 : 18}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: 'var(--space-10)',
                                                    color: 'var(--text-muted)',
                                                    fontSize: 'var(--text-sm)'
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
                            gap: 'var(--space-4)'
                        }}>
                            {/* Top Clients */}
                            <ChartCard
                                title="Top 10 Clientes"
                                headerBorderColor="var(--color-info, #3b82f6)"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Cliente</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topClients.map((client, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                            <Link
                                                                to={`/sales/client-records?id=${client.id}`}
                                                                title="Ver Ficha"
                                                                style={{
                                                                    color: 'var(--color-info)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    padding: 'var(--space-2)',
                                                                    background: 'var(--color-info-dim)',
                                                                    borderRadius: 'var(--radius-sm)',
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
                                                                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-4)' }}>{client.name}</div>
                                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                                    {client.vendor} <span style={{ opacity: 0.5 }}>|</span> {client.representative} <span style={{ opacity: 0.5 }}>|</span> ID: {client.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(client.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(client.margin)}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </ChartCard>

                            {/* Top Vendors */}
                            <ChartCard
                                title="Top 10 Vendedores"
                                headerBorderColor="var(--color-success, #10b981)"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Vendedor</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                                <Th style={{ textAlign: 'right' }}>Clientes</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topVendors.map((vendor, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', border: '1px solid var(--border-color)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: 'var(--font-semibold)' }}>{vendor.name}</div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(vendor.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(vendor.margin)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{vendor.clients}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </ChartCard>

                            {/* Top Representatives */}
                            <ChartCard
                                title="Top 10 Representantes"
                                headerBorderColor="var(--color-warning, #f59e0b)"
                            >
                                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Representante</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                                <Th style={{ textAlign: 'right' }}>Clientes</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topRepresentatives.map((rep, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', border: '1px solid var(--border-color)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: 'var(--font-semibold)' }}>{rep.name}</div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(rep.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(rep.margin)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{rep.clients}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>
                                </div>
                            </ChartCard>
                        </div>

                    </div>
                )}
            </PageContainer>

            <style>{`
                .hover-row:hover {
                    background-color: var(--bg-hover) !important;
                }
            `}</style>
        </div >
    );
};

const ChartCard = ({ title, children, action }) => (
    <Card style={{ padding: 0, borderRadius: 'var(--radius-sm)', boxShadow: "var(--shadow-sm)", background: 'var(--bg-card)' }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-4) var(--space-6)',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <h3 style={{
                fontSize: '14px',
                fontWeight: 'var(--font-bold)',
                color: 'var(--text-main)',
                margin: 0,
                letterSpacing: '0.01em',
            }}>{title}</h3>
            {action && action}
        </div>
        <div style={{ padding: 'var(--space-6)' }}>
            {children}
        </div>
    </Card>
);

export default Dashboard;
