import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SearchableSelect from './SearchableSelect';
import { useData } from '../context/DataContext';

const Filters = ({ rightElement }) => {
    const {
        salesData,
        globalFilters,
        setGlobalFilters,
        userRole,
        allowedVendor
    } = useData();
    const location = useLocation();

    // Dynamic Filter Options based on current selection
    const options = useMemo(() => {
        const vendors = new Set(['Selecionar Todos']);
        const clients = new Set(['Selecionar Todos']);
        const representatives = new Set(['Selecionar Todos']);

        // Determine active filters
        const activeVendor = globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null;
        const activeClient = globalFilters.client && globalFilters.client !== 'Selecionar Todos' ? globalFilters.client : null;
        const activeRep = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos' ? globalFilters.representative : null;

        if (!salesData) return { vendors: [], clients: [], representatives: [] };

        salesData.forEach(row => {
            const rowVendor = row.client?.vendor || '';
            const rowClient = row.client?.name || '';
            const rowRep = row.client?.representative || '';

            // Logic for Vendors Dropdown:
            // Should show all vendors that match the current client and representative filter
            const clientMatchForVendor = !activeClient || rowClient === activeClient;
            const repMatchForVendor = !activeRep || rowRep === activeRep;
            if (clientMatchForVendor && repMatchForVendor) {
                if (rowVendor) vendors.add(rowVendor);
            }

            // Logic for Representatives Dropdown:
            const vendorMatchForRep = !activeVendor || rowVendor === activeVendor;
            const clientMatchForRep = !activeClient || rowClient === activeClient;
            if (vendorMatchForRep && clientMatchForRep) {
                if (rowRep) representatives.add(rowRep);
            }

            // Logic for Clients Dropdown:
            const vendorMatchForClient = !activeVendor || rowVendor === activeVendor;
            const repMatchForClient = !activeRep || rowRep === activeRep;
            if (vendorMatchForClient && repMatchForClient) {
                if (rowClient) {
                    const clientId = row.client.id || '';
                    clients.add(clientId ? `${rowClient} - ${clientId}` : rowClient);
                }
            }
        });

        const sortWithSelectAll = (set) => {
            const arr = Array.from(set).filter(item => item !== 'Selecionar Todos').sort();
            return ['Selecionar Todos', ...arr];
        };

        return {
            vendors: sortWithSelectAll(vendors),
            clients: sortWithSelectAll(clients),
            representatives: sortWithSelectAll(representatives)
        };
    }, [salesData, globalFilters]);

    const isActive = (path) => location.pathname === path;

    const isVendorRestricted = userRole !== 'admin' && allowedVendor;

    return (
        <div className="filters-container" style={{
            padding: '24px 40px',
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-color)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            position: 'relative',
            zIndex: 10
        }}>
            {/* Title and Tabs Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                paddingBottom: '20px',
                borderBottom: '1px solid var(--border-color)'
            }}>
                {/* Left: Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'var(--bg-input)',
                        color: 'var(--text-muted)'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                    <h2 style={{
                        fontSize: '18px',
                        color: 'var(--text-main)',
                        fontWeight: '700',
                        margin: 0,
                        letterSpacing: '0.2px',
                        textTransform: 'uppercase'
                    }}>
                        Faturamento Trimestral
                    </h2>
                </div>

                {/* Center: Tabs */}
                <nav style={{
                    display: 'flex',
                    gap: '4px',
                    background: 'var(--bg-input)',
                    padding: '4px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                }}>
                    <Link to="/sales/dashboard" style={{
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive('/sales/dashboard') ? '700' : '500',
                        color: isActive('/sales/dashboard') ? '#3498db' : 'var(--text-muted)',
                        padding: '8px 24px',
                        borderRadius: '10px',
                        background: isActive('/sales/dashboard') ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive('/sales/dashboard') ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                    </Link>
                    <Link to="/sales/report" style={{
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive('/sales/report') ? '700' : '500',
                        color: isActive('/sales/report') ? '#3498db' : 'var(--text-muted)',
                        padding: '8px 24px',
                        borderRadius: '10px',
                        background: isActive('/sales/report') ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive('/sales/report') ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Relatório
                    </Link>
                    <Link to="/sales/simulation" style={{
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive('/sales/simulation') ? '700' : '500',
                        color: isActive('/sales/simulation') ? '#3498db' : 'var(--text-muted)',
                        padding: '8px 24px',
                        borderRadius: '10px',
                        background: isActive('/sales/simulation') ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive('/sales/simulation') ? 'var(--shadow-sm)' : 'none',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="10" y1="15" x2="10" y2="9"></line>
                            <line x1="14" y1="15" x2="14" y2="9"></line>
                        </svg>
                        Simulação
                    </Link>
                </nav>

                {/* Right: Export/Print Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {rightElement}
                </div>
            </div>

            {/* Filters Row */}
            <div style={{
                display: 'flex', gap: '24px', alignItems: 'flex-end', flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.03)',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Vendor Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
                    <label style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#3498db',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Vendedor
                    </label>
                    <SearchableSelect
                        options={isVendorRestricted ? [allowedVendor] : options.vendors}
                        value={isVendorRestricted ? allowedVendor : globalFilters.vendor}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, vendor: val, client: 'Selecionar Todos' }))}
                        placeholder="Selecione o Vendedor"
                        disabled={isVendorRestricted}
                    />
                </div>

                {/* Representative Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
                    <label style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#f39c12',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                        </svg>
                        Representante
                    </label>
                    <SearchableSelect
                        options={options.representatives}
                        value={globalFilters.representative}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, representative: val }))}
                        placeholder="Selecione o Representante"
                    />
                </div>

                {/* Client Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '280px' }}>
                    <label style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#2ecc71',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Cliente
                    </label>
                    <SearchableSelect
                        options={options.clients}
                        value={globalFilters.client}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, client: val }))}
                        placeholder="Selecione o Cliente"
                    />
                </div>

                {/* Ranking/Extremes Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '220px' }}>
                    <label style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#e74c3c',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                            <polyline points="17 6 23 6 23 12"></polyline>
                        </svg>
                        Destaques / Ranking
                    </label>
                    <SearchableSelect
                        options={[
                            'Sem Ordenação',
                            'Maior Faturamento',
                            'Menor Faturamento',
                            'Maior Margem',
                            'Menor Margem',
                            'Maior Prazo',
                            'Menor Prazo'
                        ]}
                        value={globalFilters.ranking}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, ranking: val }))}
                        placeholder="Filtrar Extremos"
                    />
                </div>

                {/* Reset Button */}
                <div style={{ height: '38px', display: 'flex', alignItems: 'center' }}>
                    <button
                        onClick={() => {
                            if (!isVendorRestricted) {
                                setGlobalFilters({ vendor: 'Selecionar Todos', representative: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' });
                            } else {
                                setGlobalFilters(prev => ({ ...prev, representative: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' }));
                            }
                        }}
                        style={{
                            padding: '0 20px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            height: '38px',
                            fontSize: '11px',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)';
                            e.currentTarget.style.color = '#e74c3c';
                            e.currentTarget.style.borderColor = 'rgba(231, 76, 60, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Limpar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
