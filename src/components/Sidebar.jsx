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
        return hasModules;
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
                width: isVisualCollapsed ? '50px' : '260px',
                height: '100vh',
                backgroundColor: 'var(--glass-bg)', // Glass effect
                backdropFilter: 'var(--glass-blur)',
                WebkitBackdropFilter: 'var(--glass-blur)',
                color: 'var(--text-main)',
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.8s ease, color 0.8s ease',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed', // Fixed to allow overlay
                left: 0,
                top: 0,
                zIndex: 1010, // Higher than Header (1000)
                overflow: 'hidden',
                boxShadow: 'var(--glass-shadow)',
                borderRight: 'var(--glass-border)'
            }}
        >


            {/* Logo Section */}
            <div
                onClick={toggleSidebar}
                style={{
                    height: '50px', // Adjusted to match Header height
                    position: 'relative',
                    borderBottom: '1px solid var(--border-color)',
                    width: '100%',
                    minWidth: isVisualCollapsed ? '50px' : '260px', // Ensure content doesn't reflow
                    overflow: 'hidden',
                    cursor: 'pointer'
                }}>
                {/* Collapsed Logo (Centered in 50px) */}
                <div style={{
                    position: 'absolute',
                    left: '25px', // Center of 50px sidebar
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: isVisualCollapsed ? 1 : 0,
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: isVisualCollapsed ? 'auto' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <img
                        src={logoZeph}
                        alt="ZORX"
                        style={{
                            height: '20px', // Reduced to be very small
                            objectFit: 'contain'
                        }}
                    />
                </div>

                {/* Expanded Logo (Left Aligned) */}
                <div style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    opacity: isVisualCollapsed ? 0 : 1,
                    transition: 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: isVisualCollapsed ? 'none' : 'auto',
                    width: 'max-content'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={logoZeph} alt="Z" style={{ height: '20px' }} /> {/* Reduced to be very small */}
                        <span style={{
                            fontWeight: '800',
                            fontSize: '18px', // Slightly reduced font size to match
                            color: theme === 'dark' ? '#ffffff' : '#1565C0', // Keep specific brand colors for logo text
                            letterSpacing: '-0.5px'
                        }}>
                            ZORX
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Items */}
            <div
                className="hide-scrollbar"
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingTop: '10px',
                    minWidth: isVisualCollapsed ? '50px' : '260px' // Ensure content doesn't reflow
                }}>
                {/* Home Item */}
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <div style={{
                        padding: isVisualCollapsed ? '12px 0' : '12px 20px', // Center icon 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isVisualCollapsed ? 'center' : 'flex-start', // Always start layout from left
                        color: location.pathname === '/' ? '#1E88E5' : 'var(--text-main)',
                        backgroundColor: location.pathname === '/' ? 'rgba(30, 136, 229, 0.15)' : 'transparent', // Consistent with categories
                        cursor: 'pointer',
                        borderLeft: location.pathname === '/' ? '4px solid #1E88E5' : '4px solid transparent',
                        transition: 'all 0.2s'
                    }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = location.pathname === '/' ? 'rgba(30, 136, 229, 0.15)' : 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = location.pathname === '/' ? 'rgba(30, 136, 229, 0.15)' : 'transparent'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        {!isVisualCollapsed && (
                            <span style={{ marginLeft: '15px', fontSize: '14px', fontWeight: '500' }}>Página Inicial</span>
                        )}
                    </div>
                </Link >

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
                                        padding: isVisualCollapsed ? '12px 0' : '12px 20px',
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
                                                style={{ textDecoration: 'none' }}
                                            >
                                                <div style={{
                                                    padding: '10px 20px 10px 60px',
                                                    fontSize: '13px',
                                                    color: location.pathname === module.path ? (category.color || 'var(--text-main)') : 'var(--text-main)',
                                                    backgroundColor: location.pathname === module.path ? activeBg : 'transparent', // Very light background
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
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
                                                </div>
                                            </Link>
                                        ))
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div >

            {/* Theme Toggle Footer */}
            <div
                onClick={toggleTheme}
                style={{
                    height: '50px',
                    minHeight: '50px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isVisualCollapsed ? 'center' : 'flex-start',
                    padding: isVisualCollapsed ? '0' : '0 20px',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    transition: 'all 0.2s',
                    minWidth: isVisualCollapsed ? '50px' : '260px', // Prevent reflow
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <div style={{
                    width: '24px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    {theme === 'dark' ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5"></circle>
                            <line x1="12" y1="1" x2="12" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="23"></line>
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                            <line x1="1" y1="12" x2="3" y2="12"></line>
                            <line x1="21" y1="12" x2="23" y2="12"></line>
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                        </svg>
                    )}
                </div>
                {!isVisualCollapsed && (
                    <span style={{ marginLeft: '15px', fontSize: '14px', fontWeight: '500' }}>
                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </span>
                )}
            </div>

        </div>
    );
};

export default Sidebar;
