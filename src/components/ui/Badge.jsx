import React from 'react';

const Badge = ({
    children,
    variant = 'neutral', // neutral, success, warning, danger, info
    className = '',
    ...props
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: '11px',
        fontWeight: 'var(--font-semibold)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-main)',
    };

    const variantStyles = {
        neutral: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
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
        },
        info: {
            background: 'var(--bg-elevated)',
            color: 'var(--color-info)',
            border: '1px solid var(--border-color)',
        }
    };

    const combinedStyle = {
        ...baseStyle,
        ...variantStyles[variant],
        ...(props.style || {})
    };

    return (
        <span style={combinedStyle} className={`ui-badge ${className}`} {...props}>
            {children}
        </span>
    );
};

export default Badge;
