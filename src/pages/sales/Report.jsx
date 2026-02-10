import React, { useState, useMemo } from 'react';
import logoGmad from '../../assets/logo.png';
import Header from '../../components/Header';
import KPICards from '../../components/KPICards';
import Footer from '../../components/Footer';
import SalesTable from '../../components/SalesTable';
import Filters from '../../components/Filters';
import ExportActions from '../../components/ExportActions';
import QuarterSelector from '../../components/QuarterSelector';
import { useData } from '../../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Report = () => {
    const { salesData, quarterData, selectedQuarter, updateQuarter, userRole, activeUnit, globalFilters, setGlobalFilters } = useData();
    const navigate = useNavigate();

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 50;

    const filteredData = useMemo(() => {
        if (!salesData || salesData.length === 0) return [];

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
                padding: '50px', textAlign: 'center', fontFamily: 'var(--font-main)'
            }}>
                <h2>Nenhum dado disponível.</h2>

                {userRole === 'admin' ? (
                    <>
                        <p>É necessário carregar a base de dados mensal.</p>
                        <button
                            onClick={() => navigate('/admin/upload')}
                            style={{
                                marginTop: '20px',
                                padding: '10px 20px',
                                background: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Ir para Central de Upload
                        </button>
                    </>
                ) : (
                    <p>Por favor, solicite ao administrador para carregar os dados do mês.</p>
                )}
            </div>
        );
    }

    const isBlankState = !globalFilters.vendor && !globalFilters.client;

    return (
        <div className="report-container" style={{
            maxWidth: '100%',
            minHeight: '100vh',
            background: 'white',
            fontFamily: 'var(--font-main)'
        }}>
            <div className="print-only" style={{ padding: '0 40px' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '4px solid #000',
                    paddingBottom: '15px',
                    marginBottom: '25px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <img src={logoGmad} alt="GMAD Logo" style={{ height: '35px' }} />
                        <div style={{ borderLeft: '2px solid #000', paddingLeft: '20px' }}>
                            <h1 style={{
                                margin: 0, fontSize: '26px', color: '#000', fontWeight: '800', letterSpacing: '-1px', fontFamily: 'var(--font-main)'
                            }}>{activeUnit?.replace('gmad_', '').toUpperCase()}</h1>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '2px' }}>
                                <p style={{ margin: 0, fontSize: '15px', color: '#1e293b', fontWeight: '700', fontFamily: '"Inter", sans-serif' }}>Faturamento Trimestral</p>
                                <span style={{ color: '#cbd5e1' }}>|</span>
                                <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontWeight: '600', fontFamily: '"Inter", sans-serif' }}>
                                    {globalFilters.vendor !== 'Selecionar Todos' && `Vendedor: ${globalFilters.vendor.toUpperCase()}`}
                                    {globalFilters.vendor !== 'Selecionar Todos' && globalFilters.client !== 'Selecionar Todos' && ' - '}
                                    {globalFilters.client !== 'Selecionar Todos' && `Cliente: ${globalFilters.client.toUpperCase()}`}
                                    {globalFilters.vendor === 'Selecionar Todos' && globalFilters.client === 'Selecionar Todos' && 'TODOS OS DADOS SELECIONADOS'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right', fontFamily: '"Inter", sans-serif' }}>
                        <p style={{ margin: 0, fontSize: '9px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Documento Emitido em</p>
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
            </div>

            <div style={{ position: 'relative' }}>
                <Header filters={globalFilters} />
            </div>

            <div className="no-print" style={{ background: '#f8f9fa' }}>
                <Filters
                    data={salesData}
                    selectedFilters={globalFilters}
                    onFilterChange={setGlobalFilters}
                    rightElement={<ExportActions data={filteredData} />}
                />
            </div>

            {isBlankState ? (
                <div style={{
                    padding: '80px',
                    textAlign: 'center',
                    color: '#7f8c8d',
                    background: '#fafafa'
                }}>
                    <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>Bem-vindo ao Relatório</h1>
                    <p style={{ fontSize: '18px' }}>
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
            <Footer />
        </div>
    );
};

export default Report;
