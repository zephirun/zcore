import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { allModules, categories } from '../config/menuConfig';
import { ChevronRight, Grid } from 'lucide-react';

const Menu = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name } = useData();

    // The active category for the module grid at the bottom
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || categories[0].id);

    const handleCategoryClick = (id) => {
        setActiveCategory(id);
        setSearchParams({ category: id });
    };

    const visibleCategories = categories.filter(cat => {
        const categoryModules = allModules.filter(m => m.category === cat.id);
        if (categoryModules.length === 0) return false;
        return categoryModules.some(m =>
            userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)) || m.id === 'sales-simulation'
        ) && !cat.hidden;
    });

    const currentModules = allModules.filter(m =>
        (activeCategory ? m.category === activeCategory : true) &&
        (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)) || m.id === 'sales-simulation')
    );
    const firstName = name ? name.split(' ')[0] : 'Usuário';

    // Greeting logic based on São Paulo time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) return "Bom dia";
        if (hour >= 12 && hour < 18) return "Boa tarde";
        return "Boa noite";
    };

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: 'var(--font-main)',
            background: 'var(--bg-main)',
            color: 'var(--text-main)',
        }}>
            <style>
                {`
                    @keyframes fadeInUp {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeInDown {
                        from { opacity: 0; transform: translateY(-10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .module-card:hover {
                        background: var(--bg-hover) !important;
                        border-color: var(--border-input) !important;
                    }
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}
            </style>
            <div style={{
                width: '100%',
                maxWidth: '1600px',
                margin: '0 auto',
                padding: '24px 20px 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>

                {/* --- PERSONALIZED WELCOME HEADER --- */}
                <div style={{ marginBottom: '32px', animation: 'fadeInDown 0.5s ease-out' }}>
                    <h1 style={{
                        fontSize: '24px',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        margin: '0',
                        letterSpacing: '-0.04em',
                        lineHeight: '1.2'
                    }}>
                        {getGreeting()}, {firstName}
                    </h1>
                    <p style={{
                        fontSize: '14px',
                        color: 'var(--text-muted)',
                        margin: '4px 0 0 0',
                        fontWeight: '500',
                        letterSpacing: '-0.01em'
                    }}>
                        O que você deseja acessar hoje?
                    </p>
                </div>

                <div>
                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Grid size={18} color="var(--color-primary)" strokeWidth={2.5} />
                        <h2 style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
                            Módulos Disponíveis
                        </h2>
                    </div>

                    {/* Category pills */}
                    <div
                        className="hide-scrollbar category-grid"
                        style={{
                            display: 'flex',
                            gap: '6px',
                            paddingBottom: '20px',
                            overflowX: 'auto',
                            flexWrap: 'wrap'
                        }}>
                        {visibleCategories.map(cat => {
                            const isActive = activeCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat.id)}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '6px 14px',
                                        borderRadius: '16px',
                                        background: isActive ? `${cat.color}14` : 'var(--bg-elevated)',
                                        border: '1px solid',
                                        borderColor: isActive ? `${cat.color}40` : 'var(--border-color)',
                                        color: isActive ? cat.color : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        fontSize: '12px',
                                        fontWeight: isActive ? '600' : '500',
                                        whiteSpace: 'nowrap',
                                        letterSpacing: '-0.01em',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Modules grid */}
                    {currentModules.length > 0 ? (
                        <div
                            className="menu-grid"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                gap: '12px',
                            }}>
                            {currentModules.map((module, index) => {
                                const catColor = categories.find(c => c.id === module.category)?.color || null;
                                return (
                                    <div key={module.id} style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s backwards` }}>
                                        <ModuleCard
                                            module={module}
                                            categoryColor={catColor}
                                            onClick={(m) => {
                                                if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                                else navigate(m.path);
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Nenhum módulo nesta categoria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reused ModuleCard Component
const ModuleCard = ({ module, categoryColor, onClick }) => {
    const isComingSoon = module.status === 'coming-soon';
    const [isHovered, setIsHovered] = useState(false);
    const iconColor = categoryColor || 'var(--text-muted)';

    return (
        <div
            className="module-card"
            onClick={() => !isComingSoon && onClick(module)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                borderRadius: '16px',
                padding: '16px 20px',
                position: 'relative',
                overflow: 'hidden',
                cursor: isComingSoon ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                background: 'var(--bg-card)',
                border: '1px solid',
                borderColor: isHovered && !isComingSoon ? 'var(--border-input)' : 'var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                opacity: isComingSoon ? 0.5 : 1,
            }}
        >
            <div style={{
                width: '40px', height: '40px',
                borderRadius: '12px',
                background: isHovered && !isComingSoon ? `${categoryColor}20` : 'var(--bg-input)',
                border: '1px solid',
                borderColor: categoryColor ? `${categoryColor}25` : 'var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHovered ? categoryColor : 'var(--text-muted)',
                transition: 'all 0.2s ease',
                flexShrink: 0,
            }}>
                {React.cloneElement(module.icon, { width: 18, height: 18, strokeWidth: 1.8 })}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text-main)',
                    margin: '0 0 2px 0',
                    lineHeight: '1.2',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {module.title}
                </h3>
                {module.subtitle && (
                    <p style={{
                        fontSize: '11px',
                        color: 'var(--text-muted)',
                        margin: 0,
                        lineHeight: '1.3',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {module.subtitle}
                    </p>
                )}
            </div>



            {isComingSoon && (
                <span style={{
                    fontSize: '9px',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    position: 'absolute',
                    top: '8px', right: '8px'
                }}>
                    Em Breve
                </span>
            )}
        </div>
    );
};

export default Menu;
