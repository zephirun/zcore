import React, { useMemo, useState } from 'react';
import { useData } from '../../context/DataContext';
import Header from '../../components/Header';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import QuarterSelector from '../../components/QuarterSelector';
import KPICards from '../../components/KPICards';
import Footer from '../../components/Footer';

const Dashboard = () => {
    const { salesData, quarterData, selectedQuarter, updateQuarter, refreshData, activeUnit, userRole, globalFilters, setGlobalFilters } = useData();
    const [loading, setLoading] = useState(false);
    const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue', 'margin', 'deadline'

    // Filter data based on selections
    const filteredData = useMemo(() => {
        if (!salesData || !Array.isArray(salesData) || salesData.length === 0) return [];

        if (!globalFilters.vendor && !globalFilters.client) return [];

        let filtered = salesData.filter(row => {
            const vendorRow = row.client?.vendor || '';
            const clientRow = row.client?.name || '';

            const vendorMatch = !globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos' || vendorRow === globalFilters.vendor;
            const clientMatch = !globalFilters.client || globalFilters.client === 'Selecionar Todos' || clientRow === globalFilters.client;

            return vendorMatch && clientMatch;
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
            name: item.client?.name || 'N/A',
            vendor: item.client?.vendor || 'N/A',
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



    const processCSV = (text) => {
        const lines = text.split(/\r?\n/);
        const data = [];
        let errorCount = 0;

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

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const cols = parseLine(line);

            // Header Detection: Check if first row is a header
            // If col[3] (first numeric value) is NOT a number, it's likely a header
            // OR if the first column explicitly says "ID", "Cod", etc.
            if (i === 0) {
                const firstCol = cols[0] ? cols[0].replace(/^"|"$/g, '').toUpperCase() : '';
                const thirdCol = cols[3] ? cols[3].replace(/^"|"$/g, '').trim() : '';

                // Heuristic: If 4th column (Value) is not a number, it's almost certainly a header
                const isAmountNumeric = /^\d/.test(thirdCol) || /^-\d/.test(thirdCol) || /^R\$/.test(thirdCol);

                if (firstCol.includes('ID') || firstCol.includes('COD') || firstCol.includes('CLIENTE') || !isAmountNumeric) {
                    console.log('[CSV Import] Skipping likely header row:', line);
                    continue;
                }
            }

            // Basic validation - check for minimum expected columns
            if (cols.length < 12) {
                console.warn(`[CSV Import] Skipped line ${i + 1}: Expected 12+ columns, got ${cols.length}. Content:`, line);
                errorCount++;
                continue;
            }

            const parseNum = (str) => {
                if (!str) return 0;
                // Remove all non-numeric chars except . , -
                let cleaned = str.replace(/[^\d.,-]/g, '');
                // Brazilian format (1.000,00) -> Javascript (1000.00)
                // If comma appears after dot, or we have comma but no dot, treat comma as decimal
                // Heuristic: If we have both, last is separator. If we have only one, check context? 
                // Safer: Assume BR layout: . is thousand, , is decimal
                if (cleaned.includes(',') && (!cleaned.includes('.') || cleaned.indexOf(',') > cleaned.indexOf('.'))) {
                    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
                }
                return parseFloat(cleaned) || 0;
            };

            const months = [
                {
                    amount: parseNum(cols[3]),
                    margin_percent: parseNum(cols[4]),
                    deadline: parseNum(cols[5])
                },
                {
                    amount: parseNum(cols[6]),
                    margin_percent: parseNum(cols[7]),
                    deadline: parseNum(cols[8])
                },
                {
                    amount: parseNum(cols[9]),
                    margin_percent: parseNum(cols[10]),
                    deadline: parseNum(cols[11])
                }
            ];

            // Calc Total
            const totalAmount = months.reduce((sum, m) => sum + m.amount, 0);
            const totalMarginRev = months.reduce((sum, m) => sum + (m.amount * m.margin_percent), 0);
            const totalDeadlineSum = months.reduce((sum, m) => sum + m.deadline, 0);
            const activeMonths = months.filter(m => m.amount > 0).length;

            // Helper: remove quotes, trim, collapse spaces (including NBSP), force Uppercase
            const cleanStr = (s) => {
                if (!s) return '';
                return s.replace(/^"|"$/g, '') // Remove quotes
                    .replace(/[\s\u00A0]+/g, ' ') // Collapse spaces + NBSP to single space
                    .trim()
                    .toUpperCase(); // Force Uppercase for matching
            };

            // DEBUG: Specific check for DIVINIZE
            if (cols[1] && cols[1].toUpperCase().includes('DIVINIZE')) {
                console.log('--- DEBUG DIVINIZE ---');
                console.log('Row Index:', i);
                console.log('Col 1 (Client?):', cols[1]);
                console.log('Col 2 (Vendor?):', cols[2]);
                console.log('Assigned Client Name:', cleanStr(cols[1]));
                console.log('Assigned Vendor:', cleanStr(cols[2]));
                console.log('----------------------');
            }

            data.push({
                client: {
                    id: cleanStr(cols[0]),
                    name: cleanStr(cols[1]),
                    vendor: cleanStr(cols[2])
                },
                months: months,
                total: {
                    amount: totalAmount,
                    margin_percent: totalAmount ? totalMarginRev / totalAmount : 0,
                    deadline: activeMonths ? totalDeadlineSum / activeMonths : 0
                }
            });
        }

        if (errorCount > 0) {
            alert(`Atenção: ${errorCount} linhas foram ignoradas por erro de formatação. Verifique o console (F12) para detalhes.`);
        }

        return data;
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const parsedData = processCSV(text);

                if (parsedData.length === 0) {
                    alert('Erro: Nenhum dado válido encontrado no arquivo (verifique o separador ponto e vírgula).');
                } else {
                    // DEBUG: Check payload size
                    const payloadSize = JSON.stringify(parsedData).length;
                    console.log(`[Upload Debug] Records: ${parsedData.length}`);
                    console.log(`[Upload Debug] Payload Size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);

                    if (payloadSize > 5 * 1024 * 1024) {
                        alert('Atenção: Arquivo muito grande (>5MB). O upload pode falhar.');
                    }

                    await saveReportData(parsedData);
                    alert(`Sucesso! ${parsedData.length} registros importados para ${activeUnit}.`);
                }
            } catch (err) {
                console.error(err);
                alert('Erro ao processar o arquivo.');
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file, 'ISO-8859-1'); // Common encoding for Excel CSVs in Brazil
    };

    const hasData = salesData && salesData.length > 0;
    const isBlankState = !globalFilters.vendor && !globalFilters.client;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'white',
            fontFamily: 'var(--font-main)'
        }}>
            <Header />

            {/* Filters Bar */}
            {hasData && (
                <Filters data={salesData} selectedFilters={globalFilters} onFilterChange={setGlobalFilters} />
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

            <main style={{ padding: '0 40px', maxWidth: '100%' }}>
                {!hasData && (
                    <div style={{
                        background: '#fafafa',
                        padding: '60px 40px',
                        borderRadius: '0', // Removed radius
                        textAlign: 'center',
                        borderBottom: '1px solid #e0e0e0' // Subtle bottom border instead of full box
                    }}>
                        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Nenhum dado disponível</h2>
                        <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '20px' }}>
                            Faça o upload de um arquivo CSV na página de <strong>Admin</strong> para visualizar os dados aqui.
                        </p>
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: '12px 24px',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px'
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
                        color: '#7f8c8d',
                        background: '#fafafa',
                        borderRadius: '8px'
                    }}>
                        <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Bem-vindo ao Dashboard</h1>
                        <p style={{ fontSize: '18px' }}>
                            Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                            ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                        </p>
                    </div>
                )}

                {hasData && !isBlankState && (
                    <>

                        {/* Monthly Performance Table */}
                        <div style={{
                            background: 'white',
                            padding: '25px 0',
                            marginBottom: '25px'
                        }}>
                            <h3 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#2c3e50',
                                marginBottom: '20px',
                                borderBottom: '2px solid #006400',
                                paddingBottom: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10"></line>
                                    <line x1="12" y1="20" x2="12" y2="4"></line>
                                    <line x1="6" y1="20" x2="6" y2="14"></line>
                                </svg>
                                Performance Mensal
                            </h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Mês</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Faturamento</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Margem</th>
                                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Prazo Médio</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyPerformance.map((month, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                            <td style={{ padding: '12px', fontSize: '14px', color: '#2c3e50', fontWeight: '600' }}>{month.month}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#2c3e50' }}>{formatCurrency(month.revenue)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#2c3e50' }}>{formatPercent(month.margin)}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', color: '#2c3e50' }}>{month.deadline.toFixed(0)} dias</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Monthly Comparison Charts */}
                        <div style={{
                            background: 'white',
                            padding: '25px 0',
                            marginBottom: '25px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '25px',
                                borderBottom: '2px solid #9b59b6',
                                paddingBottom: '15px'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#2c3e50',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    margin: 0
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                                        <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                                    </svg>
                                    Comparação por Clientes (Top 5 por Faturamento)
                                </h3>

                                {/* Metric Switcher */}
                                <div style={{
                                    display: 'flex',
                                    gap: '4px',
                                    background: '#f1f5f9',
                                    padding: '4px',
                                    borderRadius: '8px'
                                }}>
                                    {[
                                        { id: 'revenue', label: 'Faturamento', color: '#3498db' },
                                        { id: 'margin', label: 'Margem %', color: '#2ecc71' },
                                        { id: 'deadline', label: 'Prazo Médio', color: '#e74c3c' }
                                    ].map(m => (
                                        <button
                                            key={m.id}
                                            onClick={() => setActiveMetric(m.id)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontSize: '11px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: activeMetric === m.id ? 'white' : 'transparent',
                                                color: activeMetric === m.id ? m.color : '#64748b',
                                                boxShadow: activeMetric === m.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                                            }}
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                gap: '25px'
                            }}>
                                {monthlyClientData.map((month, idx) => {
                                    const config = {
                                        revenue: { name: 'Faturamento', color: '#3498db', formatter: formatCurrency, axisFormatter: (val) => `R$${(val / 1000).toFixed(0)}k` },
                                        margin: { name: 'Margem', color: '#2ecc71', formatter: formatPercent, axisFormatter: (val) => `${(val * 100).toFixed(0)}%` },
                                        deadline: { name: 'Prazo Médio', color: '#e74c3c', formatter: (val) => `${val.toFixed(0)} dias`, axisFormatter: (val) => `${val.toFixed(0)}d` }
                                    }[activeMetric];

                                    return (
                                        <div key={idx} style={{
                                            background: '#fafafa',
                                            padding: '15px',
                                            borderRadius: '6px',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <h4 style={{
                                                fontSize: '13px',
                                                fontWeight: '800',
                                                color: '#475569',
                                                marginBottom: '15px',
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
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                                                        <XAxis
                                                            type="number"
                                                            tickFormatter={config.axisFormatter}
                                                            tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                            axisLine={{ stroke: '#e2e8f0' }}
                                                        />
                                                        <YAxis
                                                            dataKey="name"
                                                            type="category"
                                                            width={90}
                                                            tick={{ fontSize: 10, fontWeight: '600', fill: '#475569' }}
                                                            axisLine={{ stroke: '#e2e8f0' }}
                                                        />
                                                        <Tooltip
                                                            formatter={(value) => config.formatter(value)}
                                                            contentStyle={{
                                                                borderRadius: '8px',
                                                                border: 'none',
                                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                                fontSize: '12px'
                                                            }}
                                                            itemStyle={{ fontWeight: 'bold' }}
                                                        />
                                                        <Bar
                                                            dataKey={activeMetric}
                                                            name={config.name}
                                                            fill={config.color}
                                                            radius={[0, 4, 4, 0]}
                                                            barSize={18}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '40px',
                                                    color: '#94a3b8',
                                                    fontSize: '12px'
                                                }}>
                                                    Sem dados para este mês
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Top Clients and Vendors */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
                            gap: '25px',
                            marginBottom: '25px'
                        }}>
                            {/* Top Clients */}
                            <div style={{
                                background: 'white',
                                padding: '25px 0'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#2c3e50',
                                    marginBottom: '20px',
                                    borderBottom: '2px solid #3498db',
                                    paddingBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    Top 10 Clientes
                                </h3>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Cliente</th>
                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Faturamento</th>
                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Margem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topClients.map((client, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '10px', fontSize: '13px', color: '#2c3e50' }}>
                                                        <div style={{ fontWeight: '600' }}>{client.name}</div>
                                                        <div style={{ fontSize: '11px', color: '#7f8c8d' }}>{client.vendor}</div>
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#2c3e50' }}>{formatCurrency(client.revenue)}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#2c3e50' }}>{formatPercent(client.margin)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Top Vendors */}
                            <div style={{
                                background: 'white',
                                padding: '25px 0'
                            }}>
                                <h3 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#2c3e50',
                                    marginBottom: '20px',
                                    borderBottom: '2px solid #27ae60',
                                    paddingBottom: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="8" r="7"></circle>
                                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                                    </svg>
                                    Top 10 Vendedores
                                </h3>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                            <tr style={{ background: '#f8f9fa' }}>
                                                <th style={{ padding: '10px', textAlign: 'left', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Vendedor</th>
                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Faturamento</th>
                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Margem</th>
                                                <th style={{ padding: '10px', textAlign: 'right', fontSize: '11px', fontWeight: '600', color: '#555', borderBottom: '2px solid #ddd' }}>Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topVendors.map((vendor, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                    <td style={{ padding: '10px', fontSize: '13px', color: '#2c3e50', fontWeight: '600' }}>{vendor.name}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#2c3e50' }}>{formatCurrency(vendor.revenue)}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#2c3e50' }}>{formatPercent(vendor.margin)}</td>
                                                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#2c3e50' }}>{vendor.clients}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>


                    </>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
