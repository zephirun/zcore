import React from 'react';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

import { useData } from '../../context/DataContext';

const DRE = () => {
    const { activeUnit } = useData();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
            <PageContainer
                maxWidth="1200px"
                title="DRE"
                subtitle={`Módulo em desenvolvimento para a unidade ${activeUnit === 'madville' ? 'Madville' : 'Curitiba'}`}
            >
                <Card padding="20px">
                    <p style={{ color: 'var(--text-muted)' }}>
                        Demonstração do Resultado em desenvolvimento.
                    </p>
                </Card>
            </PageContainer>
        </div>
    );
};

export default DRE;