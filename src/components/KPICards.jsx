import React from 'react';
import { formatCurrency, formatPercent, formatNumber } from '../utils/formatters';

const KPICard = ({ type, label, value, icon, subtitle }) => {
    const colors = {
        revenue: '#27ae60',
        margin: '#3498db',
        deadline: '#e74c3c'
    };

    return (
        <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
            borderLeft: `4px solid ${colors[type] || '#ccc'}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}>
            <div style={{
                color: '#7f8c8d',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{ color: colors[type] }}>{icon}</span>
                {label}
            </div>
            <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#2C3E50'
            }}>
                {value}
            </div>
            {subtitle && (
                <div style={{
                    fontSize: '11px',
                    color: '#95a5a6',
                    marginTop: '2px'
                }}>
                    {subtitle}
                </div>
            )}
        </div>
    );
};

const KPICards = ({ totals, extraInfo }) => {
    return (
        <div className="kpi-section" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            padding: '25px 40px',
            background: '#f8f9fa',
            borderBottom: '1px solid #e0e0e0'
        }}>
            <KPICard
                type="revenue"
                label="Faturamento Total"
                value={formatCurrency(totals.amount)}
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                }
                subtitle={`${extraInfo?.count || 0} registros`}
            />
            <KPICard
                type="margin"
                label="Margem Média"
                value={formatPercent(totals.margin_percent)}
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="5" x2="5" y2="19"></line>
                        <circle cx="6.5" cy="6.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                    </svg>
                }
                subtitle="Ponderada por faturamento"
            />
            <KPICard
                type="deadline"
                label="Prazo Médio"
                value={`${formatNumber(totals.deadline)} dias`}
                icon={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                }
                subtitle="Média de pagamento"
            />
        </div>
    );
};

export default KPICards;
