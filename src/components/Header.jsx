import Input from '@/components/ui/Input';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import logoGmad from '../assets/logo.png';
import logoGmadWhite from '../assets/logo2.png';
import logoZeph from '../assets/logo_zeph_new.png';
import { useData } from '../context/DataContext';
import { categories, allModules } from '../config/menuConfig';

const Header = () => {
    const {
        username, name, avatarUrl, isAuthenticated, activeUnit, AVAILABLE_UNITS,
        switchUnit, logout, userRole, allowedModules, theme, sidebarCollapsed,
        setSidebarCollapsed, toggleTheme, density, setDensity,
        dataMode, setDataMode, isDbOnline, lastSync, syncOfflineCache
    } = useData();

    const [isSyncing, setIsSyncing] = useState(false);
    const [isDataMenuOpen, setIsDataMenuOpen] = useState(false);
    const dataRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isUnitMenuOpen, setIsUnitMenuOpen] = useState(false);
    const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isAppsMenuOpen, setIsAppsMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [activeCategoryId, setActiveCategoryId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const sidebarRef = useRef(null);
    const menuButtonRef = useRef(null);
    const unitRef = useRef(null);
    const aiRef = useRef(null);
    const appsRef = useRef(null);
    const userRef = useRef(null);
    const menuTimeoutRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMegaMenuOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) &&
                menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
                setIsMegaMenuOpen(false);
                setActiveCategoryId(null);
            }
            if (isUnitMenuOpen && unitRef.current && !unitRef.current.contains(event.target)) setIsUnitMenuOpen(false);
            if (isAppsMenuOpen && appsRef.current && !appsRef.current.contains(event.target)) setIsAppsMenuOpen(false);
            if (isAiMenuOpen && aiRef.current && !aiRef.current.contains(event.target)) setIsAiMenuOpen(false);
            if (isUserMenuOpen && userRef.current && !userRef.current.contains(event.target)) setIsUserMenuOpen(false);
            if (isDataMenuOpen && dataRef.current && !dataRef.current.contains(event.target)) setIsDataMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMegaMenuOpen, isUnitMenuOpen, isAppsMenuOpen, isUserMenuOpen, isAiMenuOpen]);

    const getAccessibleCategories = () => {
        return categories.filter(category => {
            const hasModules = allModules.some(m =>
                m.category === category.id &&
                (userRole === 'admin' || (Object.keys(allowedModules || {}).length === 0 ? false : (allowedModules && allowedModules.includes(m.id))))
            );
            return hasModules;
        });
    };

    const accessibleCategories = getAccessibleCategories();

    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const results = [];
        const query = searchQuery.toLowerCase();
        allModules.forEach(mod => {
            const hasAccess = userRole === 'admin' || (allowedModules && allowedModules.includes(mod.id));
            if (hasAccess && mod.title.toLowerCase().includes(query)) {
                const cat = categories.find(c => c.id === mod.category);
                if (cat) results.push({ ...mod, categoryName: cat.name, categoryColor: cat.color });
            }
        });
        return results;
    }, [searchQuery, allModules, userRole, allowedModules]);

    const selectedCategoryId = searchParams.get('category');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated || ['/', '/login'].includes(location.pathname)) return null;

    // Shared dropdown style
    const dropdownStyle = {
        position: 'absolute',
        background: 'var(--bg-elevated)',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 120,
        animation: 'fadeIn 0.15s ease',
        overflow: 'hidden'
    };

    const dropdownItemStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '9px 14px',
        fontSize: '13px',
        fontWeight: '400',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.1s',
        textDecoration: 'none',
        letterSpacing: '-0.01em'
    };

    return (
        <div className="no-print" style={{ position: 'relative', zIndex: 50, fontFamily: 'var(--font-main)' }}>
            <div
                className="header-container"
                style={{
                    height: 'var(--header-height)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 20px',
                    borderBottom: '1px solid var(--border-color)',
                    position: 'fixed',
                    top: '0',
                    left: '0',
                    right: '0',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1200
                }}>

                {/* Left: Logo */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* Mobile toggle */}
                    <div
                        className="mobile-menu-toggle"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        style={{ display: 'none', cursor: 'pointer', color: 'var(--text-main)' }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </div>

                    <Link to="/menu" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: '8px' }}>
                        <img src={logoZeph} alt="ZCORE" style={{ height: '18px', objectFit: 'contain' }} />
                    </Link>

                    <div style={{ width: '1px', height: '14px', background: 'var(--border-color)' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        <img
                            src={theme === 'dark' ? logoGmadWhite : logoGmad}
                            alt="GMAD"
                            style={{ height: '18px', objectFit: 'contain', opacity: 0.75 }}
                        />
                    </div>
                </div>

                {/* Center: Search */}
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: '380px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {/* Search bar */}
                    <div style={{ flex: 1, position: 'relative' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: 'var(--bg-input)',
                            borderRadius: 'var(--radius)',
                            height: 'var(--density-input-height)',
                            border: '1px solid var(--border-color)',
                            padding: '0 4px 0 10px',
                            transition: 'border-color 0.15s'
                        }}
                            onFocusCapture={e => e.currentTarget.style.borderColor = 'var(--border-input)'}
                            onBlurCapture={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <Input
                                type="text"
                                placeholder="Buscar módulo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '0 8px',
                                    fontSize: '13px',
                                    outline: 'none',
                                    color: 'var(--text-main)',
                                    letterSpacing: '-0.01em'
                                }}
                            />
                        </div>

                        {/* Search results dropdown */}
                        {searchQuery && (
                            <div style={{
                                position: 'absolute',
                                top: '40px',
                                left: 0,
                                right: 0,
                                background: 'var(--bg-elevated)',
                                borderRadius: '10px',
                                border: '1px solid var(--border-color)',
                                boxShadow: 'var(--shadow-xl)',
                                zIndex: 200,
                                maxHeight: '320px',
                                overflowY: 'auto',
                                padding: '6px'
                            }}>
                                {searchResults.length > 0 ? searchResults.map((result, idx) => (
                                    <Link
                                        key={idx}
                                        to={result.path}
                                        onClick={() => setSearchQuery('')}
                                        style={dropdownItemStyle}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                    >
                                        <div style={{
                                            width: '28px', height: '28px',
                                            borderRadius: '6px',
                                            background: `${result.categoryColor}15`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: result.categoryColor,
                                            flexShrink: 0
                                        }}>
                                            {React.isValidElement(result.icon) && React.cloneElement(result.icon, { width: 14, height: 14, strokeWidth: 2 })}
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>{result.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{result.categoryName}</div>
                                        </div>
                                    </Link>
                                )) : (
                                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        Nenhum resultado para "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center', justifyContent: 'flex-end' }}>

                    {/* Unit selector */}
                    <div ref={unitRef} onClick={() => setIsUnitMenuOpen(!isUnitMenuOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', position: 'relative', padding: '5px 10px', borderRadius: 'var(--radius)', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Unidade</span>
                            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                                {(AVAILABLE_UNITS.find(u => u.id === activeUnit)?.name || 'Selecione')}
                            </span>
                        </div>

                        {isUnitMenuOpen && (
                            <div style={{ ...dropdownStyle, top: '46px', right: '0', width: '200px', padding: '6px' }}>
                                {AVAILABLE_UNITS.map(unit => (
                                    <div
                                        key={unit.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            switchUnit(unit.id);
                                            setIsUnitMenuOpen(false);
                                        }}
                                        style={{
                                            ...dropdownItemStyle,
                                            color: activeUnit === unit.id ? 'var(--text-main)' : 'var(--text-muted)',
                                            fontWeight: activeUnit === unit.id ? '600' : '400',
                                            borderRadius: '6px'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = activeUnit === unit.id ? 'var(--text-main)' : 'var(--text-muted)'; }}
                                    >
                                        {unit.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sync & Cache Controls */}
                    <div ref={dataRef} style={{ position: 'relative' }}>
                        <div
                            onClick={() => setIsDataMenuOpen(!isDataMenuOpen)}
                            style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                backgroundColor: isDataMenuOpen ? 'var(--bg-elevated)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: `1px solid ${isDataMenuOpen ? 'var(--border-color)' : 'transparent'}`,
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                            onMouseLeave={e => { if (!isDataMenuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 4v6h-6"></path>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                        </div>

                        {isDataMenuOpen && (
                            <div style={{ ...dropdownStyle, top: '42px', right: '0', width: '240px', padding: '12px' }}>
                                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                                    Controle de Dados (Local)
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>Modo Offline</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Usar dados em cache</span>
                                        </div>
                                        <div
                                            onClick={() => setDataMode(dataMode === 'live' ? 'cache' : 'live')}
                                            style={{
                                                width: '34px', height: '18px', borderRadius: '10px',
                                                background: dataMode === 'cache' ? 'var(--color-info-strong)' : 'var(--bg-input)',
                                                position: 'relative', transition: 'all 0.3s', cursor: 'pointer'
                                            }}
                                        >
                                            <div style={{
                                                width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                                                position: 'absolute', top: '2px',
                                                left: dataMode === 'cache' ? '18px' : '2px',
                                                transition: 'all 0.3s ease'
                                            }} />
                                        </div>
                                    </div>

                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                                    <div style={{ padding: '4px' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                            Última Sincronização: <br />
                                            <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                                                {lastSync ? new Date(lastSync).toLocaleString('pt-BR') : 'Nunca realizada'}
                                            </span>
                                        </div>

                                        <button
                                            onClick={async () => {
                                                setIsSyncing(true);
                                                await syncOfflineCache();
                                                setIsSyncing(false);
                                            }}
                                            disabled={isSyncing}
                                            style={{
                                                width: '100%', padding: '8px', borderRadius: '6px',
                                                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                                                color: 'var(--text-main)', fontSize: '12px', cursor: isSyncing ? 'wait' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-input)'}
                                        >
                                            <svg className={isSyncing ? 'spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M23 4v6h-6"></path>
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                            </svg>
                                            {isSyncing ? 'Sincronizando...' : 'Sincronizar Banco Agora'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Theme Switcher Top Level */}
                    <ThemeSwitcher />

                    {/* Apps menu */}
                    <div ref={appsRef} style={{ position: 'relative' }}>
                        <div
                            onClick={() => setIsAppsMenuOpen(!isAppsMenuOpen)}
                            style={{
                                width: '32px', height: '32px',
                                borderRadius: '8px',
                                backgroundColor: isAppsMenuOpen ? 'var(--bg-elevated)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                border: `1px solid ${isAppsMenuOpen ? 'var(--border-color)' : 'transparent'}`,
                            }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (!isAppsMenuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>

                        {isAppsMenuOpen && (
                            <div style={{ ...dropdownStyle, top: '42px', right: '0', width: '200px', padding: '6px' }}>

                                {userRole === 'admin' && (
                                    <Link
                                        to="/admin/audit"
                                        onClick={() => setIsAppsMenuOpen(false)}
                                        style={{ ...dropdownItemStyle, borderRadius: '6px' }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                    >
                                        <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                                                <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                                            </svg>
                                        </div>
                                        Logs de Acesso
                                    </Link>
                                )}

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                                <a
                                    href="https://wa.me/5547991047677"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setIsAppsMenuOpen(false)}
                                    style={{ ...dropdownItemStyle, borderRadius: '6px' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                                            <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                        </svg>
                                    </div>
                                    Central de Ajuda
                                </a>
                            </div>
                        )}
                    </div>

                    {/* User profile */}
                    <div
                        ref={userRef}
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '5px 10px',
                            borderRadius: 'var(--radius)',
                            transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                        ) : (
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                        )}
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
                            {name?.split(' ')[0] || 'Usuário'}
                        </span>

                        {isUserMenuOpen && (
                            <div style={{ ...dropdownStyle, top: '46px', right: '0', width: '180px', padding: '6px' }}>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsUserMenuOpen(false)}
                                    style={{ ...dropdownItemStyle, borderRadius: '6px' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                >
                                    Meus Dados
                                </Link>

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                                <div style={{ padding: '6px 14px', fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Densidade de Tela
                                </div>
                                {['comfortable', 'default', 'compact'].map(mode => (
                                    <div
                                        key={mode}
                                        onClick={(e) => { e.stopPropagation(); setDensity(mode); }}
                                        style={{
                                            ...dropdownItemStyle,
                                            borderRadius: '6px',
                                            color: density === mode ? 'var(--text-main)' : 'var(--text-muted)',
                                            fontWeight: density === mode ? '600' : '400'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = density === mode ? 'var(--text-main)' : 'var(--text-muted)'; }}
                                    >
                                        <div style={{ width: '14px', display: 'flex', justifyContent: 'center', opacity: density === mode ? 1 : 0 }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        </div>
                                        {mode === 'comfortable' ? 'Confortável' : mode === 'default' ? 'Padrão' : 'Compacta (Nativo)'}
                                    </div>
                                ))}

                                {userRole === 'admin' && (
                                    <>
                                        <Link
                                            to="/admin/upload"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            style={{ ...dropdownItemStyle, borderRadius: '6px' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            Upload de Dados
                                        </Link>
                                        <Link
                                            to="/admin"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            style={{ ...dropdownItemStyle, borderRadius: '6px' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-main)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                                        >
                                            Gestão de Usuários
                                        </Link>
                                    </>
                                )}

                                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

                                <div
                                    onClick={handleLogout}
                                    style={{ ...dropdownItemStyle, color: 'var(--color-error)', borderRadius: '6px', fontWeight: '500' }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                                >
                                    Sair
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mega Menu */}
            {isMegaMenuOpen && (
                <div
                    ref={sidebarRef}
                    className="scroll-container"
                    onMouseEnter={() => { if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current); }}
                    onMouseLeave={() => { menuTimeoutRef.current = setTimeout(() => { setIsMegaMenuOpen(false); }, 300); }}
                    style={{
                        position: 'absolute',
                        top: '62px',
                        left: '12px',
                        width: activeCategoryId ? '700px' : '280px',
                        height: 'calc(100vh - 74px)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        zIndex: 40,
                        display: 'flex',
                        flexDirection: 'row',
                        overflow: 'hidden',
                        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>

                    <div className="scroll-container" style={{
                        width: '280px', minWidth: '280px',
                        background: 'transparent',
                        borderRight: '1px solid var(--border-color)',
                        display: 'flex', flexDirection: 'column',
                        padding: '8px',
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
                                        padding: '10px 14px',
                                        cursor: 'pointer',
                                        background: isActive ? 'var(--bg-hover)' : 'transparent',
                                        color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                                        fontWeight: isActive ? '600' : '400',
                                        fontSize: '13px',
                                        transition: 'all 0.15s ease',
                                        borderRadius: 'var(--radius-sm)',
                                        letterSpacing: '-0.01em'
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    <span>{category.name}</span>
                                    {isActive && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>}
                                </div>
                            );
                        })}
                    </div>

                    {activeCategoryId && (
                        <div className="scroll-container" style={{
                            flex: 1,
                            background: 'var(--bg-card)',
                            padding: '20px',
                            display: 'flex', flexDirection: 'column', gap: "var(--space-4)",
                            overflowY: 'auto'
                        }}>
                            {(() => {
                                const activeCategoryData = categories.find(c => c.id === activeCategoryId);
                                return (
                                    <>
                                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                                            {activeCategoryData?.name}
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
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
                                                        gap: '8px',
                                                        cursor: 'pointer',
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        transition: 'background 0.1s',
                                                        border: '1px solid transparent'
                                                    }}
                                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                                                >
                                                    <div style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }}>
                                                        {React.cloneElement(module.icon, { width: 14, height: 14, strokeWidth: 2 })}
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', letterSpacing: '-0.01em' }}>{module.title}</span>
                                                        {module.subtitle && <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{module.subtitle}</span>}
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
            )}

            <style>{`
                .scroll-container::-webkit-scrollbar { width: 4px; }
                .scroll-container::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 4px; }
            `}</style>
        </div>
    );
};

export default Header;
