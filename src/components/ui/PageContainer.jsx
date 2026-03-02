import React from 'react';

const PageContainer = ({
    children,
    title,
    subtitle,
    actions,
    maxWidth = '1200px',
    className = '',
    isLoading = false,
    ...props
}) => {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: maxWidth,
                margin: '0 auto',
                padding: 'var(--space-6) var(--space-4)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-6)',
                ...(props.style || {})
            }}
            className={`ui-page-container ${className}`}
            {...props}
        >
            {/* Page Header */}
            {(title || actions) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
                    <div>
                        {title && (
                            <h1 style={{
                                fontSize: 'var(--text-3xl)',
                                fontWeight: 'var(--font-extrabold)',
                                letterSpacing: '-0.03em',
                                color: 'var(--text-main)',
                                margin: 0,
                                marginBottom: subtitle ? 'var(--space-1)' : 0
                            }}>
                                {title}
                            </h1>
                        )}
                        {subtitle && (
                            <p style={{
                                fontSize: 'var(--text-sm)',
                                color: 'var(--text-muted)',
                                margin: 0
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {actions && (
                        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                            {actions}
                        </div>
                    )}
                </div>
            )}

            {/* Page Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {isLoading ? (
                    <div className="ui-page-skeleton" style={{ padding: 'var(--space-4)', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)' }}>
                        <div className="ui-skeleton" style={{ height: 'var(--space-8)', width: '30%', marginBottom: 'var(--space-6)', borderRadius: 'var(--radius-sm)' }} />
                        <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                            <div className="ui-skeleton" style={{ height: '120px', flex: 1, borderRadius: 'var(--radius-sm)' }} />
                            <div className="ui-skeleton" style={{ height: '120px', flex: 1, borderRadius: 'var(--radius-sm)' }} />
                            <div className="ui-skeleton" style={{ height: '120px', flex: 1, borderRadius: 'var(--radius-sm)' }} />
                        </div>
                        <div className="ui-skeleton" style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-sm)' }} />
                    </div>
                ) : (
                    children
                )}
            </div>
        </div>
    );
};

export default PageContainer;
