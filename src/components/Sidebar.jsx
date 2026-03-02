import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { categories, allModules } from '../config/menuConfig';

const accessibilityCheck = (category, currentPath) => {
    return allModules.some(m => m.category === category.id && m.path === currentPath);
};

const Sidebar = () => {
    const { userRole, allowedModules, sidebarCollapsed, setSidebarCollapsed } = useData();
    const location = useLocation();

    const [isHovered, setIsHovered] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    const isVisualCollapsed = sidebarCollapsed && !isHovered;

    const accessibleCategories = categories.filter(category => {
        const hasModules = allModules.some(m =>
            m.category === category.id &&
            (userRole === 'admin' || (Object.keys(allowedModules || {}).length === 0 ? false : (allowedModules && allowedModules.includes(m.id))))
        );
        return hasModules && !category.hidden;
    });

    const handleCategoryClick = (categoryId) => {
        if (isVisualCollapsed) {
            setIsHovered(true);
            setExpandedCategory(categoryId);
        } else {
            setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
        }
    };

    const handleCategoryMouseEnter = (categoryId) => {
        if (!isVisualCollapsed) {
            setExpandedCategory(categoryId);
        }
    };

    return (
        <div
            className={`sidebar-container no-print ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}
            onMouseEnter={() => sidebarCollapsed && setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                if (sidebarCollapsed) setExpandedCategory(null);
            }}
            style={{
                width: isVisualCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
                height: 'calc(100vh - var(--header-height))',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                left: '0',
                top: 'var(--header-height)',
                bottom: '0',
                zIndex: 1100,
                overflow: 'hidden',
                borderRight: '1px solid var(--border-color)',
            }}
        >
            {/* Navigation Items */}
            <div
                className="hide-scrollbar"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingTop: 'var(--space-2)',
                    paddingBottom: 'var(--space-2)',
                    minWidth: isVisualCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)'
                }}>
                {accessibleCategories.map(category => {
                    const isActive = accessibilityCheck(category, location.pathname);
                    const isExpanded = expandedCategory === category.id;

                    return (
                        <div key={category.id}>
                            <div
                                className="sidebar-item"
                                onClick={() => handleCategoryClick(category.id)}
                                onMouseEnter={() => handleCategoryMouseEnter(category.id)}
                                style={{
                                    padding: isVisualCollapsed ? 'var(--density-padding-sm) 0' : 'var(--density-padding-sm) var(--density-padding-md)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isVisualCollapsed ? 'center' : 'space-between',
                                    color: (isActive || isExpanded) ? 'var(--text-main)' : 'var(--text-muted)',
                                    backgroundColor: (isActive || isExpanded) ? 'var(--bg-hover)' : 'transparent',
                                    cursor: 'pointer',
                                    margin: '2px 8px',
                                    borderRadius: 'var(--radius)',
                                    borderLeft: !isVisualCollapsed && isActive
                                        ? `3px solid ${category.color || 'var(--color-primary)'}`
                                        : '3px solid transparent',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{
                                        width: '24px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        color: (isActive || isExpanded)
                                            ? (category.color || 'var(--text-main)')
                                            : 'var(--text-muted)',
                                        transition: 'color 0.15s'
                                    }}>
                                        {React.cloneElement(category.icon, { width: 16, height: 16, strokeWidth: 1.8 })}
                                    </div>
                                    {!isVisualCollapsed && (
                                        <span style={{
                                            marginLeft: '10px',
                                            fontSize: 'var(--text-sm)',
                                            fontWeight: (isActive || isExpanded) ? '600' : '400',
                                            whiteSpace: 'nowrap',
                                            letterSpacing: '-0.01em'
                                        }}>
                                            {category.name}
                                        </span>
                                    )}
                                </div>
                                {!isVisualCollapsed && (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{
                                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s',
                                            opacity: 0.5
                                        }}
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                )}
                            </div>

                            {/* Submenu */}
                            <div style={{
                                height: isExpanded && !isVisualCollapsed ? 'auto' : 0,
                                overflow: 'hidden',
                                transition: 'height 0.25s ease'
                            }}>
                                {allModules
                                    .filter(m => m.category === category.id && (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id))))
                                    .map(module => {
                                        const isModuleActive = location.pathname === module.path;
                                        const catColor = category.color || 'var(--text-muted)';
                                        return (
                                            <Link
                                                key={module.id}
                                                to={module.path}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: 'var(--density-padding-xs) 10px var(--density-padding-xs) calc(var(--density-padding-md) + 2px)',
                                                    textDecoration: 'none',
                                                    color: isModuleActive ? 'var(--text-main)' : 'var(--text-muted)',
                                                    fontSize: '12px',
                                                    fontWeight: isModuleActive ? '600' : '400',
                                                    background: isModuleActive ? 'var(--bg-hover)' : 'transparent',
                                                    borderRadius: 'var(--radius-sm)',
                                                    margin: '1px 6px',
                                                    transition: 'all 0.15s ease',
                                                    letterSpacing: '-0.01em'
                                                }}
                                                onMouseEnter={e => {
                                                    if (!isModuleActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                                    e.currentTarget.style.color = 'var(--text-main)';
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.backgroundColor = isModuleActive ? 'var(--bg-hover)' : 'transparent';
                                                    e.currentTarget.style.color = isModuleActive ? 'var(--text-main)' : 'var(--text-muted)';
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: catColor,
                                                    flexShrink: 0,
                                                    opacity: isModuleActive ? 1 : 0.6
                                                }}>
                                                    {React.isValidElement(module.icon) && React.cloneElement(module.icon, {
                                                        width: 14,
                                                        height: 14,
                                                        strokeWidth: 2
                                                    })}
                                                </div>
                                                <span style={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {module.title}
                                                </span>
                                            </Link>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Sidebar;
