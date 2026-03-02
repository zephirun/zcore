import React from 'react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import Card from '@/components/ui/Card';

const KPICard = ({ type, label, value, subtitle, trend, trendValue }) => {
    // Fiori Quartz standard colors or semantic colors
    const semanticColor = {
        revenue: 'var(--color-success-strong, #107e3e)',
        margin: 'var(--color-info-strong, #005a9e)',
        deadline: 'var(--color-error-strong, #bb0000)',
    }[type] || 'var(--text-main)';

    const trendColor = trend === 'up' ? 'var(--color-success)' : trend === 'down' ? 'var(--color-error)' : 'var(--text-muted)';
    const TrendIcon = () => {
        if (trend === 'up') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>;
        if (trend === 'down') return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>;
        return null;
    };

    return (
        <Card style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            minHeight: '140px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-sm)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            position: 'relative'
        }}>
            <div style={{ marginBottom: "var(--space-2)", display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{
                    fontSize: 'var(--text-xs)',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </h2>
                {trend && (
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 'bold', color: trendColor, background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: '4px' }}>
                        <TrendIcon /> {trendValue}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 'auto' }}>
                <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: semanticColor,
                    margin: '0',
                    lineHeight: '1.2'
                }}>
                    {value}
                </div>
                {subtitle && (
                    <div style={{
                        fontSize: '11px',
                        fontWeight: 'var(--font-semibold)',
                        color: 'var(--text-muted)',
                        marginTop: 'var(--space-1)'
                    }}>
                        {subtitle}
                    </div>
                )}
            </div>
        </Card>
    );
};

const KPICards = ({ totals, extraInfo }) => {
    return (
        <div className="kpi-section" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: "var(--space-4)",
            padding: 'var(--space-6) 40px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-color)',
            maxWidth: '1200px',
            margin: '0 auto'
        }}>
            <KPICard
                type="revenue"
                label="Faturamento Total"
                value={formatCurrency(totals.amount)}
                subtitle={`${extraInfo?.count || 0} registros`}
                trend="up"
                trendValue="12% a.a."
            />
            <KPICard
                type="margin"
                label="Margem Média"
                value={formatPercent(totals.margin_percent)}
                subtitle="Ponderada por faturamento"
                trend="down"
                trendValue="1.2%"
            />
            <KPICard
                type="deadline"
                label="Prazo Médio"
                value={`${formatNumber(totals.deadline)} dias`}
                subtitle="Média de pagamento"
                trend="neutral"
                trendValue="--"
            />
        </div>
    );
};

export default KPICards;
