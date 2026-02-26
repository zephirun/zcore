import React from 'react';
import Skeleton from '../../components/ui/Skeleton';

export default {
    title: 'Data Components/Skeleton',
    component: Skeleton,
    parameters: {
        docs: {
            description: {
                component: 'Loading placeholder optimized with CSS hardware-accelerated shimmering animations.',
            },
        },
    },
    argTypes: {
        variant: {
            control: { type: 'select' },
            options: ['text', 'circular', 'rectangular', 'table', 'card', 'form'],
            description: 'Semantic variant for layout loading.',
        },
        width: { control: 'text' },
        height: { control: 'text' },
        borderRadius: { control: 'text' },
    },
};

const Template = (args) => <Skeleton {...args} />;

export const DefaultRectangular = Template.bind({});
DefaultRectangular.args = {
    variant: 'rectangular',
    width: '100%',
    height: '40px',
};

export const TextLine = Template.bind({});
TextLine.args = {
    variant: 'text',
    width: '80%',
};

export const CircularAvatar = Template.bind({});
CircularAvatar.args = {
    variant: 'circular',
    width: '64px',
    height: '64px',
};

export const TableLoading = Template.bind({});
TableLoading.args = {
    variant: 'table',
};

export const FormLoading = Template.bind({});
FormLoading.args = {
    variant: 'form',
};

export const CardLoading = Template.bind({});
CardLoading.args = {
    variant: 'card',
};
