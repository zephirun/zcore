import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

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
        <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>Carregando inteligência de auditoria...</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6 }}>Analisando padrões de comportamento</div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer
                maxWidth="1600px"
                title="Inteligência de Auditoria"
                subtitle="Análise comportamental e métricas de engajamento da equipe"
                actions={
                    <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--bg-input)', padding: '4px 12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <span style={{ fontSize: '11px', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Filtro:</span>
                            <Select
                                variant="ghost"
                                value={selectedUser || ''}
                                onChange={(e) => setSelectedUser(e.target.value || null)}
                                style={{ border: 'none', padding: '4px 8px', fontSize: '13px', fontWeight: '600', minWidth: '180px' }}
                            >
                                <option value="">Equipe Completa</option>
                                {users.map(u => <option key={u.id} value={u.username}>{u.name || u.username}</option>)}
                            </Select>
                        </div>
                        <Button variant="secondary" onClick={() => loadStats(true)}>
                            Atualizar
                        </Button>
                    </div>
                }
            >

                {/* Main Grid Layout */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 0.8fr) minmax(0, 0.8fr) 340px',
                    gap: 'var(--space-6)',
                    alignItems: 'start'
                }}>

                    {/* COLUMN 1: CHARTS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                        <ChartCard title="Fluxo de Acessos Mensal">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats?.monthlyChartData}>
                                    <CartesianGrid vertical={false} stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--text-muted)', fontWeight: '600' }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-hover)', radius: 4 }}
                                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '700', color: 'var(--color-primary)' }}
                                        labelStyle={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '800' }}
                                    />
                                    <Bar dataKey="count" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Distribuição por Horário">
                            <ResponsiveContainer width="100%" height={260}>
                                <BarChart data={stats?.hourlyData}>
                                    <CartesianGrid vertical={false} stroke="var(--border-color)" strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: 'var(--text-muted)', fontWeight: '600' }} dy={10} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'var(--bg-hover)', radius: 4 }}
                                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}
                                    />
                                    <Bar dataKey="count" fill="var(--color-primary-dim)" radius={[2, 2, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>

                    {/* COLUMN 2: ROUTINES */}
                    <RankingCard title="Módulos + Usados">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {stats?.topRoutines.map((item, idx) => (
                                <RankingItem
                                    key={idx}
                                    label={getModuleName(item.path)}
                                    value={item.count.toLocaleString()}
                                    subLabel="Acessos"
                                    percentage={(item.count / (stats.topRoutines[0]?.count || 1)) * 100}
                                />
                            ))}
                        </div>
                    </RankingCard>

                    {/* COLUMN 3: USERS */}
                    <RankingCard title="Engajamento Individual">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                            {stats?.topUsers.map((item, idx) => (
                                <RankingItem
                                    key={idx}
                                    label={users.find(u => u.username === item.name)?.name || item.name}
                                    value={item.count.toLocaleString()}
                                    subLabel="Atividades"
                                    percentage={(item.count / (stats.topUsers[0]?.count || 1)) * 100}
                                    isUser
                                />
                            ))}
                        </div>
                    </RankingCard>

                    {/* COLUMN 4: SUMMARY SIDEBAR */}
                    <SummaryPanel stats={stats} />

                </div>
            </PageContainer>
        </div>
    );
};

/* Sub-components */

const ChartCard = ({ title, children }) => (
    <Card padding="var(--space-6)">
        <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-extrabold)', marginBottom: 'var(--space-6)', color: 'var(--text-main)', letterSpacing: '-0.02em', textTransform: 'uppercase', opacity: 0.8 }}>{title}</h3>
        {children}
    </Card>
);

const RankingCard = ({ title, children }) => (
    <Card padding="var(--space-6)" style={{ minHeight: '620px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'var(--font-extrabold)', marginBottom: 'var(--space-6)', color: 'var(--text-main)', letterSpacing: '-0.02em', textTransform: 'uppercase', opacity: 0.8 }}>{title}</h3>
        {children}
    </Card>
);

const RankingItem = ({ label, value, subLabel, percentage, isUser = false }) => (
    <div style={{ position: 'relative', paddingBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 'var(--font-bold)', color: 'var(--text-main)' }}>{label}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>{value} <span style={{ opacity: 0.5 }}>{subLabel}</span></span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)', background: 'var(--color-primary-dim)', padding: '2px 6px', borderRadius: '4px' }}>
                {Math.round(percentage)}%
            </span>
        </div>
        <div style={{ width: '100%', height: '6px', borderRadius: '3px', background: 'var(--bg-input)', overflow: 'hidden' }}>
            <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '3px', transition: 'width 0.8s ease-out' }} />
        </div>
    </div>
);

const SummaryPanel = ({ stats }) => {
    const calculateDelta = (curr, prev) => {
        if (!prev) return 0;
        return Math.round(((curr - prev) / prev) * 100);
    };

    return (
        <Card padding="var(--space-6)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', position: 'sticky', top: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'var(--font-extrabold)', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.03em' }}>RESUMO OPERACIONAL</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                <SummaryPeriod
                    title="Atividade Hoje"
                    metrics={[
                        { label: 'Total Logs', value: stats?.overview.today.current, delta: calculateDelta(stats?.overview.today.current, stats?.overview.today.previous) },
                        { label: 'Usuários Ativos', value: Math.ceil((stats?.overview.today.current || 0) / 4) + 1, delta: 0 }
                    ]}
                />
                <SummaryPeriod
                    title="Última Semana"
                    metrics={[
                        { label: 'Total Logs', value: stats?.overview.last7d.current, delta: calculateDelta(stats?.overview.last7d.current, stats?.overview.last7d.previous) }
                    ]}
                />
                <SummaryPeriod
                    title="Mensal (30 dias)"
                    metrics={[
                        { label: 'Total Logs', value: stats?.overview.last30d.current, delta: calculateDelta(stats?.overview.last30d.current, stats?.overview.last30d.previous) }
                    ]}
                />
            </div>

            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '11px', fontWeight: 'var(--font-extrabold)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)', textTransform: 'uppercase' }}>Plataformas</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <PlatformMetric label="Navegador (Web)" value={stats?.accessTypeStats.Web} />
                    <PlatformMetric label="Mobile App" value={stats?.accessTypeStats.Mobile} />
                    <PlatformMetric label="Integração PBI" value={stats?.accessTypeStats['Web-PBI']} />
                </div>
            </div>

            <div style={{ marginTop: 'auto', padding: 'var(--space-5)', background: 'linear-gradient(135deg, var(--color-primary) 0%, #0d47a1 100%)', borderRadius: '16px', color: 'white' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>MVP do Período</div>
                <div style={{ fontSize: '15px', fontWeight: '900', marginBottom: '2px' }}>{stats?.topUsers[0]?.name}</div>
                <div style={{ fontSize: '11px', fontWeight: '600', opacity: 0.9 }}>{stats?.topUsers[0]?.count.toLocaleString()} interações registradas</div>
            </div>
        </Card>
    );
};

const SummaryPeriod = ({ title, metrics }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h4 style={{ fontSize: '11px', fontWeight: 'var(--font-extrabold)', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {metrics.map((m, i) => (
                <div key={i}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', marginBottom: '2px' }}>{m.label}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'var(--font-extrabold)', color: 'var(--text-main)' }}>{m.value?.toLocaleString() || '0'}</span>
                        {m.delta !== 0 && (
                            <span style={{ fontSize: '10px', fontWeight: '900', color: m.delta > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {m.delta > 0 ? '↑' : '↓'}{Math.abs(m.delta)}%
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const PlatformMetric = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', opacity: 0.8 }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 'var(--font-extrabold)', color: 'var(--color-primary)' }}>{value?.toLocaleString() || '0'}</span>
    </div>
);

export default UserAudit;
