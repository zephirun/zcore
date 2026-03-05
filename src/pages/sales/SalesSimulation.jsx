import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext.jsx';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, DollarSign, TrendingUp, Users, AlertCircle, Search, Sliders, RotateCcw, Target, Play, Save, CheckCircle, Trash2, Lock, Unlock } from 'lucide-react';
import * as api from '../../services/api';
import Filters from '../../components/Filters';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import Skeleton from '../../components/ui/Skeleton';

const SalesSimulation = () => {
    const { salesData, globalFilters, username, activeUnit, isSalesDataLoading, salesDataError } = useData();
    const [simulatedValues, setSimulatedValues] = useState({});
    const [manualMonthlyGoal, setManualMonthlyGoal] = useState(0);
    const [manualMarginGoal, setManualMarginGoal] = useState(0);
    const [growthScenario, setGrowthScenario] = useState(0);
    const [marginScenario, setMarginScenario] = useState(0);
    const [simulationName, setSimulationName] = useState('');
    const [savedSimulations, setSavedSimulations] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const toast = useToast();
    const [showAIModal, setShowAIModal] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle');
    const [aiFilter, setAiFilter] = useState('all');
    const [isLocked, setIsLocked] = useState(false);
    const [globalLockedBy, setGlobalLockedBy] = useState(null);
    const [repLockOverrides, setRepLockOverrides] = useState({});

    // Load available simulations for this vendor/representative
    const loadVersionsList = async () => {
        const activeTarget = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos'
            ? globalFilters.representative
            : (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null);

        if (activeTarget) {
            const list = await api.fetchSimulations(activeTarget, activeUnit);
            setSavedSimulations(list);
        } else {
            setSavedSimulations([]);
        }
    };

    // Load saved simulation when vendor or rep is selected
    useEffect(() => {
        const loadInitialSimulation = async () => {
            const activeTarget = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos'
                ? globalFilters.representative
                : (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null);

            if (activeTarget) {
                const list = await api.fetchSimulations(activeTarget, activeUnit);
                setSavedSimulations(list);

                // --- Fetch Representative Locks ---
                let localRepLocks = {};
                if (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' && (!globalFilters.representative || globalFilters.representative === 'Selecionar Todos')) {
                    const reps = [...new Set(salesData.filter(d => d.client?.vendor === activeTarget && d.client?.representative).map(d => d.client.representative))];
                    if (reps.length > 0) {
                        const repSimsList = await api.fetchSimulationsByVendors(reps, activeUnit);
                        const latestRepSims = {};
                        repSimsList.forEach(sim => {
                            if (!latestRepSims[sim.vendor]) latestRepSims[sim.vendor] = sim;
                        });

                        Object.values(latestRepSims).forEach(sim => {
                            if (sim.simulated_values) {
                                const repIsGloballyLocked = sim.simulated_values.locked;
                                const repGlobalLocker = sim.simulated_values.globalLockedBy || sim.username;

                                Object.entries(sim.simulated_values).forEach(([clientId, clientData]) => {
                                    if (clientId === 'globalGoal' || clientId === 'marginGoal' || clientId === 'locked' || clientId === 'globalLockedBy') return;

                                    if (clientData.isLocked || repIsGloballyLocked) {
                                        localRepLocks[clientId] = {
                                            ...clientData,
                                            isLocked: true,
                                            lockedBy: clientData.lockedBy || repGlobalLocker,
                                            isRepLock: true
                                        };
                                    }
                                });
                            }
                        });
                    }
                }
                setRepLockOverrides(localRepLocks);
                // ---------------------------------

                // If there's a default/latest one, or just clear
                if (list.length > 0) {
                    const latest = list[0];
                    const baseVals = latest.simulated_values || {};
                    const mergedVals = { ...baseVals, ...localRepLocks };

                    setSimulatedValues(mergedVals);
                    setGrowthScenario(latest.growth_scenario || 0);
                    setMarginScenario(latest.margin_scenario || 0);
                    setSimulationName(latest.version_name || '');

                    if (latest.simulated_values?.globalGoal) {
                        setManualMonthlyGoal(latest.simulated_values.globalGoal);
                    }
                    if (latest.simulated_values?.marginGoal !== undefined) {
                        setManualMarginGoal(latest.simulated_values.marginGoal);
                    }
                    setIsLocked(latest.simulated_values?.locked || false);
                    setGlobalLockedBy(latest.simulated_values?.globalLockedBy || null);
                } else {
                    setSimulatedValues({ ...localRepLocks });
                    setGrowthScenario(0);
                    setMarginScenario(0);
                    setSimulationName('');
                    setManualMonthlyGoal(0);
                    setManualMarginGoal(0);
                    setIsLocked(false);
                }

                // Load Rep/Vendor Goal from records
                const repDb = await api.fetchRepRecords();
                const record = repDb.find(r => r.rep_name === activeTarget);
                if (record && record.monthly_goal) {
                    setManualMonthlyGoal(record.monthly_goal);
                } else {
                    setManualMonthlyGoal(0);
                }
                if (record && record.margin_goal !== undefined) {
                    setManualMarginGoal(record.margin_goal);
                } else {
                    setManualMarginGoal(0);
                }
            }
        };

        if (!isSalesDataLoading) {
            loadInitialSimulation();
        }
    }, [globalFilters.vendor, globalFilters.representative, activeUnit, isSalesDataLoading, salesData]);

    const loadSpecificVersion = (version) => {
        const baseVals = version.simulated_values || {};
        const mergedVals = { ...baseVals, ...repLockOverrides };

        setSimulatedValues(mergedVals);
        setGrowthScenario(version.growth_scenario || 0);
        setMarginScenario(version.margin_scenario || 0);
        setSimulationName(version.version_name || '');
        if (version.simulated_values?.globalGoal) {
            setManualMonthlyGoal(version.simulated_values.globalGoal);
        }
        if (version.simulated_values?.marginGoal !== undefined) {
            setManualMarginGoal(version.simulated_values.marginGoal);
        }
        setIsLocked(version.simulated_values?.locked || false);
        setGlobalLockedBy(version.simulated_values?.globalLockedBy || null);
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
            const vendorMatch = !globalFilters.vendor || globalFilters.vendor === 'Selecionar Todos' || (item.client?.vendor || '').toLowerCase().trim() === globalFilters.vendor.toLowerCase().trim();
            const repMatch = !globalFilters.representative || globalFilters.representative === 'Selecionar Todos' || (item.client?.representative || '').toLowerCase().trim() === globalFilters.representative.toLowerCase().trim();
            const clientMatch = !globalFilters.client || globalFilters.client === 'Selecionar Todos' ||
                (item.client ? (`${item.client.name} - ${item.client.id}`.toLowerCase().trim() === globalFilters.client.toLowerCase().trim() || item.client.name.toLowerCase().trim() === globalFilters.client.toLowerCase().trim()) : false);
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
                    quarterRevenue: 0,
                    quarterMargin: 0,
                    m2m3Revenue: 0,
                    m2m3Margin: 0,
                    basisRevenue: 0,
                    basisMargin: 0
                };
            }

            const availableMonths = item.months || [];

            // Target the last available month (M1) as the current month
            const m1 = availableMonths[0] || { amount: 0, margin_percent: 0 };
            const m2 = availableMonths[1] || { amount: 0, margin_percent: 0 };
            const m3 = availableMonths[2] || { amount: 0, margin_percent: 0 };

            const revenueM1 = m1.amount || 0;
            const marginM1 = (m1.amount * (m1.margin_percent / 100)) || 0;
            const deadline = item.total?.deadline || 0;

            const revenueM2 = m2.amount || 0;
            const marginM2 = (m2.amount * (m2.margin_percent / 100)) || 0;

            const revenueM3 = m3.amount || 0;
            const marginM3 = (m3.amount * (m3.margin_percent / 100)) || 0;

            clientMap[clientId].realizedRevenue += revenueM1;
            clientMap[clientId].realizedMargin += marginM1;

            clientMap[clientId].quarterRevenue += (revenueM1 + revenueM2 + revenueM3);
            clientMap[clientId].quarterMargin += (marginM1 + marginM2 + marginM3);

            // Weighted sum for deadline calculation
            clientMap[clientId].weightedDeadlineSum = (clientMap[clientId].weightedDeadlineSum || 0) + (revenueM1 * deadline);
        });

        const list = Object.values(clientMap).map(c => {
            const basisRevenue = c.quarterRevenue / 3; // Basis is 3-month average
            const avgMarginRatio = c.quarterRevenue ? (c.quarterMargin / c.quarterRevenue) : 0;
            const avgDeadline = c.realizedRevenue ? (c.weightedDeadlineSum / c.realizedRevenue) : 0;
            const basisMargin = Math.round(avgMarginRatio * 10000) / 100;

            return {
                ...c,
                basisRevenue,
                basisMargin,
                avgDeadline,
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
        const totalRealizedQuarterRevenue = clients.reduce((acc, curr) => acc + curr.quarterRevenue, 0);
        const totalRealizedQuarterMargin = clients.reduce((acc, curr) => acc + curr.quarterMargin, 0);

        const totalRealizedRevenue = clients.reduce((acc, curr) => acc + curr.basisRevenue, 0);
        const totalRealizedMargin = clients.reduce((acc, curr) => acc + (curr.basisRevenue * (curr.realizedMarginPct / 100)), 0);
        const globalBasisMarginPct = totalRealizedRevenue ? (totalRealizedMargin / totalRealizedRevenue) * 100 : 0;

        let marginDeltaPreview = marginScenario; // Default to point slider
        if (manualMarginGoal > 0) {
            marginDeltaPreview = manualMarginGoal - globalBasisMarginPct;
        }

        const clientData = clients.map(client => {
            let totalBasisRevenue = client.basisRevenue;

            // Check for individual overrides in simulatedValues
            const hasOverride = !!simulatedValues[client.id];
            let simRev, simMarg;

            if (hasOverride) {
                simRev = parseFloat(simulatedValues[client.id].revenue) || 0;
                simMarg = parseFloat(simulatedValues[client.id].margin) || 0;
            } else {
                // Apply global scenarios to basis for real-time totals
                simRev = client.basisRevenue * (1 + (growthScenario / 100));
                simMarg = client.basisMargin + marginDeltaPreview;
            }
            return {
                ...client,
                projectedRevenue: simRev,
                projectedMarginPct: simMarg
            };
        });

        // Compute totals globally
        const realizedRevenue = totalRealizedRevenue;
        const realizedMargin = totalRealizedMargin;

        // Projected defaults to goal if input, otherwise sum of clients
        const clientsProjectedRevenue = clientData.reduce((acc, curr) => acc + curr.projectedRevenue, 0);
        const projectedRevenue = manualMonthlyGoal > 0 ? manualMonthlyGoal : clientsProjectedRevenue;

        // Spread margin goal: calculate absolute margin from all clients' projected margins, then find the weighted average again.
        // If manual margin goal is set, it overrides the global weighted total
        let projectedMargin;
        if (manualMarginGoal > 0) {
            projectedMargin = projectedRevenue * (manualMarginGoal / 100);
        } else {
            projectedMargin = clientData.reduce((acc, curr) => {
                const weight = clientsProjectedRevenue > 0 ? (curr.projectedRevenue / clientsProjectedRevenue) : 0;
                const adjustedClientRev = manualMonthlyGoal > 0 ? (manualMonthlyGoal * weight) : curr.projectedRevenue;
                return acc + (adjustedClientRev * (curr.projectedMarginPct / 100));
            }, 0);
        }

        const totalBasisRevenueAll = clientData.reduce((acc, curr) => acc + curr.basisRevenue, 0);

        return {
            quarterRevenue: totalRealizedQuarterRevenue,
            quarterMarginPct: totalRealizedQuarterRevenue ? (totalRealizedQuarterMargin / totalRealizedQuarterRevenue) * 100 : 0,
            realizedRevenue: realizedRevenue,
            realizedMargin: realizedMargin,
            realizedMarginPct: realizedRevenue ? (realizedMargin / realizedRevenue) * 100 : 0,
            projectedRevenue: projectedRevenue,
            projectedMargin: projectedMargin,
            projectedMarginPct: projectedRevenue ? (projectedMargin / projectedRevenue) * 100 : 0,
            diffRevenue: totalBasisRevenueAll ? ((projectedRevenue / totalBasisRevenueAll) - 1) * 100 : 0
        };
    }, [clients, simulatedValues, growthScenario, marginScenario, manualMonthlyGoal, manualMarginGoal]);

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

        // Prevent modification if locked by someone else
        const currentSim = simulatedValues[clientId];
        if (currentSim?.isLocked && currentSim?.lockedBy !== username && isLocked) {
            return; // Or show a toast
        }

        if (field === 'revenue') {
            newValue = parseBRLInput(value);
        } else if (field === 'margin') {
            // Keep as string during typing to avoid coordinate issues and trailing zero deletions
            newValue = value;
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

    const toggleClientLock = (clientId) => {
        if (!isOwnerOrRep) return; // Only owner/rep can toggle locks

        setSimulatedValues(prev => {
            const client = clients.find(c => c.id === clientId);
            const basisRevenue = client ? client.basisRevenue : 0;
            const basisMargin = client ? client.basisMargin : 0;

            const current = prev[clientId] || { revenue: basisRevenue, margin: basisMargin };
            const isCurrentlyLocked = current.isLocked;

            return {
                ...prev,
                [clientId]: {
                    ...current,
                    isLocked: !isCurrentlyLocked,
                    lockedBy: !isCurrentlyLocked ? username : null
                }
            };
        });
    };

    const handleGlobalLockToggle = () => {
        if (!isOwnerOrRep) return;

        if (isLocked && globalLockedBy && globalLockedBy !== username) {
            toast.error("Esta simulação foi travada por outro usuário.");
            return;
        }

        const willBeLocked = !isLocked;
        setIsLocked(willBeLocked);
        setGlobalLockedBy(willBeLocked ? username : null);

        setSimulatedValues(prev => {
            const nextVals = { ...prev };
            // Apply the global lock state to all currently filtered clients
            clients.forEach(client => {
                const currentSim = nextVals[client.id] || {
                    revenue: client.basisRevenue,
                    margin: client.basisMargin
                };

                nextVals[client.id] = {
                    ...currentSim,
                    isLocked: willBeLocked,
                    lockedBy: willBeLocked ? username : null
                };
            });
            return nextVals;
        });
    };

    const applyScenarios = () => {
        setIsSimulating(true);
        setTimeout(() => {
            const newSimulatedValues = {};

            // Calc total base revenue first to get weights
            const totalBaseRevenue = clients.reduce((acc, c) => acc + c.basisRevenue, 0);
            const totalBaseMargin = clients.reduce((acc, curr) => acc + (curr.basisRevenue * (curr.realizedMarginPct / 100)), 0);
            const globalBaseMarginPct = totalBaseRevenue ? (totalBaseMargin / totalBaseRevenue) * 100 : 0;

            let marginDelta = marginScenario;
            if (manualMarginGoal > 0) {
                marginDelta = manualMarginGoal - globalBaseMarginPct;
            }

            clients.forEach(client => {
                const currentSim = simulatedValues[client.id] || {};

                // If the client is locked, preserve their current values
                if (currentSim.isLocked) {
                    newSimulatedValues[client.id] = { ...currentSim };
                    return;
                }

                let simRev = client.basisRevenue * (1 + growthScenario / 100);

                // If a manual revenue goal is set, distribute it proportionally based on basis revenue weight
                // Note: In a fully advanced system, we'd subtract locked revenues from the total goal first,
                // but for proportional distribution, applying to unlocked is the standard MVP approach.
                if (manualMonthlyGoal > 0 && totalBaseRevenue > 0) {
                    const weight = client.basisRevenue / totalBaseRevenue;
                    simRev = manualMonthlyGoal * weight;
                }

                let simMarg = client.basisMargin + marginDelta;

                newSimulatedValues[client.id] = {
                    revenue: simRev,
                    margin: parseFloat(Math.max(0, simMarg).toFixed(2)),
                    isLocked: false,
                    lockedBy: null
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
        setShowAIModal(false);
    };

    const handleSave = async () => {
        setSaveStatus('saving');

        const activeTarget = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos'
            ? globalFilters.representative
            : (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : 'Global');

        const simulationData = {
            username,
            vendor: activeTarget,
            unit: activeUnit,
            versionName: simulationName || 'Padrão',
            simulatedValues: {
                ...simulatedValues,
                globalGoal: manualMonthlyGoal,
                marginGoal: manualMarginGoal,
                locked: isLocked,
                globalLockedBy: isLocked ? (globalLockedBy || username) : null
            },
            growthScenario,
            marginScenario
        };
        const result = await api.saveSimulation(simulationData);

        // Also save the Goal to the Rep Records
        if (activeTarget !== 'Global' && (manualMonthlyGoal > 0 || manualMarginGoal > 0)) {
            await api.saveRepRecord({
                repName: activeTarget,
                monthlyGoal: manualMonthlyGoal,
                marginGoal: manualMarginGoal,
                observations: ''
            });
        }

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

    // Check if the current user is the owner (can lock/unlock) OR if it is locked and they are forced into read-only
    const activeTargetDisplay = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos'
        ? globalFilters.representative
        : (globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null);

    const isOwnerOrRep = !!activeTargetDisplay;
    const isReadOnly = isLocked && globalLockedBy && globalLockedBy !== username;

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
                            gridTemplateColumns: 'repeat(3, 1fr)',
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
                                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Faturamento Realizado (Trimestre)</span>
                                    <DollarSign size={14} color="var(--color-primary)" />
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-main)' }}>{formatCurrency(totals.quarterRevenue)}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)', fontWeight: 'var(--font-semibold)', marginTop: 'var(--space-1)' }}>Margem: {formatPercent(totals.quarterMarginPct || 0)}</div>
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
                        </div>

                        {/* Global Simulator Panel & Side Actions */}
                        <div style={{ padding: '0 40px 24px 40px', display: 'grid', gridTemplateColumns: '800px 320px', gap: 'var(--space-4)', justifyContent: 'center' }}>
                            {/* Left: Settings */}
                            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)' }}>
                                                <Sliders size={18} />
                                            </div>
                                            <div>
                                                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>Simulador Global</h3>
                                                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>Aplique cenários em todos os clientes filtrados</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
                                        {/* Sliders Row */}
                                        <div style={{ background: 'var(--bg-input)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ marginBottom: 'var(--space-1)' }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crescimento (%)</label>
                                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: growthScenario >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{growthScenario >= 0 ? '+' : ''}{growthScenario}%</span>
                                                </div>
                                                <Input
                                                    type="range" min="-30" max="100" value={growthScenario}
                                                    onChange={(e) => setGrowthScenario(parseInt(e.target.value))}
                                                    style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ background: 'var(--bg-input)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ marginBottom: 'var(--space-1)' }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
                                                    <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ajuste Margem (pontos %)</label>
                                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', color: marginScenario >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>{marginScenario >= 0 ? '+' : ''}{marginScenario}%</span>
                                                </div>
                                                <Input
                                                    type="range" min="-10" max="15" value={marginScenario}
                                                    onChange={(e) => setMarginScenario(parseInt(e.target.value))}
                                                    style={{ width: '100%', height: '4px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Metas Row */}
                                        <div style={{ background: 'var(--bg-input)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meta do Mês</label>
                                                </div>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={formatBRLInput(manualMonthlyGoal)}
                                                    onChange={(e) => setManualMonthlyGoal(parseBRLInput(e.target.value))}
                                                    disabled={isReadOnly}
                                                    placeholder="R$ 0,00"
                                                    style={{
                                                        width: '100%', padding: '8px 10px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '14px', fontWeight: 'var(--font-bold)', outline: 'none',
                                                        opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ background: 'var(--bg-input)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-sm)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <label style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meta Margem %</label>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={manualMarginGoal !== undefined && manualMarginGoal !== null
                                                            ? (typeof manualMarginGoal === 'string'
                                                                ? manualMarginGoal.replace('.', ',')
                                                                : manualMarginGoal.toString().replace('.', ','))
                                                            : '0,00'
                                                        }
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace('.', ',');
                                                            if (/^-?\d*,?\d*$/.test(val)) {
                                                                setManualMarginGoal(val);
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = e.target.value.replace(',', '.');
                                                            const parsed = parseFloat(val);
                                                            if (!isNaN(parsed)) {
                                                                setManualMarginGoal(parsed.toFixed(2));
                                                            }
                                                        }}
                                                        disabled={isReadOnly}
                                                        placeholder="0,00"
                                                        style={{
                                                            width: '100%', padding: '8px 10px', background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '14px', fontWeight: 'var(--font-bold)', outline: 'none',
                                                            opacity: isReadOnly ? 0.7 : 1, cursor: isReadOnly ? 'not-allowed' : 'text', textAlign: 'right'
                                                        }}
                                                    />
                                                    <span style={{ fontSize: '14px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', paddingRight: '12px' }}>%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                    <Button onClick={clearScenarios} disabled={isSimulating || isReadOnly} style={{ padding: '10px 16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 'var(--font-bold)', cursor: isReadOnly ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', opacity: isReadOnly ? 0.5 : 1 }}>
                                        <RotateCcw size={16} /> Resetar
                                    </Button>
                                    <Button onClick={applyScenarios} disabled={isSimulating || isReadOnly} style={{ padding: '10px 24px', background: 'var(--text-main)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--bg-main)', fontSize: '13px', fontWeight: 'var(--font-bold)', cursor: isReadOnly ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', opacity: isReadOnly ? 0.5 : 1 }}>
                                        {isSimulating ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />} Aplicar Cenários
                                    </Button>
                                </div>
                            </div>

                            {/* Right: Saving */}
                            <div style={{
                                background: 'var(--bg-card)',
                                padding: 'var(--space-5)',
                                borderRadius: 'var(--radius-sm)',
                                boxShadow: 'var(--shadow-sm)',
                                border: '1px solid var(--border-color)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 'var(--space-5)',
                                justifyContent: 'center'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: '-10px' }}>
                                    <Save size={16} color="var(--text-muted)" />
                                    <h4 style={{ margin: 0, fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Salvar Simulação</h4>
                                </div>
                                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>


                                {/* Save Section */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                                    <Input
                                        type="text"
                                        placeholder="Nome da Versão"
                                        value={simulationName}
                                        onChange={(e) => setSimulationName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
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
                                            disabled={saveStatus === 'saving' || isReadOnly}
                                            style={{
                                                flex: 2,
                                                padding: '10px',
                                                background: saveStatus === 'success' ? 'var(--color-success)' : (saveStatus === 'error' ? 'var(--color-error)' : 'var(--text-main)'),
                                                color: 'var(--bg-main)',
                                                border: 'none',
                                                borderRadius: 'var(--radius-sm)',
                                                fontWeight: 'var(--font-bold)',
                                                fontSize: '13px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 'var(--space-4)',
                                                cursor: isReadOnly ? 'not-allowed' : 'pointer',
                                                transition: 'background 0.3s',
                                                opacity: isReadOnly ? 0.5 : 1
                                            }}
                                        >
                                            {saveStatus === 'saving' ? <RefreshCw size={16} className="animate-spin" /> : saveStatus === 'success' ? <CheckCircle size={16} /> : <Save size={16} />}
                                            {saveStatus === 'saving' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : 'Salvar'}
                                        </Button>

                                        {isOwnerOrRep && (
                                            <Button
                                                onClick={handleGlobalLockToggle}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    background: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-input)',
                                                    color: isLocked ? 'var(--color-error)' : 'var(--text-muted)',
                                                    border: `1px solid ${isLocked ? 'var(--color-error)' : 'var(--border-color)'}`,
                                                    borderRadius: 'var(--radius-sm)',
                                                    fontWeight: 'var(--font-bold)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '8px',
                                                    cursor: (isLocked && globalLockedBy && globalLockedBy !== username) ? 'not-allowed' : 'pointer',
                                                    transition: 'all 0.2s',
                                                    opacity: (isLocked && globalLockedBy && globalLockedBy !== username) ? 0.6 : 1
                                                }}
                                                disabled={isLocked && globalLockedBy && globalLockedBy !== username}
                                                title={isLocked ? `Travado por: ${globalLockedBy || 'Desconhecido'}` : "Travar Simulação"}
                                            >
                                                {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                                            </Button>
                                        )}

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

                                    {isReadOnly && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-error)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px 12px', borderRadius: '4px', marginTop: '4px' }}>
                                            <Lock size={14} />
                                            Esta simulação foi travada pelo Representante (Apenas Leitura).
                                        </div>
                                    )}
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
                                        <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '800' }}>Projeção de Clientes (Base: Média 3 meses)</h3>
                                    </div>
                                </div>

                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(0,0,0,0.1)' }}>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', textAlign: 'right' }}>Média Fat. (3 meses)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-info)', textTransform: 'uppercase', textAlign: 'right' }}>Média Margem (3 meses)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-error)', textTransform: 'uppercase', textAlign: 'right' }}>Prazo Médio</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-warning)', textTransform: 'uppercase', textAlign: 'right' }}>{projectionMonthName} (Projetado)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-success)', textTransform: 'uppercase', textAlign: 'right' }}>Margem Proj. (%)</th>
                                                <th style={{ padding: '15px 20px', fontSize: 'var(--text-xs)', fontWeight: '800', color: 'var(--color-primary)', textTransform: 'uppercase', textAlign: 'right' }}>Diferença vs Base</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {clients.map((client) => {
                                                const simulation = simulatedValues[client.id] || {
                                                    revenue: client.basisRevenue,
                                                    margin: client.basisMargin
                                                };
                                                const projectedRolling = client.m2m3Revenue + (simulation.revenue || 0);

                                                const isVendorView = globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' && (!globalFilters.representative || globalFilters.representative === 'Selecionar Todos');
                                                const isClientLocked = simulation.isLocked;
                                                const isClientReadOnly = isReadOnly || (isClientLocked && (simulation.lockedBy !== username || (isVendorView && simulation.isRepLock)));

                                                return (
                                                    <tr key={client.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', background: isClientLocked ? 'rgba(231, 76, 60, 0.02)' : 'transparent' }}>
                                                        <td style={{ padding: '15px 20px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                                <div style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{client.name}</div>
                                                                {isClientLocked && (
                                                                    <div title={`Travado por: ${simulation.lockedBy || 'Desconhecido'}`} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-error)' }}>
                                                                        <Lock size={12} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                                                ID: {client.id}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>{formatCurrency(client.basisRevenue)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'var(--font-semibold)', color: '#3498db' }}>{formatPercent(client.realizedMarginPct)}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right', fontWeight: 'var(--font-semibold)', color: 'var(--color-error)' }}>{client.avgDeadline ? `${client.avgDeadline.toFixed(0)} dias` : '-'}</td>
                                                        <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                                                                {isOwnerOrRep && (!isClientLocked || (simulation.lockedBy === username && !(isVendorView && simulation.isRepLock))) && (
                                                                    <button
                                                                        onClick={() => toggleClientLock(client.id)}
                                                                        title={isClientLocked ? "Destravar Cliente" : "Travar Cliente"}
                                                                        style={{
                                                                            background: 'none',
                                                                            border: 'none',
                                                                            cursor: 'pointer',
                                                                            color: isClientLocked ? 'var(--color-error)' : 'var(--text-muted)',
                                                                            padding: '4px',
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            transition: 'color 0.2s'
                                                                        }}
                                                                    >
                                                                        {isClientLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                                                    </button>
                                                                )}
                                                                <Input
                                                                    type="text"
                                                                    inputMode="numeric"
                                                                    value={formatBRLInput(simulation.revenue)}
                                                                    onChange={(e) => handleInputChange(client.id, 'revenue', e.target.value)}
                                                                    disabled={isClientReadOnly}
                                                                    style={{
                                                                        width: '180px', textAlign: 'right', padding: '8px 12px',
                                                                        background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                                        borderRadius: 'var(--radius-sm)', color: 'var(--color-warning)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)',
                                                                        opacity: isClientReadOnly ? 0.7 : 1, cursor: isClientReadOnly ? 'not-allowed' : 'text'
                                                                    }}
                                                                />
                                                            </div>
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
                                                                    disabled={isClientReadOnly}
                                                                    style={{
                                                                        width: '80px', textAlign: 'right', padding: '8px 12px',
                                                                        background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                                        borderRadius: 'var(--radius-sm)', color: 'var(--color-success)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-base)',
                                                                        opacity: isClientReadOnly ? 0.7 : 1, cursor: isClientReadOnly ? 'not-allowed' : 'text'
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
