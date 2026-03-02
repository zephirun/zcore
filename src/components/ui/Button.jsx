import React from 'react';

const Button = ({
    children,
    variant = 'primary', // primary, secondary, danger, ghost
    size = 'md', // sm, md, lg
    className = '',
    fullWidth = false,
    isLoading = false,
    ...props
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        overflow: 'hidden'
    };

    const sizeStyles = {
        sm: {
            padding: '0 var(--density-padding-sm)',
            fontSize: 'var(--text-xs)',
            borderRadius: 'var(--radius-sm)',
            minHeight: 'calc(var(--density-input-height) * 0.75)'
        },
        md: {
            padding: '0 var(--density-padding-md)',
            fontSize: 'var(--text-sm)',
            minHeight: 'var(--density-input-height)'
        },
        lg: {
            padding: '0 var(--density-padding-md)',
            fontSize: 'var(--text-base)',
            borderRadius: 'var(--radius-lg)',
            minHeight: 'calc(var(--density-input-height) * 1.25)'
        }
    };

    const variantStyles = {
        primary: {
            background: 'var(--color-accent)', // Fiori Active/Action Brand Color
            color: '#ffffff',
            boxShadow: 'var(--shadow-sm)'
        },
        secondary: {
            background: 'transparent',
            color: 'var(--color-accent)', // Fiori secondary often uses action color for text and border
            border: '1px solid var(--color-accent)',
        },
        danger: {
            background: 'var(--color-error)',
            color: '#ffffff',
            boxShadow: 'var(--shadow-sm)'
        },
        ghost: {
            background: 'transparent',
            color: 'var(--text-main)',
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
                <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <svg className="animate-spin" style={{ width: 'var(--space-4)', height: 'var(--space-4)', animation: 'spin 1s linear infinite' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                    </svg>
                    Carregando...
                </span>
            ) : children}
        </button>
    );
};

export default Button;
