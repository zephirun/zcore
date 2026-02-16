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

        // Determine active filters
        const activeVendor = globalFilters.vendor && globalFilters.vendor !== 'Selecionar Todos' ? globalFilters.vendor : null;
        const activeClient = globalFilters.client && globalFilters.client !== 'Selecionar Todos' ? globalFilters.client : null;

        if (!salesData) return { vendors: [], clients: [] };

        salesData.forEach(row => {
            const rowVendor = row.client?.vendor || '';
            const rowClient = row.client?.name || '';

            // Logic for Vendors Dropdown:
            if (!activeClient || rowClient === activeClient) {
                if (rowVendor) vendors.add(rowVendor);
            }

            // Logic for Clients Dropdown:
            if (!activeVendor || rowVendor === activeVendor) {
                if (rowClient) {
                    const clientId = row.client.id || '';
                    clients.add(clientId ? `${rowClient} - ${clientId}` : rowClient);
                }
            }
        });

        return {
            vendors: Array.from(vendors).sort(),
            clients: Array.from(clients).sort()
        };
    }, [salesData, globalFilters]);

    const isActive = (path) => location.pathname === path;

    const isVendorRestricted = userRole !== 'admin' && allowedVendor;

    return (
        <div className="filters-container" style={{
            padding: '15px 40px',
            background: 'var(--bg-input)',
            borderBottom: '1px solid var(--border-color)'
        }}>
            {/* Title and Tabs Header */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                marginBottom: '20px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '15px'
            }}>
                {/* Left: Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ fontSize: '18px', color: 'var(--text-main)', fontWeight: '700', margin: 0 }}>
                        Faturamento Trimestral
                    </h2>
                </div>

                {/* Center: Tabs */}
                <nav style={{ display: 'flex', gap: '5px', background: 'var(--bg-main)', padding: '4px', borderRadius: '8px' }}>
                    <Link to="/sales/dashboard" style={{
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive('/sales/dashboard') ? '600' : '500',
                        color: isActive('/sales/dashboard') ? 'var(--color-primary)' : 'var(--text-muted)',
                        padding: '6px 20px',
                        borderRadius: '6px',
                        background: isActive('/sales/dashboard') ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive('/sales/dashboard') ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                    }}>
                        Dashboard
                    </Link>
                    <Link to="/sales/report" style={{
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: isActive('/sales/report') ? '600' : '500',
                        color: isActive('/sales/report') ? 'var(--color-primary)' : 'var(--text-muted)',
                        padding: '6px 20px',
                        borderRadius: '6px',
                        background: isActive('/sales/report') ? 'var(--bg-card)' : 'transparent',
                        boxShadow: isActive('/sales/report') ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        transition: 'all 0.2s',
                        display: 'inline-block'
                    }}>
                        Relatório
                    </Link>
                </nav>

                {/* Right: Export/Print Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {rightElement}
                </div>
            </div>

            {/* Filters Row */}
            <div style={{
                display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap'
            }}>
                {/* Vendor Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '250px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vendedor</label>
                    <SearchableSelect
                        options={isVendorRestricted ? [allowedVendor] : options.vendors}
                        value={isVendorRestricted ? allowedVendor : globalFilters.vendor}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, vendor: val, client: 'Selecionar Todos' }))}
                        placeholder="Selecione o Vendedor"
                        disabled={isVendorRestricted}
                    />
                </div>

                {/* Client Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '300px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cliente</label>
                    <SearchableSelect
                        options={options.clients}
                        value={globalFilters.client}
                        onChange={(val) => setGlobalFilters(prev => ({ ...prev, client: val }))}
                        placeholder="Selecione o Cliente"
                    />
                </div>

                {/* Ranking/Extremes Filter */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', width: '220px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destaques / Ranking</label>
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
                {!isVendorRestricted && (
                    <button
                        onClick={() => setGlobalFilters({ vendor: 'Selecionar Todos', client: 'Selecionar Todos', ranking: 'Sem Ordenação' })}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            height: '35px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        LIMPAR FILTROS
                    </button>
                )}

                {isVendorRestricted && (
                    <button
                        onClick={() => setGlobalFilters(prev => ({ ...prev, client: 'Selecionar Todos', ranking: 'Sem Ordenação' }))}
                        style={{
                            padding: '8px 16px',
                            background: 'var(--bg-input)',
                            color: 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            height: '35px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                        }}
                    >
                        LIMPAR FILTROS
                    </button>
                )}
            </div>
        </div>
    );
};

export default Filters;
