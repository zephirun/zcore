import React from 'react';

const Card = ({
    children,
    className = '',
    padding = 'var(--space-6)',
    noBorder = false,
    hoverEffect = false,
    ...props
}) => {
    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: noBorder ? 'none' : '1px solid var(--border-color)',
        padding: padding,
        boxShadow: 'var(--shadow-sm)',
        transition: hoverEffect ? 'transform 0.2s, box-shadow 0.2s' : 'none',
        display: 'flex',
        flexDirection: 'column',
        ...(props.style || {})
    };

    return (
        <div
            style={cardStyle}
            className={`ui-card ${className}`}
            onMouseEnter={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
            }}
            onMouseLeave={(e) => {
                if (hoverEffect) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
