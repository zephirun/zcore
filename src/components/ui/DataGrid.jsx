import React, { useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Skeleton from './Skeleton';
import { useData } from '../../context/DataContext';

/**
 * Enterprise Data Grid
 * Handles 100k+ rows via virtualization
 */
const DataGrid = ({
    columns = [],
    data = [],
    isLoading = false,
    emptyMessage = "Nenhum registro encontrado.",
    rowHeightMode = null, // Deprecated, will use global density if null
    style,
    className = '',
    onRowClick = null,
    sortColumn = null,
    sortDirection = 'asc',
    onSort = null,
    height = '100%', // MUST have constrained height for virtualizer to work
}) => {
    const parentRef = useRef(null);

    const { density } = useData();

    // Row Height Dictionary mapped to Global Density Context
    const activeDensity = rowHeightMode || density || 'default';
    const ROW_HEIGHTS = {
        compact: 32,
        default: 48,
        comfortable: 64,
    };
    const rowHeight = ROW_HEIGHTS[activeDensity] || ROW_HEIGHTS.default;

    // Grid Template Builder
    const gridTemplateColumns = useMemo(() => {
        return columns
            .map(col => col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : '1fr')
            .join(' ');
    }, [columns]);

    // Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: isLoading ? 0 : data.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        overscan: 10, // Render extra rows for smooth fast-scrolling
    });

    // Semantic alignment mapped to grid items
    const getAlignment = (align) => {
        switch (align) {
            case 'right': return 'flex-end';
            case 'center': return 'center';
            default: return 'flex-start';
        }
    };

    return (
        <div className={`ui-data-grid-wrapper ${className}`} style={{
            display: 'flex',
            flexDirection: 'column',
            height: height,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            ...style
        }}>

            {/* HEADER - Fixed via Grid, detached from virtualized body for 0-jitter */}
            <div className="ui-data-grid-header" style={{
                display: 'grid',
                gridTemplateColumns,
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-color)',
                width: '100%',
                paddingRight: '12px' // Compensate for scrollbar roughly
            }}>
                {columns.map((col, idx) => (
                    <div
                        key={col.key || idx}
                        onClick={() => col.sortable && onSort && onSort(col.key)}
                        style={{
                            padding: 'var(--density-table-cell-padding)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: getAlignment(col.align),
                            fontWeight: '800',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            cursor: col.sortable ? 'pointer' : 'default',
                            userSelect: 'none',
                            transition: 'color var(--motion-fast) var(--ease-standard), background var(--motion-fast) var(--ease-standard)'
                        }}
                        onMouseEnter={e => { if (col.sortable) { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'var(--bg-hover)'; } }}
                        onMouseLeave={e => { if (col.sortable) { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; } }}
                    >
                        {col.label}
                        {col.sortable && sortColumn === col.key && (
                            <span style={{ marginLeft: '6px', color: 'var(--color-info)', display: 'flex' }}>
                                {sortDirection === 'asc' ? (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                                ) : (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                )}
                            </span>
                        )}
                        {col.sortable && sortColumn !== col.key && (
                            <span style={{ marginLeft: '6px', color: 'transparent', display: 'flex' }} className="sort-icon-placeholder">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* VIRTUALIZED BODY */}
            <div
                ref={parentRef}
                className="scroll-container"
                style={{
                    flex: 1,
                    overflow: 'auto',
                    position: 'relative'
                }}
            >
                {isLoading ? (
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[...Array(8)].map((_, i) => (
                            <Skeleton key={i} height={rowHeight - 8} borderRadius="8px" />
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-muted)',
                        padding: '40px'
                    }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="3" y1="9" x2="21" y2="9"></line>
                            <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>{emptyMessage}</span>
                    </div>
                ) : (
                    <div
                        style={{
                            height: `${rowVirtualizer.getTotalSize()}px`,
                            width: '100%',
                            position: 'relative',
                        }}
                    >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = data[virtualRow.index];
                            return (
                                <div
                                    key={virtualRow.key}
                                    onClick={() => onRowClick && onRowClick(row, virtualRow.index)}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: `${virtualRow.size}px`,
                                        transform: `translateY(${virtualRow.start}px)`,
                                        display: 'grid',
                                        gridTemplateColumns,
                                        borderBottom: '1px solid var(--border-color)',
                                        background: 'var(--bg-main)', // Use main for rows, card for container
                                        cursor: onRowClick ? 'pointer' : 'default',
                                        transition: 'background-color var(--motion-fast) var(--ease-standard)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--bg-hover)' }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--bg-main)' }}
                                >
                                    {columns.map((col, idx) => {
                                        const cellValue = col.render ? col.render(row) : row[col.key];
                                        return (
                                            <div
                                                key={idx}
                                                style={{
                                                    padding: '0 var(--density-padding-md)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: getAlignment(col.align),
                                                    fontSize: '13px',
                                                    color: 'var(--text-main)',
                                                    overflow: 'hidden',
                                                    whiteSpace: 'nowrap',
                                                    textOverflow: 'ellipsis',
                                                }}
                                                title={typeof cellValue === 'string' || typeof cellValue === 'number' ? cellValue : undefined}
                                            >
                                                {cellValue}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                .ui-data-grid-header:hover .sort-icon-placeholder {
                    color: var(--text-muted) !important;
                    opacity: 0.3;
                }
            `}</style>
        </div>
    );
};

export default DataGrid;
