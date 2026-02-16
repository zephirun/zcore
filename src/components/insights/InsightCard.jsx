import React from 'react';
import { getInsightIcon, getInsightColor } from '../../utils/insightsEngine';

const InsightCard = ({ insight }) => {
    const icon = getInsightIcon(insight.severity);
    const color = getInsightColor(insight.severity);

    return (
        <div style={{
            background: 'var(--bg-card)',
            border: `2px solid ${color}20`,
            borderLeft: `4px solid ${color}`,
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '12px',
            transition: 'all 0.2s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <h4 style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                            margin: 0
                        }}>
                            {insight.title}
                        </h4>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: '600',
                            color,
                            background: `${color}15`,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {insight.entity === 'customer' ? 'Cliente' : 'Vendedor'}
                        </span>
                    </div>

                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        margin: '0 0 12px 0',
                        lineHeight: '1.5'
                    }}>
                        {insight.description}
                    </p>

                    {insight.metrics && (
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            fontSize: '11px',
                            color: 'var(--text-tertiary)',
                            borderTop: '1px solid var(--border-color)',
                            paddingTop: '12px'
                        }}>
                            {insight.metrics.previous !== undefined && (
                                <div>
                                    <span style={{ fontWeight: '600' }}>Anterior: </span>
                                    <span>{typeof insight.metrics.previous === 'number' && insight.metrics.previous > 100
                                        ? `R$ ${insight.metrics.previous.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                        : insight.metrics.previous.toFixed(1)}</span>
                                </div>
                            )}
                            {insight.metrics.current !== undefined && (
                                <div>
                                    <span style={{ fontWeight: '600' }}>Atual: </span>
                                    <span>{typeof insight.metrics.current === 'number' && insight.metrics.current > 100
                                        ? `R$ ${insight.metrics.current.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                        : insight.metrics.current.toFixed(1)}</span>
                                </div>
                            )}
                            {insight.metrics.change !== undefined && (
                                <div>
                                    <span style={{ fontWeight: '600' }}>Variação: </span>
                                    <span style={{ color: insight.metrics.trend === 'up' ? '#10B981' : insight.metrics.trend === 'down' ? '#EF4444' : 'inherit' }}>
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
