import React from 'react';

const FormField = ({
    label,
    error,
    hint,
    required = false,
    children,
    className = '',
    style = {}
}) => {
    return (
        <div className={`ui-form-field ${className}`} style={{ width: '100%', marginBottom: 'var(--space-4)', ...style }}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '4px' }}>
                    <label style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        letterSpacing: '-0.01em'
                    }}>
                        {label}
                    </label>
                    {required && (
                        <span style={{ color: 'var(--color-error)', fontSize: '14px', lineHeight: 1 }} aria-hidden="true">*</span>
                    )}
                </div>
            )}

            <div className={`ui-form-control-wrapper ${error ? 'has-error' : ''}`}>
                {/* We clone the child to pass down the error state for styling its border if needed */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            hasError: !!error,
                            ...(error ? { 'aria-invalid': 'true' } : {})
                        });
                    }
                    return child;
                })}
            </div>

            {error && (
                <div
                    className="ui-form-error"
                    role="alert"
                    aria-live="polite"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'var(--color-error)',
                        animation: 'fadeInUp 0.15s ease-out forwards'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <span>{error.message || error}</span>
                </div>
            )}

            {hint && !error && (
                <div
                    className="ui-form-hint"
                    style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                    }}
                >
                    {hint}
                </div>
            )}
        </div>
    );
};

export default FormField;
