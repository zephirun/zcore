import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { categories, allModules } from '../config/menuConfig';
import logoZeph from '../assets/logo_zeph_new.png'; // Header Logo (colored)

// Helper to check if a category is active based on current path
const accessibilityCheck = (category, currentPath) => {
    return allModules.some(m => m.category === category.id && m.path === currentPath);
};

const Sidebar = () => {
    const { userRole, allowedModules, theme, toggleTheme, sidebarCollapsed, setSidebarCollapsed } = useData();
    const location = useLocation();

    // Local state for hover interaction
    const [isHovered, setIsHovered] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Visual State: Collapsed if global setting is true AND mouse is not hovering
    const isVisualCollapsed = sidebarCollapsed && !isHovered;

    // Alias for compatibility if needed, but we should rely on isVisualCollapsed for rendering
    const isCollapsed = sidebarCollapsed;

    // Filter accessible categories
    const accessibleCategories = categories.filter(category => {
        const hasModules = allModules.some(m =>
            m.category === category.id &&
            (userRole === 'admin' || (Object.keys(allowedModules || {}).length === 0 ? false : (allowedModules && allowedModules.includes(m.id))))
        );
        return hasModules && !category.hidden; // Exclude hidden categories
    });

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    const handleCategoryClick = (categoryId) => {
        if (isVisualCollapsed) {
            // If collapsed (and not hovered - though click implies hover), expand
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
                width: isVisualCollapsed ? '48px' : '220px', // Compacted widths
                height: 'calc(100vh - 50px)', // Start below header
                backgroundColor: 'var(--glass-bg)', // Glass effect
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                color: 'var(--text-main)',
                transition: 'width 0.4s cubic-bezier(0.2, 0, 0, 1), background-color 0.8s ease, color 0.8s ease', // Faster width transition
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed', // Fixed to allow overlay
                left: 0,
                top: '50px', // Below Header
                zIndex: 900, // Lower than Header (1000)
                overflow: 'hidden',
                boxShadow: 'var(--glass-shadow)',
                borderRight: 'var(--glass-border)'
            }}
        >


            {/* Logo Section */}


            {/* Navigation Items */}
            <div
                className="hide-scrollbar"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingTop: '6px', // Reduced top padding
                    minWidth: isVisualCollapsed ? '48px' : '220px' // Ensure content doesn't reflow
                }}>
                {/* Home Item */}


                {/* Categories */}
                {
                    accessibleCategories.map(category => {
                        // Check if any module in this category is active
                        const isActive = accessibilityCheck(category, location.pathname);
                        const isExpanded = expandedCategory === category.id;

                        // Calculate dynamic background colors based on category color
                        const activeBg = `${category.color || '#1E88E5'}26`; // 15% opacity hex
                        const hoverBg = `${category.color || '#1E88E5'}1A`; // 10% opacity hex
                        const itemColor = category.color || 'var(--text-main)';

                        return (
                            <div key={category.id}>
                                <div
                                    onClick={() => handleCategoryClick(category.id)}
                                    // Merged onMouseEnter
                                    onMouseEnter={(e) => {
                                        handleCategoryMouseEnter(category.id);
                                        // Standard hover styles
                                        if (!isActive && !isExpanded) {
                                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                            e.currentTarget.style.color = itemColor;
                                            const iconWrapper = e.currentTarget.firstElementChild?.firstElementChild;
                                            if (iconWrapper) iconWrapper.style.color = itemColor;
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive && !isExpanded) {
                                            e.currentTarget.style.backgroundColor = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-main)';
                                            // Reset icon wrapper
                                            const iconWrapper = e.currentTarget.firstElementChild?.firstElementChild;
                                            if (iconWrapper) iconWrapper.style.color = 'var(--text-main)';
                                        }
                                    }}
                                    style={{
                                        padding: isVisualCollapsed ? '10px 0' : '10px 16px', // Reduced padding
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: isVisualCollapsed ? 'center' : 'space-between',
                                        // Color text if active OR expanded
                                        color: (isActive || isExpanded) ? itemColor : 'var(--text-main)',
                                        // Background active if active OR expanded
                                        backgroundColor: (isActive || isExpanded) ? activeBg : 'transparent',
                                        cursor: 'pointer',
                                        borderLeft: (isActive || isExpanded) ? `4px solid ${category.color || '#1E88E5'}` : '4px solid transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        {/* Icon Wrapper to ensure consistent size */}
                                        <div style={{
                                            width: '24px',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            color: (isActive || isExpanded) ? itemColor : 'var(--text-main)',
                                            transition: 'color 0.2s' // Smooth transition
                                        }}>
                                            {category.icon}
                                        </div>
                                        {!isVisualCollapsed && (
                                            <span style={{ marginLeft: '15px', fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                                                {category.name}
                                            </span>
                                        )}
                                    </div>
                                    {!isVisualCollapsed && (
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            style={{
                                                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s'
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
                                    // Match Submenu background to Category Header in Light Mode
                                    backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.2)' : (category.bgColor || '#f9fafb'),
                                    transition: 'height 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}>
                                    {allModules
                                        .filter(m => m.category === category.id && (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id))))
                                        .map(module => (
                                            <Link
                                                key={module.id}
                                                to={module.path}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    padding: '8px 12px 8px 16px', // Compact padding
                                                    textDecoration: 'none',
                                                    color: location.pathname === module.path ? (category.color || 'var(--text-main)') : 'var(--text-main)',
                                                    fontSize: '13px', // Smaller font
                                                    background: location.pathname === module.path ? activeBg : 'transparent',
                                                    borderRadius: '6px',
                                                    margin: '2px 8px', // Tighter spacing
                                                    transition: 'all 0.2s ease',
                                                    borderRight: location.pathname === module.path ? `3px solid ${category.color || '#1E88E5'}` : '3px solid transparent'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = location.pathname === module.path ? activeBg : hoverBg}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = location.pathname === module.path ? activeBg : 'transparent'}
                                            >
                                                <div style={{
                                                    marginRight: '10px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: category.color || 'var(--text-main)', // Always colorful
                                                    flexShrink: 0
                                                }}>
                                                    {React.isValidElement(module.icon) && React.cloneElement(module.icon, {
                                                        width: 18,
                                                        height: 18,
                                                        strokeWidth: 2
                                                    })}
                                                </div>
                                                {module.title}
                                            </Link>
                                        ))
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div >



        </div >
    );
};

export default Sidebar;
