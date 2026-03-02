import React from 'react';

const Alert = ({
    title,
    children,
    variant = 'info', // info, success, warning, danger
    className = '',
    ...props
}) => {
    const baseStyle = {
        padding: 'var(--space-3) var(--space-4)',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-main)',
        fontSize: 'var(--text-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
    };

    const variantStyles = {
        info: {
            background: 'var(--bg-elevated)',
            color: 'var(--color-info)',
            border: '1px solid var(--border-color)',
        },
        success: {
            background: 'var(--bg-elevated)',
            color: 'var(--color-success)',
            border: '1px solid var(--border-color)',
        },
        warning: {
            background: 'var(--bg-elevated)',
            color: 'var(--color-warning)',
            border: '1px solid var(--border-color)',
        },
        danger: {
            background: 'var(--bg-elevated)',
            color: 'var(--color-error)',
            border: '1px solid var(--border-color)',
        }
    };

    const combinedStyle = {
        ...baseStyle,
        ...variantStyles[variant],
        ...(props.style || {})
    };

    return (
        <div style={combinedStyle} className={`ui-alert ${className}`} {...props}>
            {title && (
                <span style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>
                    {title}
                </span>
            )}
            {children && (
                <span style={{ color: 'var(--text-muted)' }}>
                    {children}
                </span>
            )}
        </div>
    );
};

export default Alert;
