import React, { useRef, useState, useMemo, useCallback, memo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Skeleton from './Skeleton';
import { useData } from '../../context/DataContext';

/**
 * Enterprise Data Grid (SAP Fiori 3 Standard)
 * Handles 100k+ rows via virtualization, memoization, multi-sort, resize.
 */
const DataGrid = ({
    columns = [],
    data = [],
    isLoading = false,
    emptyMessage = "Nenhum registro encontrado.",
    style,
    className = '',
    onRowClick = null,
    selectable = false,
    onSelectionChange = null,
    height = '100%',
    defaultSortContext = [], // Array of { key, direction }
    keyField = 'id'
}) => {
    const parentRef = useRef(null);
    const { density } = useData();

    const [sortContext, setSortContext] = useState(defaultSortContext);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [columnWidths, setColumnWidths] = useState({});
    const [resizingCol, setResizingCol] = useState(null);

    // Row Height Dictionary mapped to Global Density Context
    const activeDensity = density || 'default';
    const ROW_HEIGHTS = {
        compact: 32,
        default: 44,
        comfortable: 48,
    };
    const rowHeight = ROW_HEIGHTS[activeDensity] || ROW_HEIGHTS.default;

    // Handle Sorting (Multi-column support)
    const handleSort = (colKey) => {
        setSortContext(prev => {
            const existing = prev.find(s => s.key === colKey);
            if (!existing) return [{ key: colKey, direction: 'asc' }, ...prev];
            if (existing.direction === 'asc') {
                return prev.map(s => s.key === colKey ? { ...s, direction: 'desc' } : s);
            }
            return prev.filter(s => s.key !== colKey); // remove sort
        });
    };

    // Derived sorted data
    const sortedData = useMemo(() => {
        if (!sortContext.length) return data;
        return [...data].sort((a, b) => {
            for (let sort of sortContext) {
                const valA = a[sort.key];
                const valB = b[sort.key];
                if (valA === valB) continue;
                const multiplier = sort.direction === 'asc' ? 1 : -1;
                return valA > valB ? multiplier : -multiplier;
            }
            return 0;
        });
    }, [data, sortContext]);

    // Handle Resize
    const handleResizeStart = (e, colKey) => {
        e.stopPropagation();
        setResizingCol({ key: colKey, startX: e.clientX, startWidth: columnWidths[colKey] || 150 });
    };

    // Ensure global mouse events for resize dragging
    React.useEffect(() => {
        if (!resizingCol) return;
        const handleMouseMove = (e) => {
            const diff = e.clientX - resizingCol.startX;
            const newWidth = Math.max(80, resizingCol.startWidth + diff);
            setColumnWidths(prev => ({ ...prev, [resizingCol.key]: newWidth }));
        };
        const handleMouseUp = () => setResizingCol(null);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingCol]);

    // Grid Template Builder
    const gridTemplateColumns = useMemo(() => {
        let cols = columns.map(col => {
            if (columnWidths[col.key]) return `${columnWidths[col.key]}px`;
            return col.width ? (typeof col.width === 'number' ? `${col.width}px` : col.width) : '1fr';
        });
        if (selectable) cols.unshift('var(--space-12)'); // Checkbox column
        return cols.join(' ');
    }, [columns, columnWidths, selectable]);

    // Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: isLoading ? 0 : sortedData.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => rowHeight,
        getItemKey: (index) => sortedData[index][keyField] || index,
        overscan: 10,
    });

    const getAlignment = (align) => {
        switch (align) {
            case 'right': return 'flex-end';
            case 'center': return 'center';
            default: return 'flex-start';
        }
    };

    const toggleRowSelection = (row) => {
        const newSet = new Set(selectedRows);
        const key = row[keyField];
        if (newSet.has(key)) newSet.delete(key);
        else newSet.add(key);
        setSelectedRows(newSet);
        if (onSelectionChange) {
            const selectedItems = data.filter(r => newSet.has(r[keyField]));
            onSelectionChange(selectedItems);
        }
    };

    const toggleAllSelection = () => {
        if (selectedRows.size === sortedData.length) {
            setSelectedRows(new Set());
            if (onSelectionChange) onSelectionChange([]);
        } else {
            const newSet = new Set(sortedData.map(r => r[keyField]));
            setSelectedRows(newSet);
            if (onSelectionChange) onSelectionChange(sortedData);
        }
    };

    return (
        <div className={`ui-data-grid-wrapper ${className}`} style={{
            display: 'flex', flexDirection: 'column', height: height,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
            ...style
        }}>
            {/* TOOLBAR (Bulk Actions / Column Visibility stub) */}
            {selectable && selectedRows.size > 0 && (
                <div style={{
                    padding: 'var(--space-2) var(--space-4)', background: 'var(--bg-selected)', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--color-accent)', fontWeight: 'var(--font-semibold)'
                }}>
                    <span>{selectedRows.size} itens selecionados</span>
                </div>
            )}

            {/* HEADER */}
            <div className="ui-data-grid-header" style={{
                display: 'grid', gridTemplateColumns, background: 'var(--bg-main)',
                borderBottom: '1px solid var(--border-color)', width: '100%', paddingRight: 'var(--space-3)'
            }}>
                {selectable && (
                    <div style={{
                        padding: 'var(--density-table-cell-padding)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRight: '1px solid var(--border-subtle)'
                    }}>
                        <input type="checkbox" checked={sortedData.length > 0 && selectedRows.size === sortedData.length} onChange={toggleAllSelection} />
                    </div>
                )}
                {columns.map((col, idx) => {
                    const sortData = sortContext.find(s => s.key === col.key);
                    return (
                        <div
                            key={col.key || idx}
                            onClick={() => col.sortable && handleSort(col.key)}
                            style={{
                                padding: 'var(--density-table-cell-padding)', display: 'flex', alignItems: 'center',
                                justifyContent: getAlignment(col.align), fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)',
                                color: 'var(--text-muted)', textTransform: 'uppercase', cursor: col.sortable ? 'pointer' : 'default',
                                userSelect: 'none', position: 'relative', borderRight: '1px solid var(--border-subtle)',
                                background: sortData ? 'var(--bg-hover)' : 'transparent', transition: 'background var(--motion-fast)'
                            }}
                            onMouseEnter={e => { if (col.sortable) e.currentTarget.style.background = 'var(--bg-hover)'; }}
                            onMouseLeave={e => { if (col.sortable && !sortData) e.currentTarget.style.background = 'transparent'; }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col.label}</span>
                            {sortData && (
                                <span style={{ marginLeft: 'var(--space-1)', color: 'var(--color-info)' }}>
                                    {sortData.direction === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                            {/* Resize Handle */}
                            <div
                                onMouseDown={(e) => handleResizeStart(e, col.key)}
                                style={{
                                    position: 'absolute', right: 0, top: 0, bottom: 0, width: 'var(--space-1)', cursor: 'col-resize',
                                    background: resizingCol?.key === col.key ? 'var(--color-primary)' : 'transparent',
                                    transition: 'background var(--motion-slow)', zIndex: 2
                                }}
                            />
                        </div>
                    );
                })}
            </div>

            {/* VIRTUALIZED BODY */}
            <div ref={parentRef} className="scroll-container hide-scrollbar" style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
                {isLoading ? (
                    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {[...Array(8)].map((_, i) => <Skeleton key={i} height={rowHeight - 8} borderRadius="var(--radius)" />)}
                    </div>
                ) : sortedData.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: 'var(--space-10)' }}>
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>{emptyMessage}</span>
                    </div>
                ) : (
                    <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                            const row = sortedData[virtualRow.index];
                            const isSelected = selectedRows.has(row[keyField]);
                            return (
                                <MemoizedRow
                                    key={virtualRow.key}
                                    virtualRow={virtualRow}
                                    row={row}
                                    columns={columns}
                                    gridTemplateColumns={gridTemplateColumns}
                                    getAlignment={getAlignment}
                                    onRowClick={onRowClick ? () => onRowClick(row, virtualRow.index) : null}
                                    selectable={selectable}
                                    isSelected={isSelected}
                                    onSelect={() => toggleRowSelection(row)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Memoized Row to prevent re-renders on hover across 50k items
const MemoizedRow = memo(({ virtualRow, row, columns, gridTemplateColumns, getAlignment, onRowClick, selectable, isSelected, onSelect }) => {
    return (
        <div
            onClick={onRowClick}
            style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)`,
                display: 'grid', gridTemplateColumns, borderBottom: '1px solid var(--border-color)',
                background: isSelected ? 'var(--bg-selected)' : 'var(--bg-elevated)', cursor: onRowClick ? 'pointer' : 'default',
            }}
            onMouseEnter={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; }}
            onMouseLeave={e => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
        >
            {selectable && (
                <div style={{ padding: '0 var(--density-padding-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-subtle)' }} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={isSelected} onChange={onSelect} />
                </div>
            )}
            {columns.map((col, idx) => {
                const cellValue = col.render ? col.render(row) : row[col.key];
                return (
                    <div
                        key={idx}
                        style={{
                            padding: '0 var(--density-padding-md)', display: 'flex', alignItems: 'center', justifyContent: getAlignment(col.align),
                            fontSize: 'var(--text-base)', color: 'var(--text-main)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                            borderRight: idx < columns.length - 1 ? '1px solid transparent' : 'none' // Structure placeholder
                        }}
                        title={typeof cellValue === 'string' || typeof cellValue === 'number' ? cellValue : undefined}
                    >
                        {cellValue}
                    </div>
                );
            })}
        </div>
    );
}, (prev, next) => {
    return prev.virtualRow.start === next.virtualRow.start &&
        prev.isSelected === next.isSelected &&
        prev.gridTemplateColumns === next.gridTemplateColumns &&
        prev.row === next.row;
});

export default DataGrid;
