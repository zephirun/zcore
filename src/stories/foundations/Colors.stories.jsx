import React from 'react';

export default {
    title: 'Foundations/Colors',
    parameters: {
        docs: {
            description: {
                component: 'ZCORE Enterprise Color System. These design tokens ensure systematic application of colors in light and dark modes.',
            },
        },
    },
};

const ColorSwatch = ({ name, hexVar }) => (
    <div style={{ display: 'flex', flexDirection: 'column', width: '120px', marginBottom: '24px' }}>
        <div style={{
            height: '80px',
            backgroundColor: `var(${hexVar})`,
            borderRadius: '8px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
            marginBottom: '8px',
            transition: 'all 0.2s ease'
        }} />
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{name}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{hexVar}</span>
    </div>
);

const ColorGroup = ({ title, colors }) => (
    <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {colors.map(color => <ColorSwatch key={color.hexVar} {...color} />)}
        </div>
    </div>
);

export const ColorTokens = () => {
    return (
        <div style={{ fontFamily: 'var(--font-main)' }}>
            <ColorGroup
                title="Primary Interaction Scale"
                colors={[
                    { name: 'Primary Core', hexVar: '--color-primary' },
                    { name: 'Primary Dim (Hover)', hexVar: '--color-primary-dim' },
                    { name: 'Accent Layer', hexVar: '--color-accent' },
                ]}
            />

            <ColorGroup
                title="Surface & Backgrounds"
                colors={[
                    { name: 'Main Canvas', hexVar: '--bg-main' },
                    { name: 'Card Surface', hexVar: '--bg-card' },
                    { name: 'Elevated (Modals)', hexVar: '--bg-elevated' },
                    { name: 'Input Fields', hexVar: '--bg-input' },
                    { name: 'Hover State', hexVar: '--bg-hover' },
                ]}
            />

            <ColorGroup
                title="Typography Colors"
                colors={[
                    { name: 'Main Text', hexVar: '--text-main' },
                    { name: 'Muted Text', hexVar: '--text-muted' },
                    { name: 'Light/Inverted Text', hexVar: '--text-light' },
                ]}
            />

            <ColorGroup
                title="Borders & Dividers"
                colors={[
                    { name: 'Standard Border', hexVar: '--border-color' },
                    { name: 'Input Border', hexVar: '--border-input' },
                    { name: 'Subtle Divider', hexVar: '--border-subtle' },
                ]}
            />

            <ColorGroup
                title="Semantic Feedback"
                colors={[
                    { name: 'Success', hexVar: '--color-success' },
                    { name: 'Warning', hexVar: '--color-warning' },
                    { name: 'Error / Danger', hexVar: '--color-error' },
                    { name: 'Info', hexVar: '--color-info' },
                ]}
            />
        </div>
    );
};
