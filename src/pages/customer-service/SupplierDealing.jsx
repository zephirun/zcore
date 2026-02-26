import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

import { useData } from '../../context/DataContext';

const SupplierDealing = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer
                maxWidth="1200px"
                title="Tratativas Fornecedores"
                subtitle={`Módulo em desenvolvimento para a unidade ${activeUnit === 'madville' ? 'Madville' : 'Curitiba'}`}
            >
                <Card padding="20px">
                    <p style={{ color: '#666' }}>
                        Resolução de Conflitos em desenvolvimento.
                    </p>
                </Card>
            </PageContainer>
        </div>
    );
};

export default SupplierDealing;