import React from 'react';
import { useData } from '../../context/DataContext';
import PageContainer from '@/components/ui/PageContainer';
import Card from '@/components/ui/Card';

const QuarterlySalesAnalysis = () => {
    const { activeUnit } = useData();

    return (
        <PageContainer maxWidth="1200px" title="Faturamento Trimestral" subtitle={`Visão consolidada para a unidade ${activeUnit === 'madville' ? 'Madville' : 'Curitiba'}`}>
            <Card padding="40px">
                <div style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-primary-dim)',
                    color: 'var(--color-primary)',
                    borderRadius: '16px',
                    marginBottom: '24px',
                    fontWeight: '800',
                    fontSize: '12px',
                    display: 'inline-block',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    Módulo em Desenvolvimento
                </div>

                <p style={{ color: 'var(--text-main)', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                    O módulo de Análise Trimestral de Vendas está sendo preparado para oferecer uma visão multidimensional de vendedores X clientes para a unidade <strong>{activeUnit === 'madville' ? 'Madville' : 'Curitiba'}</strong>.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '16px', margin: '16px 0 0' }}>
                    Esta funcionalidade permitirá comparar a evolução do mix de produtos e faturamento entre trimestres consecutivos, utilizando o novo motor de inteligência estratégica do ZCORE.
                </p>
            </Card>
        </PageContainer>
    );
};

export default QuarterlySalesAnalysis;
