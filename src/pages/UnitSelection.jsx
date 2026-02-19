import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';

const UnitSelection = () => {
    const { switchUnit, allowedUnit, userRole, AVAILABLE_UNITS } = useData();
    const navigate = useNavigate();

    // Filter units based on permission
    // Units are already filtered in DataContext
    const units = AVAILABLE_UNITS;

    const handleUnitClick = (unitId) => {
        switchUnit(unitId);
        navigate('/menu');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-obsidian, var(--bg-main))',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                width: '100%',
                maxWidth: '560px',
                padding: '40px',
                borderRadius: 'var(--radius-lg, 24px)',
                boxShadow: 'var(--glass-shadow)',
                border: 'var(--glass-border)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '32px' }}>
                    <div style={{
                        width: '56px', height: '56px', margin: '0 auto 20px',
                        background: 'rgba(59, 130, 246, 0.1)', borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-primary)',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4" />
                        </svg>
                    </div>
                    <h2 style={{
                        color: 'var(--text-main)',
                        fontSize: '24px',
                        fontWeight: '800',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em'
                    }}>
                        Selecione a Unidade
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>
                        Escolha uma filial para carregar seus dados
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {units.map(unit => (
                        <button
                            key={unit.id}
                            onClick={() => handleUnitClick(unit.id)}
                            className="unit-card"
                            style={{
                                padding: '20px 24px',
                                borderRadius: '16px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: unit.id === 'madville' ? '#3b82f6' : '#10b981',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    boxShadow: `0 4px 12px ${unit.id === 'madville' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                                }}>
                                    {unit.id.substring(0, 1).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.01em' }}>{unit.name}</span>
                                </div>
                            </div>

                            <div className="arrow-icon" style={{
                                color: 'var(--text-muted)',
                                transform: 'translateX(0)',
                                transition: 'all 0.3s ease',
                                position: 'relative', zIndex: 2
                            }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <style>{`
                .unit-card:hover {
                    border-color: var(--color-primary) !important;
                    background: rgba(59, 130, 246, 0.08) !important;
                    box-shadow: 0 0 20px rgba(59, 130, 246, 0.15) !important;
                    transform: translateX(4px);
                }
                .unit-card:hover .arrow-icon {
                    color: var(--color-primary) !important;
                    transform: translateX(4px) !important;
                }
            `}</style>
        </div>
    );
};

export default UnitSelection;
