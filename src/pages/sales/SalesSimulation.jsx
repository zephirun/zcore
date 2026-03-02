import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, DollarSign, TrendingUp, Users, AlertCircle, Search, Sliders, RotateCcw, Target, Play, Save, CheckCircle, Trash2 } from 'lucide-react';
import * as api from '../../services/api';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Skeleton from '../../components/ui/Skeleton';

const SalesSimulation = () => {
    const { salesData, globalFilters, username, activeUnit, isSalesDataLoading, salesDataError } = useData();
    const [simulatedValues, setSimulatedValues] = useState({});
    const [growthScenario, setGrowthScenario] = useState(0);
    const [marginScenario, setMarginScenario] = useState(0);
    const [directMarginScenario, setDirectMarginScenario] = useState(0);
    const [simulationName, setSimulationName] = useState('');
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const toast = useToast();
    const [showAIModal, setShowAIModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [aiFilter, setAiFilter] = useState('all');

    // Load available simulations for this vendor
    const loadVersionsList = async () => {
        if (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos') {
            const list = await api.fetchSimulations(globalFilters.vendor, activeUnit);
            setSavedSimulations(list);
        }
    };

    // Load saved simulation when vendor is selected
    useEffect(() => {
        const loadInitialSimulation = async () => {
            if (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos') {
                const list = await api.fetchSimulations(globalFilters.vendor, activeUnit);
                setSavedSimulations(list);

                // If there's a default/latest one, or just clear
                if (list.length > 0) {
                    const latest = list[0];
                    setSimulatedValues(latest.simulated_values || {});
                    setGrowthScenario(latest.growth_scenario || 0);
                    setMarginScenario(latest.margin_scenario || 0);
                    setDirectMarginScenario(latest.direct_margin_scenario || 0);
                    setSimulationName(latest.version_name || '');
                } else {
                    setSimulatedValues({});
                    setGrowthScenario(0);
                    setMarginScenario(0);
                    setDirectMarginScenario(0);
                    setSimulationName('');
                }
            }
        };
        loadInitialSimulation();
    }, [globalFilters.vendor, activeUnit]);

    const loadSpecificVersion = (version) => {
        setSimulatedValues(version.simulated_values || {});
        setGrowthScenario(version.growth_scenario || 0);
        setMarginScenario(version.margin_scenario || 0);
        setDirectMarginScenario(version.direct_margin_scenario || 0);
        setSimulationName(version.version_name || '');
        setShowHistory(false);
    };

    const handleDeleteVersion = async (id) => {
        if (window.confirm('Excluir esta simulação?')) {
            await api.deleteSimulation(id);
            loadVersionsList();
        }
    };

    const getProjectionMonth = () => {
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const currentMonthIdx = new Date().getMonth();
        return months[currentMonthIdx];
    };

    const projectionMonthName = getProjectionMonth();

    // Data Filtering & Processing
    const filteredData = useMemo(() => {
        if (!salesData) return [];
        return salesData.filter(item => {
            const vendorMatch = !globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos' || item.client?.vendor === globalFilters.vendor;
            const repMatch = !globalFilters.representative || globalFilters.representative === 'Selecionar Todos' || item.client?.representative === globalFilters.representative;
            const clientMatch = !globalFilters.client || globalFilters.client === 'Selecionar Todos' ||
                (item.client ? (`${item.client.name} - ${item.client.id}` === globalFilters.client || item.client.name === globalFilters.client) : false);
            return vendorMatch && repMatch && clientMatch;
        });
    }, [salesData, globalFilters.vendor, globalFilters.representative, globalFilters.client]);

    // Client Processing
    const clients = useMemo(() => {
        const clientMap = {};

        filteredData.forEach(item => {
            const clientId = item.client?.id;
            const clientName = item.client?.name;
            if (!clientId) return;

            if (!clientMap[clientId]) {
                clientMap[clientId] = {
                    id: clientId,
                    name: clientName,
                    realizedRevenue: 0,
                    realizedMargin: 0,
                    m2m3Revenue: 0,
                    m2m3Margin: 0,
                    basisRevenue: 0,
                    basisMargin: 0
                };
            }

            const availableMonths = item.months || [];
            const m1 = availableMonths[0] || { amount: 0, margin_percent: 0 };
            const m2 = availableMonths[1] || { amount: 0, margin_percent: 0 };
            const m3 = availableMonths[2] || { amount: 0, margin_percent: 0 };

            const revenueM1M2M3 = (m1.amount || 0) + (m2.amount || 0) + (m3.amount || 0);
            const marginM1M2M3 =
                ((m1.amount * (m1.margin_percent / 100)) || 0) +
                ((m2.amount * (m2.margin_percent / 100)) || 0) +
                ((m3.amount * (m3.margin_percent / 100)) || 0);

            const revenueM2M3 = (m2.amount || 0) + (m3.amount || 0);
            const marginM2M3 =
                ((m2.amount * (m2.margin_percent / 100)) || 0) +
                ((m3.amount * (m3.margin_percent / 100)) || 0);

            clientMap[clientId].realizedRevenue += revenueM1M2M3;
            clientMap[clientId].realizedMargin += marginM1M2M3;
            clientMap[clientId].m2m3Revenue += revenueM2M3;
            clientMap[clientId].m2m3Margin += marginM2M3;
        });

        const list = Object.values(clientMap).map(c => {
            const basisRevenue = Math.round((c.realizedRevenue / 3) * 100) / 100;
            const avgMarginRatio = c.realizedRevenue ? (c.realizedMargin / c.realizedRevenue) : 0;
            const basisMargin = Math.round(avgMarginRatio * 10000) / 100;

            return {
                ...c,
                basisRevenue,
                basisMargin,
                realizedMarginPct: c.realizedRevenue ? (c.realizedMargin / c.realizedRevenue) * 100 : 0
            };
        });

        // Ranking Sorting
        const ranking = globalFilters.ranking || 'Sem Ordenação';
        if (ranking === 'Maior Faturamento') return list.sort((a, b) => b.realizedRevenue - a.realizedRevenue);
        if (ranking === 'Menor Faturamento') return list.sort((a, b) => a.realizedRevenue - b.realizedRevenue);
        if (ranking === 'Maior Margem') return list.sort((a, b) => b.realizedMarginPct - a.realizedMarginPct);
        if (ranking === 'Menor Margem') return list.sort((a, b) => a.realizedMarginPct - b.realizedMarginPct);

        return list.sort((a, b) => b.realizedRevenue - a.realizedRevenue);
    }, [filteredData, globalFilters.ranking]);

    const totals = useMemo(() => {
        let totalRealizedRevenue = 0;
        let totalRealizedMargin = 0;
        let totalBasisRevenue = 0;
        let totalProjectedRevenue = 0;
        let totalProjectedMargin = 0;

        clients.forEach(client => {
            totalRealizedRevenue += client.realizedRevenue;
            totalRealizedMargin += client.realizedMargin;
            totalBasisRevenue += client.basisRevenue;

            // Check for individual overrides in simulatedValues
            const hasOverride = !!simulatedValues[client.id];
            let simRev, simMarg;

            if (hasOverride) {
                simRev = parseFloat(simulatedValues[client.id].revenue) || 0;
                simMarg = parseFloat(simulatedValues[client.id].margin) || 0;
            } else {
                // Apply global scenarios to basis for real-time totals
                simRev = client.basisRevenue * (1 + (growthScenario / 100));

                if (directMarginScenario > 0) {
                    simMarg = directMarginScenario;
                } else {
                    simMarg = client.basisMargin + marginScenario;
                }
            }

            totalProjectedRevenue += simRev;
            totalProjectedMargin += (simRev * (simMarg / 100));
        });

        return {
            realizedRevenue: totalRealizedRevenue,
            realizedMargin: totalRealizedMargin,
            realizedMarginPct: totalRealizedRevenue ? (totalRealizedMargin / totalRealizedRevenue) * 100 : 0,
            projectedRevenue: totalProjectedRevenue,
            projectedMargin: totalProjectedMargin,
            projectedMarginPct: totalProjectedRevenue ? (totalProjectedMargin / totalProjectedRevenue) * 100 : 0,
            diffRevenue: totalBasisRevenue ? ((totalProjectedRevenue / totalBasisRevenue) - 1) * 100 : 0
        };
    }, [clients, simulatedValues, growthScenario, marginScenario, directMarginScenario]);

    // AI advisor engine removed to adhere to Fiori ERP standards.
    const aiInsights = null;

    // Local input field masks
    const formatBRLInput = (value) => {
        if (value === null || value === undefined || value === '') return '';

        // If it's already a number (like from state), format it normally
        if (typeof value === 'number') {
            return formatCurrency(value);
        }

        // If it's a string (user typing), treat as digits representing cents
        const cleanValue = value.replace(/\D/g, '');
        if (!cleanValue) return '';
        const numberValue = parseFloat(cleanValue) / 100;
        return formatCurrency(numberValue);
    };

    const parseBRLInput = (value) => {
        if (!value) return 0;
        const cleanValue = value.replace(/\D/g, '');
        return parseFloat(cleanValue) / 100;
    };

    const handleInputChange = (clientId, field, value) => {
        let newValue = value;

        if (field === 'revenue') {
            newValue = parseBRLInput(value);
        } else if (field === 'margin') {
            // Handle comma to dot for internal processing
            let normalized = value.replace(',', '.');
            // If typing a separator or minus, keep as string
            if (normalized.endsWith('.') || normalized === '' || normalized === '-') {
                newValue = normalized;
            } else {
                const parsed = parseFloat(normalized);
                newValue = isNaN(parsed) ? 0 : parsed;
            }
        }

        setSimulatedValues(prev => {
            const client = clients.find(c => c.id === clientId);
            const basisRevenue = client ? client.basisRevenue : 0;
            const basisMargin = client ? client.basisMargin : 0;

            const current = prev[clientId] || { revenue: basisRevenue, margin: basisMargin };
            return {
                ...prev,
                [clientId]: {
                    ...current,
                    [field]: newValue
                }
            };
        });
    };

    const applyScenarios = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const newSimulatedValues = {};
            clients.forEach(client => {
                const baseMargin = directMarginScenario > 0 ? directMarginScenario : client.basisMargin;
                newSimulatedValues[client.id] = {
                    revenue: client.basisRevenue * (1 + growthScenario / 100),
                    margin: Math.max(0, baseMargin + marginScenario)
                };
            });
            setSimulatedValues(newSimulatedValues);
            setIsSimulating(false);
        }, 600);
    };

    const clearScenarios = () => {
        setSimulatedValues({});
        setGrowthScenario(0);
        setMarginScenario(0);
        setDirectMarginScenario(0);
        setShowAIModal(false);
    };

    const handleSave = async () => {
        if (!globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos') return;
        setSaveStatus('saving');
        const simulationData = {
            username,
            vendor: globalFilters.vendor,
            unit: activeUnit,
            versionName: simulationName || 'Padrão', // Use the input name
            simulatedValues,
            growthScenario,
            marginScenario,
            directMarginScenario
        };
        const result = await api.saveSimulation(simulationData);
        if (result.success) {
            setSaveStatus('success');
            loadVersionsList(); // Refresh the list after saving
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
            toast.error("Erro ao salvar", result.error);
        }
    };

    const isAnyFilterActive = useMemo(() => {
        return (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos') ||
            (globalFilters.representative && globalFilters.representative !== 'Selecionar Todos') ||
            (globalFilters.client && globalFilters.client !== 'Selecionar Todos');
    }, [globalFilters]);

    return (
        <div style={{ background: 'var(--bg-main)', minHeight: '100vh' }}>
            <div className="no-print" style={{ background: 'var(--bg-input)' }}>
                <Filters />
            </div>

            <div className="animate-fade-in" style={{ paddingBottom: '100px' }}>
                {salesDataError ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--color-error)' }}>
                        <AlertCircle size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.8 }} />
                        <h3>Erro ao carregar dados</h3>
                        <p>{salesDataError}</p>
                    </div>
                ) : isSalesDataLoading ? (
                    <div style={{ padding: '0 40px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', marginTop: '10px' }}>
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                            <Skeleton height={120} borderRadius="var(--radius-sm)" />
                        </div>
                        <Skeleton height={400} borderRadius="var(--radius-sm)" />
                    </div>
                ) : !isAnyFilterActive ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                        <h3>Selecione um filtro para iniciar a simulação</h3>
                        <p>Escolha um Vendedor, Representante ou Cliente acima para projetar os resultados.</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Search size={48} style={{ marginBottom: 'var(--space-4)', opacity: 0.5 }} />
                        <h3>Nenhum cliente encontrado</h3>
                        <p>Os filtros atuais não retornaram dados de faturamento. Tente ajustar a busca.</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 'var(--space-4)',
                            padding: '0 40px 24px 40px',
                            marginTop: '10px'
                        }}>
                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                borderLeft: '3px solid var(--color-primary)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturamento Realizado</span>
                                    <DollarSign size={14} color="var(--color-primary)" />
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totals.realizedRevenue)}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', marginTop: 'var(--space-1)' }}>Margem: {formatPercent(totals.realizedMarginPct || 0)}</div>
                            </div>

                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                borderLeft: '3px solid var(--color-warning, #f59e0b)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{projectionMonthName} Projetado</span>
                                    <Target size={14} color="var(--color-warning, #f59e0b)" />
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totals.projectedRevenue)}</div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 'var(--space-4)',
                                    fontSize: 'var(--text-sm)',
                                    color: totals.diffRevenue >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                                    fontWeight: 'var(--font-semibold)',
                                    marginTop: 'var(--space-1)'
                                }}>
                                    <TrendingUp size={12} />
                                    Dif: {totals.diffRevenue >= 0 ? '+' : ''}{totals.diffRevenue.toFixed(1)}%
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                borderLeft: '3px solid var(--color-success)',
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margem Projetada</span>
                                    <TrendingUp size={14} color="var(--color-success)" />
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>{formatPercent(totals.projectedMarginPct)}</div>
                            </div>

                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 'var(--space-4)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                borderLeft: '3px solid var(--color-purple, #8b5cf6)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: 'var(--space-4)'
                            }}>
                                <Input
                                    type="text"
                                    placeholder="Nome da Versão"
                                    value={simulationName}
                                    onChange={(e) => setSimulationName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: 'var(--space-4)',
                                        color: 'var(--text-main)',
                                        fontSize: 'var(--text-sm)',
                                        fontWeight: 'var(--font-semibold)',
                                        outline: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%' }}>
                                    <Button
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving'}
                                        style={{
                                            flex: 2,
                                            padding: '10px',
                                            background: saveStatus === 'success' ? 'var(--color-success)' : (saveStatus === 'error' ? 'var(--color-error)' : 'var(--color-primary)'),
                                            color: 'var(--bg-main)',
                                            border: 'none',
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 'var(--font-bold)',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 'var(--space-4)',
                                            cursor: 'pointer',
                                            transition: 'background 0.3s',
                                        }}
                                    >
                                        {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle size={16} /> : <Save size={16} />}
                                        {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : 'Salvar'}
                                    </Button>
                                    <Button
                                        onClick={() => setShowHistory(true)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'var(--bg-input)',
                                            color: 'var(--text-main)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-sm)',
                                            fontWeight: 'var(--font-bold)',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 'var(--space-4)',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <RotateCcw size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Global Simulator Panel */}
                        <div style={{ padding: '0 40px 24px 40px' }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', padding: 'var(--space-6)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <div style={{ width: '36px', height: '36px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                            <Sliders size={18} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', letterSpacing: '-0.02em' }}>Simulador Global</h3>
                                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Aplique cenários em todos os clientes filtrados</p>
                                        </div>
                                    </div>
                                </div >

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                    <div style={{ background: 'var(--bg-input)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                                                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>Cenário de Crescimento (%)</label>
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: growthScenario >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{growthScenario >= 0 ? '+' : ''}{growthScenario}%</span>
                                            </div>
                                            <Input
                                                type="range" min="-30" max="100" value={growthScenario}
                                                onChange={(e) => setGrowthScenario(parseInt(e.target.value))}
                                                style={{ width: '100%', height: 'var(--space-1)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--bg-input)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                                                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>Configurar Margem Direta (%)</label>
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: 'var(--color-info, #3b82f6)' }}>{directMarginScenario > 0 ? `${directMarginScenario}%` : 'Usar Base'}</span>
                                            </div>
                                            <Input
                                                type="range" min="0" max="50" step="0.5" value={directMarginScenario}
                                                onChange={(e) => setDirectMarginScenario(parseFloat(e.target.value))}
                                                style={{ width: '100%', height: 'var(--space-1)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                            />
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>{directMarginScenario > 0 ? 'Sobrequescreve a margem base de todos os clientes.' : 'Mantém a margem histórica de cada cliente.'}</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'var(--bg-input)', padding: 'var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ marginBottom: 'var(--space-4)' }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                                                <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 'var(--font-semibold)' }}>Ajuste de Margem (Pontos %)</label>
                                                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: marginScenario >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{marginScenario >= 0 ? '+' : ''}{marginScenario}%</span>
                                            </div>
                                            <Input
                                                type="range" min="-10" max="15" value={marginScenario}
                                                onChange={(e) => setMarginScenario(parseInt(e.target.value))}
                                                style={{ width: '100%', height: 'var(--space-1)', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                    <Button onClick={clearScenarios} style={{ padding: '10px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-bold)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <RotateCcw size={16} /> Resetar
                                    </Button>
                                    <Button onClick={applyScenarios} disabled={isSimulating} style={{ minWidth: '200px', padding: '10px 24px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--bg-main)', fontSize: '13px', fontWeight: 'var(--font-bold)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)' }}>
                                        {isSimulating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />} Aplicar Cenários
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content Removed: AI Modal */}
                        {/* History Modal */}
                        {showHistory && (
                            <div style={{
                                position: 'fixed',
                                top: 0, left: 0, right: 0, bottom: 0,
                                background: 'rgba(0,0,0,0.85)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2000,
                                backdropFilter: 'blur(8px)',
                                animation: 'fadeIn 0.3s ease'
                            }}>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '600px',
                                    background: 'var(--bg-main)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '28px',
                                    position: 'relative',
                                    border: '1px solid var(--border-color)',
                                    margin: 'var(--space-5)',
                                    boxShadow: 'var(--shadow-lg)'
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                                <RotateCcw size={20} />
                                            </div>
                                            <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)', fontWeight: '800' }}>Histórico de Simulações</h2>
                                        </div>
                                        <Button
                                            onClick={() => setShowHistory(false)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            <RotateCcw size={24} style={{ transform: 'rotate(45deg)' }} />
                                        </Button>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', paddingRight: '5px' }}>
                                        {savedSimulations.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Nenhuma simulação salva para este vendedor.</p>
                                            </div>
                                        ) : (
                                            savedSimulations.map(sim => (
                                                <div key={sim.id} style={{
                                                    padding: '16px 20px',
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)', marginBottom: 'var(--space-4)' }}>{sim.version_name || 'Simulação Padrão'}</div>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                            <RefreshCw size={10} />
                                                            {new Date(sim.updated_at).toLocaleString('pt-BR')}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                                        <Button
                                                            onClick={() => loadSpecificVersion(sim)}
                                                            className="hover-scale"
                                                            style={{
                                                                padding: '10px 18px',
                                                                background: 'var(--color-primary)',
                                                                color: 'var(--bg-main)',
                                                                border: 'none',
                                                                borderRadius: 'var(--radius-sm)',
                                                                fontSize: 'var(--text-sm)',
                                                                fontWeight: 'var(--font-bold)',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
                                                            }}
                                                        >
                                                            Carregar
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleDeleteVersion(sim.id)}
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                background: 'var(--color-primary-dim)',
                                                                color: 'var(--color-error)',
                                                                border: '1px solid var(--border-color)',
                                                                borderRadius: 'var(--radius-sm)',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <Button
                                        onClick={() => setShowHistory(false)}
                                        style={{ width: '100%', marginTop: '25px', padding: '14px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontWeight: 'var(--font-bold)', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        Voltar ao Simulador
                                    </Button>
                                </div>
                            </div>
                        )}


                        {/* Table Section */}
                        <div style={{ padding: '0 40px' }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                        <Users size={18} color="var(--text-muted)" />
                                        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '800' }}>Projeção Trimestral Móvel</h3>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Faturamento Realizado</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-info)', textTransform: 'uppercase', textAlign: 'right' }}>Margem Realizada</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-warning)', textTransform: 'uppercase', textAlign: 'right' }}>{projectionMonthName} (Projetado)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-success)', textTransform: 'uppercase', textAlign: 'right' }}>Margem Proj. (%)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', textAlign: 'right' }}>Diferença vs Média</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map((client) => {
                                                const simulation = simulatedValues[client.id] || {
                                                    revenue: client.basisRevenue,
                                                    margin: client.basisMargin
                                                };
                                                const projectedRolling = client.m2m3Revenue + (simulation.revenue || 0);

                                                return (
                                                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}>
                                                        <td style={{ padding: '15px 20px' }}>
                                                            <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{client.name}</div>
                                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                                ID: {client.id}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>{formatCurrency(client.realizedRevenue)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'var(--font-semibold)', color: '#3498db' }}>{formatPercent(client.realizedMarginPct)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <Input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={formatBRLInput(simulation.revenue)}
                                                                onChange={(e) => handleInputChange(client.id, 'revenue', e.target.value)}
                                                                style={{
                                                                    width: '180px', textAlign: 'right', padding: '8px 12px',
                                                                    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                                    borderRadius: 'var(--radius-sm)', color: 'var(--color-warning)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 'var(--space-4)' }}>
                                                                <Input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    value={simulation.margin !== undefined && simulation.margin !== null
                                                                        ? (typeof simulation.margin === 'string'
                                                                            ? simulation.margin.replace('.', ',')
                                                                            : simulation.margin.toString().replace('.', ','))
                                                                        : '0,00'
                                                                    }
                                                                    onChange={(e) => {
                                                                        const val = e.target.value.replace('.', ',');
                                                                        // Filtro para permitir apenas números, uma vírgula e sinal de menos
                                                                        if (/^-?\d*,?\d*$/.test(val)) {
                                                                            handleInputChange(client.id, 'margin', val);
                                                                        }
                                                                    }}
                                                                    onBlur={(e) => {
                                                                        // Ao perder o foco, formata para duas casas decimais se for um número válido
                                                                        const val = e.target.value.replace(',', '.');
                                                                        const parsed = parseFloat(val);
                                                                        if (!isNaN(parsed)) {
                                                                            handleInputChange(client.id, 'margin', parsed.toFixed(2));
                                                                        }
                                                                    }}
                                                                    style={{
                                                                        width: '80px', textAlign: 'right', padding: '8px 12px',
                                                                        background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                                        borderRadius: 'var(--radius-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)'
                                                                    }}
                                                                />
                                                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <div style={{
                                                                fontSize: '15px',
                                                                fontWeight: '800',
                                                                color: (simulation.revenue - client.basisRevenue) >= 0 ? 'var(--color-success)' : 'var(--color-error)'
                                                            }}>
                                                                {((simulation.revenue / (client.basisRevenue || 1)) * 100 - 100).toFixed(1)}%
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div >
    );
};

export default SalesSimulation;
