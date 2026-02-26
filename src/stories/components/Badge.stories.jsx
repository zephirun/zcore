import React from 'react';
import Badge from '../../components/ui/Badge';

export default {
    title: 'UI Base/Badge',
    component: Badge,
    parameters: {
        docs: {
            description: {
                component: 'Small status indicator used to highlight tags, states, or priorities within tables and cards.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['success', 'warning', 'danger', 'info', 'neutral'],
        },
        children: {
            control: 'text',
        },
    },
};

const Template = (args) => <Badge {...args} />;

export const Neutral = Template.bind({});
Neutral.args = {
    variant: 'neutral',
    children: 'Rascunho',
};

export const Success = Template.bind({});
Success.args = {
    variant: 'success',
    children: 'Aprovado',
};

export const Warning = Template.bind({});
Warning.args = {
    variant: 'warning',
    children: 'Pendente',
};

export const Danger = Template.bind({});
Danger.args = {
    variant: 'danger',
    children: 'Cancelado',
};

export const Info = Template.bind({});
Info.args = {
    variant: 'info',
    children: 'Em Análise',
};
