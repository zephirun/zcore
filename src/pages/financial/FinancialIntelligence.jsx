import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const FinancialIntelligence = () => {
    const { salesData, theme, userRole, allowedVendor } = useData();
    const [selectedClientId, setSelectedClientId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isDark = theme === 'dark';

    // Process all clients for the sidebar
    const clients = useMemo(() => {
        if (!salesData) return [];
        const clientMap = new Map();

        salesData.forEach(item => {
            const clientId = item.client?.id;
            if (clientId) {
                if (userRole !== 'admin' && allowedVendor && item.client?.vendor !== allowedVendor) return;

                if (!clientMap.has(clientId)) {
                    const totalRevenue = item.total?.amount || 0;
                    const avgMargin = item.total?.margin_percent || 0;

                    // Simulate financial health based on sales performance
                    const solvency = Math.min(100, 60 + (totalRevenue / 10000) * 4);
                    const liquidity = Math.min(100, 50 + (avgMargin / 0.1) * 10);
                    const defaultRisk = totalRevenue > 20000 ? 'BAIXO' : (totalRevenue > 5000 ? 'MÉDIO' : 'ALTO');

                    clientMap.set(clientId, {
                        id: clientId,
                        name: item.client?.name || 'N/A',
                        totalRevenue,
                        solvency,
                        liquidity,
                        defaultRisk,
                        // Data for Radar
                        radar: [
                            { subject: 'Solvência', A: solvency, fullMark: 100 },
                            { subject: 'Liquidez', A: liquidity, fullMark: 100 },
                            { subject: 'Margem Líquida', A: Math.min(100, (avgMargin / 0.2) * 100), fullMark: 100 },
                            { subject: 'Inadimplência', A: defaultRisk === 'BAIXO' ? 90 : (defaultRisk === 'MÉDIO' ? 60 : 30), fullMark: 100 },
                            { subject: 'Orçamento', A: 70 + Math.random() * 25, fullMark: 100 },
                        ],
                        // Data for Cash Flow (simulated based on revenue)
                        cashFlow: [
                            { name: 'Jan', entrada: totalRevenue * 0.8, saida: totalRevenue * 0.6 },
                            { name: 'Fev', entrada: totalRevenue * 0.9, saida: totalRevenue * 0.65 },
                            { name: 'Mar', entrada: totalRevenue, saida: totalRevenue * 0.7 },
                            { name: 'Abr (P)', entrada: totalRevenue * 1.1, saida: totalRevenue * 0.72 },
                            { name: 'Mai (P)', entrada: totalRevenue * 1.05, saida: totalRevenue * 0.7 },
                            { name: 'Jun (P)', entrada: totalRevenue * 1.2, saida: totalRevenue * 0.75 },
                        ],
                        risks: [
                            { name: 'Capital Giro', value: Math.round(solvency * 0.9), color: '#00897b' },
                            { name: 'Limite Usado', value: Math.round(Math.random() * 80), color: '#fbc02d' },
                            { name: 'Prazo Médio', value: Math.round(item.total?.deadline || 30), color: '#d32f2f' }
                        ]
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

    return (
        <div style={{
            padding: '24px',
            maxWidth: '1600px',
            margin: '0 auto',
            background: 'var(--bg-main)',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif",
            animation: 'fadeIn 0.5s ease'
        }}>
            {/* Header Area */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                background: 'var(--bg-card)',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)'
            }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        MONITOR FINANCEIRO <span style={{ color: '#00897b' }}>POR CLIENTE</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Análise de Solvência, Liquidez e Risco de Crédito Individual</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '12px 15px 12px 40px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            width: '300px',
                            transition: 'all 0.3s',
                            outline: 'none'
                        }}
                    />
                    <svg style={{ position: 'absolute', left: '15px', top: '12px', color: 'var(--text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 3fr', gap: '25px' }}>

                {/* Left Sidebar: Client List */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    height: 'calc(100vh - 180px)',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)'
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
                                borderLeft: `4px solid ${selectedClientId === client.id ? '#00897b' : 'transparent'}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{client.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {client.id}</span>
                                <span style={{
                                    fontSize: '10px',
                                    fontWeight: '900',
                                    color: client.defaultRisk === 'ALTO' ? '#d32f2f' : (client.defaultRisk === 'MÉDIO' ? '#fbc02d' : '#2e7d32')
                                }}>
                                    RISCO: {client.defaultRisk}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Financial Board */}
                <div>
                    {selectedClient ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>

                                {/* Left Side Area */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    {/* Cash Flow */}
                                    <div style={{
                                        backgroundColor: 'var(--bg-card)',
                                        padding: '25px',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00897b" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                                            Fluxo Projetado: {selectedClient.name}
                                        </h3>
                                        <div style={{ height: '300px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={selectedClient.cashFlow}>
                                                    <defs>
                                                        <linearGradient id="colorEntrada" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#00897b" stopOpacity={0.1} />
                                                            <stop offset="95%" stopColor="#00897b" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                                    <YAxis hide />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '8px',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    />
                                                    <Area type="monotone" dataKey="entrada" stroke="#00897b" fillOpacity={1} fill="url(#colorEntrada)" strokeWidth={3} />
                                                    <Area type="monotone" dataKey="saida" stroke="#d32f2f" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                        <ActionButton icon="📄" label="Ficha Cadastral" color="#00897b" />
                                        <ActionButton icon="🛡️" label="Aumentar Limite" color="#1565C0" />
                                        <ActionButton icon="⚖️" label="Histórico Juríd." color="#f57c00" />
                                        <ActionButton icon="📧" label="Cobrança" color="#d32f2f" />
                                    </div>
                                </div>

                                {/* Right Side Area */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    {/* Radar */}
                                    <div style={{
                                        backgroundColor: 'var(--bg-card)',
                                        padding: '25px',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>Radar de Saúde Financeira</h3>
                                        <div style={{ height: '320px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedClient.radar}>
                                                    <PolarGrid stroke="var(--border-color)" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar dataKey="A" stroke="#00897b" fill="#00897b" fillOpacity={0.5} />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--bg-card)',
                                                            border: '1px solid var(--border-color)',
                                                            borderRadius: '8px',
                                                            color: 'var(--text-main)'
                                                        }}
                                                    />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Risks */}
                                    <div style={{
                                        backgroundColor: 'var(--bg-card)',
                                        padding: '25px',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>Metricas de Crédito</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {selectedClient.risks.map((risk, index) => (
                                                <div key={index}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)' }}>{risk.name}</span>
                                                        <span style={{ fontSize: '12px', fontWeight: '900', color: risk.color }}>{risk.value}%</span>
                                                    </div>
                                                    <div style={{ height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                                                        <div style={{ width: `${risk.value}%`, height: '100%', backgroundColor: risk.color }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: '16px', color: 'var(--text-muted)'
                        }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '15px', opacity: 0.5 }}><path d="M12 2v20M2 12h20" /><circle cx="12" cy="12" r="10" /></svg>
                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>Selecione um cliente para análise financeira</h3>
                            <p>Visão individual de risco, crédito e solvência.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .client-item:hover {
                    background-color: var(--bg-hover) !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const ActionButton = ({ icon, label, color }) => (
    <div style={{
        padding: '15px 10px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: '0.2s',
        textAlign: 'center'
    }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
    >
        <div style={{ fontSize: '20px' }}>{icon}</div>
        <div style={{ fontSize: '10px', fontWeight: '900', color, textTransform: 'uppercase' }}>{label}</div>
    </div>
);

export default FinancialIntelligence;
