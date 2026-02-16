import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { fetchDeliveries } from '../../services/api';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    LineChart, Line, Legend
} from 'recharts';

const PurchasingIntelligence = () => {
    const { theme, activeUnit } = useData();
    const [deliveries, setDeliveries] = useState([]);
    const [selectedSupplierName, setSelectedSupplierName] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const isDark = theme === 'dark';

    // Fetch deliveries to get unique suppliers
    useEffect(() => {
        const loadData = async () => {
            const data = await fetchDeliveries(activeUnit);
            setDeliveries(data || []);
        };
        loadData();
    }, [activeUnit]);

    // Process all suppliers for the sidebar
    const suppliers = useMemo(() => {
        const supplierMap = new Map();

        // Base list from deliveries
        deliveries.forEach(d => {
            if (d.supplier && !supplierMap.has(d.supplier)) {
                // Simulate metrics for each supplier
                const leadTime = 60 + Math.random() * 30;
                const savings = 70 + Math.random() * 20;
                const quality = 75 + Math.random() * 20;

                supplierMap.set(d.supplier, {
                    name: d.supplier,
                    leadTime,
                    savings,
                    quality,
                    radar: [
                        { subject: 'Lead Time', A: leadTime, fullMark: 100 },
                        { subject: 'Savings', A: savings, fullMark: 100 },
                        { subject: 'Cobertura', A: 80 + Math.random() * 15, fullMark: 100 },
                        { subject: 'Qualidade', A: quality, fullMark: 100 },
                        { subject: 'Mix Diversid.', A: 70 + Math.random() * 25, fullMark: 100 },
                    ],
                    inventoryTrend: [
                        { name: 'Sem 01', estoque: 800 + Math.random() * 200, consumo: 700 + Math.random() * 100 },
                        { name: 'Sem 02', estoque: 750 + Math.random() * 200, consumo: 720 + Math.random() * 100 },
                        { name: 'Sem 03', estoque: 900 + Math.random() * 200, consumo: 710 + Math.random() * 100 },
                        { name: 'Sem 04', estoque: 850 + Math.random() * 200, consumo: 780 + Math.random() * 100 },
                        { name: 'Sem 05 (P)', estoque: 820 + Math.random() * 200, consumo: 760 + Math.random() * 100 },
                        { name: 'Sem 06 (P)', estoque: 790 + Math.random() * 200, consumo: 800 + Math.random() * 100 },
                    ],
                    risks: [
                        { name: 'Risco Ruptura', value: Math.round(Math.random() * 30), color: '#2e7d32' },
                        { name: 'Atraso Médio', value: Math.round(Math.random() * 40), color: '#fbc02d' },
                        { name: 'Inconformidade', value: Math.round(Math.random() * 25), color: '#1565C0' }
                    ]
                });
            }
        });

        // Add some default suppliers if none found in deliveries (Simulation Fallback)
        if (supplierMap.size === 0) {
            ['Arauco', 'Duratex', 'Eucatex', 'Sudati'].forEach(name => {
                supplierMap.set(name, {
                    name,
                    leadTime: 80,
                    savings: 85,
                    quality: 90,
                    radar: [
                        { subject: 'Lead Time', A: 80, fullMark: 100 },
                        { subject: 'Savings', A: 85, fullMark: 100 },
                        { subject: 'Cobertura', A: 90, fullMark: 100 },
                        { subject: 'Qualidade', A: 90, fullMark: 100 },
                        { subject: 'Mix Diversid.', A: 85, fullMark: 100 },
                    ],
                    inventoryTrend: [
                        { name: 'Sem 01', estoque: 850, consumo: 720 },
                        { name: 'Sem 02', estoque: 780, consumo: 750 },
                        { name: 'Sem 03', estoque: 920, consumo: 730 },
                        { name: 'Sem 04', estoque: 880, consumo: 810 },
                        { name: 'Sem 05 (P)', estoque: 840, consumo: 790 },
                        { name: 'Sem 06 (P)', estoque: 810, consumo: 820 },
                    ],
                    risks: [
                        { name: 'Risco Ruptura', value: 12, color: '#2e7d32' },
                        { name: 'Atraso Médio', value: 15, color: '#fbc02d' },
                        { name: 'Inconformidade', value: 8, color: '#1565C0' }
                    ]
                });
            });
        }

        return Array.from(supplierMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [deliveries]);

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [suppliers, searchTerm]);

    const selectedSupplier = useMemo(() =>
        suppliers.find(s => s.name === selectedSupplierName),
        [suppliers, selectedSupplierName]);

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
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)', letterSpacing: '-0.5px', margin: 0 }}>
                        MONITOR DE COMPRAS <span style={{ color: '#1565C0' }}>POR FORNECEDOR</span>
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>Lead Time, Performance e Saúde de Malha Individual</p>
                </div>

                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Buscar fornecedor..."
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

                {/* Left Sidebar: Supplier List */}
                <div style={{
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '16px',
                    height: 'calc(100vh - 180px)',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    {filteredSuppliers.map(supplier => (
                        <div
                            key={supplier.name}
                            onClick={() => setSelectedSupplierName(supplier.name)}
                            className="supplier-item"
                            style={{
                                padding: '15px 20px',
                                borderBottom: '1px solid var(--border-color)',
                                cursor: 'pointer',
                                backgroundColor: selectedSupplierName === supplier.name ? 'var(--bg-hover)' : 'transparent',
                                borderLeft: `4px solid ${selectedSupplierName === supplier.name ? '#1565C0' : 'transparent'}`,
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-main)' }}>{supplier.name}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Supply Health</span>
                                <div style={{ width: '60px', height: '4px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', alignSelf: 'center' }}>
                                    <div style={{ width: `${supplier.quality}%`, height: '100%', backgroundColor: '#1565C0', borderRadius: '2px' }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Panel: Procurement Dashboard */}
                <div>
                    {selectedSupplier ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>

                                {/* Left Side Area */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    {/* Inventory Trend */}
                                    <div style={{
                                        backgroundColor: 'var(--bg-card)',
                                        padding: '25px',
                                        borderRadius: '16px',
                                        boxShadow: 'var(--shadow-lg)',
                                        border: '1px solid var(--border-color)'
                                    }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1565C0" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                            Estoque vs Consumo: {selectedSupplier.name}
                                        </h3>
                                        <div style={{ height: '300px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={selectedSupplier.inventoryTrend}>
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
                                                    <Legend iconType="circle" />
                                                    <Line type="monotone" dataKey="estoque" stroke="#1565C0" strokeWidth={4} dot={{ r: 4 }} />
                                                    <Line type="monotone" dataKey="consumo" stroke="#f57c00" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
                                        <PurchasingActionButton icon="🛒" label="Comprar" color="#1565C0" />
                                        <PurchasingActionButton icon="📋" label="RFQ" color="#00897b" />
                                        <PurchasingActionButton icon="🚚" label="Tracking" color="#fbc02d" />
                                        <PurchasingActionButton icon="📈" label="Mix Hist." color="#689f38" />
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
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>Radar de Eficiência (Suprimentos)</h3>
                                        <div style={{ height: '320px', width: '100%' }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={selectedSupplier.radar}>
                                                    <PolarGrid stroke="var(--border-color)" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold' }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar dataKey="A" stroke="#1565C0" fill="#1565C0" fillOpacity={0.5} />
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
                                        <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '20px', color: 'var(--text-main)', margin: '0 0 20px 0' }}>Riscos e Performance</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {selectedSupplier.risks.map((risk, index) => (
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
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ marginBottom: '15px', opacity: 0.5 }}><circle cx="12" cy="12" r="10" /><path d="m16 12-4-4-4 4" /><path d="m12 8v8" /></svg>
                            <h3 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>Selecione um fornecedor para análise de suprimentos</h3>
                            <p>Análise de lead time, savings e eficiência logística.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .supplier-item:hover {
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

const PurchasingActionButton = ({ icon, label, color }) => (
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

export default PurchasingIntelligence;
