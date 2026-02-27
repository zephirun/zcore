import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    width = '520px',
    ...props
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn 150ms var(--ease-decelerate) forwards',
    };

    const modalStyle = {
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'modalEnter 200ms var(--ease-decelerate) forwards',
        overflow: 'hidden',
    };

    const headerStyle = {
        padding: '20px 24px 16px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '12px',
    };

    const contentStyle = {
        padding: 'var(--space-6)',
        overflowY: 'auto',
        flex: 1,
    };

    const footerStyle = {
        padding: '16px 24px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-card)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--space-3)',
    };

    return (
        <div style={overlayStyle} onClick={onClose} className="ui-modal-overlay">
            <div style={modalStyle} onClick={e => e.stopPropagation()} className="ui-modal">
                {(title || onClose) && (
                    <div style={headerStyle}>
                        <div>
                            {title && (
                                <h3 style={{
                                    margin: 0,
                                    fontSize: 'var(--text-base)',
                                    fontWeight: 600,
                                    color: 'var(--text-main)',
                                    letterSpacing: '-0.02em',
                                    lineHeight: '1.3'
                                }}>
                                    {title}
                                </h3>
                            )}
                            {subtitle && (
                                <p style={{
                                    margin: '4px 0 0',
                                    fontSize: 'var(--text-xs)',
                                    color: 'var(--text-muted)',
                                    lineHeight: '1.4'
                                }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        {onClose && (
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    padding: '4px',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'all var(--motion-fast) var(--ease-standard)',
                                    flexShrink: 0
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.borderColor = 'var(--border-input)';
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}

                <div style={contentStyle}>
                    {children}
                </div>

                {footer && (
                    <div style={footerStyle}>
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Modal;
