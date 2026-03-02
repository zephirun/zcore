import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import DataGrid from '@/components/ui/DataGrid';

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatCurrency } from '../../utils/formatters';
import { Search, Wallet, AlertCircle, Loader2, ChevronRight, ArrowLeft, TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const ClientSummary = () => {
    const { fetchClientSummary, searchClients, theme } = useData();

    // Helpers
    const isNumeric = (val) => /^[0-9]+$/.test(val);

    // UI States
    const [view, setView] = useState('selection'); // 'selection' | 'client-dashboard' | 'client-report'
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);

    // Data States
    const [selectedClientData, setSelectedClientData] = useState([]);
    const [selectedClientInfo, setSelectedClientInfo] = useState(null);

    // Filter for Details View
    const [activeFilter, setActiveFilter] = useState('Todos');

    // Search Result Fetch
    useEffect(() => {
        const trimmedTerm = searchTerm.trim();
        const minLength = isNumeric(trimmedTerm) ? 1 : 2;

        if (!trimmedTerm || trimmedTerm.length < minLength) {
            setSearchResults([]);
            setSearching(false);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearching(true);
            setError(null);
            try {
                const results = await searchClients(trimmedTerm);
                if (Array.isArray(results)) {
                    setSearchResults(results.slice(0, 15));
                } else {
                    setSearchResults([]);
                }
            } catch (err) {
                console.error("Search error:", err);
                setError("Ocorreu um erro na busca. Verifique a conexão com o servidor.");
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 350);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, searchClients]);

    const handleSelectClientById = async (clientId) => {
        setLoading(true);
        setError(null);
        try {
            const clientData = await fetchClientSummary(clientId);
            if (Array.isArray(clientData) && clientData.length > 0) {
                // Ensure activeFilter resets when changing client
                setActiveFilter('Todos');
                setSelectedClientData(clientData);
                setSelectedClientInfo({
                    repre: clientData[0]?.repre,
                    cliente: clientData[0]?.cliente,
                    limite: clientData[0]?.limite || 0
                });
                setView('client-dashboard');
                window.scrollTo(0, 0);
            } else {
                setError("Dados financeiros não encontrados para este cliente no Oracle.");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Erro ao conectar com a API Oracle.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate complex metrics for Dashboard
    const clientMetrics = useMemo(() => {
        if (!selectedClientData || selectedClientData.length === 0) {
            return { carteira: 0, cheques: 0, creditos: 0, saldoDevedor: 0, resumo: 0 };
        }

        return selectedClientData.reduce((acc, curr) => {
            const val = curr.valor || 0;
            // Carteira: Vencidos (1), A Vencer (2), Carteira (4)
            if ([1, 2, 4].includes(curr.seq)) acc.carteira += val;
            // Cheques: Cheques (3)
            else if (curr.seq === 3) acc.cheques += val;
            // Créditos: Crédito (5)
            else if (curr.seq === 5) acc.creditos += val;

            return acc;
        }, { carteira: 0, cheques: 0, creditos: 0 });
    }, [selectedClientData]);

    const finalMetrics = useMemo(() => {
        const saldoDevedor = clientMetrics.carteira + clientMetrics.cheques + clientMetrics.creditos;
        const resumo = saldoDevedor - (selectedClientInfo?.limite || 0);
        return { ...clientMetrics, saldoDevedor, resumo };
    }, [clientMetrics, selectedClientInfo]);

    // Data for Distribution Chart (Pie)
    const pieData = useMemo(() => {
        return [
            { name: 'Carteira', value: Math.max(0, clientMetrics.carteira), color: 'var(--color-primary)' },
            { name: 'Cheques', value: Math.max(0, clientMetrics.cheques), color: 'var(--color-warning)' },
            { name: 'Crédito', value: Math.abs(Math.min(0, clientMetrics.creditos)), color: 'var(--color-success)' }
        ].filter(d => d.value > 0);
    }, [clientMetrics]);

    // Data for Timeline Chart (Bar - A Vencer by Month)
    const activeProjectionData = useMemo(() => {
        if (!selectedClientData) return [];
        const monthlyData = {};

        selectedClientData
            .filter(d => d.seq === 2) // A Vencer
            .forEach(d => {
                const date = new Date(d.vencto);
                const monthName = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
                const year = date.getFullYear();
                const key = `${monthName}/${year}`;

                if (!monthlyData[key]) monthlyData[key] = { name: key, valor: 0, sortKey: date.getTime() };
                monthlyData[key].valor += d.valor || 0;
            });

        return Object.values(monthlyData)
            .sort((a, b) => a.sortKey - b.sortKey)
            .slice(0, 6); // Next 6 months
    }, [selectedClientData]);

    const handleBack = () => {
        if (view === 'client-report') {
            setView('client-dashboard');
            // Always reset filter when going back to dashboard to avoid confusion when returning to report
            setActiveFilter('Todos');
        } else {
            setView('selection');
            setSearchTerm('');
            setSearchResults([]); // Explicitly clear search results
            setSelectedClientData([]);
            setSelectedClientInfo(null);
            setActiveFilter('Todos');
        }
    };

    const detailsFilteredData = useMemo(() => {
        if (activeFilter === 'Todos') return selectedClientData;
        if (activeFilter === 'Vencidos') return selectedClientData.filter(d => d.seq === 1);
        if (activeFilter === 'A Vencer') return selectedClientData.filter(d => d.seq === 2);
        if (activeFilter === 'Cheques') return selectedClientData.filter(d => d.seq === 3);
        if (activeFilter === 'Carteira') return selectedClientData.filter(d => [1, 2, 4].includes(d.seq));
        if (activeFilter === 'Crédito') return selectedClientData.filter(d => d.seq === 5);
        return selectedClientData;
    }, [selectedClientData, activeFilter]);

    const columns = useMemo(() => [
        {
            key: 'vendedor',
            label: 'Vendedor',
            sortable: true,
            width: '150px',
            render: (row) => row.repre?.split('Vendedor: ')[1]?.split(' ')[0] || '-'
        },
        { 
            key: 'docto', 
            label: 'Docto', 
            sortable: true,
            width: '120px',
            render: (row) => <span style={{ fontWeight: 'var(--font-semibold)' }}>{row.docto}</span>
        },
        { 
            key: 'emissao', 
            label: 'Emissão', 
            sortable: true, 
            width: '120px',
            render: (row) => formatDate(row.emissao)
        },
        { 
            key: 'vencto', 
            label: 'Vencimento', 
            sortable: true, 
            width: '120px',
            render: (row) => <span style={{ fontWeight: row.seq === 1 ? 'var(--font-bold)' : 'var(--font-medium)' }}>{formatDate(row.vencto)}</span>
        },
        { 
            key: 'seq', 
            label: 'Situação', 
            sortable: true, 
            align: 'center',
            width: '120px',
            render: (row) => (
                <span style={{
                    padding: '2px 8px', borderRadius: 'var(--space-1)', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                    background: row.seq === 1 ? 'var(--color-error-dim)' : row.seq === 2 ? 'var(--color-info-dim)' : row.seq === 3 ? 'var(--color-warning-dim)' : row.seq === 5 ? 'var(--color-success-dim)' : 'rgba(0,0,0,0.05)',
                    color: row.seq === 1 ? 'var(--color-error)' : row.seq === 2 ? 'var(--color-info)' : row.seq === 3 ? 'var(--color-warning)' : row.seq === 5 ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                    {row.seq === 1 ? 'Vencido' : row.seq === 2 ? 'A Vencer' : row.seq === 3 ? 'Cheque' : row.seq === 4 ? 'Carteira' : 'Crédito'}
                </span>
            )
        },
        {
            key: 'valor',
            label: 'Valor',
            sortable: true,
            align: 'right',
            width: '150px',
            render: (row) => <span style={{ fontWeight: 'var(--font-bold)' }}>{formatCurrency(row.valor)}</span>
        }
    ], []);

    const detailsTotal = useMemo(() => {

        return detailsFilteredData.reduce((sum, curr) => sum + (curr.valor || 0), 0);
    }, [detailsFilteredData]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const containerStyle = {
        minHeight: '100vh', background: 'var(--bg-main)', color: 'var(--text-main)',
        transition: 'all 0.3s', display: 'flex', flexDirection: 'column'
    };

    const cardStyle = {
        background: 'var(--bg-card)', borderRadius: 'var(--space-4)', border: '1px solid var(--border-color)',
        padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)'
    };

    if (loading) {
        return (
            <div style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="animate-spin" style={{ color: 'var(--color-primary)', opacity: 0.5 }} />
                <p style={{ marginTop: 'var(--space-4)', color: 'var(--text-muted)', fontSize: '15px' }}>Consultando Oracle via API...</p>
                <style>{`.animate-spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (view === 'selection') {
        return (
            <div style={containerStyle}>
                <main style={{ padding: '80px 20px', maxWidth: '700px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <div style={{ width: '60px', height: '60px', background: 'var(--bg-card)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
<Search size={28} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <h1 style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', letterSpacing: '-0.04em', marginBottom: 'var(--space-4)' }}>Saúde Financeira</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Busque um cliente para ver seu dashboard individual.</p>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', background: 'var(--bg-card)',
                            borderRadius: '18px', padding: '14px 22px', border: '2px solid var(--border-color)',
                            boxShadow: 'var(--shadow-lg)', transition: 'all 0.2s'
                        }}>
<Search size={20} style={{ color: 'var(--text-muted)', marginRight: '14px' }} />
                            <Input
                                autoFocus
                                type="text"
                                placeholder="Nome ou ID do cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '17px', width: '100%', outline: 'none', fontWeight: 'var(--font-medium)' }}
                            />
                            {searching && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />}
                        </div>

                        {(searchResults.length > 0 || (searchTerm.trim().length >= (isNumeric(searchTerm.trim()) ? 1 : 2) && !searching && searchResults.length === 0)) && (
                            <div style={{ position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, background: 'var(--bg-card)', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 100, textAlign: 'left' }}>
                                {searchResults.length > 0 ? (
                                    searchResults.map((client, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectClientById(client.IDPESS || client.idpess)}
                                            style={{ padding: '14px 20px', cursor: 'pointer', borderBottom: idx === searchResults.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                            className="search-item"
                                        >
                                            <div>
                                                <div style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)' }}>{client.NOME || client.nome}</div>
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Código: {client.IDPESS || client.idpess}</div>
                                            </div>
                                            <ChevronRight size={16} style={{ opacity: 0.3 }} />
                                        </div>
                                    ))
                                ) : searchTerm.trim().length >= (isNumeric(searchTerm.trim()) ? 1 : 2) && !searching && (
                                    <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--text-base)' }}>
                                        Nenhum parceiro encontrado para "{searchTerm.trim()}"
                                    </div>
                                )}
                            </div>
                        )}

                        {error && (
                            <div style={{ marginTop: 'var(--space-5)', padding: '14px', borderRadius: 'var(--space-3)', background: 'var(--color-error-dim)', color: 'var(--color-error)', border: '1px solid var(--color-error)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', justifyContent: 'center' }}>
<AlertCircle size={16} />
                                {error}
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: '60px', opacity: 0.4, display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
<div style={{ textAlign: 'center' }}><Users size={20} /><div style={{ fontSize: '10px', fontWeight: '800', marginTop: 'var(--space-1)' }}>PARCEIROS</div></div>
                        <div style={{ textAlign: 'center' }}><Wallet size={20} /><div style={{ fontSize: '10px', fontWeight: '800', marginTop: 'var(--space-1)' }}>TÍTULOS</div></div>
                        <div style={{ textAlign: 'center' }}><TrendingUp size={20} /><div style={{ fontSize: '10px', fontWeight: '800', marginTop: 'var(--space-1)' }}>PONTUALIDADE</div></div>
                    </div>
                </main>
                <style>{`.search-item:hover { background: var(--bg-hover); }`}</style>
            </div>
        );
    }

    if (view === 'client-dashboard') {
        const COLORS = ['var(--color-primary)', 'var(--color-warning)', 'var(--color-success)', 'var(--color-info)'];

        return (
            <div style={containerStyle}>
                <PageContainer maxWidth="1200px" title="Dashboard Individual" actions={
                    <Button variant="ghost" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <ArrowLeft size={18} /> Voltar
                    </Button>
                }>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        {/* Info & Core KPIs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
<Card style={{ borderLeft: '4px solid var(--color-primary)' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Cliente</div>
                                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>{selectedClientInfo?.cliente}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>Representante</div>
                                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)' }}>{selectedClientInfo?.repre?.replace('Vendedor: ', '')}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>Limite de Crédito</div>
                                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>{formatCurrency(selectedClientInfo?.limite)}</div>
                                    </div>
                                </div>
                            </Card>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
                                <Card>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>CARTEIRA</div>
                                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)' }}>{formatCurrency(finalMetrics.carteira)}</div>
                                </Card>
                                <Card>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>CHEQUES</div>
                                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)' }}>{formatCurrency(finalMetrics.cheques)}</div>
                                </Card>
                                <Card>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>CRÉDITO</div>
                                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)', color: 'var(--color-success)' }}>{formatCurrency(finalMetrics.creditos)}</div>
                                </Card>
                                <Card style={{ background: 'var(--bg-hover)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>SALDO DEVEDOR</div>
                                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)', color: finalMetrics.saldoDevedor > 0 ? 'var(--color-error)' : 'var(--text-main)' }}>
                                        {formatCurrency(finalMetrics.saldoDevedor)}
                                    </div>
                                </Card>
                            </div>

                            <Card style={{ textAlign: 'center', background: 'var(--color-primary-dim)', border: '1px solid var(--color-primary)' }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)' }}>RESUMO (DISPONIBILIDADE)</div>
                                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-black)', color: finalMetrics.resumo > 0 ? 'var(--color-error)' : 'var(--color-success)' }}>
                                    {formatCurrency(Math.abs(finalMetrics.resumo))}
                                    <span style={{ fontSize: 'var(--text-xs)', marginLeft: 'var(--space-2)', opacity: 0.7 }}>
                                        {finalMetrics.resumo > 0 ? 'EXCEDIDO' : 'DISPONÍVEL'}
                                    </span>
                                </div>
                            </Card>
                        </div>

                        {/* Charts Area */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
<Card style={{ height: '240px' }}>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>DISTRIBUIÇÃO POR TIPO</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>

                            <Card style={{ height: '180px' }}>
                                <div style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-black)', marginBottom: 'var(--space-4)', textAlign: 'center' }}>PROJEÇÃO A VENCER</div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={activeProjectionData}>
                                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="valor" fill="var(--color-info)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={() => setView('client-report')}
                        style={{
                            padding: 'var(--space-5)',
                            fontSize: 'var(--text-md)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)',
                            width: '100%',
                            marginTop: 'var(--space-4)'
                        }}
                    >
                        Ver Detalhamento de Títulos (Resumo)
                        <ChevronRight size={20} />
                    </Button>
                </PageContainer>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <PageContainer maxWidth="1200px" title="Resumo de Títulos" actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
<Button variant="ghost" onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <ArrowLeft size={18} /> Voltar
                    </Button>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', background: 'var(--bg-card)', padding: 'var(--space-1)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
{['Todos', 'Carteira', 'Cheques', 'Crédito', 'Vencidos', 'A Vencer'].map(filter => (
                            <Button
                                key={filter}
                                variant={activeFilter === filter ? 'primary' : 'ghost'}
                                onClick={() => setActiveFilter(filter)}
                                style={{
                                    padding: 'var(--space-1) var(--space-3)',
                                    fontSize: 'var(--text-xs)',
                                }}
                            >
                                {filter}
                            </Button>
                        ))}
                    </div>
                </div>
            }>
                <Card padding="0" style={{ overflow: 'hidden' }}>
                    {/* Header Details */}
                    <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.01)', fontSize: 'var(--text-sm)' }}>
                        <div><span style={{ fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>Cliente:</span> <strong style={{ fontWeight: 'var(--font-black)' }}>{selectedClientInfo?.cliente}</strong></div>
                        <div style={{ marginTop: 'var(--space-1)' }}>
                            <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>Representante:</span> <strong style={{ fontWeight: 'var(--font-black)' }}>{selectedClientInfo?.repre?.replace('Vendedor: ', '')}</strong>
                            <span style={{ margin: '0 var(--space-3)', color: 'var(--border-color)' }}>|</span>
                            <span style={{ fontWeight: 'var(--font-bold)', color: 'var(--text-muted)' }}>Limite:</span> <strong style={{ color: 'var(--color-success)', fontWeight: 'var(--font-black)' }}>{formatCurrency(selectedClientInfo?.limite)}</strong>
                        </div>
                    </div>

                    {/* Table */}
                                            <DataGrid
                            columns={columns}
                            data={detailsFilteredData}
                            height="400px"
                            emptyMessage="Nenhum título encontrado para este filtro."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)' }}>
<div style={{ fontWeight: 'var(--font-bold)', marginRight: 'var(--space-6)' }}>TOTAL:</div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)', color: 'var(--color-error)' }}>
                                {formatCurrency(detailsTotal)}
                            </div>
                        </div>
                </Card>
            </PageContainer>
        </div>
    );
};

export default ClientSummary;
