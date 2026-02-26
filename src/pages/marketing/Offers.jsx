import React from 'react';

import { useData } from '../../context/DataContext';

const Offers = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa', fontFamily: 'var(--font-main)' }}>

            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: '#2c3e50', marginBottom: '20px', borderBottom: '2px solid #673ab7', paddingBottom: '10px', display: 'inline-block' }}>
                    Ofertas
                </h2>

                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div style={{
                        padding: '10px 15px',
                        background: activeUnit === 'madville' ? '#e3f2fd' : '#e8f5e9',
                        color: activeUnit === 'madville' ? '#1565c0' : '#2e7d32',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        UNIDADE ATIVA: {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}
                    </div>

                    <p style={{ color: '#666' }}>
                        Módulo de Ofertas em desenvolvimento.
                        Gestão de Ofertas para a unidade <strong>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Offers;