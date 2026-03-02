import React, { useId } from 'react';

const FormField = ({
    label,
    error,
    hint,
    success,
    required = false,
    children,
    className = '',
    style = {}
}) => {
    const generatedId = useId();
    // Use the ID from children if available (assume first valid child)
    const assignedId = React.Children.toArray(children).find(c => React.isValidElement(c) && c.props.id)?.props.id || generatedId;

    return (
        <div className={`ui-form-field ${className}`} style={{ width: '100%', marginBottom: 'var(--space-2)', ...style }}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--space-2)', gap: 'var(--space-1)' }}>
                    <label
                        htmlFor={assignedId}
                        style={{
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--text-main)',
                            letterSpacing: '-0.01em',
                            cursor: 'pointer'
                        }}>
                        {label}
                    </label>
                    {required && (
                        <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-base)', lineHeight: 1 }} aria-hidden="true">*</span>
                    )}
                </div>
            )}

            <div className={`ui-form-control-wrapper ${error ? 'has-error' : ''}`}>
                {/* We clone the child to pass down the error state and accessibility IDs */}
                {React.Children.map(children, child => {
                    if (React.isValidElement(child)) {
                        return React.cloneElement(child, {
                            id: child.props.id || assignedId,
                            hasError: !!error,
                            isSuccess: !!success,
                            ...(error ? { 'aria-invalid': 'true' } : {})
                        });
                    }
                    return child;
                })}
            </div>

            {/* Reserved space to prevent layout shift: min-height 24px */}
            <div style={{ minHeight: 'var(--space-6)', marginTop: 'var(--space-1)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                {error ? (
                    <div
                        className="ui-form-error"
                        role="alert"
                        aria-live="polite"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            marginTop: '6px',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-error)',
                            animation: 'fadeInUp var(--motion-base) ease-out forwards'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="8" x2="12" y2="12"></line>
                            <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>{error.message || error}</span>
                    </div>
                ) : success && typeof success === 'string' ? (
                    <div
                        className="ui-form-success"
                        role="alert"
                        aria-live="polite"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-medium)',
                            color: 'var(--color-success)',
                            animation: 'fadeInUp var(--motion-base) ease-out forwards'
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span>{success}</span>
                    </div>
                ) : hint ? (
                    <div
                        className="ui-form-hint"
                        style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--text-muted)'
                        }}
                    >
                        {hint}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default FormField;
