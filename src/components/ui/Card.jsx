import React from 'react';

/**
 * Card — Premium surface container with optional hover elevation effect.
 */
const Card = ({
    children,
    className = '',
    padding = 'var(--density-card-padding, var(--space-6))',
    noBorder = false,
    hoverEffect = false,
    accentBorder = false, // Purple accent border on hover
    ...props
}) => {
    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: noBorder ? 'none' : `1px solid ${accentBorder ? 'var(--color-accent-glow)' : 'var(--border-color)'}`,
        padding: padding,
        boxShadow: 'var(--shadow-sm)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        ...(props.style || {})
    };

    return (
        <div
            style={cardStyle}
            className={`ui-card ${hoverEffect ? 'card-elevated-hover' : ''} ${className}`}
            onMouseEnter={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.borderColor = 'var(--border-input)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35), 0 0 0 1px var(--color-accent-glow)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                }
            }}
            onMouseLeave={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.borderColor = accentBorder ? 'var(--color-accent-glow)' : 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
