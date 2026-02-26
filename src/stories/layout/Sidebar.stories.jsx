import React from 'react';
import Sidebar from '../../components/Sidebar';
import { BrowserRouter } from 'react-router-dom';

export default {
    title: 'Layout/Sidebar',
    component: Sidebar,
    parameters: {
        docs: {
            description: {
                component: 'Main navigational structure for ZCORE. Supports nested modules and fluid collapsed states for adaptive workspace density.',
            },
        },
    },
    decorators: [
        (Story) => (
            <div style={{ position: 'relative', width: '280px', height: '800px', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                <Story />
            </div>
        )
    ]
};

const Template = (args) => <Sidebar {...args} />;

export const Default = Template.bind({});
Default.args = {};

export const Collapsed = Template.bind({});
Collapsed.args = {
    // We can simulate state if we mapped it, but since it relies on internal context/state mostly, this is a visual representation 
};
