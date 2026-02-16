import React, { useState, useEffect } from 'react';

import { useData } from '../../context/DataContext';

const SalesCampaigns = () => {
    const { activeUnit } = useData();
    const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 4, minutes: 20 });

    // Mock Data for Campaign
    const campaignData = {
        title: "Sprint de Verão 2026",
        description: "Acelere suas vendas e garanta prêmios incríveis!",
        target: 500000,
        current: 345000,
        endDate: "2026-03-01"
    };

    const leaderboard = [
        { id: 1, name: "Ana Silva", sales: 125000, target: 100000, avatar: "AS", rank: 1 },
        { id: 2, name: "Carlos Souza", sales: 98000, target: 100000, avatar: "CS", rank: 2 },
        { id: 3, name: "Roberto Dias", sales: 92000, target: 100000, avatar: "RD", rank: 3 },
        { id: 4, name: "Fernanda Lima", sales: 85000, target: 100000, avatar: "FL", rank: 4 },
        { id: 5, name: "João Pedro", sales: 78000, target: 100000, avatar: "JP", rank: 5 },
    ];

    // Styles
    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', // Dark premium background
        fontFamily: 'var(--font-main)',
        color: 'white',
        paddingBottom: '40px'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '24px',
        marginBottom: '20px'
    };

    const podiumStyle = {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '20px',
        margin: '40px 0'
    };

    const podiumStepStyle = (height, color, glow) => ({
        width: '100px',
        height: height,
        background: `linear-gradient(to bottom, ${color}, rgba(0,0,0,0.3))`,
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: '20px',
        boxShadow: `0 0 20px ${glow}`,
        position: 'relative'
    });

    const avatarStyle = (size, border) => ({
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#e0e0e0',
        color: '#333',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        border: `3px solid ${border}`,
        marginBottom: '10px',
        fontSize: '18px'
    });

    const progressBarContainer = {
        height: '8px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginTop: '8px'
    };

    const progressBarFill = (percent) => ({
        height: '100%',
        width: `${Math.min(percent, 100)}%`,
        background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
        borderRadius: '4px'
    });

    return (
        <div style={containerStyle}>


            <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Campaign Hero Section */}
                <div style={{ ...glassCardStyle, textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(255,215,0,0.3)' }}>
                    <div style={{ display: 'inline-block', padding: '5px 15px', background: 'rgba(255,215,0,0.2)', borderRadius: '20px', color: '#ffd700', fontSize: '12px', fontWeight: 'bold', marginBottom: '15px' }}>
                        EM ANDAMENTO • {activeUnit === 'madville' ? 'MADVILLE' : 'CURITIBA'}
                    </div>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', background: 'linear-gradient(to right, #fff, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
                        {campaignData.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 30px auto' }}>
                        {campaignData.description}
                    </p>

                    {/* Countdown */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        {Object.entries(timeLeft).map(([unit, value]) => (
                            <div key={unit} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{String(value).padStart(2, '0')}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{unit}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Podium Section */}
                <div style={podiumStyle}>
                    {/* 2nd Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={avatarStyle('60px', '#c0c0c0')}>CS</div>
                        <div style={podiumStepStyle('120px', '#c0c0c0', 'rgba(192,192,192,0.3)')}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>2</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Carlos</div>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div style={{ textAlign: 'center', zIndex: 10 }}>
                        <div style={{ marginBottom: '10px', fontSize: '2rem' }}>👑</div>
                        <div style={avatarStyle('80px', '#ffd700')}>AS</div>
                        <div style={podiumStepStyle('160px', '#ffd700', 'rgba(255,215,0,0.4)')}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>1</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#333' }}>Ana Silva</div>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={avatarStyle('60px', '#cd7f32')}>RD</div>
                        <div style={podiumStepStyle('100px', '#cd7f32', 'rgba(205,127,50,0.3)')}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Roberto</div>
                        </div>
                    </div>
                </div>

                {/* Main Leaderboard List */}
                <div style={glassCardStyle}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '20px' }}>Ranking Geral</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {leaderboard.map((user) => {
                            const percent = (user.sales / user.target) * 100;
                            return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                                    <div style={{ width: '30px', fontWeight: 'bold', color: user.rank <= 3 ? '#ffd700' : 'white' }}>#{user.rank}</div>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', border: '1px solid rgba(255,255,255,0.2)' }}>{user.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                            <span style={{ fontWeight: '600' }}>{user.name}</span>
                                            <span style={{ color: '#00d2ff' }}>R$ {user.sales.toLocaleString('pt-BR')}</span>
                                        </div>
                                        <div style={progressBarContainer}>
                                            <div style={progressBarFill(percent)}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
                                            <span>Meta: R$ {user.target.toLocaleString('pt-BR')}</span>
                                            <span>{percent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Prizes */}
                <h3 style={{ marginTop: '40px', marginBottom: '20px' }}>Premiação</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>✈️</div>
                        <h4>1º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Viagem com acompanhante para Resort All-Inclusive.</p>
                    </div>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📱</div>
                        <h4>2º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>iPhone 16 Pro Max ou equivalente.</p>
                    </div>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⌚</div>
                        <h4>3º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Apple Watch Series 10.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesCampaigns;
