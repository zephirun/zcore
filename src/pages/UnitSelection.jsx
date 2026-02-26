import Button from '@/components/ui/Button';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const UNIT_COLORS = {
    madville: '#3b82f6',
    curitiba: '#10b981',
    default: '#6366f1',
};

const UnitSelection = () => {
    const { switchUnit, AVAILABLE_UNITS } = useData();
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    const units = AVAILABLE_UNITS;

    const handleUnitClick = (unitId) => {
        switchUnit(unitId);
        navigate('/menu');
    };

    const getColor = (unitId) =>
        UNIT_COLORS[unitId] || UNIT_COLORS.default;

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, var(--color-primary)08 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '40%',
                height: '40%',
                background: 'radial-gradient(circle, var(--color-success)05 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: 0
            }} />

            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

                {/* Header */}
                <div style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                    <div style={{
                        width: '56px', height: '56px',
                        borderRadius: '18px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-primary)',
                        marginBottom: 'var(--space-5)',
                        marginInline: 'auto',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4" />
                        </svg>
                    </div>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Selecione uma unidade para continuar
                    </p>
                </div>

                {/* Unit list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {units.map(unit => {
                        const color = getColor(unit.id);
                        const isHovered = hoveredId === unit.id;

                        return (
                            <button
                                key={unit.id}
                                onClick={() => handleUnitClick(unit.id)}
                                onMouseEnter={() => setHoveredId(unit.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    padding: 'var(--space-5) var(--space-6)',
                                    borderRadius: '20px',
                                    background: isHovered ? 'var(--bg-card)' : 'var(--bg-card)88',
                                    border: `1px solid ${isHovered ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                    cursor: 'pointer',
                                    color: 'var(--text-main)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    width: '100%',
                                    outline: 'none',
                                    boxShadow: isHovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                                    transform: isHovered ? 'translateY(-2px)' : 'none'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '42px',
                                        height: '42px',
                                        borderRadius: '14px',
                                        background: isHovered ? color : `${color}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isHovered ? 'white' : color,
                                        fontWeight: 'var(--font-extrabold)',
                                        fontSize: '16px',
                                        flexShrink: 0,
                                        transition: 'all 0.2s'
                                    }}>
                                        {unit.id.substring(0, 1).toUpperCase()}
                                    </div>

                                    {/* Name */}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{
                                            fontSize: '15px',
                                            fontWeight: 'var(--font-bold)',
                                            letterSpacing: '-0.02em',
                                            color: 'var(--text-main)',
                                        }}>
                                            {unit.name}
                                        </span>
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                                            Unidade Operacional
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: isHovered ? 'var(--color-primary)10' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s'
                                }}>
                                    <svg
                                        width="16" height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke={isHovered ? 'var(--color-primary)' : 'var(--text-muted)'}
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 'var(--space-10)',
                    paddingTop: 'var(--space-6)',
                    borderTop: '1px solid var(--border-subtle)',
                    textAlign: 'center',
                    opacity: 0.5
                }}>
                    <p style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        fontWeight: '500',
                        letterSpacing: '-0.01em'
                    }}>
                        © {new Date().getFullYear()} Z.CORE. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnitSelection;
