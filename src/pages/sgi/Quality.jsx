import React from 'react';

import { useData } from '../../context/DataContext';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

const Quality = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer maxWidth="1200px" title="Gestão da Qualidade (SGQ)">

                <Card>
                    <div style={{
                        padding: 'var(--space-2) var(--space-4)',
                        background: activeUnit === 'madville' ? 'var(--color-info-dim)' : 'var(--color-success-dim)',
                        color: activeUnit === 'madville' ? 'var(--color-info)' : 'var(--color-success)',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: 'var(--space-5)',
                        fontWeight: 'var(--font-bold)',
                        display: 'inline-block',
                        fontSize: 'var(--text-sm)'
                    }}>
                        UNIDADE ATIVA: {activeUnit === 'madville' ? 'Madville' : 'Curitiba'}
                    </div>

                    <p style={{ color: 'var(--text-muted)' }}>
                        Módulo de Gestão da Qualidade em desenvolvimento.<br />
                        Aqui serão gerenciados os indicadores de qualidade, RNCs, e processos de auditoria para a unidade <strong style={{ color: 'var(--text-main)' }}>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                    </p>
                </Card>
            </PageContainer>
        </div>
    );
};

export default Quality;
