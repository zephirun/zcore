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

    const FilterButton = ({ filter, label, count, color }) => (
        <button
            onClick={() => setActiveFilter(filter)}
            style={{
                padding: '8px 16px',
                background: activeFilter === filter ? color : 'var(--bg-input)',
                color: activeFilter === filter ? 'white' : 'var(--text-main)',
                border: `2px solid ${activeFilter === filter ? color : 'var(--border-color)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}
        >
            {label}
            <span style={{
                background: activeFilter === filter ? 'rgba(255,255,255,0.3)' : color + '20',
                color: activeFilter === filter ? 'white' : color,
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '800'
            }}>
                {count}
            </span>
        </button>
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
                borderRadius: '24px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '2px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            color: 'var(--text-main)',
                            margin: '0 0 4px 0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            💡 Insights Automáticos
                        </h2>
                        <p style={{
                            fontSize: '13px',
                            color: 'var(--text-secondary)',
                            margin: 0
                        }}>
                            Análise inteligente dos dados de vendas
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'var(--bg-input)',
                            border: '2px solid var(--border-color)',
                            borderRadius: '12px',
                            width: '40px',
                            height: '40px',
                            cursor: 'pointer',
                            fontSize: '20px',
                            color: 'var(--text-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        ×
                    </button>
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
                        <FilterButton filter="all" label="Todos" count={counts.all} color="#6B7280" />
                        <FilterButton filter="critical" label="🔴 Crítico" count={counts.critical} color="#EF4444" />
                        <FilterButton filter="warning" label="🟡 Atenção" count={counts.warning} color="#F59E0B" />
                        <FilterButton filter="positive" label="🟢 Positivo" count={counts.positive} color="#10B981" />
                        <FilterButton filter="informational" label="ℹ️ Info" count={counts.informational} color="#3B82F6" />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={() => setEntityFilter('all')}
                            style={{
                                padding: '6px 12px',
                                background: entityFilter === 'all' ? 'var(--color-primary)' : 'var(--bg-input)',
                                color: entityFilter === 'all' ? 'white' : 'var(--text-main)',
                                border: `2px solid ${entityFilter === 'all' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '700'
                            }}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setEntityFilter('customer')}
                            style={{
                                padding: '6px 12px',
                                background: entityFilter === 'customer' ? 'var(--color-primary)' : 'var(--bg-input)',
                                color: entityFilter === 'customer' ? 'white' : 'var(--text-main)',
                                border: `2px solid ${entityFilter === 'customer' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '700'
                            }}
                        >
                            Clientes
                        </button>
                        <button
                            onClick={() => setEntityFilter('salesperson')}
                            style={{
                                padding: '6px 12px',
                                background: entityFilter === 'salesperson' ? 'var(--color-primary)' : 'var(--bg-input)',
                                color: entityFilter === 'salesperson' ? 'white' : 'var(--text-main)',
                                border: `2px solid ${entityFilter === 'salesperson' ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '11px',
                                fontWeight: '700'
                            }}
                        >
                            Vendedores
                        </button>
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
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
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
