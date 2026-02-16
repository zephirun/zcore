import React from 'react';

import { useData } from '../../context/DataContext';

const PurchaseRequisitions = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', fontFamily: 'var(--font-main)', color: 'var(--text-main)' }}>

            <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '20px', borderBottom: '2px solid #d84315', paddingBottom: '10px', display: 'inline-block' }}>
                    Requisições de Compras
                </h2>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{
                        padding: '10px 15px',
                        background: activeUnit === 'madville' ? 'rgba(33, 150, 243, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        color: activeUnit === 'madville' ? '#2196f3' : '#4caf50',
                        borderRadius: '4px',
                        marginBottom: '20px',
                        fontWeight: '600',
                        display: 'inline-block'
                    }}>
                        UNIDADE ATIVA: {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}
                    </div>

                    <p style={{ color: 'var(--text-muted)' }}>
                        Módulo de Requisições de Compras em desenvolvimento.
                        Sistema de Requisições para a unidade <strong>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PurchaseRequisitions;