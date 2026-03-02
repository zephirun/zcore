import React from 'react';

const FormSection = ({ title, description, children, style = {}, className = '' }) => {
    return (
        <div
            className={`ui-form-section ${className}`}
            style={{
                marginBottom: 'var(--space-8)',
                paddingBottom: 'var(--space-8)',
                borderBottom: '1px solid var(--border-color)',
                ...style
            }}
        >
            <div style={{ marginBottom: 'var(--space-5)' }}>
                {title && (
                    <h3 style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-bold)',
                        color: 'var(--text-main)',
                        margin: '0 0 var(--space-1) 0',
                        letterSpacing: '-0.02em'
                    }}>
                        {title}
                    </h3>
                )}
                {description && (
                    <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                        margin: 0,
                        lineHeight: 1.5
                    }}>
                        {description}
                    </p>
                )}
            </div>

            {/* The main content area for form fields */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
            }}>
                {children}
            </div>
        </div>
    );
};

export default FormSection;
