import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    width = '500px',
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
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 5000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        animation: 'fadeIn var(--motion-base) var(--ease-standard) forwards',
    };

    const modalStyle = {
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        maxWidth: width,
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeInUp var(--motion-slow) var(--ease-decelerate) forwards',
        overflow: 'hidden',
    };

    const headerStyle = {
        padding: 'var(--space-4) var(--space-6)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    };

    const contentStyle = {
        padding: 'var(--space-6)',
        overflowY: 'auto',
        flex: 1,
    };

    const footerStyle = {
        padding: 'var(--space-4) var(--space-6)',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-elevated)',
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--space-3)',
    };

    return (
        <div style={overlayStyle} onClick={onClose} className="ui-modal-overlay">
            <div style={modalStyle} onClick={e => e.stopPropagation()} className="ui-modal">
                {(title || onClose) && (
                    <div style={headerStyle}>
                        {title && <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>{title}</h3>}
                        {onClose && (
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    padding: 'var(--space-1)',
                                    borderRadius: 'var(--radius-sm)',
                                    transition: 'background var(--motion-fast) var(--ease-standard), color var(--motion-fast) var(--ease-standard)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'var(--bg-hover)';
                                    e.currentTarget.style.color = 'var(--text-main)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                            >
                                <X size={20} />
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
