import React from 'react';
import { useNavigate } from 'react-router-dom';

const ModulePanel = ({ category, onBack }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            animation: 'slideIn 0.3s ease-out',
            width: '100%'
        }}>
            <style>
                {`
                    @keyframes slideIn {
                        from {
                            opacity: 0;
                            transform: translateX(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateX(0);
                        }
                    }
                `}
            </style>

            {/* Header with Category Info */}
            <div style={{
                background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                borderRadius: '10px',
                padding: '20px',
                marginBottom: '20px',
                border: `2px solid ${category.color}30`
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'white',
                        border: `1px solid ${category.color}30`,
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: category.color,
                        marginBottom: '16px',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = category.bgColor;
                        e.currentTarget.style.transform = 'translateX(-4px)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    VOLTAR
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: category.bgColor,
                        color: category.color,
                        width: '56px',
                        height: '56px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {category.icon}
                    </div>
                    <div>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: category.color,
                            marginBottom: '6px',
                            letterSpacing: '0.5px'
                        }}>
                            {category.name}
                        </h2>
                        <p style={{
                            fontSize: '13px',
                            color: '#666',
                            margin: 0
                        }}>
                            {category.description}
                        </p>
                        <div style={{
                            display: 'inline-block',
                            background: 'white',
                            padding: '3px 10px',
                            borderRadius: '16px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: category.color,
                            marginTop: '10px',
                            border: `1px solid ${category.color}30`
                        }}>
                            {category.modules.length} {category.modules.length === 1 ? 'Módulo' : 'Módulos'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px'
            }}>
                {category.modules.map(module => {
                    const isExternalLink = module.path.startsWith('http://') || module.path.startsWith('https://');

                    return (
                        <div
                            key={module.id}
                            onClick={() => {
                                if (module.path === '#') return;
                                if (isExternalLink) {
                                    window.open(module.path, '_blank', 'noopener,noreferrer');
                                } else {
                                    navigate(module.path);
                                }
                            }}
                            style={{
                                border: '1px solid #eee',
                                borderRadius: '6px',
                                padding: '18px',
                                cursor: module.path !== '#' ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                background: 'white',
                                gap: '16px',
                                position: 'relative',
                                overflow: 'hidden',
                                opacity: module.path === '#' ? 0.6 : 1
                            }}
                            onMouseEnter={e => {
                                if (module.path !== '#') {
                                    e.currentTarget.style.borderColor = category.color;
                                    e.currentTarget.style.boxShadow = `0 4px 15px ${category.color}20`;
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.borderColor = '#eee';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            {module.path === '#' && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: '0',
                                    background: '#ffa726',
                                    color: 'white',
                                    fontSize: '10px',
                                    fontWeight: '700',
                                    textTransform: 'uppercase',
                                    padding: '4px 10px',
                                    borderBottomLeftRadius: '8px',
                                    letterSpacing: '0.5px'
                                }}>
                                    Em Breve
                                </div>
                            )}

                            <div style={{
                                background: category.bgColor,
                                color: category.color,
                                width: '48px',
                                height: '48px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                {module.icon}
                            </div>

                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '15px',
                                    fontWeight: '700',
                                    color: '#333',
                                    marginBottom: '6px'
                                }}>
                                    {module.title}
                                </h3>
                                <div style={{
                                    fontSize: '11px',
                                    color: '#777',
                                    marginBottom: '12px',
                                    lineHeight: '1.4'
                                }}>
                                    {module.subtitle}
                                </div>

                                {module.path !== '#' && (
                                    <span style={{
                                        fontSize: '12px',
                                        color: category.color,
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        textTransform: 'uppercase'
                                    }}>
                                        Acessar
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <polyline points="9 18 15 12 9 6"></polyline>
                                        </svg>
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ModulePanel;
