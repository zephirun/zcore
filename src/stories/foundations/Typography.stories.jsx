import React from 'react';

export default {
    title: 'Foundations/Typography',
    parameters: {
        docs: {
            description: {
                component: 'ZCORE Enterprise Typography scale rules, constrained mapping for maximum legibility in ERP interfaces.',
            },
        },
    },
};

const TypoSample = ({ label, token, sampleClass }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 1fr) 3fr', gap: '16px', borderBottom: '1px solid var(--border-subtle)', padding: '16px 0', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>{label}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: '4px', width: 'fit-content' }}>{token}</span>
        <span style={{ fontSize: `var(${token})`, color: 'var(--text-main)', fontWeight: sampleClass?.includes('bold') ? '600' : '400', fontFamily: 'var(--font-main)' }}>
            The quick brown fox jumps over the lazy dog.
        </span>
    </div>
);

export const TypographyScale = () => {
    return (
        <div style={{ fontFamily: 'var(--font-main)', maxWidth: '800px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>Typography System</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>Font Family: <code>var(--font-main)</code> (Inter / System Sans-Serif)</p>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(120px, 1fr) minmax(100px, 1fr) 3fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Role</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Variable</span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sample</span>
                </div>

                <TypoSample label="Display / 3XL" token="--text-3xl" sampleClass="bold" />
                <TypoSample label="Hero / 2XL" token="--text-2xl" sampleClass="bold" />
                <TypoSample label="Heading 1 / XL" token="--text-xl" sampleClass="bold" />
                <TypoSample label="Heading 2 / LG" token="--text-lg" sampleClass="bold" />
                <TypoSample label="Heading 3 / Base" token="--text-base" sampleClass="bold" />

                <TypoSample label="Body Normal / SM" token="--text-sm" />
                <TypoSample label="Body Compact / XS" token="--text-xs" />
                <TypoSample label="Caption / 2XS" token="--text-2xs" />
            </div>
        </div>
    );
};
