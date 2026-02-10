import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import Footer from '../components/Footer';

const UnitSelection = () => {
    const { switchUnit, allowedUnit, userRole, AVAILABLE_UNITS } = useData();
    const navigate = useNavigate();

    // Filter units based on permission
    const units = (userRole === 'admin' || !allowedUnit)
        ? AVAILABLE_UNITS
        : AVAILABLE_UNITS.filter(u => u.id === allowedUnit);

    const handleUnitClick = (unitId) => {
        switchUnit(unitId);
        navigate('/menu');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f1f5f9', // Updated to cleaner background
            fontFamily: 'var(--font-main)'
        }}>
            <Header />

            <div style={{
                height: 'calc(100vh - 70px)', // Adjusted for new header height
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    background: 'white',
                    width: '100%',
                    maxWidth: '500px',
                    padding: '40px',
                    borderRadius: '24px', // More rounded corners
                    boxShadow: '0 20px 40px -15px rgba(0,0,0,0.08)',
                    margin: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h2 style={{
                            color: '#1e293b',
                            fontSize: '24px',
                            fontWeight: '800',
                            marginBottom: '8px',
                            letterSpacing: '-0.02em'
                        }}>
                            Selecione sua empresa
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                            Escolha uma unidade para acessar o painel
                        </p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {units.map(unit => (
                            <button
                                key={unit.id}
                                onClick={() => handleUnitClick(unit.id)}
                                style={{
                                    padding: '20px 24px',
                                    borderRadius: '16px',
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    cursor: 'pointer',
                                    color: '#334155',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#2563eb';
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(37,99,235,0.1)';
                                    e.currentTarget.style.color = '#2563eb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                    e.currentTarget.style.background = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                                    e.currentTarget.style.color = '#334155';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        background: unit.id === 'madville' ? '#2563eb' : '#16a34a'
                                    }}></div>
                                    {unit.name}
                                </div>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default UnitSelection;
