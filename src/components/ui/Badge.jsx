import React from 'react';

/**
 * Badge — Status indicator chip with semantic color variants.
 * Variants: neutral, success, warning, danger, info, accent
 */
const Badge = ({
    children,
    variant = 'neutral',
    size = 'sm', // sm | md
    dot = false, // Show a dot indicator
    className = '',
    ...props
}) => {
    const baseStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: size === 'md' ? '3px 10px' : '2px 8px',
        borderRadius: 'var(--radius-full)',
        fontSize: size === 'md' ? '12px' : '11px',
        fontWeight: 600,
        letterSpacing: '0.04em',
        fontFamily: 'var(--font-main)',
        whiteSpace: 'nowrap',
        lineHeight: '1.4',
    };

    const variantStyles = {
        neutral: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-color)',
        },
        success: {
            background: 'var(--color-success-bg, rgba(0,212,170,0.12))',
            color: 'var(--color-success)',
            border: '1px solid var(--color-success-border, rgba(0,212,170,0.2))',
        },
        warning: {
            background: 'var(--color-warning-bg, rgba(255,181,71,0.12))',
            color: 'var(--color-warning)',
            border: '1px solid var(--color-warning-border, rgba(255,181,71,0.2))',
        },
        danger: {
            background: 'var(--color-error-bg, rgba(255,77,106,0.12))',
            color: 'var(--color-error)',
            border: '1px solid var(--color-error-border, rgba(255,77,106,0.2))',
        },
        info: {
            background: 'var(--color-info-bg, rgba(59,158,255,0.12))',
            color: 'var(--color-info)',
            border: '1px solid var(--color-info-border, rgba(59,158,255,0.2))',
        },
        accent: {
            background: 'var(--color-accent-dim, rgba(108,99,255,0.12))',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-accent-glow, rgba(108,99,255,0.2))',
        },
    };

    const dotColors = {
        neutral: 'var(--text-muted)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-error)',
        info: 'var(--color-info)',
        accent: 'var(--color-accent)',
    };

    const combinedStyle = {
        ...baseStyle,
        ...variantStyles[variant],
        ...(props.style || {})
    };

    return (
        <span style={combinedStyle} className={`ui-badge ui-badge-${variant} ${className}`} {...props}>
            {dot && (
                <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: dotColors[variant] || dotColors.neutral,
                    flexShrink: 0,
                }} />
            )}
            {children}
        </span>
    );
};

export default Badge;
