import React from 'react';
import Card from '../../components/ui/Card';

export default {
    title: 'Layout/Card',
    component: Card,
    parameters: {
        docs: {
            description: {
                component: 'Primary container for grouping related content, forms, or data blocks. Uses native adaptive density for paddings.',
            },
        },
    },
    argTypes: {
        title: { control: 'text' },
        subtitle: { control: 'text' },
        noPadding: { control: 'boolean' },
    },
};

const Template = (args) => (
    <Card {...args}>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            This is the content inside the card. It automatically respects the --density-card-padding variable.
        </div>
    </Card>
);

export const Default = Template.bind({});
Default.args = {
    title: 'Informações do Cliente',
    subtitle: 'Dados de faturamento e endereço',
};

export const NoPadding = Template.bind({});
NoPadding.args = {
    title: 'Lista de Pedidos Recentes',
    noPadding: true,
};
