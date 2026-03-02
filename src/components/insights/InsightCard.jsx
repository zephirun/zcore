import React from 'react';
import { getInsightIcon, getInsightColor } from '../../utils/insightsEngine';

const InsightCard = ({ insight }) => {
    const icon = getInsightIcon(insight.severity);
    const color = getInsightColor(insight.severity);

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderLeft: `4px solid ${color}`,
            borderRadius: 'var(--radius-sm)',
            padding: '16px 20px',
            marginBottom: '12px',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: "var(--space-4)" }}>
                <span style={{ fontSize: '20px', flexShrink: 0, opacity: 0.9 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                        <h4 style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                            margin: 0,
                            letterSpacing: '-0.01em'
                        }}>
                            {insight.title}
                        </h4>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            color,
                            background: `${color}15`,
                            padding: '3px 10px',
                            borderRadius: '4px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            border: `1px solid ${color}30`
                        }}>
                            {insight.entity === 'customer' ? 'Cliente' : 'Vendedor'}
                        </span>
                    </div>

                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        margin: '0 0 12px 0',
                        lineHeight: '1.5',
                        fontWeight: '400'
                    }}>
                        {insight.description}
                    </p>

                    {insight.metrics && (
                        <div style={{
                            display: 'flex',
                            gap: "var(--space-4)",
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            borderTop: '1px solid var(--border-subtle)',
                            paddingTop: '12px',
                            marginTop: '8px'
                        }}>
                            {insight.metrics.previous !== undefined && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Anterior:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {typeof insight.metrics.previous === 'number' && insight.metrics.previous > 100
                                            ? `R$ ${insight.metrics.previous.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : insight.metrics.previous.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {insight.metrics.current !== undefined && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Atual:</span>
                                    <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                                        {typeof insight.metrics.current === 'number' && insight.metrics.current > 100
                                            ? `R$ ${insight.metrics.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                            : insight.metrics.current.toFixed(1)}
                                    </span>
                                </div>
                            )}
                            {insight.metrics.change !== undefined && (
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <span style={{ color: 'var(--text-muted)', opacity: 0.7 }}>Variação:</span>
                                    <span style={{
                                        fontWeight: '700',
                                        color: insight.metrics.trend === 'up' ? 'var(--color-success-strong)' : insight.metrics.trend === 'down' ? 'var(--color-error-strong)' : 'inherit'
                                    }}>
                                        {insight.metrics.change > 0 ? '+' : ''}{insight.metrics.change.toFixed(1)}
                                        {insight.type === 'revenue_change' || insight.type === 'margin_change' ? '%' : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InsightCard;
