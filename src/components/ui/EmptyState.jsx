import React from 'react';

const EmptyState = ({
    icon,
    title,
    description,
    action,
    className = '',
    style = {}
}) => {
    return (
        <div
            className={`ui-empty-state ${className}`}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-12) var(--space-6)',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: 'var(--space-4)',
                border: '1px dashed var(--border-color)',
                color: 'var(--text-secondary)',
                ...style
            }}
        >
            {icon && (
                <div style={{
                    marginBottom: 'var(--space-4)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 'var(--space-16)',
                    height: 'var(--space-16)',
                    borderRadius: '50%',
                    background: 'var(--bg-input)'
                }}>
                    {icon}
                </div>
            )}

            <h3 style={{
                margin: '0 0 8px 0',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-main)'
            }}>
                {title}
            </h3>

            {description && (
                <p style={{
                    margin: '0',
                    fontSize: 'var(--text-base)',
                    lineHeight: '1.5',
                    maxWidth: '400px'
                }}>
                    {description}
                </p>
            )}

            {action && (
                <div style={{ marginTop: 'var(--space-6)' }}>
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
