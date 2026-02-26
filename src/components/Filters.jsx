import Button from '@/components/ui/Button';

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

        const activeVendor = globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null;
        const activeClient = globalFilters.client && globalFilters.client !== 'Selecionar Todos' ? globalFilters.client : null;
        const activeRep = globalFilters.representative && globalFilters.representative !== 'Selecionar Todos' ? globalFilters.representative : null;

        if (!salesData) return { vendors: [], clients: [], representatives: [] };

        salesData.forEach(row => {
            const rowVendor = row.client?.vendor || '';
            const rowClient = row.client?.name || '';
            const rowRep = row.client?.representative || '';

            const clientMatchForVendor = !activeClient || rowClient === activeClient;
            const repMatchForVendor = !activeRep || rowRep === activeRep;
            if (clientMatchForVendor && repMatchForVendor) {
                if (rowVendor) vendors.add(rowVendor);
            }

            const vendorMatchForRep = !activeVendor || rowVendor === activeVendor;
            const clientMatchForRep = !activeClient || rowClient === activeClient;
            if (vendorMatchForRep && clientMatchForRep) {
                if (rowRep) representatives.add(rowRep);
            }

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

    const tabStyle = (path) => ({
        textDecoration: 'none',
        fontSize: '13px',
        fontWeight: isActive(path) ? '600' : '400',
        color: isActive(path) ? 'var(--bg-main)' : 'var(--text-muted)',
        padding: '7px 18px',
        borderRadius: '8px',
        background: isActive(path) ? 'var(--color-primary)' : 'transparent',
        transition: 'all 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        whiteSpace: 'nowrap',
    });

    return (
        <div className="filters-container no-print" style={{
            padding: '16px 40px',
            background: 'var(--bg-main)',
            borderBottom: '1px solid var(--border-color)',
            position: 'relative',
            zIndex: 10,
        }}>
            {/* Header row: Title + Tabs + Right */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
            }}>
                {/* Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--bg-card)',
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                    }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="20" x2="18" y2="10"></line>
                            <line x1="12" y1="20" x2="12" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="14"></line>
                        </svg>
                    </div>
                    <span style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--text-main)',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                    }}>
                        Faturamento Trimestral
                    </span>
                </div>

                {/* Tabs */}
                <nav style={{
                    display: 'flex',
                    gap: '2px',
                    background: 'var(--bg-input)',
                    padding: '3px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                }}>
                    <Link to="/sales/dashboard" style={tabStyle('/sales/dashboard')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                        Dashboard
                    </Link>
                    <Link to="/sales/report" style={tabStyle('/sales/report')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                        </svg>
                        Relatório
                    </Link>
                    <Link to="/sales/simulation" style={tabStyle('/sales/simulation')}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="10" y1="15" x2="10" y2="9"></line>
                            <line x1="14" y1="15" x2="14" y2="9"></line>
                        </svg>
                        Simulação
                    </Link>
                </nav>

                {/* Right element */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {rightElement}
                </div>
            </div>

            {/* Filters Row — flat, no background box */}
            <div style={{
                display: 'flex',
                gap: '24px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                marginTop: '8px'
            }}>
                {/* Vendor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '200px' }}>
                    <label style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}>
                        Vendedor
                    </label>
                    <SearchableSelect
                        options={isVendorRestricted ? [allowedVendor] : options.vendors}
                        value={isVendorRestricted ? allowedVendor : globalFilters.vendor}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, vendor: val, client: 'Selecionar Todos' }))}
                        placeholder="Todos"
                        disabled={isVendorRestricted}
                    />
                </div>

                {/* Representative */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '200px' }}>
                    <label style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}>
                        Representante
                    </label>
                    <SearchableSelect
                        options={options.representatives}
                        value={globalFilters.representative}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, representative: val }))}
                        placeholder="Todos"
                    />
                </div>

                {/* Client */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '260px' }}>
                    <label style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}>
                        Cliente
                    </label>
                    <SearchableSelect
                        options={options.clients}
                        value={globalFilters.client}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, client: val }))}
                        placeholder="Todos"
                    />
                </div>

                {/* Ranking */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '200px' }}>
                    <label style={{
                        fontSize: '10px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                    }}>
                        Ordenação
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
                        placeholder="Sem Ordenação"
                    />
                </div>

                {/* Reset */}
                <div style={{ paddingBottom: '1px' }}>
                    <Button
                        onClick={() => {
                            if (!isVendorRestricted) {
                                setGlobalFilters({ vendor: 'Selecionar Todos', representative: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' });
                            } else {
                                setGlobalFilters(prev => ({ ...prev, representative: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' }));
                            }
                        }}
                        style={{
                            padding: '0 14px',
                            height: '36px',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            transition: 'all 0.15s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-error)';
                            e.currentTarget.style.color = 'var(--color-error)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                        }}
                    >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Limpar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Filters;
