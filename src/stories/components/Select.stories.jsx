import React from 'react';
import Select from '../../components/ui/Select';

export default {
    title: 'UI Base/Select',
    component: Select,
    parameters: {
        docs: {
            description: {
                component: 'Standard select dropdown for native browser option picking. Uses standard ZCORE padding and error states.',
            },
        },
    },
    argTypes: {
        label: { control: 'text' },
        hint: { control: 'text' },
        error: { control: 'text' },
        required: { control: 'boolean' },
        disabled: { control: 'boolean' },
    },
};

const Template = (args) => <Select {...args} />;

export const Default = Template.bind({});
Default.args = {
    label: 'Status do Pedido',
    options: [
        { value: '', label: 'Selecione um status...' },
        { value: 'pending', label: 'Pendente' },
        { value: 'approved', label: 'Aprovado' },
        { value: 'rejected', label: 'Rejeitado' },
    ],
    fullWidth: false,
};

export const RequiredWithError = Template.bind({});
RequiredWithError.args = {
    label: 'Filial Destino',
    required: true,
    error: 'É obrigatório selecionar uma filial antes de avançar.',
    options: [
        { value: '', label: 'Selecione a filial' },
        { value: 'cba', label: 'Curitiba (PR)' },
        { value: 'spo', label: 'São Paulo (SP)' },
    ],
    fullWidth: false,
};
