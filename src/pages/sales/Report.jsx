import Button from '@/components/ui/Button';

import React, { useState, useMemo } from 'react';
import logoGmad from '../../assets/logo.png';
import KPICards from '../../components/KPICards';
import SalesTable from '../../components/SalesTable';
import Filters from '../../components/Filters';
import ExportActions from '../../components/ExportActions';
import QuarterSelector from '../../components/QuarterSelector';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import InsightsPanel from '../../components/insights/InsightsPanel';
import { generateInsights } from '../../utils/insightsEngine';

const Report = () => {
    const { salesData, quarterData, selectedQuarter, updateQuarter, userRole, activeUnit, globalFilters, setGlobalFilters } = useData();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const [showInsights, setShowInsights] = useState(false);
    const rowsPerPage = 50;

    const filteredData = useMemo(() => {
        if (!salesData || salesData.length === 0) return [];

        if (!globalFilters.vendor && !globalFilters.client) return [];

        let filtered = salesData.filter(row => {
            const vendorRow = row.client?.vendor || '';
            const clientName = row.client?.name || '';
            const clientId = row.client?.id || '';
            const clientFormatted = clientId ? `${clientName} - ${clientId}` : clientName;
            const representativeRow = row.client?.representative || '';

            const vendorMatch = !globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos' || vendorRow.toLowerCase().trim() === globalFilters.vendor.toLowerCase().trim();
            const clientMatch = !globalFilters.client || globalFilters.client === 'Selecionar Todos' || clientFormatted.toLowerCase().trim() === globalFilters.client.toLowerCase().trim();
            const representativeMatch = !globalFilters.representative || globalFilters.representative === 'Selecionar Todos' || representativeRow.toLowerCase().trim() === globalFilters.representative.toLowerCase().trim();

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

        setCurrentPage(1);
        return filtered;
    }, [salesData, globalFilters]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return filteredData.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredData, currentPage]);

    const totals = useMemo(() => {
        const totalRevenue = filteredData.reduce((acc, curr) => acc + curr.total.amount, 0);
        const totalMarginRevenue = filteredData.reduce((acc, curr) =>
            acc + (curr.total.margin_percent * curr.total.amount), 0);
        const avgMargin = totalRevenue ? totalMarginRevenue / totalRevenue : 0;
        const avgDeadline = filteredData.reduce((acc, curr) => acc + curr.total.deadline, 0) / (filteredData.length || 1);

        return {
            amount: totalRevenue,
            margin_percent: avgMargin,
            deadline: avgDeadline
        };
    }, [filteredData]);

    if (!salesData || salesData.length === 0) {
        return (
            <div style={{
                padding: '80px 40px', textAlign: 'center', fontFamily: 'var(--font-main)',
                color: 'var(--text-muted)',
            }}>
                <h2 style={{ color: 'var(--text-main)', fontWeight: 'var(--font-bold)', letterSpacing: '-0.03em', marginBottom: 'var(--space-4)' }}>
                    Nenhum dado disponível
                </h2>

                {userRole === 'admin' ? (
                    <>
                        <p style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>É necessário carregar a base de dados mensal.</p>
                        <Button
                            onClick={() => navigate('/admin/upload')}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--text-main)',
                                color: 'var(--bg-main)',
                                border: 'none',
                                borderRadius: 'var(--space-4)',
                                cursor: 'pointer',
                                fontWeight: 'var(--font-semibold)',
                                fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            Ir para Central de Upload
                        </Button>
                    </>
                ) : (
                    <p style={{ fontSize: 'var(--text-base)' }}>Por favor, solicite ao administrador para carregar os dados do mês.</p>
                )}
            </div>
        );
    }

    const isBlankState = !globalFilters.vendor && !globalFilters.client;

    // Generate insights (comparing months within the quarter)
    const insights = useMemo(() => {
        if (!filteredData || filteredData.length === 0) {
            return { critical: [], warning: [], positive: [], informational: [] };
        }

        // Split data into previous months (0,1) and current month (2) for comparison
        const previousMonthsData = [];
        const currentMonthData = [];

        filteredData.forEach(row => {
            if (row.months && row.months.length >= 3) {
                // Previous months (first 2 months of quarter)
                for (let i = 0; i < 2; i++) {
                    if (row.months[i] && row.months[i].amount > 0) {
                        previousMonthsData.push({
                            client: row.client,
                            total: row.months[i]
                        });
                    }
                }

                // Current month (last month of quarter)
                if (row.months[2] && row.months[2].amount > 0) {
                    currentMonthData.push({
                        client: row.client,
                        total: row.months[2]
                    });
                }
            }
        });

        // Generate insights comparing current month vs previous months
        return generateInsights(currentMonthData, previousMonthsData);
    }, [filteredData]);

    return (
        <div className="report-container" style={{
            maxWidth: '100%',
            minHeight: '100vh',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)'
        }}>
            <div className="print-only" style={{ padding: '0 40px' }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <img src={logoGmad} alt="GMAD Logo" style={{ height: '35px' }} />
                        <div style={{ borderLeft: '2px solid #000', paddingLeft: 'var(--space-5)' }}>
                            <h1 style={{
                                margin: 0, fontSize: '26px', color: '#000', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'var(--font-main)'
                            }}>{activeUnit?.replace('gmad_', '').toUpperCase()}</h1>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginTop: '2px' }}>
                                <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-main)', fontWeight: 'var(--font-bold)', fontFamily: '"Inter", sans-serif' }}>Faturamento Trimestral</p>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <p style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)', fontFamily: '"Inter", sans-serif' }}>
                                    {globalFilters.vendor !== 'Selecionar Todos' && `Vendedor: ${globalFilters.vendor.toUpperCase()}`}
                                    {globalFilters.vendor !== 'Selecionar Todos' && (globalFilters.representative !== 'Selecionar Todos' || globalFilters.client !== 'Selecionar Todos') && ' - '}
                                    {globalFilters.representative !== 'Selecionar Todos' && `Representante: ${globalFilters.representative.toUpperCase()}`}
                                    {globalFilters.representative !== 'Selecionar Todos' && globalFilters.client !== 'Selecionar Todos' && ' - '}
                                    {globalFilters.client !== 'Selecionar Todos' && `Cliente: ${globalFilters.client.toUpperCase()}`}
                                    {globalFilters.vendor === 'Selecionar Todos' && globalFilters.representative === 'Selecionar Todos' && globalFilters.client === 'Selecionar Todos' && 'TODOS OS DADOS SELECIONADOS'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: '"Inter", sans-serif' }}>
                        <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Documento Emitido em</p>
                        <p style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>



            <div className="no-print" style={{ background: 'var(--bg-input)' }}>
                <Filters
                    rightElement={
                        <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                            <Button
                                onClick={() => setShowInsights(true)}
                                className="btn-insights"
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: 'var(--space-4)',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: 'var(--font-semibold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-4)',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18h6"></path>
                                    <path d="M10 22h4"></path>
                                    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                                </svg>
                                Insights
                            </Button>
                            <ExportActions data={filteredData} />
                        </div>
                    }
                />
            </div>

            {isBlankState ? (
                <div style={{
                    padding: '80px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-card)'
                }}>
                    <h1 style={{ color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>Bem-vindo ao Relatório</h1>
                    <p style={{ fontSize: 'var(--text-xl)' }}>
                        Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                        ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                    </p>
                </div>
            ) : (
                <>
                    <KPICards totals={totals} extraInfo={{ count: filteredData.length }} />

                    {/* Visual Interface with Pagination */}
                    <div className="no-print">
                        <SalesTable
                            key={`view-${globalFilters.vendor}-${globalFilters.client}`}
                            reportData={paginatedData}
                            totals={totals}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            totalRows={filteredData.length}
                            rowsPerPage={rowsPerPage}
                        />
                    </div>

                    {/* Print Version with ALL data */}
                    <div className="print-only">
                        <SalesTable
                            key={`print-${globalFilters.vendor}-${globalFilters.client}`}
                            reportData={filteredData}
                            totals={totals}
                            currentPage={1}
                            onPageChange={() => { }}
                            totalRows={filteredData.length}
                            rowsPerPage={filteredData.length}
                        />
                    </div>
                </>
            )}

            {/* Insights Modal */}
            {showInsights && (
                <InsightsPanel
                    insights={insights}
                    onClose={() => setShowInsights(false)}
                />
            )}

        </div>
    );
};

export default Report;
