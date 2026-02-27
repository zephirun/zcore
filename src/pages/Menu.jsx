import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';
import { Grid } from 'lucide-react';


// Derive icon palette from the category's own color (same source as sidebar)
const hexToRgba = (hex, alpha) => {
    const h = (hex || '#7C6EF8').replace('#', '');
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
};

const getPalette = (cat) => {
    if (!cat?.color) return { bg: 'rgba(124,110,248,0.12)', color: '#7C6EF8' };
    return { color: cat.color, bg: hexToRgba(cat.color, 0.12) };
};

const Menu = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name } = useData();
    const [activeCategory, setActiveCategory] = useState(
        searchParams.get('category') || categories[0]?.id
    );

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
        setSearchParams({ category: id });
    };

    const visibleCategories = categories.filter(cat => {
        if (cat.hidden) return false;
        return allModules.some(m =>
            m.category === cat.id &&
            (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)))
        );
    });

    const currentModules = allModules.filter(m =>
        m.category === activeCategory &&
        (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)))
    );

    const firstName = name ? name.split(' ')[0] : 'Usuário';
    const getGreeting = () => {
        const h = new Date().getHours();
        if (h >= 5 && h < 12) return 'Bom dia';
        if (h >= 12 && h < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    const activeCat = categories.find(c => c.id === activeCategory);
    const activePalette = getPalette(activeCat);

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: 'var(--font-main)',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
        }}>
            <style>{`
                .greeting-gradient {
                    /* Dark mode: electric gradient text */
                    background: linear-gradient(135deg, var(--text-primary, #EEEEF5) 0%, var(--text-accent, #A89EFF) 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                /* Light mode: solid dark text — gradient is invisible on light bg */
                :root:not([data-theme='dark']) .greeting-gradient {
                    background: none !important;
                    -webkit-text-fill-color: var(--text-main) !important;
                    color: var(--text-main);
                }


                .cat-pill-active {
                    background: var(--mod-bg) !important;
                    border-color: var(--mod-color) !important;
                    color: var(--mod-color) !important;
                    font-weight: 700 !important;
                    box-shadow: 0 0 10px color-mix(in srgb, var(--mod-color) 25%, transparent) !important;
                }

                .cat-pill:hover:not(.cat-pill-active) {
                    border-color: var(--border-strong, var(--border-input)) !important;
                    color: var(--text-primary, var(--text-main)) !important;
                    background: var(--bg-elevated, var(--bg-elevated)) !important;
                }

                .mod-card-wrap {
                    position: relative;
                    border-radius: 14px;
                    min-height: 80px;
                    cursor: pointer;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 18px 20px;
                    background: var(--bg-surface, var(--bg-card));
                    border: 1px solid var(--border-subtle, var(--border-color));
                    transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
                }
                .mod-card-wrap::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
                    pointer-events: none;
                }
                .mod-card-wrap:hover {
                    border-color: var(--border-strong, var(--border-input)) !important;
                    background: var(--bg-elevated) !important;
                    transform: translateY(-1px);
                    box-shadow: var(--shadow-md);
                }
                .mod-card-wrap.cs-card {
                    opacity: 0.45;
                    cursor: not-allowed;
                }
                .mod-card-wrap.cs-card:hover {
                    transform: none !important;
                    box-shadow: none !important;
                    border-color: var(--border-subtle, var(--border-color)) !important;
                    background: var(--bg-surface, var(--bg-card)) !important;
                }

                /* Light mode overrides */
                :root:not([data-theme='dark']) .mod-card-wrap {
                    background: #FFFFFF !important;
                    border: 1px solid #E8E8F0 !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                }
                :root:not([data-theme='dark']) .mod-card-wrap:hover {
                    border-color: #C8C8D8 !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important;
                }
                :root:not([data-theme='dark']) .sidebar-container {
                    background: #FFFFFF !important;
                    border-right: 1px solid #E8E8F0 !important;
                }
                :root:not([data-theme='dark']) .header-container {
                    background: rgba(255,255,255,0.88) !important;
                    backdrop-filter: blur(20px) !important;
                    -webkit-backdrop-filter: blur(20px) !important;
                    border-bottom: 1px solid #E8E8F0 !important;
                    box-shadow: 0 1px 0 rgba(0,0,0,0.04) !important;
                }
                :root:not([data-theme='dark']) body,
                :root:not([data-theme='dark']) #root {
                    background-color: #F4F4F8 !important;
                }
            `}</style>

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '28px 24px 48px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
            }}>
                {/* ── GREETING ─────────────────────────────────── */}
                <div style={{ animation: 'fadeSlideIn 280ms ease forwards' }}>
                    <h1 className="greeting-gradient" style={{
                        fontSize: '26px',
                        fontWeight: 800,
                        margin: '0 0 6px 0',
                        letterSpacing: '-0.5px',
                        lineHeight: '1.2',
                    }}>
                        {getGreeting()}, {firstName}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary, var(--text-muted))',
                        margin: 0,
                        letterSpacing: '-0.01em',
                    }}>
                        O que você deseja acessar hoje?
                    </p>
                </div>

                {/* ── MODULES SECTION ──────────────────────────── */}
                <div>
                    {/* Section label */}
                    <div className="section-label" style={{ marginBottom: '14px' }}>
                        <Grid size={11} style={{ color: 'var(--text-tertiary, var(--text-muted))' }} />
                        Módulos Disponíveis
                    </div>

                    {/* Category filter pills */}
                    <div
                        className="hide-scrollbar"
                        style={{
                            display: 'flex',
                            gap: '6px',
                            paddingBottom: '16px',
                            overflowX: 'auto',
                            flexWrap: 'wrap',
                            // Inject the active palette as CSS variables so pills + icons share the same color
                            '--mod-bg': activePalette.bg,
                            '--mod-color': activePalette.color,
                        }}
                    >
                        {visibleCategories.map(cat => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    className={`cat-pill${isActive ? ' cat-pill-active' : ''}`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '6px 14px',
                                        borderRadius: '9999px',
                                        background: 'var(--bg-surface, var(--bg-card))',
                                        border: '1px solid var(--border-default, var(--border-color))',
                                        color: 'var(--text-secondary, var(--text-muted))',
                                        cursor: 'pointer',
                                        transition: 'all 180ms ease',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '0.5px',
                                        textTransform: 'uppercase',
                                        userSelect: 'none',
                                        fontFamily: 'var(--font-main)',
                                    }}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Module cards grid — inject palette for icon coloring */}
                    {currentModules.length > 0 ? (
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                                gap: '10px',
                                '--mod-bg': activePalette.bg,
                                '--mod-color': activePalette.color,
                            }}
                        >
                            {currentModules.map((module, index) => (
                                <ModuleCard
                                    key={module.id}
                                    module={module}
                                    index={index}
                                    onClick={(m) => {
                                        if (m.status === 'coming-soon') return;
                                        if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                        else navigate(m.path);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '48px',
                            textAlign: 'center',
                            color: 'var(--text-secondary, var(--text-muted))',
                            fontSize: '13px',
                        }}>
                            Nenhum módulo nesta categoria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── ModuleCard ───────────────────────────────────────────────────────────────
const ModuleCard = ({ module, index, onClick }) => {
    const isComingSoon = module.status === 'coming-soon';

    return (
        <div
            className="module-card"
            style={{ animationDelay: `${Math.min(index * 40, 480)}ms` }}
        >
            <div
                className={`mod-card-wrap${isComingSoon ? ' cs-card' : ''}`}
                onClick={() => onClick(module)}
            >
                {/* Icon — color controlled by CSS variable from parent grid */}
                <div
                    className="card-icon"
                    style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '11px',
                        background: 'var(--mod-bg)',
                        color: 'var(--mod-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 180ms ease',
                    }}
                >
                    {React.cloneElement(module.icon, { width: 18, height: 18, strokeWidth: 2 })}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="card-title" style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--text-primary, var(--text-main))',
                        letterSpacing: '-0.01em',
                        lineHeight: '1.3',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {module.title}
                    </div>
                    {module.subtitle && (
                        <div className="card-subtitle" style={{
                            fontSize: '11px',
                            color: 'var(--text-secondary, var(--text-muted))',
                            marginTop: '2px',
                            lineHeight: '1.4',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {module.subtitle}
                        </div>
                    )}
                </div>

                {/* Em Breve badge */}
                {isComingSoon && (
                    <span className="badge-soon" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        flexShrink: 0,
                    }}>
                        Em Breve
                    </span>
                )}
            </div>
        </div>
    );
};

export default Menu;
