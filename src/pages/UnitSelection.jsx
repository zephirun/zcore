import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const UnitSelection = () => {
    const { switchUnit, AVAILABLE_UNITS } = useData();
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    const handleUnitClick = (unitId) => {
        switchUnit(unitId);
        navigate('/menu');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-6)',
        }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Header */}
                <div style={{ marginBottom: "var(--space-4)", textAlign: 'center' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-info-strong)',
                        marginBottom: "var(--space-4)",
                        marginInline: 'auto',
                        boxShadow: 'var(--shadow-sm)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4" />
                        </svg>
                    </div>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--text-main)',
                        margin: '0 0 4px 0',
                        letterSpacing: '-0.01em'
                    }}>
                        Empresa
                    </h1>
                    <p style={{
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        fontWeight: '400',
                        margin: 0
                    }}>
                        Selecione uma unidade para continuar
                    </p>
                </div>

                {/* Unit list */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1px',
                    background: 'var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {AVAILABLE_UNITS.map(unit => {
                        const isHovered = hoveredId === unit.id;

                        return (
                            <button
                                key={unit.id}
                                onClick={() => handleUnitClick(unit.id)}
                                onMouseEnter={() => setHoveredId(unit.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    padding: '16px 20px',
                                    background: isHovered ? 'var(--bg-hover)' : 'var(--bg-card)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-main)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    transition: 'background-color 0.1s ease',
                                    width: '100%',
                                    outline: 'none',
                                }}
                            >
                                {unit.name}
                                {/* Arrow */}
                                <svg
                                    width="16" height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="var(--text-muted)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        opacity: isHovered ? 1 : 0.3,
                                        transition: 'opacity 0.2s',
                                        transform: isHovered ? 'translateX(2px)' : 'none'
                                    }}
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '40px',
                    textAlign: 'center',
                }}>
                    <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        letterSpacing: '-0.01em',
                        margin: 0
                    }}>
                        © {new Date().getFullYear()} Z.CORE. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UnitSelection;
