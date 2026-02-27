import Button from '@/components/ui/Button';

import { useApiData } from '../../hooks/useApiData';
import { CacheBanner } from '../../components/CacheBanner';

const StrategicDashboard = () => {
    const navigate = useNavigate();

    // Unified data fetching with automatic cache/company handling
    const { data: cachedResponse, loading, error, fromCache } = useApiData('cached-dashboard');

    // Extract KPIs from the response structure
    const kpis = cachedResponse?.data?.kpis;
    const savedAt = cachedResponse?.savedAt;

    // Goal Constant
    const MONTHLY_GOAL = 12000000;

    const faturamento = kpis?.faturamento || 0;
    const ticketMedio = kpis?.ticketMedio || 0;
    const margem = kpis?.margem || 0;
    const qtdVendas = kpis?.qtdVendas || 0;

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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
                <span>Carregando Visão Estratégica...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
            {/* Heading */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.04em' }}>
                        Radar Estratégico
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Visão executiva consolidada para tomada de decisão.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/menu')}
                >
                    Voltar ao Menu
                </Button>
            </div>

            {/* Status Banner (visible only on cache/offline) */}
            <CacheBanner fromCache={fromCache} savedAt={savedAt} error={error} />

            {/* Strategic Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '20px' }}>

                {/* VIEW 1: FATURAMENTO & TREND */}
                <StrategicCard title="Desempenho de Vendas">
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-primary)', marginBottom: '8px' }}>
                        {formatCurrency(faturamento)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                        <span style={{ color: 'var(--color-success)', fontWeight: '700' }}>+8.4%</span>
                        <span style={{ color: 'var(--text-muted)' }}>vs. mês anterior</span>
                    </div>
                </StrategicCard>

                {/* VIEW 2: GOAL & PROGRESS */}
                <StrategicCard title="Atingimento de Meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
                        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>
                            {percentMeta.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>
                            Meta: {formatCurrency(MONTHLY_GOAL)}
                        </div>
                    </div>
                    <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentMeta}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-success))', borderRadius: '4px' }}></div>
                    </div>
                </StrategicCard>

                {/* VIEW 3: FORECAST */}
                <StrategicCard title="Projeção de Fechamento">
                    <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-accent)', marginBottom: '8px' }}>
                        {formatCurrency(forecast)}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        Baseado no ritmo atual do dia {today} (Run Rate)
                    </div>
                </StrategicCard>

                {/* VIEW 4: EFFICIENCY */}
                <StrategicCard title="Eficiência Operacional">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Margem Média</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-success)' }}>{margem}%</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Índice Devolução</div>
                            <div style={{ fontSize: '20px', fontWeight: '700', color: '#ff5252' }}>{devolucoesIndex}%</div>
                        </div>
                    </div>
                </StrategicCard>
            </div>

            {/* Bottom Row: Mix and Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '16px', borderLeft: '4px solid var(--color-primary)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Performance de Vendas</strong>
                            A tendência atual aponta para um fechamento acima da meta histórica. O Ticket Médio se mantém estável em {formatCurrency(ticketMedio)}.
                        </div>
                        <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '16px', borderLeft: '4px solid var(--color-accent)' }}>
                            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Saúde Financeira</strong>
                            A margem operacional de {margem}% está dentro do quadrante de segurança. Recomenda-se monitorar o índice de devoluções que subiu 0.5pp.
                        </div>
                    </div>
                </StrategicCard>
            </div>
        </div>
    );
};

const StrategicCard = ({ title, children }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {title}
            </h2>
        </div>
        {children}
    </div>
);

export default StrategicDashboard;
