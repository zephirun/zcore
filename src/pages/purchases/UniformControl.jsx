import React from 'react';

import { useData } from '../../context/DataContext';

const UniformControl = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-card)', fontFamily: 'var(--font-main)' }}>

            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: 'var(--space-4)', borderBottom: '2px solid #d84315', paddingBottom: '10px', display: 'inline-block' }}>
                    Controle de Uniformes
                </h2>

                <div style={{ background: 'var(--bg-card)', padding: 'var(--space-5)', borderRadius: 'var(--space-4)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{
                        padding: '10px 15px',
                        background: activeUnit === 'madville' ? '#e3f2fd' : '#e8f5e9',
                        color: activeUnit === 'madville' ? '#1565c0' : '#2e7d32',
                        borderRadius: 'var(--space-1)',
                        marginBottom: 'var(--space-4)',
                        fontWeight: 'var(--font-semibold)',
                        display: 'inline-block'
                    }}>
                        UNIDADE ATIVA: {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}
                    </div>

                    <p style={{ color: 'var(--text-muted)' }}>
                        Módulo de Controle de Uniformes em desenvolvimento.
                        Gestão de Uniformes e EPI para a unidade <strong>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UniformControl;