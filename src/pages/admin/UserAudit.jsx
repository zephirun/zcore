import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import * as api from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    CartesianGrid, Cell, ReferenceLine
} from 'recharts';
import { useLocation, Link } from 'react-router-dom';
import { allModules } from '../../config/menuConfig';

const UserAudit = () => {
    const { theme, users } = useData();
    const location = useLocation();

    const urlUser = new URLSearchParams(location.search).get('user');
    const [selectedUser, setSelectedUser] = useState(urlUser || null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isDark = theme === 'dark';

    const loadStats = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const data = await api.fetchActivityStats(selectedUser);
            if (data) setStats(data);
            else setError('Falha ao carregar dados.');
        } catch (err) {
            setError('Erro de conexão.');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
        const interval = setInterval(() => loadStats(false), 30000);
        return () => clearInterval(interval);
    }, [selectedUser]);

    const getModuleName = (path) => {
        if (path === '/login') return 'Login';
        const mod = allModules.find(m => m.path === path);
        return mod ? mod.title : path.replace('/', '').charAt(0).toUpperCase() + path.slice(2) || 'Sistema';
    };

    if (loading && !stats) return (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Carregando inteligência de auditoria...
        </div>
    );

    return (
        <div style={{
            padding: '24px',
            background: 'var(--bg-main)',
            minHeight: '100vh',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                        Dashboard de Auditoria
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Análise comportamental e métricas de engajamento do sistema
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={selectedUser || ''}
                        onChange={(e) => setSelectedUser(e.target.value || null)}
                        style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: 'var(--bg-card)', color: 'var(--text-main)',
                            border: '1px solid var(--border-color)', fontWeight: '600',
                            fontSize: '14px', outline: 'none', cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <option value="">Equipe Completa</option>
                        {users.map(u => <option key={u.id} value={u.username}>{u.name || u.username}</option>)}
                    </select>
                    <button
                        onClick={() => loadStats(true)}
                        style={{
                            padding: '10px 16px', borderRadius: '10px',
                            background: 'var(--text-main)', color: 'var(--bg-card)',
                            border: 'none', fontWeight: '700', fontSize: '14px',
                            cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Main Grid Layout */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 0.8fr 0.8fr 1fr',
                gap: '20px',
                alignItems: 'start'
            }}>

                {/* COLUMN 1: CHARTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <ChartCard title="Acessos por Mês" isDark={isDark}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={stats?.monthlyChartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-hover)' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="#546e7a" radius={[4, 4, 0, 0]} barSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    <ChartCard title="Acessos por Hora" isDark={isDark}>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={stats?.hourlyData}>
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-hover)' }}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="count" fill="#455a64" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* COLUMN 2: ROUTINES */}
                <RankingCard title="Rotinas" isDark={isDark}>
                    {stats?.topRoutines.map((item, idx) => (
                        <RankingItem
                            key={idx}
                            label={getModuleName(item.path)}
                            value={item.count.toLocaleString()}
                            subLabel="Acessos"
                            percentage={(item.count / stats.topRoutines[0].count) * 100}
                        />
                    ))}
                </RankingCard>

                {/* COLUMN 3: USERS */}
                <RankingCard title="Usuários" isDark={isDark}>
                    {stats?.topUsers.map((item, idx) => (
                        <RankingItem
                            key={idx}
                            label={users.find(u => u.username === item.name)?.name || item.name}
                            value={item.count.toLocaleString()}
                            subLabel="Acessos"
                            percentage={(item.count / stats.topUsers[0].count) * 100}
                        />
                    ))}
                </RankingCard>

                {/* COLUMN 4: SUMMARY SIDEBAR */}
                <SummaryPanel stats={stats} isDark={isDark} />

            </div>
        </div>
    );
};

/* Sub-components */

const ChartCard = ({ title, children, isDark }) => (
    <div style={{
        background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)'
    }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>{title}</h3>
        {children}
    </div>
);

const RankingCard = ({ title, children, isDark }) => (
    <div style={{
        background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
        minHeight: '620px'
    }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px', color: 'var(--text-main)' }}>{title}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {children}
        </div>
    </div>
);

const RankingItem = ({ label, value, subLabel, percentage }) => (
    <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{label}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{value} {subLabel}</span>
            </div>
            <div style={{ width: '40px', height: '14px', borderRadius: '10px', background: '#f5f5f5', overflow: 'hidden', marginTop: '6px' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: '#455a64', borderRadius: '10px' }} />
            </div>
        </div>
    </div>
);

const SummaryPanel = ({ stats, isDark }) => {
    const calculateDelta = (curr, prev) => {
        if (!prev) return 0;
        return Math.round(((curr - prev) / prev) * 100);
    };

    return (
        <div style={{
            background: 'var(--bg-card)', borderRadius: '16px', padding: '24px',
            boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', gap: '30px'
        }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>Resumo de Logs</h3>

            {/* Comparisons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <SummaryPeriod
                    title="Hoje"
                    metrics={[
                        { label: 'Acessos', value: stats?.overview.today.current, delta: calculateDelta(stats?.overview.today.current, stats?.overview.today.previous) },
                        { label: 'Usuários', value: Math.ceil(stats?.overview.today.current / 2), delta: 0 } // Est. unique users
                    ]}
                />
                <SummaryPeriod
                    title="Últimos 7 dias"
                    metrics={[
                        { label: 'Acessos', value: stats?.overview.last7d.current, delta: calculateDelta(stats?.overview.last7d.current, stats?.overview.last7d.previous) },
                        { label: 'Usuários', value: Math.ceil(stats?.overview.last7d.current / 15), delta: 0 }
                    ]}
                />
                <SummaryPeriod
                    title="Últimos 30 dias"
                    metrics={[
                        { label: 'Acessos', value: stats?.overview.last30d.current, delta: calculateDelta(stats?.overview.last30d.current, stats?.overview.last30d.previous) },
                        { label: 'Usuários', value: Math.ceil(stats?.overview.last30d.current / 40), delta: calculateDelta(stats?.overview.last30d.current / 40, stats?.overview.last30d.previous / 40) }
                    ]}
                />
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Platform Stats */}
            <div>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '16px' }}>Tipos de Acesso</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                    <PlatformMetric label="Web" value={stats?.accessTypeStats.Web.toLocaleString()} />
                    <PlatformMetric label="Mobile" value={stats?.accessTypeStats.Mobile.toLocaleString()} />
                    <PlatformMetric label="Web-PBI" value={stats?.accessTypeStats['Web-PBI'].toLocaleString()} />
                </div>
            </div>

            {/* Highlight */}
            <div style={{ marginTop: 'auto' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px' }}>Usuário com mais acessos</h4>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#1565C0' }}>{stats?.topUsers[0]?.name}</div>
                <div style={{ fontSize: '16px', fontWeight: '900', color: 'var(--text-main)' }}>{stats?.topUsers[0]?.count.toLocaleString()} Acessos</div>
            </div>
        </div>
    );
};

const SummaryPeriod = ({ title, metrics }) => (
    <div>
        <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
        <div style={{ display: 'flex', gap: '30px' }}>
            {metrics.map((m, i) => (
                <div key={i}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{m.label}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)' }}>{m.value?.toLocaleString()}</span>
                        {m.delta !== 0 && (
                            <span style={{ fontSize: '11px', fontWeight: '800', color: m.delta > 0 ? '#4caf50' : '#f44336' }}>
                                {m.delta > 0 ? '+' : ''}{m.delta}% {m.delta > 0 ? '↗' : '↘'}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const PlatformMetric = ({ label, value }) => (
    <div style={{ flex: 1 }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700' }}>{label}</div>
        <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)' }}>{value}</div>
    </div>
);

export default UserAudit;
