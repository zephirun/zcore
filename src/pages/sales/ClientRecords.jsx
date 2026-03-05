import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import DataGrid from '@/components/ui/DataGrid';
import EmptyState from '@/components/ui/EmptyState';
import React, { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useLocation } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import * as api from '../../services/api';


const clientGroupSchema = z.object({
    name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres')
});

const clientDataSchema = z.object({
    economicGroupId: z.string().optional(),
    paymentMethod: z.string().optional(),
    deadlines: z.string().optional(),
    observations: z.string().optional()
});

const ClientRecords = () => {
    const { salesData, clientRecords, saveClientRecord, userRole, allowedVendor, theme, activeUnit } = useData();
    const location = useLocation();

    // View State: 'dashboard' (default), 'search', 'detail'
    const [viewMode, setViewMode] = useState('dashboard');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', '#d32f2f', '#fbc02d', '#2e7d32'

    // Economic Groups State
    const [economicGroups, setEconomicGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState('all');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const {
        register: registerClient,
        handleSubmit: handleClientSubmit,
        reset: resetClient,
        formState: { errors: clientErrors }
    } = useForm({
        resolver: zodResolver(clientDataSchema),
        mode: 'onTouched',
        defaultValues: {
            economicGroupId: '',
            paymentMethod: '',
            deadlines: '',
            observations: ''
        }
    });

    const {
        register: registerGroup,
        handleSubmit: handleGroupSubmit,
        reset: resetGroup,
        formState: { errors: groupErrors }
    } = useForm({
        resolver: zodResolver(clientGroupSchema),
        mode: 'onTouched',
        defaultValues: {
            name: ''
        }
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load Economic Groups
    useEffect(() => {
        loadGroups();
    }, []);

    const loadGroups = async () => {
        const groups = await api.fetchEconomicGroups(activeUnit);
        setEconomicGroups(groups);
    };

    const onGroupSubmit = async (data) => {
        await api.saveEconomicGroup({ name: data.name, unit: activeUnit });
        resetGroup();
        setIsGroupModalOpen(false);
        loadGroups();
    };

    const handleAssignGroup = async (clientId, groupId) => {
        await api.updateClientGroup(clientId, groupId);
        // Ideally trigger a refresh of clientRecords here or update local state
        // For now relying on standard refresh
    };

    // Handle URL parameters for direct linking
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get('id');
        if (id) {
            setSelectedClientId(id);
            setViewMode('detail');
        }
    }, [location]);

    // Handle Search to Switch View
    useEffect(() => {
        if (searchTerm.length > 0) {
            setViewMode('search');
        } else if (!selectedClientId) {
            setViewMode('dashboard');
        }
    }, [searchTerm, selectedClientId]);

    // Extract unique clients and their detailed stats
    const clients = useMemo(() => {
        if (!salesData || !Array.isArray(salesData)) return [];

        const clientMap = new Map();

        // Helper to track vendor stats per client
        const vendorStats = {}; // { clientId: { vendorName: { count: 0, revenue: 0 } } }

        salesData.forEach(item => {
            const clientId = item.client?.id;
            if (!clientId) return;

            // Filter logic
            if (userRole !== 'admin' && allowedVendor && !(item.client?.vendor || '').toLowerCase().trim().includes(allowedVendor.toLowerCase().trim())) {
                return;
            }

            const revenue = item.total?.amount || 0;
            const vendor = item.client?.vendor || 'N/A';
            const margin = item.total?.margin_percent || 0;
            const deadline = item.total?.deadline || 0;

            // Track Vendor Stats
            if (!vendorStats[clientId]) vendorStats[clientId] = {};
            if (!vendorStats[clientId][vendor]) vendorStats[clientId][vendor] = { count: 0, revenue: 0 };

            vendorStats[clientId][vendor].count += 1;
            vendorStats[clientId][vendor].revenue += revenue;

            if (!clientMap.has(clientId)) {
                // Initialize Client Entry
                const manualRecord = clientRecords?.find(r => r.client_id === clientId);

                // Detailed monthly metrics (Initialize with 0s or empty structure to be filled)
                // Actually, since we might have multiple rows, we need to sum monthly data.
                // Assuming standard 3-month structure.

                clientMap.set(clientId, {
                    id: clientId,
                    name: item.client?.name || 'N/A',
                    // Vendor determined later
                    totalRevenue: 0,
                    weightedMarginSum: 0,
                    weightedDeadlineSum: 0,
                    manualDeadline: manualRecord?.payment_method?.toUpperCase().includes('CARTEIRA = PIX') ? 30 : null,
                    monthlySums: [0, 0, 0], // assuming 3 months index 0=current, 1=prev, 2=prev-prev
                    economicGroupId: manualRecord?.economic_group_id
                });
            }

            // Aggregate Data
            const c = clientMap.get(clientId);
            c.totalRevenue += revenue;
            c.weightedMarginSum += (margin * revenue);
            c.weightedDeadlineSum += (deadline * revenue);

            if (item.months && Array.isArray(item.months)) {
                item.months.forEach((m, idx) => {
                    if (idx < 3) c.monthlySums[idx] += (m.amount || 0);
                });
            }
        });

        // Final Processing
        const result = Array.from(clientMap.values()).map(c => {
            // Determine Frequency/Principal Vendor
            const stats = vendorStats[c.id];
            let bestVendor = 'N/A';
            let maxRev = -1;

            if (stats) {
                Object.entries(stats).forEach(([v, s]) => {
                    // Logic: Highest Revenue wins. 
                    if (s.revenue > maxRev) {
                        maxRev = s.revenue;
                        bestVendor = v;
                    }
                    // Tie breaker: Count?
                    else if (s.revenue === maxRev && s.count > stats[bestVendor]?.count) {
                        bestVendor = v;
                    }
                });
            }

            // Calc Averages
            const avgMargin = c.totalRevenue > 0 ? c.weightedMarginSum / c.totalRevenue : 0;
            const calcDeadline = c.totalRevenue > 0 ? c.weightedDeadlineSum / c.totalRevenue : 0;
            const finalAvgDeadline = c.manualDeadline !== null ? c.manualDeadline : calcDeadline;

            // Monthly Data for charts/insights
            const monthlyData = c.monthlySums.map((amt, idx) => ({
                index: idx,
                amount: amt,
                margin: avgMargin, // Simplified
                deadline: finalAvgDeadline
            }));

            // Insights Logic
            const m1 = monthlyData[0]?.amount || 0;
            const m3 = monthlyData[2]?.amount || 0;

            const isDeclineAggressive = m3 < m1 * 0.7 && m1 > 0;
            const isDeclineModerate = m3 < m1 * 0.9 && m1 > 0;
            const isTrendStrong = m3 > m1 * 1.15;

            const isMarginCritical = avgMargin < 0.06;
            const isMarginLow = avgMargin < 0.11;
            const isMarginHigh = avgMargin > 0.18;

            const isTermLongHard = finalAvgDeadline > 65;
            const isTermLongSoft = finalAvgDeadline > 45;
            const isTermShort = finalAvgDeadline < 25 && finalAvgDeadline > 0;

            let healthColor = '#fbc02d';
            const isCritical = isDeclineAggressive || isMarginCritical || isTermLongHard;
            const isGood = (m3 >= m1 * 1.0 && m1 > 0) && (avgMargin >= 0.13) && (finalAvgDeadline <= 35);
            if (isCritical) healthColor = '#d32f2f';
            else if (isGood) healthColor = '#2e7d32';

            let insights = [];
            if (isDeclineAggressive) insights.push({ type: 'risk', label: 'Queda Grave', text: 'Faturamento despencou >30%.' });
            else if (isDeclineModerate) insights.push({ type: 'risk', label: 'Queda Leve', text: 'Tendência de queda.' });
            else if (isTrendStrong) insights.push({ type: 'potential', label: 'Crescimento', text: 'Volume em expansão.' });

            if (isMarginCritical) insights.push({ type: 'risk', label: 'Margem Crítica', text: 'Rentabilidade mínima.' });
            else if (isMarginHigh) insights.push({ type: 'potential', label: 'Alta Margem', text: 'Excelente rentabilidade.' });

            if (isTermLongHard) insights.push({ type: 'risk', label: 'Prazo Perigoso', text: 'Prazo >65 dias.' });

            if (insights.length === 0) insights.push({ type: 'neutral', label: 'Estável', text: 'Dentro do esperado.' });

            return {
                id: c.id,
                name: c.name,
                vendor: bestVendor,
                totalRevenue: c.totalRevenue,
                avgMargin,
                avgDeadline: finalAvgDeadline,
                monthlyData,
                insights,
                healthColor,
                economicGroupId: c.economicGroupId
            };
        });

        return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [salesData, userRole, allowedVendor, clientRecords]);

    // Filtered list
    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.vendor.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || c.healthColor === statusFilter;
            const matchesGroup = selectedGroupId === 'all' || c.economicGroupId === selectedGroupId;

            return matchesSearch && matchesStatus && matchesGroup;
        });
    }, [clients, searchTerm, statusFilter, selectedGroupId]);

    const columns = useMemo(() => [
        {
            key: 'name',
            label: 'Cliente / ID',
            sortable: true,
            width: '250px',
            render: (row) => (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                    <div style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', whiteSpace: 'normal' }}>{row.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ID: {row.id}</div>
                </div>
            )
        },
        { key: 'vendor', label: 'Vendedor Freq.', sortable: true, width: '150px' },
        {
            key: 'totalRevenue',
            label: 'Faturamento (Tri)',
            sortable: true,
            align: 'right',
            width: '180px',
            render: (row) => <div style={{ fontWeight: 'var(--font-semibold)' }}>{formatCurrency(row.totalRevenue)}</div>
        },
        {
            key: 'avgMargin',
            label: 'Margem',
            sortable: true,
            align: 'right',
            width: '120px',
            render: (row) => <div style={{ fontWeight: 'var(--font-semibold)', color: row.avgMargin < 0.1 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatPercent(row.avgMargin)}</div>
        },
        {
            key: 'healthColor',
            label: 'Saúde',
            sortable: false,
            align: 'center',
            width: '100px',
            render: (row) => (
                <div style={{ width: 'var(--space-3)', height: 'var(--space-3)', borderRadius: '50%', backgroundColor: row.healthColor, margin: '0 auto', boxShadow: `0 0 8px ${row.healthColor}` }} />
            )
        },
        {
            key: 'action',
            label: 'Ação',
            sortable: false,
            align: 'center',
            width: '120px',
            render: () => <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>VER FICHA</Button>
        }
    ], []);

    const displayClients = viewMode === 'dashboard' ? filteredClients.slice(0, 50) : filteredClients;


    const selectedClient = useMemo(() =>
        clients.find(c => c.id === selectedClientId),
        [clients, selectedClientId]);

    const currentRecord = useMemo(() =>
        clientRecords.find(r => r.client_id === selectedClientId),
        [clientRecords, selectedClientId]);

    useEffect(() => {
        if (selectedClientId) {
            resetClient({
                paymentMethod: currentRecord?.payment_method || '',
                deadlines: currentRecord?.deadlines || '',
                observations: currentRecord?.observations || '',
                economicGroupId: currentRecord?.economic_group_id || ''
            });
            setMessage({ type: '', text: '' });
        }
    }, [selectedClientId, currentRecord, resetClient]);

    const onClientSubmit = async (data) => {
        if (!selectedClientId) return;
        setSaving(true);
        const result = await saveClientRecord({
            clientId: selectedClientId,
            paymentMethod: data.paymentMethod,
            deadlines: data.deadlines,
            observations: data.observations,
            economicGroupId: data.economicGroupId
        });
        if (result.success) {
            setMessage({ type: 'success', text: 'Ficha atualizada com sucesso!' });
        } else {
            setMessage({ type: 'error', text: 'Erro ao salvar: ' + result.error });
        }
        setSaving(false);
    };

    // Chart Data Preparation
    const chartData = useMemo(() => {
        if (!selectedClient) return [];
        const monthNames = [3, 2, 1].map(m => {
            const d = new Date();
            d.setMonth(d.getMonth() - m);
            return d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
        });

        return selectedClient.monthlyData.map((d, i) => ({
            name: monthNames[i],
            faturamento: d.amount,
            margem: (d.margin * 100).toFixed(1)
        }));
    }, [selectedClient]);

    return (
        <div style={{
            padding: 'var(--space-6)',
            maxWidth: '1600px',
            margin: '0 auto',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* --- TOP BAR (Filters) --- */}
            <div style={{
                marginBottom: 'var(--space-4)',
                backgroundColor: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                padding: 'var(--space-5)',
                borderRadius: 'var(--glass-radius)',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Pesquisar Cliente</div>
                    <Input
                        type="text"
                        placeholder="Nome, ID ou Vendedor..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: 'var(--space-4)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: 'var(--text-base)',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ minWidth: '200px' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Status da Carteira</div>
                    <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                        <StatusFilter color="all" active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} label="Todos" />
                        <StatusFilter color="#2e7d32" active={statusFilter === '#2e7d32'} onClick={() => setStatusFilter('#2e7d32')} label="OK" />
                        <StatusFilter color="#fbc02d" active={statusFilter === '#fbc02d'} onClick={() => setStatusFilter('#fbc02d')} label="Atenção" />
                        <StatusFilter color="#d32f2f" active={statusFilter === '#d32f2f'} onClick={() => setStatusFilter('#d32f2f')} label="Crítico" />
                    </div>
                </div>

                <div style={{ minWidth: '200px' }}>
                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: 'var(--space-4)', textTransform: 'uppercase' }}>Grupo Econômico</div>
                    <Select
                        value={selectedGroupId}
                        onChange={e => setSelectedGroupId(e.target.value)}
                        style={{
                            width: '100%',
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--space-4)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: 'var(--text-base)',
                            outline: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="all">Todos os Grupos</option>
                        {economicGroups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* --- MAIN CONTENT AREA --- */}

            {viewMode === 'detail' && selectedClient ? (
                /* --- DETAIL VIEW --- */
                <div className="fade-in">
                    <Button
                        onClick={() => { setSelectedClientId(null); setViewMode(searchTerm ? 'search' : 'dashboard'); }}
                        style={{
                            marginBottom: 'var(--space-4)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-4)',
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)'
                        }}>
                        ← Voltar para a lista
                    </Button>

                    {/* Quick Stats Header */}
                    <div style={{
                        backgroundColor: 'var(--bg-card)',
                        padding: '30px',
                        borderRadius: 'var(--space-4)',
                        marginBottom: 'var(--space-4)',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-lg)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h1 style={{ margin: 0, fontSize: 'var(--text-4xl)', color: 'var(--text-main)' }}>{selectedClient.name}</h1>
                            <div style={{ marginTop: 'var(--space-2)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--space-4)' }}>
                                <span>ID: {selectedClient.id}</span>
                                <span>Vendedor: {selectedClient.vendor}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--space-5)',
                                backgroundColor: `${selectedClient.healthColor}22`,
                                color: selectedClient.healthColor,
                                fontWeight: 'bold',
                                border: `1px solid ${selectedClient.healthColor}`,
                                display: 'inline-block'
                            }}>
                                Saúde: {selectedClient.healthColor === '#d32f2f' ? 'Crítica' : (selectedClient.healthColor === '#2e7d32' ? 'Excelente' : 'Atenção')}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-4)' }}>
                        {/* Left Column: Data & Analytics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {/* Key Metrics */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                                <MetricCard label="Faturamento (Tri)" value={formatCurrency(selectedClient.totalRevenue)} color="#1565C0" />
                                <MetricCard label="Margem Média" value={formatPercent(selectedClient.avgMargin)} color="#2e7d32" />
                                <MetricCard label="Prazo Médio" value={`${selectedClient.avgDeadline.toFixed(0)} dias`} color="#f57c00" />
                                <MetricCard label="Ticket Mensal" value={formatCurrency(selectedClient.totalRevenue / 3)} color="#7b1fa2" />
                            </div>

                            {/* Chart */}
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--space-4)', border: '1px solid var(--border-color)', height: '350px' }}>
                                <h3 style={{ marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>Evolução de Vendas</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} tickFormatter={(value) => formatCurrency(value)} />
                                        <Tooltip
                                            cursor={{ fill: 'var(--bg-hover)' }}
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div style={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: 'var(--space-4)',
                                                            padding: '10px',
                                                            color: 'var(--text-main)'
                                                        }}>
                                                            <p style={{ margin: 0, fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>{label}</p>
                                                            <p style={{ margin: 0, color: '#1565C0', fontSize: 'var(--text-base)' }}>
                                                                {`Faturamento: ${formatCurrency(payload[0].value)}`}
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar dataKey="faturamento" fill="#1565C0" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Insights */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                                {selectedClient.insights.map((insight, idx) => (
                                    <div key={idx} style={{
                                        padding: 'var(--space-4)',
                                        borderRadius: 'var(--space-3)',
                                        backgroundColor: insight.type === 'potential' ? 'rgba(46, 125, 50, 0.1)' : (insight.type === 'risk' ? 'rgba(211, 47, 47, 0.1)' : 'var(--bg-input)'),
                                        color: insight.type === 'potential' ? '#2e7d32' : (insight.type === 'risk' ? '#c62828' : 'var(--text-muted)'),
                                        border: `1px solid ${insight.type === 'potential' ? '#a5d6a7' : (insight.type === 'risk' ? '#ef9a9a' : 'var(--border-color)')}`
                                    }}>
                                        <div style={{ fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>{insight.label}</div>
                                        <div style={{ fontSize: '13px' }}>{insight.text}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Management */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {/* Internal Data Form */}
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--space-4)', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>Dados Internos</h3>
                                <form onSubmit={handleClientSubmit(onClientSubmit)} style={{ maxWidth: '800px', margin: '0 auto' }}>

                                    {/* Economic Group Integration */}
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-4)' }}>Grupo Econômico</label>
                                        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                                            <Select
                                                error={clientErrors.economicGroupId?.message}
                                                {...registerClient('economicGroupId')}
                                                style={{
                                                    flex: 1,
                                                }}
                                            >
                                                <option value="">Sem Grupo</option>
                                                {economicGroups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </Select>
                                            <Button
                                                type="button"
                                                onClick={() => setIsGroupModalOpen(true)}
                                                style={{
                                                    padding: '0 15px',
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: 'var(--space-4)',
                                                    color: 'var(--primary, #1565C0)',
                                                    fontSize: 'var(--text-2xl)',
                                                    cursor: 'pointer'
                                                }}
                                                title="Criar Novo Grupo"
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>

                                    {isGroupModalOpen && (
                                        <div style={{
                                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                                        }}>
                                            <div style={{ backgroundColor: 'var(--bg-card)', padding: 'var(--space-6)', borderRadius: 'var(--space-4)', width: '300px' }}>
                                                <h3>Novo Grupo</h3>
                                                <Input
                                                    placeholder="Nome do grupo..."
                                                    error={groupErrors.name?.message}
                                                    {...registerGroup('name')}
                                                />
                                                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'flex-end', marginTop: 'var(--space-4)' }}>
                                                    <Button type="button" onClick={() => { setIsGroupModalOpen(false); resetGroup(); }} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>Cancelar</Button>
                                                    <Button type="button" onClick={handleGroupSubmit(onGroupSubmit)} style={{ padding: '8px 16px', border: 'none', background: '#1565C0', color: '#fff', borderRadius: 'var(--space-4)', cursor: 'pointer' }}>Criar</Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-4)' }}>Forma Pagamento</label>
                                        <Input
                                            type="text"
                                            error={clientErrors.paymentMethod?.message}
                                            {...registerClient('paymentMethod')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 'var(--space-4)' }}>
                                        <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-4)' }}>Prazos</label>
                                        <Input
                                            type="text"
                                            error={clientErrors.deadlines?.message}
                                            {...registerClient('deadlines')}
                                            style={{ width: '100%' }}
                                        />
                                    </div>

                                    <label style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-4)' }}>Observações</label>
                                    <Textarea
                                        rows="5"
                                        error={clientErrors.observations?.message}
                                        {...registerClient('observations')}
                                        style={{ width: '100%', resize: 'vertical' }}
                                    />

                                    <Button
                                        type="submit"
                                        disabled={saving}
                                        style={{ width: '100%', padding: 'var(--space-3)', backgroundColor: '#1565C0', color: '#fff', border: 'none', borderRadius: 'var(--space-4)', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px' }}
                                    >
                                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                                    </Button>
                                    {message.text && (
                                        <div style={{ marginTop: '10px', fontSize: '13px', color: message.type === 'success' ? '#2e7d32' : '#d32f2f', textAlign: 'center' }}>
                                            {message.text}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- LIST VIEW (Replaces Dashboard) --- */
                <div className="fade-in">
                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {viewMode === 'search' ? `Resultados da Pesquisa (${displayClients.length})` : 'Todos os Clientes'}
                        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'normal', color: 'var(--text-muted)' }}>{displayClients.length} registros encontrados</span>
                    </h2>

                    <div style={{
                        backgroundColor: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        borderRadius: 'var(--space-4)',
                        border: 'var(--glass-border)',
                        boxShadow: 'var(--glass-shadow)',
                        overflow: 'hidden'
                    }}>
                        {displayClients.length === 0 ? (
                            <EmptyState
                                icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                                title="Nenhum cliente encontrado"
                                description="Modifique sua pesquisa ou filtros."
                            />
                        ) : (
                            <DataGrid
                                columns={columns}
                                data={displayClients}
                                height="600px"
                                onRowClick={(row) => { setSelectedClientId(row.id); setViewMode('detail'); }}
                            />
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .table-row:hover {
                    background-color: var(--bg-hover) !important;
                }
                .fade-in {
                    animation: fadeIn 0.3s ease-in;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const MetricCard = ({ label, value, color }) => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: 'var(--space-5)',
        borderRadius: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: `4px solid ${color}`,
        border: '1px solid var(--border-color)',
        borderLeftWidth: 'var(--space-1)',
        borderLeftColor: color
    }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 'var(--font-bold)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>{label}</div>
        <div style={{ fontSize: 'var(--text-xl)', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
    </div>
);

const DashboardCard = ({ title, clients, color, onClickClient }) => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--space-4)',
        padding: 'var(--space-5)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-md)',
        borderTop: `4px solid ${color}`
    }}>
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', marginBottom: 'var(--space-4)', color: 'var(--text-main)' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {clients.map(c => (
                <div
                    key={c.id}
                    onClick={() => onClickClient(c.id)}
                    style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: 'var(--space-2)', borderRadius: 'var(--space-4)',
                        backgroundColor: 'var(--bg-input)', cursor: 'pointer',
                        fontSize: '13px'
                    }}
                >
                    <span style={{ color: 'var(--text-main)', fontWeight: 'var(--font-medium)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60%' }}>{c.name}</span>
                    <span style={{ color: color, fontWeight: 'bold' }}>{c.healthColor === '#d32f2f' ? 'Risco' : formatCurrency(c.totalRevenue)}</span>
                </div>
            ))}
            {clients.length === 0 && <EmptyState className="ui-empty-state-sm" title="Nenhum cliente" />}
        </div>
    </div>
);

const StatusFilter = ({ color, active, onClick, label }) => (
    <div
        onClick={onClick}
        style={{
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 'var(--space-5)',
            border: `1px solid ${active ? (color === 'all' ? 'var(--primary, #1565C0)' : color) : 'var(--border-color)'}`,
            backgroundColor: active ? (color === 'all' ? 'rgba(21, 101, 192, 0.1)' : `${color}22`) : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
        }}
    >
        <div style={{
            width: 'var(--space-2)',
            height: 'var(--space-2)',
            borderRadius: '50%',
            backgroundColor: color === 'all' ? 'var(--text-muted)' : color,
            boxShadow: active ? `0 0 5px ${color === 'all' ? '#1565C0' : color}` : 'none'
        }} />
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{label}</span>
    </div>
);

export default ClientRecords;
