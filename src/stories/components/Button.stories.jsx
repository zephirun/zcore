import React from 'react';
import Button from '../../components/ui/Button';
import { DownloadCloud, Trash2 } from 'lucide-react';

export default {
    title: 'UI Base/Button',
    component: Button,
    parameters: {
        docs: {
            description: {
                component: 'The core interactive element for the ZCORE ERP. Triggers business logic and navigates user flows. Ensure to adhere to the hierarchy of primary -> secondary -> ghost.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['primary', 'secondary', 'danger', 'ghost'],
            description: 'The visual style defining hierarchy and intent.',
        },
        size: {
            control: { type: 'radio' },
            options: ['sm', 'md', 'lg'],
            description: 'The size of the button, adhering to density rules.',
        },
        fullWidth: {
            control: 'boolean',
            description: 'Spans the full width of the parent container.',
        },
        isLoading: {
            control: 'boolean',
            description: 'Disables interaction and shows a spinner icon.',
        },
        disabled: {
            control: 'boolean',
            description: 'Natively disables the button element.',
        },
        onClick: { action: 'clicked' },
    },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
    variant: 'primary',
    size: 'md',
    children: 'Confirmar Requisição',
};

export const Secondary = Template.bind({});
Secondary.args = {
    variant: 'secondary',
    size: 'md',
    children: 'Cancelar',
};

export const Danger = Template.bind({});
Danger.args = {
    variant: 'danger',
    size: 'md',
    children: 'Excluir Registro',
};

export const Ghost = Template.bind({});
Ghost.args = {
    variant: 'ghost',
    size: 'md',
    children: 'Limpar Filtros',
};

export const WithIcons = (args) => (
    <div style={{ display: 'flex', gap: '16px' }}>
        <Button variant="primary" {...args}>
            <DownloadCloud size={16} style={{ marginRight: '8px' }} />
            Exportar CSV
        </Button>
        <Button variant="danger" {...args}>
            <Trash2 size={16} />
        </Button>
    </div>
);

export const LoadingState = Template.bind({});
LoadingState.args = {
    variant: 'primary',
    size: 'md',
    isLoading: true,
    children: 'Processando',
};

export const Sizes = () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Button size="sm" variant="secondary">Small (sm)</Button>
        <Button size="md" variant="primary">Medium (md)</Button>
        <Button size="lg" variant="primary">Large (lg)</Button>
    </div>
);
