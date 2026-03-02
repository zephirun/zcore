import React from 'react';

const Skeleton = ({
    variant = 'default', // 'default', 'table', 'card', 'form'
    className = '',
    width,
    height,
    borderRadius = 'var(--radius-sm)',
    style = {},
    ...props
}) => {

    // --- Preset Sizes and Layouts based on variant ---

    if (variant === 'table') {
        return (
            <div className={`ui-skeleton-table ${className}`} style={{ width: width || '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', ...style }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="ui-skeleton" style={{ height: 'var(--space-10)', borderRadius, width: '100%' }} />
                ))}
            </div>
        );
    }

    if (variant === 'card') {
        return (
            <div className={`ui-skeleton-card ${className}`} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                width: width || '100%',
                ...style
            }}>
                <div className="ui-skeleton" style={{ height: 'var(--space-6)', width: '40%', marginBottom: 'var(--space-4)', borderRadius: 'var(--space-1)' }} />
                <div className="ui-skeleton" style={{ height: '14px', width: '100%', marginBottom: 'var(--space-2)', borderRadius: 'var(--space-1)' }} />
                <div className="ui-skeleton" style={{ height: '14px', width: '80%', marginBottom: 'var(--space-2)', borderRadius: 'var(--space-1)' }} />
                <div className="ui-skeleton" style={{ height: '14px', width: '60%', borderRadius: 'var(--space-1)' }} />
            </div>
        );
    }

    if (variant === 'form') {
        return (
            <div className={`ui-skeleton-form ${className}`} style={{ width: width || '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', ...style }}>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        <div className="ui-skeleton" style={{ height: '14px', width: '30%', borderRadius: 'var(--space-1)' }} />
                        <div className="ui-skeleton" style={{ height: 'var(--space-10)', width: '100%', borderRadius: 'var(--space-1)' }} />
                    </div>
                ))}
            </div>
        );
    }

    // Default generic skeleton block
    return (
        <div
            className={`ui-skeleton ${className}`}
            style={{
                width: width || '100%',
                height: height || 'var(--space-5)',
                borderRadius,
                ...style
            }}
            {...props}
        />
    );
};

export default Skeleton;
