import React from 'react';
import DataGrid from '../../components/ui/DataGrid';
import Badge from '../../components/ui/Badge';

export default {
    title: 'Data Components/DataGrid',
    component: DataGrid,
    parameters: {
        docs: {
            description: {
                component: 'Enterprise virtualization data grid capable of rendering 100k+ rows with smooth 60fps scrolling and zero lag.',
            },
        },
    },
    argTypes: {
        isLoading: { control: 'boolean' },
        height: { control: 'text' },
    },
};

const mockData = Array.from({ length: 1500 }).map((_, i) => ({
    id: `ORD-${1000 + i}`,
    date: `2024-02-${(i % 28 + 1).toString().padStart(2, '0')}`,
    customer: `Cliente ${i + 1} S.A.`,
    value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.random() * 10000),
    status: i % 3 === 0 ? 'approved' : i % 5 === 0 ? 'rejected' : 'pending',
}));

const mockColumns = [
    { key: 'id', label: 'Cód. Pedido', width: 120, sortable: true },
    { key: 'date', label: 'Data Movimento', width: 140, sortable: true },
    { key: 'customer', label: 'Razão Social', width: '2fr', sortable: true },
    { key: 'value', label: 'Valor Total', width: 150, align: 'right', sortable: true },
    {
        key: 'status',
        label: 'Status',
        width: 140,
        align: 'center',
        render: (row) => (
            <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'danger' : 'warning'}>
                {row.status === 'approved' ? 'Aprovado' : row.status === 'rejected' ? 'Cancelado' : 'Pendente'}
            </Badge>
        )
    },
];

const Template = (args) => (
    <div style={{ padding: '24px', background: 'var(--bg-main)' }}>
        <DataGrid {...args} />
    </div>
);

export const MassiveVirtualization = Template.bind({});
MassiveVirtualization.args = {
    columns: mockColumns,
    data: mockData,
    height: '600px',
    rowHeightMode: 'default'
};

export const LoadingState = Template.bind({});
LoadingState.args = {
    columns: mockColumns,
    data: [],
    isLoading: true,
    height: '600px'
};

export const EmptyState = Template.bind({});
EmptyState.args = {
    columns: mockColumns,
    data: [],
    isLoading: false,
    height: '600px',
    emptyMessage: 'Nenhum pedido atende aos filtros atuais.'
};
