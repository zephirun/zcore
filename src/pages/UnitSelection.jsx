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
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-card)',
                width: '100%',
                maxWidth: '600px',
                padding: '48px',
                borderRadius: '24px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-color)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '40px' }}>
                    <div style={{
                        width: '64px', height: '64px', margin: '0 auto 24px',
                        background: 'var(--bg-input)', borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-4h8v4" />
                        </svg>
                    </div>
                    <h2 style={{
                        color: 'var(--text-main)',
                        fontSize: '28px',
                        fontWeight: '800',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}>
                        Selecione a Unidade
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: '500' }}>
                        Escolha uma filial para acessar o ambiente de trabalho
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                    {units.map(unit => (
                        <button
                            key={unit.id}
                            onClick={() => handleUnitClick(unit.id)}
                            className="unit-card"
                            style={{
                                padding: '24px',
                                borderRadius: '16px',
                                background: 'var(--bg-input)',
                                border: '1px solid var(--border-input)',
                                cursor: 'pointer',
                                color: 'var(--text-main)',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative', zIndex: 2 }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: unit.id === 'madville' ? '#1E88E5' : '#43A047',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                }}>
                                    {unit.id.substring(0, 1).toUpperCase()}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.01em' }}>{unit.name}</span>
                                </div>
                            </div>

                            <div className="arrow-icon" style={{
                                color: 'var(--text-muted)',
                                transform: 'translateX(0)',
                                transition: 'transform 0.2s',
                                position: 'relative', zIndex: 2
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    background: var(--bg-card) !important;
                    box-shadow: var(--shadow-md) !important;
                    transform: translateY(-2px);
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
