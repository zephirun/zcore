import Button from '@/components/ui/Button';

import React, { useState, useMemo } from 'react';
import InsightCard from './InsightCard';

const InsightsPanel = ({ insights, onClose }) => {
    const [activeFilter, setActiveFilter] = useState('all');
    const [entityFilter, setEntityFilter] = useState('all');

    // Count insights by severity
    const counts = useMemo(() => {
        return {
            all: insights.critical.length + insights.warning.length + insights.positive.length + insights.informational.length,
            critical: insights.critical.length,
            warning: insights.warning.length,
            positive: insights.positive.length,
            informational: insights.informational.length
        };
    }, [insights]);

    // Filter insights
    const filteredInsights = useMemo(() => {
        let allInsights = [];

        if (activeFilter === 'all') {
            allInsights = [
                ...insights.critical,
                ...insights.warning,
                ...insights.positive,
                ...insights.informational
            ];
        } else {
            allInsights = insights[activeFilter] || [];
        }

        // Apply entity filter
        if (entityFilter !== 'all') {
            allInsights = allInsights.filter(i => i.entity === entityFilter);
        }

        return allInsights;
    }, [insights, activeFilter, entityFilter]);

    const FilterButton = ({ filter, label, count, colorVar, colorLightVar }) => (
        <Button
            onClick={() => setActiveFilter(filter)}
            style={{
                padding: '8px 16px',
                background: activeFilter === filter ? `var(${colorVar})` : 'var(--bg-input)',
                color: activeFilter === filter ? 'white' : 'var(--text-main)',
                border: '1px solid',
                borderColor: activeFilter === filter ? `var(${colorVar})` : 'var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '36px'
            }}
        >
            {label}
            <span style={{
                background: activeFilter === filter ? 'rgba(255,255,255,0.2)' : `var(${colorLightVar})`,
                color: activeFilter === filter ? 'white' : `var(${colorVar})`,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: '700'
            }}>
                {count}
            </span>
        </Button>
    );

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-main)',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-card)'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: 'var(--text-main)',
                            margin: '0 0 2px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            💡 Insights Automáticos
                        </h2>
                        <p style={{
                            fontSize: '12px',
                            color: 'var(--text-muted)',
                            margin: 0
                        }}>
                            Análise inteligente dos dados de vendas
                        </p>
                    </div>
                    <Button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            fontSize: '18px',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-error)'; e.currentTarget.style.color = 'var(--color-error)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    >
                        ×
                    </Button>
                </div>

                {/* Filters */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <FilterButton filter="all" label="Todos" count={counts.all} colorVar="--text-muted" colorLightVar="--bg-hover" />
                        <FilterButton filter="critical" label="Crítico" count={counts.critical} colorVar="--color-error-strong" colorLightVar="--color-error-light" />
                        <FilterButton filter="warning" label="Atenção" count={counts.warning} colorVar="--color-warning-strong" colorLightVar="--color-warning-light" />
                        <FilterButton filter="positive" label="Positivo" count={counts.positive} colorVar="--color-success-strong" colorLightVar="--color-success-light" />
                        <FilterButton filter="informational" label="Info" count={counts.informational} colorVar="--color-info-strong" colorLightVar="--color-info-light" />
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                        <Button
                            onClick={() => setEntityFilter('all')}
                            style={{
                                padding: '6px 14px',
                                background: entityFilter === 'all' ? 'var(--color-accent)' : 'var(--bg-input)',
                                color: entityFilter === 'all' ? 'white' : 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Todos
                        </Button>
                        <Button
                            onClick={() => setEntityFilter('customer')}
                            style={{
                                padding: '6px 14px',
                                background: entityFilter === 'customer' ? 'var(--color-accent)' : 'var(--bg-input)',
                                color: entityFilter === 'customer' ? 'white' : 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Clientes
                        </Button>
                        <Button
                            onClick={() => setEntityFilter('salesperson')}
                            style={{
                                padding: '6px 14px',
                                background: entityFilter === 'salesperson' ? 'var(--color-accent)' : 'var(--bg-input)',
                                color: entityFilter === 'salesperson' ? 'white' : 'var(--text-muted)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}
                        >
                            Vendedores
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px'
                }}>
                    {filteredInsights.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: 'var(--text-secondary)'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: "var(--space-4)" }}>🎉</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 8px 0' }}>
                                Nenhum insight encontrado
                            </h3>
                            <p style={{ fontSize: '14px', margin: 0 }}>
                                Tudo está funcionando dentro do esperado!
                            </p>
                        </div>
                    ) : (
                        filteredInsights.map(insight => (
                            <InsightCard key={insight.id} insight={insight} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InsightsPanel;
