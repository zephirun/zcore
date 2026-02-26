import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';

import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, Tooltip
} from 'recharts';

const SalesIntelligence = () => {
    const { salesData, theme, userRole, allowedVendor } = useData();
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isDark = theme === 'dark';

    // Process all clients
    const clients = useMemo(() => {
        if (!salesData) return [];

        const clientMap = new Map();

        salesData.forEach(item => {
            const clientId = item.client?.id;
            if (clientId) {
                // Filter by vendor if needed
                if (userRole !== 'admin' && allowedVendor && item.client?.vendor !== allowedVendor) {
                    return;
                }

                if (!clientMap.has(clientId)) {
                    // Aggregated metrics for Radar
                    const totalRevenue = item.total?.amount || 0;
                    const avgMargin = item.total?.margin_percent || 0;
                    const avgDeadline = item.total?.deadline || 0;

                    // Monthly faturamento for trend
                    const monthlyData = item.months?.map(m => m.amount) || [0, 0, 0];
                    const m1 = monthlyData[0] || 0;
                    const m2 = monthlyData[1] || 0;
                    const m3 = monthlyData[2] || 0;
                    // Trend logic: comparison of last month (m1) vs 3 months ago (m3)
                    // If m1 is 0, we can't divide, handle gracefully
                    const revenueTrend = (m3 > 0) ? (m1 / m3) : (m1 > 0 ? 2 : 1); // rough trend estimate

                    // Normalized scores (0-100) for Radar
                    const scoreVolume = Math.min(100, (totalRevenue / 50000) * 100);
                    const scoreMargin = Math.min(100, (avgMargin / 0.25) * 100);
                    const scoreTerm = Math.max(0, 100 - (avgDeadline / 60) * 100); // Shorter is better
                    const scoreGrowth = Math.min(100, (revenueTrend * 50));
                    const scoreConsistency = (item.months?.filter(m => m.amount > 0).length || 0) * 33; // 0-100 based on 3 months

                    // Predict White Space
                    const suggestedCategories = totalRevenue > 10000 ? ['Ferragens Premium', 'Adesivos Estruturais'] : ['Painéis MDF', 'Fitas de Borda'];

                    let churnRisk = 'BAIXO';
                    if (revenueTrend < 0.5) churnRisk = 'ALTO';
                    else if (revenueTrend < 0.8) churnRisk = 'MÉDIO';

                    clientMap.set(clientId, {
                        id: clientId,
                        name: item.client?.name || 'N/A',
                        vendor: item.client?.vendor || 'N/A',
                        totalRevenue,
                        avgMargin,
                        avgDeadline,
                        radarData: [
                            { subject: 'Volume', A: scoreVolume, fullMark: 100 },
                            { subject: 'Margem', A: scoreMargin, fullMark: 100 },
                            { subject: 'Prazo', A: scoreTerm, fullMark: 100 },
                            { subject: 'Crescimento', A: scoreGrowth, fullMark: 100 },
                            { subject: 'Frequência', A: scoreConsistency, fullMark: 100 },
                        ],
                        churnRisk,
                        suggestedCategories
                    });
                }
            }
        });

        return Array.from(clientMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
    }, [salesData, userRole, allowedVendor]);

    const filteredClients = useMemo(() => {
        return clients.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const selectedClient = useMemo(() =>
        clients.find(c => c.id === selectedClientId),
        [clients, selectedClientId]);

    const handleWhatsApp = () => {
        if (!selectedClient) return;
        const msg = window.encodeURIComponent(`Olá ${selectedClient.name}, tudo bem? Sou da GMAD e gostaria de conversar sobre as ofertas deste mês...`);
        window.open(`https://wa.me/?text=${msg}`, '_blank');
    };

    return (
        <div style={{
            background: 'var(--bg-main)',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            animation: 'fadeIn 0.5s ease'
        }}>
            <PageContainer maxWidth="1600px" title={
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                    RADAR ESTRATÉGICO <span style={{ color: '#f57c00' }}>AI</span>
                </h1>
            } subtitle="Inteligência de Vendas e Predição de Performance" actions={
                <div style={{ position: 'relative' }}>
                    <Input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '12px 15px 12px 40px',
                            width: '300px',
                        }}
                    />
                    <svg style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
            }>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 3fr', gap: '25px', marginTop: '24px' }}>

                    {/* Left Sidebar: Client List */}
                    <Card padding="0" style={{
                        height: 'calc(100vh - 180px)',
                        overflowY: 'auto'
                    }}>
                        {filteredClients.map(client => (
                            <div
                                key={client.id}
                                onClick={() => setSelectedClientId(client.id)}
                                className="client-item"
                                style={{
                                    padding: '15px 20px',
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    backgroundColor: selectedClientId === client.id ? 'var(--bg-hover)' : 'transparent',
                                    borderLeft: `4px solid ${selectedClientId === client.id ? '#1565C0' : 'transparent'}`,
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{client.name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {client.id}</span>
                                    <span style={{
                                        fontSize: '10px',
                                        fontWeight: '900',
                                        color: client.churnRisk === 'ALTO' ? '#d32f2f' : (client.churnRisk === 'MÉDIO' ? '#fbc02d' : '#2e7d32')
                                    }}>
                                        RISCO: {client.churnRisk}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </Card>

                    {/* Right Panel: Intelligence Dashboard */}
                    <div style={{ position: 'relative' }}>
                        {selectedClient ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                                {/* Top row: Radar + predictive details */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>

                                    {/* Radar Chart Card */}
                                    <Card padding="25px">
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="m12 8 4 4-4 4-4-4 4-4Z" /></svg>
                                            Perfil Estratégico 360º
                                        </h3>
                                        <div style={{ height: '320px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedClient.radarData}>
                                                    <PolarGrid stroke="var(--border-color)" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 'bold' }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar
                                                        name={selectedClient.name}
                                                        dataKey="A"
                                                        stroke="#1565C0"
                                                        fill="#1565C0"
                                                        fillOpacity={0.5}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '16px',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>

                                    {/* Predictive Insights Card */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                        {/* Actions Card */}
                                        <Card padding="20px">
                                            <h4 style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '15px', margin: '0 0 15px 0' }}>Ações Inteligentes</h4>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Button
                                                    onClick={handleWhatsApp}
                                                    style={{
                                                        flex: 1, padding: '12px', backgroundColor: '#25D366', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: '0.2s', boxShadow: '0 2px 5px rgba(37, 211, 102, 0.3)'
                                                    }}
                                                >
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                                    Conversar
                                                </Button>
                                                <Button style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                                                    Relatório PDF
                                                </Button>
                                            </div>
                                        </Card>

                                        {/* White Space Card */}
                                        <Card padding="20px" style={{ flex: 1 }}>
                                            <h4 style={{ fontSize: '12px', fontWeight: '900', color: '#f57c00', textTransform: 'uppercase', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 15px 0' }}>
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
                                                Oportunidade (Cross-sell)
                                            </h4>
                                            <p style={{ fontSize: '13px', marginBottom: '15px', color: 'var(--text-muted)' }}>
                                                Baseado no perfil de compra, sugerimos introduzir:
                                            </p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {selectedClient.suggestedCategories.map((cat, idx) => (
                                                    <span key={idx} style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: 'rgba(21, 101, 192, 0.1)',
                                                        color: '#1565C0',
                                                        borderRadius: '6px',
                                                        fontSize: '11px',
                                                        fontWeight: '800'
                                                    }}>
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </div>

                                {/* Bottom row: Benchmarks and Timeline */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>

                                    {/* Benchmarks */}
                                    <Card padding="25px">
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>Benchmark (Vs. Média)</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <BenchmarkRow label="Margem" clientValue={selectedClient.avgMargin * 100} avgValue={15} suffix="%" />
                                            <BenchmarkRow label="Prazo Pagto" clientValue={selectedClient.avgDeadline} avgValue={42} suffix=" dias" reverse />
                                            <BenchmarkRow label="Ticket Médio" clientValue={selectedClient.totalRevenue / 3} avgValue={8500} suffix=" R$" prefix="R$ " />
                                        </div>
                                    </Card>
                                    {/* Churn Guard */}
                                    <Card padding="25px" style={{
                                        backgroundColor: selectedClient.churnRisk === 'ALTO' ? 'rgba(211, 47, 47, 0.05)' : 'var(--bg-card)',
                                        borderColor: selectedClient.churnRisk === 'ALTO' ? '#ef9a9a' : 'var(--border-color)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{
                                            width: '80px', height: '80px', borderRadius: '50%',
                                            backgroundColor: selectedClient.churnRisk === 'ALTO' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(46, 125, 50, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'
                                        }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={selectedClient.churnRisk === 'ALTO' ? '#d32f2f' : '#2e7d32'} strokeWidth="2">
                                                <path d="M12 2v20M2 12h20" />
                                                <circle cx="12" cy="12" r="10" />
                                            </svg>
                                        </div>
                                        <h4 style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Saúde Preditiva (Churn)</h4>
                                        <div style={{
                                            fontSize: '28px',
                                            fontWeight: '900',
                                            color: selectedClient.churnRisk === 'ALTO' ? '#d32f2f' : '#2e7d32',
                                            margin: '5px 0'
                                        }}>
                                            RISCO {selectedClient.churnRisk}
                                        </div>
                                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                                            {selectedClient.churnRisk === 'ALTO'
                                                ? 'Tendência de queda severa detectada. Recomenda-se visita técnica imediata.'
                                                : 'Comportamento de compra estável e dentro da normalidade.'}
                                        </p>
                                    </Card>

                                </div>
                            </div>
                        ) : (
                            <div style={{
                                height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-muted)'
                            }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '15px', opacity: 0.5 }}><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="m12 8v8" /></svg>
                                <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>Selecione um cliente no Radar</h3>
                                <p>Análise multidimensional e predição de comportamento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </PageContainer >

            <style>{`
                .client-item:hover {
                    background-color: var(--bg-hover) !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
};

const BenchmarkRow = ({ label, clientValue, avgValue, suffix = '', prefix = '', reverse = false }) => {
    const isBetter = reverse ? clientValue < avgValue : clientValue > avgValue;
    const diff = ((clientValue - avgValue) / (avgValue || 1)) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: '700' }}>
                <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ color: isBetter ? '#2e7d32' : '#d32f2f' }}>
                    {isBetter ? '↑' : '↓'} {Math.abs(diff).toFixed(1)}% vs. Média
                </span>
            </div>
            <div style={{ display: 'flex', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                    width: `${Math.min(100, (clientValue / (avgValue * 1.5 || 1)) * 100)}%`,
                    backgroundColor: isBetter ? '#2e7d32' : '#fbc02d',
                    borderRadius: '4px'
                }} />
                {/* Average Marker */}
                <div style={{
                    position: 'absolute',
                    left: `${(100 / 1.5)}%`,
                    height: '100%',
                    width: '2px',
                    backgroundColor: '#1565C0',
                    zIndex: 2,
                    opacity: 0.5
                }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
                <span>Cliente: {prefix}{typeof clientValue === 'number' ? clientValue.toLocaleString() : clientValue}{suffix}</span>
                <span>Média: {prefix}{avgValue.toLocaleString()}{suffix}</span>
            </div>
        </div>
    );
};

export default SalesIntelligence;
