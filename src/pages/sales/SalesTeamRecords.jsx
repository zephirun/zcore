import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { fetchSalesData, fetchRepRecords, saveRepRecord } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatPercent = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 1 }).format(value / 100);
};

// Component for Status Filter Buttons
const StatusFilter = ({ color, active, onClick, label }) => (
    <Button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: `1px solid ${active ? color : 'var(--border-color)'}`,
            backgroundColor: active ? `${color}22` : 'transparent',
            color: active ? color : 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }}
    >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }}></div>
        {label}
    </Button>
);

// Component for Metric Cards
const MetricCard = ({ label, value, subtext, color }) => (
    <div style={{
        backgroundColor: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
    }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: color || 'var(--text-main)' }}>{value}</div>
        {subtext && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtext}</div>}
    </div>
);

export default function SalesTeamRecords() {
    const { allowedUnit, theme } = useData();
    const [salesData, setSalesData] = useState([]);
    const [repRecords, setRepRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRepId, setSelectedRepId] = useState(null);
    const [editingRecord, setEditingRecord] = useState({ monthlyGoal: '', observations: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Load Data
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const [sales, reps] = await Promise.all([
                fetchSalesData(allowedUnit || 'madville'),
                fetchRepRecords()
            ]);
            setSalesData(sales || []);
            setRepRecords(reps || []);
            setLoading(false);
        };
        load();
    }, [allowedUnit]);

    // Aggregate Data by Vendor
    const reps = useMemo(() => {
        if (!salesData || !Array.isArray(salesData)) return [];

        const repMap = new Map();

        salesData.forEach(item => {
            const vendorName = item.client?.vendor;
            if (!vendorName) return;

            // Initialize
            if (!repMap.has(vendorName)) {
                // Find existing record
                const record = repRecords.find(r => r.rep_name === vendorName);

                repMap.set(vendorName, {
                    id: vendorName, // Using name as ID
                    name: vendorName,
                    totalRevenue: 0,
                    activeClients: new Set(),
                    monthlySums: [0, 0, 0], // Current, Prev, Prev-Prev (Index 0, 1, 2)
                    weightedMarginSum: 0,
                    weightedDeadlineSum: 0,
                    monthlyGoal: record?.monthly_goal || 0,
                    observations: record?.observations || '',
                });
            }

            const rep = repMap.get(vendorName);
            const revenue = item.total?.amount || 0;
            const margin = item.total?.margin_percent || 0;
            const deadline = item.total?.deadline || 0;

            rep.totalRevenue += revenue;
            rep.activeClients.add(item.client?.id);
            rep.weightedMarginSum += (margin * revenue);
            rep.weightedDeadlineSum += (deadline * revenue);

            if (item.months && Array.isArray(item.months)) {
                item.months.forEach((m, idx) => {
                    if (idx < 3) rep.monthlySums[idx] += (m.amount || 0);
                });
            }
        });

        // Finalize
        return Array.from(repMap.values()).map(r => {
            const avgMargin = r.totalRevenue > 0 ? r.weightedMarginSum / r.totalRevenue : 0;
            const avgDeadline = r.totalRevenue > 0 ? r.weightedDeadlineSum / r.totalRevenue : 0;

            // Goal Tracking
            const goalProgress = r.monthlyGoal > 0 ? (r.monthlySums[0] / r.monthlyGoal) : 0; // Assuming index 0 is current month

            return {
                ...r,
                activeClientsCount: r.activeClients.size,
                avgMargin,
                avgDeadline,
                goalProgress,
                monthlyData: r.monthlySums.map((amt, i) => ({ index: i, amount: amt })).reverse() // [Prev-Prev, Prev, Curr] for chart
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);

    }, [salesData, repRecords]);

    // Filter
    const filteredReps = useMemo(() => {
        return reps.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [reps, searchTerm]);

    const selectedRep = useMemo(() => reps.find(r => r.id === selectedRepId), [reps, selectedRepId]);

    // Form Handling
    useEffect(() => {
        if (selectedRep) {
            setEditingRecord({
                monthlyGoal: selectedRep.monthlyGoal || '',
                observations: selectedRep.observations || ''
            });
            setMessage({ type: '', text: '' });
        }
    }, [selectedRepId]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!selectedRepId) return;
        setSaving(true);
        const result = await saveRepRecord({
            repName: selectedRepId,
            monthlyGoal: parseFloat(editingRecord.monthlyGoal) || 0,
            observations: editingRecord.observations
        });

        if (result.success) {
            setMessage({ type: 'success', text: 'Ficha atualizada com sucesso!' });
            // Update local state without reload
            setRepRecords(prev => {
                const existing = prev.findIndex(r => r.rep_name === selectedRepId);
                const newRecord = { rep_name: selectedRepId, monthly_goal: editingRecord.monthlyGoal, observations: editingRecord.observations };
                if (existing >= 0) {
                    const updated = [...prev];
                    updated[existing] = newRecord;
                    return updated;
                }
                return [...prev, newRecord];
            });
        } else {
            setMessage({ type: 'error', text: 'Erro ao salvar: ' + result.error });
        }
        setSaving(false);
    };

    // Chart Data
    const chartData = useMemo(() => {
        if (!selectedRep) return [];
        const monthNames = ["Mês -2", "Mês -1", "Atual"];
        return selectedRep.monthlyData.map((d, i) => ({
            name: monthNames[i],
            vendas: d.amount
        }));
    }, [selectedRep]);

    if (loading) return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Carregando dados...</div>;

    return (
        <div className="fade-in" style={{
            padding: '24px',
            maxWidth: '1600px',
            margin: '0 auto',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Top Bar */}
            <div style={{
                marginBottom: '30px',
                backgroundColor: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                padding: '20px',
                borderRadius: 'var(--glass-radius)',
                border: 'var(--glass-border)',
                boxShadow: 'var(--glass-shadow)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase' }}>Pesquisar Vendedor</div>
                    <Input
                        type="text"
                        placeholder="Nome do vendedor..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                </div>

                {viewMode === 'list' && (
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faturamento Equipe</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1565C0' }}>
                                {formatCurrency(reps.reduce((acc, curr) => acc + curr.totalRevenue, 0))}
                            </div>
                        </div>
                        <div style={{ width: '1px', height: '30px', backgroundColor: 'var(--border-color)' }}></div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margem Média</div>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2e7d32' }}>
                                {formatPercent(reps.reduce((acc, curr) => acc + (curr.avgMargin * curr.totalRevenue), 0) / (reps.reduce((acc, curr) => acc + curr.totalRevenue, 0) || 1))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {viewMode === 'list' && reps.length > 0 && !searchTerm && (
                <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }} className="fade-in">

                    {/* Top 5 Revenue */}
                    <div style={{
                        backgroundColor: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        borderRadius: '16px',
                        border: 'var(--glass-border)',
                        padding: '24px',
                        height: '320px'
                    }}>
                        <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#1565C0' }}>★</span> Top 5 Faturamento
                        </h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={reps.slice(0, 5).map(r => ({ name: r.name.split(' ')[0], value: r.totalRevenue }))} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-hover)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '16px',
                                                    padding: '10px',
                                                    color: 'var(--text-main)'
                                                }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                                                    <p style={{ margin: 0, color: '#1565C0', fontSize: '14px' }}>
                                                        {formatCurrency(payload[0].value)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" fill="#1565C0" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top 5 Margin */}
                    <div style={{
                        backgroundColor: 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)',
                        WebkitBackdropFilter: 'var(--glass-blur)',
                        borderRadius: '16px',
                        border: 'var(--glass-border)',
                        padding: '24px',
                        height: '320px'
                    }}>
                        <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#2e7d32' }}>★</span> Top 5 Margem
                        </h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <BarChart data={[...reps].sort((a, b) => b.avgMargin - a.avgMargin).slice(0, 5).map(r => ({ name: r.name.split(' ')[0], value: r.avgMargin }))} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-hover)' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div style={{
                                                    backgroundColor: 'var(--bg-card)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '16px',
                                                    padding: '10px',
                                                    color: 'var(--text-main)'
                                                }}>
                                                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                                                    <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                                                        {formatPercent(payload[0].value)}
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" fill="#2e7d32" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            )}

            {viewMode === 'list' ? (
                /* LIST VIEW */
                <div style={{
                    backgroundColor: 'var(--glass-bg)',
                    backdropFilter: 'var(--glass-blur)',
                    WebkitBackdropFilter: 'var(--glass-blur)',
                    borderRadius: '16px',
                    border: 'var(--glass-border)',
                    boxShadow: 'var(--glass-shadow)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendedor</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendas Totais</th>
                                <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margem</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clientes Ativos</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Meta (%)</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReps.map(rep => (
                                <tr
                                    key={rep.id}
                                    onClick={() => { setSelectedRepId(rep.id); setViewMode('detail'); }}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}
                                    className="table-row"
                                >
                                    <td style={{ padding: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>{rep.name}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: 'var(--text-main)' }}>{formatCurrency(rep.totalRevenue)}</td>
                                    <td style={{ padding: '16px', textAlign: 'right', color: rep.avgMargin < 0.1 ? '#d32f2f' : '#2e7d32' }}>{formatPercent(rep.avgMargin)}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', color: 'var(--text-main)' }}>{rep.activeClientsCount}</td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: rep.goalProgress >= 1 ? '#2e7d32' : (rep.goalProgress < 0.5 ? '#d32f2f' : '#fbc02d') }}>
                                        {rep.monthlyGoal > 0 ? formatPercent(rep.goalProgress) : '-'}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <Button style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--primary, #1565C0)', background: 'transparent', color: 'var(--primary, #1565C0)', cursor: 'pointer' }}>Abrir Ficha</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* DETAIL VIEW */
                <div className="fade-in">
                    <Button
                        onClick={() => { setSelectedRepId(null); setViewMode('list'); }}
                        style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600' }}
                    >
                        ← Voltar para a lista
                    </Button>

                    {selectedRep && (
                        <>
                            {/* Header */}
                            <div style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '16px', marginBottom: '30px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--text-main)' }}>{selectedRep.name}</h1>
                                    <div style={{ marginTop: '8px', color: 'var(--text-muted)' }}>Ficha de Vendedor</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Faturamento Total</div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1565C0' }}>{formatCurrency(selectedRep.totalRevenue)}</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                                {/* Left Column: Metrics & Charts */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                        <MetricCard label="Clientes Ativos" value={selectedRep.activeClientsCount} color="#1565C0" />
                                        <MetricCard label="Margem Média" value={formatPercent(selectedRep.avgMargin)} color={selectedRep.avgMargin > 0.12 ? '#2e7d32' : '#fbc02d'} />
                                        <MetricCard label="Ticket Médio" value={formatCurrency(selectedRep.activeClientsCount ? selectedRep.totalRevenue / selectedRep.activeClientsCount : 0)} color="#7b1fa2" />
                                    </div>

                                    <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', height: '350px' }}>
                                        <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Tendência de Vendas (Trimestral)</h3>
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
                                                                    borderRadius: '16px',
                                                                    padding: '10px',
                                                                    color: 'var(--text-main)'
                                                                }}>
                                                                    <p style={{ margin: 0, fontWeight: 'bold', marginBottom: '5px' }}>{label}</p>
                                                                    <p style={{ margin: 0, color: '#1565C0', fontSize: '14px' }}>
                                                                        {`Vendas: ${formatCurrency(payload[0].value)}`}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Bar dataKey="vendas" fill="#1565C0" radius={[4, 4, 0, 0]} barSize={50} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Right Column: Management Form */}
                                <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-main)' }}>Dados do Vendedor</h3>
                                    <form onSubmit={handleSave}>
                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Meta Mensal (R$)</label>
                                            <Input
                                                type="number"
                                                value={editingRecord.monthlyGoal}
                                                onChange={e => setEditingRecord({ ...editingRecord, monthlyGoal: e.target.value })}
                                                placeholder="0.00"
                                                style={{ width: '100%', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)' }}
                                            />
                                        </div>

                                        <div style={{ marginBottom: '20px' }}>
                                            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Observações</label>
                                            <Textarea
                                                rows="6"
                                                value={editingRecord.observations}
                                                onChange={e => setEditingRecord({ ...editingRecord, observations: e.target.value })}
                                                placeholder="Anotações sobre o desempenho..."
                                                style={{ width: '100%', padding: '12px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', resize: 'vertical' }}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            style={{ width: '100%', padding: '12px', backgroundColor: '#1565C0', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Alterações'}
                                        </Button>

                                        {message.text && (
                                            <div style={{ marginTop: '15px', padding: '10px', borderRadius: '16px', backgroundColor: message.type === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)', color: message.type === 'success' ? '#2e7d32' : '#d32f2f', textAlign: 'center', fontSize: '13px' }}>
                                                {message.text}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
