import React from 'react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';
import Card from '@/components/ui/Card';

const KPICard = ({ type, label, value, subtitle }) => {
    const accentColor = {
        revenue: 'var(--color-success)',
        margin: 'var(--color-info)',
        deadline: 'var(--color-error)',
    }[type] || 'var(--border-color)';

    return (
        <Card padding="24px" style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {label}
                </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    fontSize: '28px',
                    fontWeight: '800',
                    color: accentColor,
                    marginBottom: '8px'
                }}>
                    {value}
                </div>
                {subtitle && (
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '16px',
            padding: '20px 40px',
            borderBottom: '1px solid var(--border-color)',
        }}>
            <KPICard
                type="revenue"
                label="Faturamento Total"
                value={formatCurrency(totals.amount)}
                subtitle={`${extraInfo?.count || 0} registros`}
            />
            <KPICard
                type="margin"
                label="Margem Média"
                value={formatPercent(totals.margin_percent)}
                subtitle="Ponderada por faturamento"
            />
            <KPICard
                type="deadline"
                label="Prazo Médio"
                value={`${formatNumber(totals.deadline)} dias`}
                subtitle="Média de pagamento"
            />
        </div>
    );
};

export default KPICards;
