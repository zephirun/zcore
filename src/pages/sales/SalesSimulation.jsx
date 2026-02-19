import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { RefreshCw, DollarSign, TrendingUp, Users, AlertCircle, Search, Sliders, RotateCcw, Target, Play, Save, CheckCircle, Trash2 } from 'lucide-react';
import * as api from '../../services/api';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const SalesSimulation = () => {
    const { salesData, globalFilters, username, activeUnit } = useData();
    const [simulatedValues, setSimulatedValues] = useState({});
    const [growthScenario, setGrowthScenario] = useState(0);
    const [marginScenario, setMarginScenario] = useState(0);
    const [directMarginScenario, setDirectMarginScenario] = useState(0);
    const [simulationName, setSimulationName] = useState('');
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
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

    // AI advisor engine
    const aiInsights = useMemo(() => {
        // Pure projection analysis vs historical basis
        const benchmarkRev = totals.realizedRevenue;
        const benchmarkMarg = totals.realizedMarginPct;

        if (!benchmarkRev && !benchmarkMarg) return null;

        const revGap = benchmarkRev - totals.projectedRevenue;
        const margGap = benchmarkMarg - totals.projectedMarginPct;

        const isBeatingBase = revGap <= 0 && margGap <= 0;

        const revDiffPct = totals.realizedRevenue ? ((totals.projectedRevenue / totals.realizedRevenue) - 1) * 100 : 0;
        const margDiff = totals.projectedMarginPct - totals.realizedMarginPct;

        const insights = [];
        insights.push(`Projeção de faturamento está ${revDiffPct >= 0 ? 'acima' : 'abaixo'} da base histórica (${Math.abs(revDiffPct).toFixed(1)}%).`);
        insights.push(`Sua margem está ${margDiff >= 0 ? 'acima' : 'abaixo'} da base histórica (${Math.abs(margDiff).toFixed(2)}%).`);

        // Advanced Segmentation
        const processedClients = clients.map(c => {
            const hasOverride = !!simulatedValues[c.id];
            let simRev, simMarg;

            if (hasOverride) {
                simRev = parseFloat(simulatedValues[c.id].revenue) || 0;
                simMarg = parseFloat(simulatedValues[c.id].margin) || 0;
            } else {
                simRev = c.basisRevenue * (1 + (growthScenario / 100));
                if (directMarginScenario > 0) simMarg = directMarginScenario;
                else simMarg = c.basisMargin + marginScenario;
            }
            return { ...c, simRevenue: simRev, simMargin: simMarg };
        });

        const avgRev = processedClients.reduce((acc, c) => acc + c.simRevenue, 0) / (processedClients.length || 1);
        const avgMarg = processedClients.reduce((acc, c) => acc + c.simMargin, 0) / (processedClients.length || 1);

        const segments = {
            champions: processedClients.filter(c => c.simRevenue >= avgRev && c.simMargin >= avgMarg),
            volume: processedClients.filter(c => c.simRevenue >= avgRev && c.simMargin < avgMarg),
            gems: processedClients.filter(c => c.simRevenue < avgRev && c.simMargin >= avgMarg),
            rehab: processedClients.filter(c => c.simRevenue < avgRev && c.simMargin < avgMarg)
        };

        const recommendations = [];

        // 1. Strategic Trade-offs: Balanced Growth (Multiple Pairs)
        const sortedVolume = [...segments.volume].sort((a, b) => b.simRevenue - a.simRevenue);
        const sortedChamps = [...segments.champions].sort((a, b) => b.simMargin - a.simMargin);

        // Find up to 3 trade-off pairs
        const pairsCount = Math.min(3, sortedVolume.length, sortedChamps.length);
        const usedIds = new Set();

        for (let i = 0; i < pairsCount; i++) {
            const vol = sortedVolume[i];
            const champ = sortedChamps[i];
            usedIds.add(vol.id);
            usedIds.add(champ.id);

            recommendations.push({
                type: 'tradeoff',
                clientId: vol.id,
                clientName: `Trade-off: ${vol.name}`,
                suggestion: `Agressividade (-2%) balanceada com +1.5% em ${champ.name}`,
                impact: `Expansão de volume compensada por prêmio de exclusividade.`
            });
        }

        // 2. Margin Optimization in Remaining Volume Drivers
        const extraVolume = [...segments.volume]
            .filter(c => !usedIds.has(c.id))
            .sort((a, b) => b.simRevenue - a.simRevenue)
            .slice(0, 8);

        extraVolume.forEach(c => {
            const boost = 1.5;
            recommendations.push({
                type: 'margin',
                clientId: c.id,
                clientName: c.name,
                suggestion: `Otimização de Rentabilidade: +${boost}%`,
                impact: `Impacto global approx. ${((c.simRevenue / (totals.projectedRevenue || 1)) * boost).toFixed(2)}%`
            });
        });

        // 3. Scaling Champions & Gems
        const highValue = [...segments.champions, ...segments.gems]
            .filter(c => !usedIds.has(c.id))
            .sort((a, b) => b.simMargin - a.simMargin)
            .slice(0, 8);

        highValue.forEach(c => {
            recommendations.push({
                type: 'revenue',
                clientId: c.id,
                clientName: c.name,
                suggestion: `Escalar Volume (Margem Alta: ${c.simMargin.toFixed(1)}%)`,
                impact: `Crescimento orgânico focado em lucro.`
            });
        });

        return {
            status: isBeatingBase ? 'success' : 'warning',
            message: insights.join(' '),
            comparison: {
                revDiffPct,
                margDiff
            },
            recommendations: recommendations.slice(0, 20)
        };
    }, [totals, clients, simulatedValues, growthScenario, marginScenario, directMarginScenario]);

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
            alert("Erro ao salvar simulação: " + result.error);
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
                {!isAnyFilterActive ? (
                    <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3>Selecione um filtro para iniciar a simulação</h3>
                        <p>Escolha um Vendedor, Representante ou Cliente acima para projetar os resultados.</p>
                    </div>
                ) : (
                    <>
                        {/* KPI Section */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            padding: '0 40px 30px 40px',
                            marginTop: '10px'
                        }}>
                            <div style={{
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                padding: '24px',
                                borderRadius: 'var(--radius, 12px)',
                                border: 'var(--glass-border)',
                                borderLeft: '4px solid var(--color-primary)',
                                boxShadow: 'var(--glass-shadow)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturamento Realizado</span>
                                    <DollarSign size={16} color="var(--color-primary)" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totals.realizedRevenue)}</div>
                                <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600', marginTop: '4px' }}>Margem Realizada: {formatPercent(totals.realizedMarginPct || 0)}</div>
                            </div>

                            <div style={{
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                padding: '24px',
                                borderRadius: 'var(--radius, 12px)',
                                border: 'var(--glass-border)',
                                borderLeft: '4px solid #f39c12',
                                boxShadow: 'var(--glass-shadow)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{projectionMonthName} Projetado</span>
                                    <Target size={16} color="#f39c12" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totals.projectedRevenue)}</div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '12px',
                                    color: totals.diffRevenue >= 0 ? 'var(--color-success)' : 'var(--color-error)',
                                    fontWeight: '600',
                                    marginTop: '4px'
                                }}>
                                    <TrendingUp size={12} />
                                    Dif: {totals.diffRevenue >= 0 ? '+' : ''}{totals.diffRevenue.toFixed(1)}%
                                </div>
                            </div>

                            <div style={{
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                padding: '24px',
                                borderRadius: 'var(--radius, 12px)',
                                border: 'var(--glass-border)',
                                borderLeft: '4px solid var(--color-success)',
                                boxShadow: 'var(--glass-shadow)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Margem Projetada</span>
                                    <TrendingUp size={16} color="var(--color-success)" />
                                </div>
                                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>{formatPercent(totals.projectedMarginPct)}</div>
                            </div>

                            <div style={{
                                background: 'var(--glass-bg)',
                                backdropFilter: 'var(--glass-blur)',
                                padding: '24px',
                                borderRadius: 'var(--radius, 12px)',
                                border: 'var(--glass-border)',
                                boxShadow: 'var(--glass-shadow)',
                                borderLeft: '4px solid var(--color-purple)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                gap: '12px'
                            }}>
                                <input
                                    type="text"
                                    placeholder="Nome da Versão"
                                    value={simulationName}
                                    onChange={(e) => setSimulationName(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '8px',
                                        color: 'var(--text-main)',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        outline: 'none'
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                    <button
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving'}
                                        style={{
                                            flex: 2,
                                            padding: '12px',
                                            background: saveStatus === 'success' ? 'var(--color-success)' : (saveStatus === 'error' ? 'var(--color-error)' : 'var(--color-primary)'),
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: '0 4px 12px var(--color-primary-glow)'
                                        }}
                                    >
                                        {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle size={16} /> : <Save size={16} />}
                                        {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : 'Salvar'}
                                    </button>
                                    <button
                                        onClick={() => setShowHistory(true)}
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--text-main)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            fontWeight: '700',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Global Simulator Panel */}
                        <div style={{ padding: '0 40px 30px 40px' }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                            <Sliders size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Simulador Global</h3>
                                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Aplique cenários em todos os clientes filtrados</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginBottom: '30px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Cenário de Crescimento (%)</label>
                                                <span style={{ fontSize: '12px', fontWeight: '800', color: growthScenario >= 0 ? '#2ecc71' : '#e74c3c' }}>{growthScenario >= 0 ? '+' : ''}{growthScenario}%</span>
                                            </div>
                                            <input
                                                type="range" min="-30" max="100" value={growthScenario}
                                                onChange={(e) => setGrowthScenario(parseInt(e.target.value))}
                                                style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '2px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Configurar Margem Direta (%)</label>
                                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#3498db' }}>{directMarginScenario > 0 ? `${directMarginScenario}%` : 'Usar Base'}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="50" step="0.5" value={directMarginScenario}
                                                onChange={(e) => setDirectMarginScenario(parseFloat(e.target.value))}
                                                style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '2px', outline: 'none' }}
                                            />
                                            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px' }}>{directMarginScenario > 0 ? 'Sobrequescreve a margem base de todos os clientes.' : 'Mantém a margem histórica de cada cliente.'}</p>
                                        </div>
                                    </div>

                                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '15px' }}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <label style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>Ajuste de Margem (Pontos %)</label>
                                                <span style={{ fontSize: '12px', fontWeight: '800', color: marginScenario >= 0 ? '#2ecc71' : '#e74c3c' }}>{marginScenario >= 0 ? '+' : ''}{marginScenario}%</span>
                                            </div>
                                            <input
                                                type="range" min="-10" max="15" value={marginScenario}
                                                onChange={(e) => setMarginScenario(parseInt(e.target.value))}
                                                style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: '2px', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button onClick={clearScenarios} style={{ padding: '12px 20px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <RotateCcw size={16} /> Resetar
                                    </button>
                                    <button onClick={applyScenarios} disabled={isSimulating} style={{ minWidth: '220px', padding: '12px 30px', background: 'var(--color-primary)', border: 'none', borderRadius: '10px', color: 'white', fontSize: '13px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)' }}>
                                        {isSimulating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />} Aplicar Cenários
                                    </button>
                                    <button
                                        onClick={() => setShowAIModal(true)}
                                        className="hover-scale"
                                        style={{
                                            padding: '12px 25px',
                                            background: 'linear-gradient(135deg, #9b59b6, #8e44ad)',
                                            border: 'none',
                                            borderRadius: '10px',
                                            color: 'white',
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            boxShadow: '0 4px 15px rgba(155, 89, 182, 0.3)'
                                        }}
                                    >
                                        <Target size={18} /> Consultor de IA
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Consultor de IA Modal */}
                        {showAIModal && (
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
                                    maxWidth: '650px',
                                    background: 'var(--bg-main)',
                                    borderRadius: '24px',
                                    padding: '40px',
                                    position: 'relative',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    border: '1px solid var(--border-color)',
                                    margin: '20px'
                                }}>
                                    <button
                                        onClick={() => setShowAIModal(false)}
                                        style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                    >
                                        <RotateCcw size={24} style={{ transform: 'rotate(45deg)' }} />
                                    </button>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                                        <div style={{ width: '45px', height: '45px', background: '#9b59b6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                            <RefreshCw size={24} className={isAnalyzing ? 'animate-spin' : ''} />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#9b59b6' }}>Consultor de IA</h2>
                                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>Análise estratégica e definição de metas</p>
                                        </div>
                                    </div>

                                    {/* Modal Content: Targets */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
                                        {/* Projection Summary Section */}
                                        {aiInsights && !isAnalyzing && (
                                            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', animate: 'fadeIn 0.4s ease' }}>
                                                <div style={{ flex: 1, background: 'rgba(52, 152, 219, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(52, 152, 219, 0.1)' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800', letterSpacing: '1px' }}>Projeção vs Base Historical</div>
                                                    <div style={{ fontSize: '24px', fontWeight: '900', color: aiInsights.comparison.revDiffPct >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                                        {aiInsights.comparison.revDiffPct >= 0 ? '+' : ''}{aiInsights.comparison.revDiffPct.toFixed(1)}% <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>em Faturamento</span>
                                                    </div>
                                                </div>
                                                <div style={{ flex: 1, background: 'rgba(46, 204, 113, 0.05)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(46, 204, 113, 0.1)' }}>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '800', letterSpacing: '1px' }}>Delta de Margem Real</div>
                                                    <div style={{ fontSize: '24px', fontWeight: '900', color: aiInsights.comparison.margDiff >= 0 ? '#2ecc71' : '#e74c3c' }}>
                                                        {aiInsights.comparison.margDiff >= 0 ? '+' : ''}{aiInsights.comparison.margDiff.toFixed(2)}% <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.8 }}>vs Realizado</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Modal Content: Insights (Scrollable List) */}
                                        {aiInsights && !isAnalyzing && (
                                            <div className="animate-fade-in">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                                    <h3 style={{ fontSize: '12px', fontWeight: '800', color: aiInsights.status === 'success' ? '#2ecc71' : '#f39c12', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>Recomendações de Otimização</h3>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        {[
                                                            { id: 'all', label: 'Tudo' },
                                                            { id: 'tradeoff', label: 'Trade-offs' },
                                                            { id: 'margin', label: 'Margem' },
                                                            { id: 'revenue', label: 'Volume' }
                                                        ].map(pill => (
                                                            <button
                                                                key={pill.id}
                                                                onClick={() => setAiFilter(pill.id)}
                                                                style={{
                                                                    padding: '4px 12px',
                                                                    borderRadius: '20px',
                                                                    fontSize: '10px',
                                                                    fontWeight: '800',
                                                                    border: '1px solid',
                                                                    borderColor: aiFilter === pill.id ? 'var(--color-primary)' : 'var(--border-color)',
                                                                    background: aiFilter === pill.id ? 'var(--color-primary)' : 'transparent',
                                                                    color: aiFilter === pill.id ? '#fff' : 'var(--text-muted)',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                {pill.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div style={{
                                                    maxHeight: '350px',
                                                    overflowY: 'auto',
                                                    paddingRight: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '12px',
                                                    marginBottom: '30px'
                                                }}>
                                                    {aiInsights.recommendations
                                                        .filter(r => aiFilter === 'all' || r.type === aiFilter)
                                                        .map((rec, idx) => (
                                                            <div key={idx} style={{
                                                                background: 'var(--bg-card)',
                                                                border: rec.type === 'tradeoff' ? '1px solid rgba(155, 89, 182, 0.4)' : '1px solid var(--border-color)',
                                                                borderRadius: '12px',
                                                                padding: '16px 20px',
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                boxShadow: rec.type === 'tradeoff' ? '0 4px 12px rgba(155, 89, 182, 0.1)' : 'none'
                                                            }}>
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        {rec.clientName}
                                                                        {rec.type === 'tradeoff' && <span style={{ fontSize: '9px', padding: '2px 6px', background: 'rgba(155, 89, 182, 0.2)', color: '#9b59b6', borderRadius: '4px' }}>ESTRATÉGIA BALANCEADA</span>}
                                                                    </div>
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: rec.type === 'margin' ? '#3498db' : (rec.type === 'tradeoff' ? '#9b59b6' : '#2ecc71'),
                                                                        fontWeight: '700'
                                                                    }}>
                                                                        {rec.suggestion}
                                                                    </div>
                                                                </div>
                                                                <div style={{ textAlign: 'right' }}>
                                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Impacto</div>
                                                                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{rec.impact}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => setShowAIModal(false)}
                                            style={{ width: '100%', padding: '15px', background: 'var(--color-primary)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: '800', cursor: 'pointer' }}
                                        >
                                            Fechar e Voltar ao Simulador
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    borderRadius: '24px',
                                    padding: '30px',
                                    position: 'relative',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                    border: '1px solid var(--border-color)',
                                    margin: '20px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                                                <RotateCcw size={20} />
                                            </div>
                                            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>Histórico de Simulações</h2>
                                        </div>
                                        <button
                                            onClick={() => setShowHistory(false)}
                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                                        >
                                            <RotateCcw size={24} style={{ transform: 'rotate(45deg)' }} />
                                        </button>
                                    </div>

                                    <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '5px' }}>
                                        {savedSimulations.length === 0 ? (
                                            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: '16px' }}>
                                                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>Nenhuma simulação salva para este vendedor.</p>
                                            </div>
                                        ) : (
                                            savedSimulations.map(sim => (
                                                <div key={sim.id} style={{
                                                    padding: '16px 20px',
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    transition: 'all 0.2s'
                                                }}>
                                                    <div>
                                                        <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-main)', marginBottom: '4px' }}>{sim.version_name || 'Simulação Padrão'}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <RefreshCw size={10} />
                                                            {new Date(sim.updated_at).toLocaleString('pt-BR')}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => loadSpecificVersion(sim)}
                                                            className="hover-scale"
                                                            style={{
                                                                padding: '10px 18px',
                                                                background: 'var(--color-primary)',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '10px',
                                                                fontSize: '12px',
                                                                fontWeight: '700',
                                                                cursor: 'pointer',
                                                                boxShadow: '0 4px 12px rgba(52, 152, 219, 0.2)'
                                                            }}
                                                        >
                                                            Carregar
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVersion(sim.id)}
                                                            style={{
                                                                width: '38px',
                                                                height: '38px',
                                                                background: 'rgba(231, 76, 60, 0.05)',
                                                                color: '#e74c3c',
                                                                border: '1px solid rgba(231, 76, 60, 0.1)',
                                                                borderRadius: '10px',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowHistory(false)}
                                        style={{ width: '100%', marginTop: '25px', padding: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-main)', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        Voltar ao Simulador
                                    </button>
                                </div>
                            </div>
                        )}


                        {/* Table Section */}
                        <div style={{ padding: '0 40px' }}>
                            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Users size={18} color="var(--text-muted)" />
                                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Projeção Trimestral Móvel</h3>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</th>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Faturamento Realizado</th>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: '#3498db', textTransform: 'uppercase', textAlign: 'right' }}>Margem Realizada</th>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: '#f39c12', textTransform: 'uppercase', textAlign: 'right' }}>{projectionMonthName} (Projetado)</th>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: '#2ecc71', textTransform: 'uppercase', textAlign: 'right' }}>Margem Proj. (%)</th>
                                                <th style={{ padding: '15px 20px', fontSize: '11px', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', textAlign: 'right' }}>Diferença vs Média</th>
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
                                                            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{client.name}</div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                ID: {client.id}
                                                                {aiInsights?.recommendations.some(r => r.clientId === client.id) && (
                                                                    <span style={{
                                                                        padding: '2px 6px',
                                                                        background: 'rgba(52, 152, 219, 0.2)',
                                                                        color: '#3498db',
                                                                        borderRadius: '4px',
                                                                        fontSize: '9px',
                                                                        fontWeight: '900',
                                                                        textTransform: 'uppercase'
                                                                    }}>
                                                                        Oportunidade IA
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '600' }}>{formatCurrency(client.realizedRevenue)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: '600', color: '#3498db' }}>{formatPercent(client.realizedMarginPct)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <input
                                                                type="text"
                                                                inputMode="numeric"
                                                                value={formatBRLInput(simulation.revenue)}
                                                                onChange={(e) => handleInputChange(client.id, 'revenue', e.target.value)}
                                                                style={{
                                                                    width: '180px', textAlign: 'right', padding: '8px 12px',
                                                                    background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                                    borderRadius: '6px', color: '#f39c12', fontWeight: '700', fontSize: '14px'
                                                                }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                                <input
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
                                                                        borderRadius: '6px', color: '#2ecc71', fontWeight: '700', fontSize: '14px'
                                                                    }}
                                                                />
                                                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>%</span>
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <div style={{
                                                                fontSize: '15px',
                                                                fontWeight: '800',
                                                                color: (simulation.revenue - client.basisRevenue) >= 0 ? '#2ecc71' : '#e74c3c'
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
