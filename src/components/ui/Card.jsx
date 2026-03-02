import React from 'react';
import Skeleton from './Skeleton';

const Card = ({
    children,
    className = '',
    padding = 'var(--density-card-padding)',
    noBorder = false,
    hoverEffect = false,
    isLoading = false,
    ...props
}) => {
    const cardStyle = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        border: noBorder ? 'none' : '1px solid var(--border-color)',
        padding: padding,
        boxShadow: 'var(--shadow-sm)',
        transition: hoverEffect ? 'transform var(--motion-slow), box-shadow var(--motion-slow)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        ...(props.style || {})
    };

    if (isLoading) {
        return (
            <div style={cardStyle} className={`ui-card ${className}`} {...props}>
                <Skeleton variant="card" />
            </div>
        );
    }

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
