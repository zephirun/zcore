import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    className = '',
    fullWidth = false,
    isLoading = false,
    icon = null,
    ...props
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        border: 'none',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-main)',
        fontWeight: 'var(--font-semibold)',
        cursor: props.disabled || isLoading ? 'not-allowed' : 'pointer',
        letterSpacing: '-0.01em',
        width: fullWidth ? '100%' : 'auto',
        outline: 'none',
        opacity: props.disabled ? 0.5 : 1,
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        userSelect: 'none',
        flexShrink: 0,
    };

    const sizeStyles = {
        sm: {
            padding: '6px 12px',
            fontSize: 'var(--text-xs)',
            borderRadius: 'var(--radius-sm)',
            minHeight: '30px'
        },
        md: {
            padding: '8px 16px',
            fontSize: 'var(--text-sm)',
            minHeight: '36px'
        },
        lg: {
            padding: '10px 20px',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-lg)',
            minHeight: '44px'
        }
    };

    const variantStyles = {
        primary: {
            background: 'var(--btn-primary-bg, #6C63FF)',
            color: '#ffffff',
            border: '1px solid transparent',
        },
        secondary: {
            background: 'transparent',
            color: 'var(--text-main)',
            border: '1px solid var(--btn-secondary-border, var(--border-color))',
        },
        danger: {
            background: 'transparent',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error-border, var(--color-error))',
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-muted)',
            border: '1px solid transparent',
        }
    };

    const combinedStyle = {
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...(props.style || {})
    };

    return (
        <button
            style={combinedStyle}
            className={`ui-button ui-button-${variant} ${className}`}
            disabled={props.disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                    </svg>
                    Carregando...
                </span>
            ) : (
                <>
                    {icon && <span style={{ flexShrink: 0, display: 'flex' }}>{icon}</span>}
                    {children}
                </>
            )}
        </button>
    );
};

export default Button;
