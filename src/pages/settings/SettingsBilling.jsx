import React, { useState } from 'react';
import { Check, Zap, Shield, Building2, ArrowRight, Download } from 'lucide-react';

const plans = [
    {
        id: 'starter',
        name: 'Starter',
        price: 'R$ 299',
        period: '/mês',
        description: 'Ideal para pequenas equipes',
        color: 'var(--text-muted)',
        features: [
            'Até 5 usuários',
            'Módulos básicos',
            'Suporte por e-mail',
            '5 GB de armazenamento',
            'Relatórios básicos',
        ],
        notIncluded: ['Oracle API', 'AI Agents', 'Audit Log', 'SLA Garantido'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$ 799',
        period: '/mês',
        description: 'Para equipes em crescimento',
        color: 'var(--color-accent)',
        current: true,
        features: [
            'Até 25 usuários',
            'Todos os módulos ERP',
            'Oracle API Gateway',
            'Suporte prioritário',
            '50 GB de armazenamento',
            'Relatórios avançados',
            'Export PDF/Excel/CSV',
        ],
        notIncluded: ['AI Agents ilimitados', 'SLA 99.9%'],
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 'Sob consulta',
        period: '',
        description: 'Para grandes corporações',
        color: 'var(--color-success)',
        features: [
            'Usuários ilimitados',
            'Todos os módulos',
            'AI Agents ilimitados',
            'Oracle + Supabase',
            'SLA 99.9% garantido',
            'Suporte 24/7 dedicado',
            'Armazenamento ilimitado',
            'Deploy on-premise',
            'Treinamento incluído',
        ],
        notIncluded: [],
    },
];

const invoices = [
    { id: 'INV-2026-02', date: 'Fev 2026', amount: 'R$ 799,00', status: 'Pago' },
    { id: 'INV-2026-01', date: 'Jan 2026', amount: 'R$ 799,00', status: 'Pago' },
    { id: 'INV-2025-12', date: 'Dez 2025', amount: 'R$ 799,00', status: 'Pago' },
    { id: 'INV-2025-11', date: 'Nov 2025', amount: 'R$ 799,00', status: 'Pago' },
];

const usageItems = [
    { label: 'Usuários Ativos', current: 12, max: 25, color: 'var(--color-accent)' },
    { label: 'Armazenamento', current: 18.4, max: 50, unit: 'GB', color: 'var(--color-info)' },
    { label: 'Requisições API', current: 42800, max: 100000, color: 'var(--color-success)' },
    { label: 'Relatórios este mês', current: 87, max: 500, color: 'var(--color-warning)' },
];

const SettingsBilling = () => {
    const [hoveredPlan, setHoveredPlan] = useState(null);

    return (
        <div style={{
            padding: '32px',
            maxWidth: '1100px',
            margin: '0 auto',
            animation: 'fadeSlideIn 250ms ease forwards',
        }}>
            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'var(--color-accent-dim, rgba(108,99,255,0.12))',
                        borderRadius: '8px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-accent)',
                    }}>
                        <Zap size={16} />
                    </div>
                    <h1 style={{
                        fontSize: '22px', fontWeight: 700, margin: 0,
                        color: 'var(--text-main)', letterSpacing: '-0.03em',
                    }}>
                        Planos & Cobrança
                    </h1>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                    Gerencie sua assinatura, limites de uso e histórico de faturas.
                </p>
            </div>

            {/* Current Usage */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '28px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                            Uso Atual — Plano Pro
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
                            Ciclo renova em 28 de Março de 2026
                        </p>
                    </div>
                    <span style={{
                        background: 'var(--color-accent-dim, rgba(108,99,255,0.12))',
                        color: 'var(--color-accent)',
                        border: '1px solid var(--color-accent-glow, rgba(108,99,255,0.2))',
                        borderRadius: '20px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                    }}>
                        PRO ATIVO
                    </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                    {usageItems.map(item => {
                        const pct = Math.min((item.current / item.max) * 100, 100);
                        const displayCurrent = item.unit === 'GB'
                            ? `${item.current} ${item.unit}`
                            : item.current.toLocaleString('pt-BR');
                        const displayMax = item.unit === 'GB'
                            ? `${item.max} ${item.unit}`
                            : item.max.toLocaleString('pt-BR');
                        return (
                            <div key={item.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                        {item.label}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-main)', fontWeight: 600 }}>
                                        {displayCurrent} / {displayMax}
                                    </span>
                                </div>
                                <div style={{
                                    height: '5px',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: '9999px',
                                    overflow: 'hidden',
                                }}>
                                    <div style={{
                                        width: `${pct}%`,
                                        height: '100%',
                                        background: item.color,
                                        borderRadius: '9999px',
                                        transition: 'width 600ms ease',
                                    }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Plan Comparison */}
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px', letterSpacing: '-0.02em' }}>
                Comparar Planos
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '32px',
            }}>
                {plans.map(plan => {
                    const isHovered = hoveredPlan === plan.id;
                    return (
                        <div
                            key={plan.id}
                            onMouseEnter={() => setHoveredPlan(plan.id)}
                            onMouseLeave={() => setHoveredPlan(null)}
                            style={{
                                background: plan.current ? 'var(--bg-elevated)' : 'var(--bg-card)',
                                border: `1px solid ${plan.current ? 'var(--color-accent)' : isHovered ? 'var(--border-input)' : 'var(--border-color)'}`,
                                borderRadius: '12px',
                                padding: '24px',
                                transition: 'all 200ms ease',
                                transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                                boxShadow: isHovered ? 'var(--shadow-md)' : 'none',
                                position: 'relative',
                            }}
                        >
                            {plan.current && (
                                <span style={{
                                    position: 'absolute', top: '-1px', right: '20px',
                                    background: 'var(--color-accent)', color: '#fff',
                                    fontSize: '10px', fontWeight: 700,
                                    padding: '2px 10px', borderRadius: '0 0 6px 6px',
                                    letterSpacing: '0.06em',
                                }}>
                                    PLANO ATUAL
                                </span>
                            )}
                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <div style={{
                                        width: '28px', height: '28px',
                                        background: `${plan.color}18`,
                                        borderRadius: '6px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: plan.color,
                                    }}>
                                        {plan.id === 'starter' ? <Shield size={14} /> : plan.id === 'pro' ? <Zap size={14} /> : <Building2 size={14} />}
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
                                        {plan.name}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                    <span style={{ fontSize: '28px', fontWeight: 700, color: plan.color, letterSpacing: '-0.04em' }}>
                                        {plan.price}
                                    </span>
                                    {plan.period && (
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                            {plan.period}
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0' }}>
                                    {plan.description}
                                </p>
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {plan.features.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                                        <Check size={13} color={plan.color} strokeWidth={2.5} style={{ flexShrink: 0 }} />
                                        {f}
                                    </li>
                                ))}
                                {plan.notIncluded.map(f => (
                                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-disabled)' }}>
                                        <span style={{ width: '13px', height: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</span>
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            {!plan.current && (
                                <button
                                    style={{
                                        width: '100%',
                                        height: '36px',
                                        background: plan.id === 'enterprise' ? 'transparent' : `${plan.color}18`,
                                        color: plan.color,
                                        border: `1px solid ${plan.color}40`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-main)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '6px',
                                        transition: 'all 150ms ease',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = `${plan.color}28`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = plan.id === 'enterprise' ? 'transparent' : `${plan.color}18`;
                                    }}
                                >
                                    {plan.id === 'enterprise' ? 'Falar com Vendas' : 'Fazer Upgrade'}
                                    <ArrowRight size={13} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Invoice History */}
            <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>
                        Histórico de Faturas
                    </h2>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        background: 'transparent', border: '1px solid var(--border-color)',
                        borderRadius: '6px', padding: '5px 10px',
                        color: 'var(--text-muted)', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 500,
                        fontFamily: 'var(--font-main)', transition: 'all 150ms ease',
                    }}>
                        <Download size={12} />
                        Exportar todas
                    </button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-main)' }}>
                            {['Fatura', 'Data', 'Valor', 'Status', ''].map(h => (
                                <th key={h} style={{
                                    padding: '10px 20px',
                                    textAlign: 'left',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.06em',
                                    borderBottom: '1px solid var(--border-color)',
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((inv, i) => (
                            <tr
                                key={inv.id}
                                style={{
                                    borderBottom: i < invoices.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                                    transition: 'background 150ms ease',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-main)', fontWeight: 500 }}>
                                    {inv.id}
                                </td>
                                <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    {inv.date}
                                </td>
                                <td style={{ padding: '12px 20px', fontSize: '13px', color: 'var(--text-main)', fontWeight: 600 }}>
                                    {inv.amount}
                                </td>
                                <td style={{ padding: '12px 20px' }}>
                                    <span style={{
                                        background: 'var(--color-success-bg, rgba(0,212,170,0.12))',
                                        color: 'var(--color-success)',
                                        border: '1px solid var(--color-success-border, rgba(0,212,170,0.2))',
                                        borderRadius: '20px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        letterSpacing: '0.04em',
                                    }}>
                                        {inv.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                    <button style={{
                                        display: 'flex', alignItems: 'center', gap: '4px',
                                        background: 'transparent', border: 'none',
                                        color: 'var(--text-muted)', cursor: 'pointer',
                                        fontSize: '12px', fontFamily: 'var(--font-main)',
                                        transition: 'color 150ms ease',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.color = 'var(--color-accent)'}
                                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        <Download size={12} />
                                        PDF
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SettingsBilling;
