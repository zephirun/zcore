import Button from '@/components/ui/Button';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDetailedKPIsQuery } from '@/hooks/useSalesQueries';
import Card from '@/components/ui/Card';
import PageContainer from '@/components/ui/PageContainer';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StrategicDashboard = () => {
    const navigate = useNavigate();
    // State managed by React Query
    const { data: kpisData, isLoading, isError } = useDetailedKPIsQuery();
    const data = kpisData || null;

    // Goal Constant
    const MONTHLY_GOAL = 12000000;

    const faturamento = data?.faturamento || 0;
    const ticketMedio = data?.ticketMedio || 0;
    const margem = data?.margem || 0;
    const qtdVendas = data?.qtdVendas || 0;

    // 1. Goal Achievement
    const percentMeta = Math.min((faturamento / MONTHLY_GOAL) * 100, 100);

    // 2. Forecast Calculation (Simple Run Rate)
    const today = new Date().getDate();
    const totalDays = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const runRate = faturamento / today;
    const forecast = runRate * totalDays;

    // 3. Operational Efficiency (Simulated Devolutions Index)
    const devolucoesIndex = 4.2; // Mocked for now

    // 4. Mix Performance (Mocked Categories for visualization)
    const mixData = [
        { name: 'Madeiras', value: 45, color: 'var(--color-primary)' },
        { name: 'Ferragens', value: 30, color: 'var(--color-accent)' },
        { name: 'Químicos', value: 15, color: 'var(--color-success)' },
        { name: 'Outros', value: 10, color: 'var(--text-muted)' },
    ];

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    const [isExporting, setIsExporting] = useState(false);

    return (
        <PageContainer
            title="Radar Estratégico"
            subtitle="Visão executiva consolidada para tomada de decisão."
            isLoading={isLoading}
            actions={
                <Button variant="ghost" onClick={() => navigate('/menu')}>
                    Voltar ao Menu
                </Button>
            }
        >


            {/* Strategic Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>

                {/* VIEW 1: FATURAMENTO & TREND */}
                <StrategicCard title="Desempenho de Vendas">
                    <div style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--color-primary)', marginBottom: 'var(--space-4)' }}>
                        {formatCurrency(faturamento)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', fontSize: '13px' }}>
<span style={{ color: 'var(--color-success)', fontWeight: 'var(--font-bold)' }}>+8.4%</span>
                        <span style={{ color: 'var(--text-muted)' }}>vs. mês anterior</span>
                    </div>
                </StrategicCard>

                {/* VIEW 2: GOAL & PROGRESS */}
                <StrategicCard title="Atingimento de Meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-4)' }}>
<div style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--text-main)' }}>
                            {percentMeta.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)', fontWeight: 'var(--font-medium)' }}>
                            Meta: {formatCurrency(MONTHLY_GOAL)}
                        </div>
                    </div>
                    <div style={{ height: 'var(--space-2)', background: 'var(--bg-elevated)', borderRadius: 'var(--space-1)', overflow: 'hidden' }}>
                        <div style={{ width: `${percentMeta}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-success))', borderRadius: 'var(--space-1)' }}></div>
                    </div>
                </StrategicCard>

                {/* VIEW 3: FORECAST */}
                <StrategicCard title="Projeção de Fechamento">
                    <div style={{ fontSize: 'var(--text-4xl)', fontWeight: '800', color: 'var(--color-accent)', marginBottom: 'var(--space-4)' }}>
                        {formatCurrency(forecast)}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Baseado no ritmo atual do dia {today} (Run Rate)
                    </div>
                </StrategicCard>

                {/* VIEW 4: EFFICIENCY */}
                <StrategicCard title="Eficiência Operacional">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Margem Média</div>
                            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-success)' }}>{margem}%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-4)' }}>Índice Devolução</div>
                            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-error)' }}>{devolucoesIndex}%</div>
                        </div>
                    </div>
                </StrategicCard>
            </div>

            {/* Bottom Row: Mix and Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-4)' }}>
                <StrategicCard title="Mix de Categorias">
                    <div style={{ height: '200px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mixData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-main)' }} width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                    {mixData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </StrategicCard>

                <StrategicCard title="Observações Executivas">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', fontSize: 'var(--text-base)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
<div style={{ padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-primary)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 'var(--space-4)' }}>Performance de Vendas</strong>
                            A tendência atual aponta para um fechamento acima da meta histórica. O Ticket Médio se mantém estável em {formatCurrency(ticketMedio)}.
                        </div>
                        <div style={{ padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-accent)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: 'var(--space-4)' }}>Saúde Financeira</strong>
                            A margem operacional de {margem}% está dentro do quadrante de segurança. Recomenda-se monitorar o índice de devoluções que subiu 0.5pp.
                        </div>
                    </div>
                </StrategicCard>
            </div>
        </PageContainer>
    );
};

const StrategicCard = ({ title, isLoading, children }) => (
    <Card isLoading={isLoading} style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
<h2 style={{ fontSize: 'var(--text-sm)', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {title}
            </h2>
        </div>
        {children}
    </Card>
);

export default StrategicDashboard;
