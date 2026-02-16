import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logoGmad from '../assets/logo.png';
import logoGmadWhite from '../assets/logo2.png'; // Assuming this is the white version
import { useData } from '../context/DataContext';
import { categories, allModules } from '../config/menuConfig';

const Header = () => {
    const { username, name, avatarUrl, isAuthenticated, activeUnit, AVAILABLE_UNITS, switchUnit, logout, userRole, allowedModules, theme, sidebarCollapsed, setSidebarCollapsed, toggleTheme } = useData();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isUnitMenuOpen, setIsUnitMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false); // Mega Menu State
    const [activeCategoryId, setActiveCategoryId] = useState(null); // Active Category in Flyout
    const [searchQuery, setSearchQuery] = useState(''); // Search State
    const sidebarRef = useRef(null); // Ref for sidebar
    const menuButtonRef = useRef(null); // Ref for menu button
    const unitRef = useRef(null); // Ref for unit selector
    const appsRef = useRef(null); // Ref for apps menu
    const userRef = useRef(null); // Ref for user menu

    // Click Outside Handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Mega Menu
            if (isMegaMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setIsMegaMenuOpen(false);
                setActiveCategoryId(null);
            }
            // Unit Menu
            if (isUnitMenuOpen && unitRef.current && !unitRef.current.contains(event.target)) {
                setIsUnitMenuOpen(false);
            }
            // Apps Menu
            if (isAppsMenuOpen && appsRef.current && !appsRef.current.contains(event.target)) {
                setIsAppsMenuOpen(false);
            }
            // User Menu
            if (isUserMenuOpen && userRef.current && !userRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMegaMenuOpen, isUnitMenuOpen, isAppsMenuOpen, isUserMenuOpen]);

    // Helper to filter accessible categories
    const getAccessibleCategories = () => {
        return categories.filter(category => {
            const hasModules = allModules.some(m =>
                m.category === category.id &&
                (userRole === 'admin' || (Object.keys(allowedModules || {}).length === 0 ? false : (allowedModules && allowedModules.includes(m.id))))
            );
            return hasModules;
        });
    };
    /* Fix logic: allowedModules is array of module IDs. If Empty/Null and NOT admin, access is denied? 
       Actually previous logic in Menu.jsx was: userRole === 'admin' || allowedModules.includes(m.id)
       If allowedModules is undefined/null, user has no access usually.
    */

    const accessibleCategories = getAccessibleCategories();

    // Search Logic
    // Search Logic
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const results = [];
        const query = searchQuery.toLowerCase();

        allModules.forEach(mod => {
            // Check Access
            const hasAccess = userRole === 'admin' || (allowedModules && allowedModules.includes(mod.id));

            if (hasAccess && mod.title.toLowerCase().includes(query)) {
                // Find Category Info
                const cat = categories.find(c => c.id === mod.category);
                if (cat) {
                    results.push({
                        ...mod,
                        categoryName: cat.name,
                        categoryColor: cat.color
                    });
                }
            }
        });
        return results;
    }, [searchQuery, allModules, userRole, allowedModules]);

    // Check if we have a selected category to highlight in the nav strip
    const selectedCategoryId = searchParams.get('category');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated || ['/', '/login'].includes(location.pathname)) return null;

    return (
        <div className="no-print" style={{
            position: 'relative',
            zIndex: 50,
            fontFamily: 'var(--font-main)'
        }}>
            {/* 2. MAIN HEADER (Green) - Now Theme Aware */}
            <div
                className="header-container" // Added class for CSS override
                style={{
                    height: '50px',
                    backgroundColor: 'var(--glass-bg)', // Dynamic background
                    color: 'var(--text-main)',
                    backdropFilter: 'var(--glass-blur)', // Modern blur
                    WebkitBackdropFilter: 'var(--glass-blur)', // Safari support
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingLeft: '20px',
                    paddingRight: '10px',
                    boxShadow: 'var(--glass-shadow)',
                    borderBottom: 'var(--glass-border)', // Theme border
                    position: 'fixed', // Fixed to stay on screen
                    top: 0,
                    width: sidebarCollapsed ? 'calc(100% - 50px)' : 'calc(100% - 260px)',
                    left: sidebarCollapsed ? '50px' : '260px',
                    transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1), width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1000
                }}>
                {/* Left Section (Logo + Menu) */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>

                    {/* Mobile Menu Toggle */}
                    <div
                        className="mobile-menu-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)} // Toggle global state
                        style={{
                            display: 'none', // Hidden by default, shown via CSS
                            cursor: 'pointer',
                            color: 'var(--text-main)',
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </div>

                    {/* Logo First - Updated to ZCORE */}
                    {/* Logo First - Updated to ZCORE */}
                    <Link to="/menu" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                        <img
                            src={theme === 'dark' ? logoGmadWhite : logoGmad}
                            alt="ZORX"
                            style={{
                                height: '26px',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>


                </div>

                {/* Middle Section (Search Bar - Perfectly Centered) */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    maxWidth: '400px',
                    pointerEvents: 'auto'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-input)', // Theme input bg
                        borderRadius: '6px',
                        height: '42px',
                        border: '1px solid var(--border-input)', // Theme border
                        padding: '0 12px',
                        transition: 'all 0.2s ease',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'} // Active color on hover
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
                    >
                        <input
                            type="text"
                            placeholder="O que você está procurando?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'transparent',
                                padding: '0 10px',
                                fontSize: '14px',
                                outline: 'none',
                                color: 'var(--text-main)' // Main text color for input
                            }}
                        />
                        {/* Search Icon (Gray) */}
                        <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>
                    {/* Search Results Dropdown (unchanged) */}
                    {searchQuery && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            width: '100%',
                            background: 'white',
                            borderRadius: '0 0 4px 4px',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                            border: '1px solid #eee',
                            borderTop: 'none',
                            zIndex: 100,
                            maxHeight: '400px',
                            overflowY: 'auto'
                        }}>
                            {searchResults.length > 0 ? (
                                <div style={{ padding: '0px' }}>
                                    {searchResults.map((result, idx) => (
                                        <Link
                                            key={idx}
                                            to={result.path}
                                            onClick={() => setSearchQuery('')}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '10px 12px',
                                                textDecoration: 'none',
                                                color: '#333',
                                                borderBottom: '1px solid #f5f5f5'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: result.categoryColor || '#1E88E5', // Dynamic bullet
                                                marginRight: '12px'
                                            }} />
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{result.title}</div>
                                                <div style={{ fontSize: '11px', color: '#999' }}>{result.categoryName}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                                    Nenhum resultado para "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Section (Actions) */}
                <div style={{ flex: 1, display: 'flex', gap: '25px', alignItems: 'center', justifyContent: 'flex-end' }}>

                    {/* Unit Selector */}
                    <div
                        ref={unitRef}
                        onClick={() => setIsUnitMenuOpen(!isUnitMenuOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative' }}
                    >
                        {/* Icon Theme Aware */}
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.02em' }}>UNIDADE</span>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                                {(AVAILABLE_UNITS.find(u => u.id === activeUnit)?.name || 'Selecione')}
                            </span>
                        </div>
                        {isUnitMenuOpen && (
                            <div style={{
                                position: 'absolute', top: '50px', right: '0',
                                background: 'var(--bg-card)', borderRadius: '4px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                width: '200px',
                                zIndex: 120
                            }}>
                                {AVAILABLE_UNITS.map(unit => (
                                    <div
                                        key={unit.id}
                                        onClick={() => { switchUnit(unit.id); setIsUnitMenuOpen(false); }}
                                        style={{
                                            padding: '10px 15px',
                                            fontSize: '13px',
                                            cursor: 'pointer',
                                            color: activeUnit === unit.id ? 'var(--text-main)' : 'var(--text-muted)',
                                            background: activeUnit === unit.id ? 'var(--bg-input)' : 'transparent',
                                            borderBottom: '1px solid var(--border-color)'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                        onMouseLeave={e => activeUnit !== unit.id && (e.currentTarget.style.background = 'transparent')}
                                    >
                                        {unit.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Apps Menu (Blue Button) */}
                    <div
                        ref={appsRef}
                        style={{ position: 'relative' }}
                    >
                        <div
                            onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '8px',
                                backgroundColor: isAppsMenuOpen ? 'var(--bg-input)' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: `1px solid ${isAppsMenuOpen ? 'var(--border-color)' : 'transparent'}`,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={e => {
                                if (!isAppsMenuOpen) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                } else {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                                }
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>

                        {isAppsMenuOpen && (
                            <div style={{
                                position: 'absolute', top: '50px', right: '0',
                                background: 'var(--bg-card)', borderRadius: '12px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                width: '220px',
                                zIndex: 120,
                                padding: '8px',
                                overflow: 'hidden'
                            }}>
                                {userRole === 'admin' && (
                                    <Link
                                        to="/admin/audit"
                                        onClick={() => setIsAppsMenuOpen(false)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 15px', textDecoration: 'none', color: 'var(--text-main)',
                                            borderRadius: '8px', transition: 'background 0.2s',
                                            backgroundColor: location.pathname === '/admin/audit' ? 'var(--bg-input)' : 'transparent'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                        onMouseLeave={e => location.pathname !== '/admin/audit' && (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '6px',
                                            backgroundColor: 'rgba(96, 125, 139, 0.1)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#607d8b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>Logs de Acesso</span>
                                    </Link>
                                )}

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 8px' }} />

                                <a
                                    href="https://wa.me/5547991047677"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsAppsMenuOpen(false)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        padding: '12px 15px', textDecoration: 'none', color: 'var(--text-main)',
                                        borderRadius: '8px', transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '6px',
                                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600' }}>Central de Ajuda</span>
                                </a>
                            </div>
                        )}
                    </div>



                    {/* User Profile */}
                    <div
                        ref={userRef}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-input)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {/* Avatar or Icon */}
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '1px solid var(--border-color)'
                                }}
                            />
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-main)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>
                                {name?.split(' ')[0] || 'Visitante'}
                            </span>
                        </div>
                        {isUserMenuOpen && (
                            <div style={{
                                position: 'absolute', top: '50px', right: '0',
                                background: 'var(--bg-card)', borderRadius: '4px',
                                boxShadow: 'var(--shadow-lg)',
                                border: '1px solid var(--border-color)',
                                width: '180px',
                                zIndex: 120
                            }}>
                                <Link
                                    to="/profile"
                                    style={{
                                        display: 'block', padding: '10px 15px', color: 'var(--text-main)',
                                        textDecoration: 'none', borderBottom: '1px solid var(--border-color)',
                                        fontSize: '13px'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Meus Dados
                                </Link>

                                {userRole === 'admin' && (
                                    <>
                                        <Link
                                            to="/admin/upload"
                                            style={{
                                                display: 'block', padding: '10px 15px', color: 'var(--text-main)',
                                                textDecoration: 'none', borderBottom: '1px solid var(--border-color)',
                                                fontSize: '13px'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Upload de Dados
                                        </Link>
                                        <Link
                                            to="/admin"
                                            style={{
                                                display: 'block', padding: '10px 15px', color: 'var(--text-main)',
                                                textDecoration: 'none', borderBottom: '1px solid var(--border-color)',
                                                fontSize: '13px'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            Gestão de Usuários
                                        </Link>
                                    </>
                                )}

                                <div
                                    onClick={handleLogout}
                                    style={{ padding: '10px 15px', color: '#f44336', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    Sair
                                </div>
                            </div>
                        )}
                    </div>




                    {/* Cart Removed as requested */}
                </div>
            </div>

            {/* --- MEGA MENU SIDEBAR (Absolute) --- */}
            {
                isMegaMenuOpen && (
                    <div
                        ref={sidebarRef}
                        className="scroll-container"
                        onMouseEnter={() => {
                            if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
                        }}
                        onMouseLeave={() => {
                            menuTimeoutRef.current = setTimeout(() => {
                                setIsMegaMenuOpen(false);
                            }, 300);
                        }}
                        style={{
                            position: 'absolute',
                            top: '50px',
                            left: 0,
                            width: activeCategoryId ? '750px' : '300px',
                            height: 'calc(100vh - 50px)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glass effect
                            backdropFilter: 'blur(15px)',
                            WebkitBackdropFilter: 'blur(15px)',
                            borderRight: '1px solid rgba(226, 232, 240, 0.5)',
                            boxShadow: '10px 0 40px rgba(0,0,0,0.08)',
                            zIndex: 40,
                            display: 'flex',
                            flexDirection: 'row',
                            overflow: 'hidden',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}>

                        <div
                            className="scroll-container"
                            style={{
                                width: '300px',
                                minWidth: '300px',
                                background: 'transparent',
                                borderRight: '1px solid rgba(241, 241, 241, 0.5)',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '15px 0',
                                overflowY: 'auto'
                            }}>
                            {accessibleCategories.map(category => {
                                const isActive = (activeCategoryId || selectedCategoryId) === category.id;
                                return (
                                    <div
                                        key={category.id}
                                        onMouseEnter={() => setActiveCategoryId(category.id)}
                                        onClick={() => {
                                            setSearchParams({ category: category.id });
                                            setIsMegaMenuOpen(false);
                                            setActiveCategoryId(null);
                                            navigate(`/menu?category=${category.id}`);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '14px 28px',
                                            cursor: 'pointer',
                                            background: 'transparent',
                                            color: isActive ? (category.color || '#1E88E5') : '#4a4a4a', // Dynamic category color
                                            fontWeight: isActive ? '700' : '500',
                                            fontSize: '15px',
                                            transition: 'all 0.2s ease',
                                            borderLeft: '4px solid transparent'
                                        }}
                                    >
                                        <span>{category.name}</span>
                                        {isActive && <span style={{ color: category.color || '#1E88E5', fontWeight: '900', fontSize: '18px' }}>›</span>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Panel 2: Modules (Right - Flyout) */}
                        {activeCategoryId && (
                            <div
                                className="scroll-container"
                                style={{
                                    flex: 1,
                                    background: 'white',
                                    padding: '30px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    overflowY: 'auto'
                                }}>
                                {(() => {
                                    const activeCategoryData = categories.find(c => c.id === activeCategoryId);
                                    return (
                                        <>
                                            <h4 style={{
                                                fontSize: '20px',
                                                fontWeight: '800',
                                                color: activeCategoryData?.color || '#1A1A1A', // Dynamic category title
                                                marginBottom: '15px',
                                                paddingBottom: '12px',
                                                display: 'inline-block',
                                                letterSpacing: '-0.02em',
                                                borderBottom: `2px solid ${activeCategoryData?.color || '#1E88E5'}22` // Transparent dynamic border
                                            }}>
                                                {activeCategoryData?.name}
                                            </h4>

                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '15px'
                                            }}>
                                                {allModules.filter(m => m.category === activeCategoryId && (userRole === 'admin' || (allowedModules && allowedModules.includes(m.id)))).map(module => (
                                                    <div
                                                        key={module.id}
                                                        onClick={() => {
                                                            setIsMegaMenuOpen(false);
                                                            setActiveCategoryId(null);
                                                            if (module.path.startsWith('http')) window.open(module.path, '_blank');
                                                            else navigate(module.path);
                                                        }}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '10px',
                                                            cursor: 'pointer',
                                                            padding: '10px',
                                                            borderRadius: '4px',
                                                            transition: 'background 0.1s'
                                                        }}
                                                        onMouseEnter={e => e.currentTarget.style.background = '#fcfcfc'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <div style={{ color: activeCategoryData?.color || '#1E88E5', marginTop: '6px' }}>
                                                            {/* Bullet Point - Solid Dynamic Color */}
                                                            <svg width="6" height="6" viewBox="0 0 10 10" fill="currentColor"><circle cx="5" cy="5" r="5" /></svg>
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: '500', color: '#333' }}>{module.title}</span>
                                                            <span style={{ fontSize: '12px', color: '#777' }}>{module.subtitle}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                )
            }

            <style>{`
                .menu-item-hover { padding: 8px 12px; cursor: pointer; border-radius: 4px; font-size: 13px; color: #555; }
                .menu-item-hover:hover { background: #f5f5f5; color: #1B5E20; }
                .scroll-container::-webkit-scrollbar { width: 6px; }
                .scroll-container::-webkit-scrollbar-thumb { background: #ddd; border-radius: 3px; }
            `}</style>
        </div >
    );
};

export default Header;

