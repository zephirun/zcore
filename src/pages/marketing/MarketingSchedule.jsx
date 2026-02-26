import Button from '@/components/ui/Button';

import React, { useState } from 'react';

import { useData } from '../../context/DataContext';

const MarketingSchedule = () => {
    const { activeUnit } = useData();
    const [viewMode, setViewMode] = useState('month'); // 'month', 'week'
    const [currentDate, setCurrentDate] = useState(new Date());

    // Mock Data for Schedule
    const [events] = useState([
        { id: 1, title: 'Campanha de Verão', category: 'Social Media', date: '2026-02-10', duration: 3, color: '#e91e63' },
        { id: 2, title: 'Email Mkt: Promo Relâmpago', category: 'Email', date: '2026-02-12', duration: 1, color: '#2196f3' },
        { id: 3, title: 'Evento: Feira de Móveis', category: 'Eventos', date: '2026-02-15', duration: 2, color: '#ff9800' },
        { id: 4, title: 'Reunião de Planejamento', category: 'Interno', date: '2026-02-09', duration: 1, color: '#9c27b0' },
        { id: 5, title: 'Lançamento Coleção Outono', category: 'Social Media', date: '2026-02-20', duration: 5, color: '#e91e63' },
    ]);

    const categories = [
        { name: 'Social Media', color: '#e91e63' },
        { name: 'Email', color: '#2196f3' },
        { name: 'Eventos', color: '#ff9800' },
        { name: 'Interno', color: '#9c27b0' }
    ];

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: 'var(--font-main)',
        paddingBottom: '40px'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        padding: '24px',
        margin: '20px auto',
        maxWidth: '1200px'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
    };

    const buttonStyle = (active) => ({
        padding: '10px 20px',
        borderRadius: '12px',
        border: 'none',
        background: active ? '#2563eb' : 'rgba(255,255,255,0.5)',
        color: active ? 'white' : '#475569',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: active ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
    });

    const renderCalendarGrid = () => {
        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        const days = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            days.push(
                <div key={i} style={{
                    background: 'rgba(255,255,255,0.4)',
                    borderRadius: '12px',
                    padding: '10px',
                    minHeight: '120px',
                    border: '1px solid rgba(255,255,255,0.5)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    transition: 'transform 0.2s',
                    cursor: 'pointer'
                }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <span style={{ fontWeight: '700', color: '#64748b', marginBottom: '5px', display: 'block' }}>{i}</span>
                    {dayEvents.map(ev => (
                        <div key={ev.id} style={{
                            background: ev.color,
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                            {ev.title}
                        </div>
                    ))}
                </div>
            );
        }
        return days;
    };

    return (
        <div style={containerStyle}>


            <div style={{ padding: '0 20px' }}>
                <div style={glassCardStyle}>
                    <div style={headerStyle}>
                        <div>
                            <h1 style={{ fontSize: '28px', color: '#1e293b', margin: 0, fontWeight: '800' }}>Cronograma de Marketing e Eventos</h1>
                            <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Planejamento de campanhas e ações</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <Button style={buttonStyle(viewMode === 'month')} onClick={() => setViewMode('month')}>Mês</Button>
                            <Button style={buttonStyle(viewMode === 'week')} onClick={() => setViewMode('week')}>Semana</Button>
                            <Button style={{ ...buttonStyle(true), background: '#10b981' }}>+ Novo Evento</Button>
                        </div>
                    </div>

                    {/* Filters / Legend */}
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.5)', padding: '6px 12px', borderRadius: '20px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></div>
                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>{cat.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '15px'
                    }}>
                        {renderCalendarGrid()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarketingSchedule;
