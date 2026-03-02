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
        paddingBottom: 'var(--space-10)'
    };

    const glassCardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: 'var(--space-5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: 'var(--space-6)',
        marginBottom: 'var(--space-5)'
    };

    const podiumStyle = {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 'var(--space-5)',
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
        paddingBottom: 'var(--space-5)',
        boxShadow: `0 0 20px ${glow}`,
        position: 'relative'
    });

    const avatarStyle = (size, border) => ({
        width: size,
        height: size,
        borderRadius: '50%',
        background: '#e0e0e0',
        color: 'var(--text-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        border: `3px solid ${border}`,
        marginBottom: '10px',
        fontSize: 'var(--text-xl)'
    });

    const progressBarContainer = {
        height: 'var(--space-2)',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 'var(--space-1)',
        overflow: 'hidden',
        marginTop: 'var(--space-2)'
    };

    const progressBarFill = (percent) => ({
        height: '100%',
        width: `${Math.min(percent, 100)}%`,
        background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
        borderRadius: 'var(--space-1)'
    });

    return (
        <div style={containerStyle}>


            <div style={{ padding: 'var(--space-5)', maxWidth: '1200px', margin: '0 auto' }}>

                {/* Campaign Hero Section */}
                <div style={{ ...glassCardStyle, textAlign: 'center', background: 'linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(255,215,0,0.3)' }}>
                    <div style={{ display: 'inline-block', padding: '5px 15px', background: 'rgba(255,215,0,0.2)', borderRadius: 'var(--space-5)', color: '#ffd700', fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: 'var(--space-4)' }}>
                        EM ANDAMENTO • {activeUnit === 'madville' ? 'MADVILLE' : 'CURITIBA'}
                    </div>
                    <h1 style={{ fontSize: '3rem', margin: '0 0 10px 0', background: 'linear-gradient(to right, #fff, #ffd700)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: '800' }}>
                        {campaignData.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', maxWidth: '600px', margin: '0 auto 30px auto' }}>
                        {campaignData.description}
                    </p>

                    {/* Countdown */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
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
                            <div style={{ fontSize: '0.9rem', fontWeight: 'var(--font-semibold)' }}>Carlos</div>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div style={{ textAlign: 'center', zIndex: 10 }}>
                        <div style={{ marginBottom: 'var(--space-4)', fontSize: '2rem' }}>👑</div>
                        <div style={avatarStyle('80px', '#ffd700')}>AS</div>
                        <div style={podiumStepStyle('160px', '#ffd700', 'rgba(255,215,0,0.4)')}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>1</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Ana Silva</div>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={avatarStyle('60px', '#cd7f32')}>RD</div>
                        <div style={podiumStepStyle('100px', '#cd7f32', 'rgba(205,127,50,0.3)')}>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>3</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 'var(--font-semibold)' }}>Roberto</div>
                        </div>
                    </div>
                </div>

                {/* Main Leaderboard List */}
                <div style={glassCardStyle}>
                    <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: 'var(--space-4)' }}>Ranking Geral</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
{leaderboard.map((user) => {
                            const percent = (user.sales / user.target) * 100;
                            return (
                                <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--space-4)' }}>
<div style={{ width: '30px', fontWeight: 'bold', color: user.rank <= 3 ? '#ffd700' : 'white' }}>#{user.rank}</div>
                                    <div style={{ width: 'var(--space-10)', height: 'var(--space-10)', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', border: '1px solid rgba(255,255,255,0.2)' }}>
{user.avatar}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
<span style={{ fontWeight: 'var(--font-semibold)' }}>{user.name}</span>
                                            <span style={{ color: '#00d2ff' }}>R$ {user.sales.toLocaleString('pt-BR')}</span>
                                        </div>
                                        <div style={progressBarContainer}>
                                            <div style={progressBarFill(percent)}></div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-1)', fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
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
                <h3 style={{ marginTop: 'var(--space-10)', marginBottom: 'var(--space-4)' }}>Premiação</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-4)' }}>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>✈️</div>
                        <h4>1º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Viagem com acompanhante para Resort All-Inclusive.</p>
                    </div>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>📱</div>
                        <h4>2º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>iPhone 16 Pro Max ou equivalente.</p>
                    </div>
                    <div style={glassCardStyle}>
                        <div style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>⌚</div>
                        <h4>3º Lugar</h4>
                        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Apple Watch Series 10.</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesCampaigns;
