import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/react-query';
import { fetchSalesData, fetchClientRecords } from '../services/api';
import { fetchDetailedKPIs } from '../services/oracleService';
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
    const handlePrefetch = (modulePath) => {
        // Core Sales & Analysis Views
        if (modulePath.includes('/sales/synthetic-summary')) {
            queryClient.prefetchQuery({ queryKey: ['sales', 'monthly-billing'], queryFn: () => fetchSalesData(activeUnit) });
        }

        // Strategic Board
        if (modulePath.includes('/board/strategic')) {
            queryClient.prefetchQuery({ queryKey: ['sales', 'detailed-kpis'], queryFn: () => fetchDetailedKPIs() });
        }

        // Client Records (CRM basis)
        if (modulePath.includes('/sales/client-records')) {
            queryClient.prefetchQuery({ queryKey: QUERY_KEYS.clients.all(activeUnit), queryFn: () => fetchClientRecords(activeUnit) });
        }
    };

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
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
            }}>
                {/* --- PERSONALIZED WELCOME HEADER --- */}
                <div style={{ marginBottom: 'var(--space-4)', animation: 'fadeInDown 0.5s ease-out' }}>
                    <h1 style={{
                        fontSize: 'var(--text-3xl)',
                        fontWeight: '800',
                        color: 'var(--text-main)',
                        margin: '0',
                        letterSpacing: '-0.04em',
                        lineHeight: '1.2'
                    }}>
                        {getGreeting()}, {firstName}
                    </h1>
                    <p style={{
                        fontSize: 'var(--text-base)',
                        color: 'var(--text-muted)',
                        margin: '4px 0 0 0',
                        fontWeight: 'var(--font-medium)',
                        letterSpacing: '-0.01em'
                    }}>
                        O que você deseja acessar hoje?
                    </p>
                </div>

                <div>
                    <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <Grid size={18} color="var(--color-primary)" strokeWidth={2.5} />
                        <h2 style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>
                            Módulos Disponíveis
                        </h2>
                    </div>

                    {/* Category pills */}
                    <div
                        className="hide-scrollbar category-grid"
                        style={{
                            display: 'flex',
                            gap: 'var(--space-4)',
                            paddingBottom: 'var(--space-5)',
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
                                        borderRadius: 'var(--radius-sm)',
                                        background: isActive ? `${cat.color}14` : 'var(--bg-elevated)',
                                        border: '1px solid',
                                        borderColor: isActive ? `${cat.color}40` : 'var(--border-color)',
                                        color: isActive ? cat.color : 'var(--text-muted)',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        fontSize: 'var(--text-sm)',
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
                                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                                gap: 'var(--space-4)',
                            }}>
                            {currentModules.map((module, index) => {
                                const catColor = categories.find(c => c.id === module.category)?.color || null;
                                return (
                                    <div key={module.id} style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.04}s backwards` }}>
                                        <ModuleCard
                                            module={module}
                                            categoryColor={catColor}
                                            onHover={(m) => handlePrefetch(m.path)}
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
                        <div style={{ padding: 'var(--space-10)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            Nenhum módulo nesta categoria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Reused ModuleCard Component
const ModuleCard = ({ module, categoryColor, onClick, onHover }) => {
    const isComingSoon = module.status === 'coming-soon';
    const [isHovered, setIsHovered] = useState(false);
    const iconColor = categoryColor || 'var(--text-muted)';

    return (
        <div
            className="module-card"
            onClick={() => !isComingSoon && onClick(module)}
            onMouseEnter={() => { setIsHovered(true); if (onHover) onHover(module); }}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-6)',
                position: 'relative',
                overflow: 'hidden',
                cursor: isComingSoon ? 'default' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isHovered && !isComingSoon ? `${categoryColor}20` : 'var(--bg-card)',
                boxShadow: isHovered && !isComingSoon ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                border: '1px solid',
                borderColor: isHovered && !isComingSoon ? `${categoryColor}60` : 'var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                aspectRatio: '1.1 / 1', // Slightly wider than tall for a more dashboard look
                gap: 'var(--space-4)',
                opacity: isComingSoon ? 0.5 : 1,
                transform: isHovered && !isComingSoon ? 'translateY(-4px)' : 'translateY(0)',
            }}
        >
            <div style={{
                width: '56px', height: '56px',
                borderRadius: 'var(--radius-lg)',
                background: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isHovered && !isComingSoon ? categoryColor : 'var(--text-muted)',
                transition: 'all 0.3s ease',
                flexShrink: 0,
                marginBottom: 'var(--space-1)',
                boxShadow: 'none'
            }}>
                {React.cloneElement(module.icon, {
                    width: 28,
                    height: 28,
                    strokeWidth: 2,
                    stroke: isHovered && !isComingSoon ? categoryColor : 'var(--text-muted)'
                })}
            </div>

            <div style={{ width: '100%' }}>
                <h3 style={{
                    fontSize: '14px',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--text-main)',
                    margin: '0 0 6px 0',
                    lineHeight: '1.25',
                    letterSpacing: '-0.01em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {module.title}
                </h3>
                {module.subtitle && (
                    <p style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)',
                        margin: 0,
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {module.subtitle}
                    </p>
                )}
            </div>



            {isComingSoon && (
                <span style={{
                    fontSize: '9px',
                    fontWeight: 'var(--font-bold)',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-elevated)',
                    padding: '2px 6px',
                    borderRadius: 'var(--space-1)',
                    textTransform: 'uppercase',
                    position: 'absolute',
                    top: 'var(--space-2)', right: 'var(--space-2)'
                }}>
                    Em Breve
                </span>
            )}
        </div>
    );
};

export default Menu;
