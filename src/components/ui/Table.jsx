import React from 'react';

// Basic Fiori 3 Table Fallback (for non-virtualized, small datasets like widgets)
export const Table = ({ children, className = '', compact = false, ...props }) => {
    return (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: 'var(--radius)', border: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: 'var(--text-base)',
                    ...(props.style || {})
                }}
                className={`ui-table ${compact ? 'compact' : ''} ${className}`}
                {...props}
            >
                {children}
            </table>
            <style>{`
                .ui-table .ui-tr:hover {
                    background-color: var(--color-primary-dim); /* Fiori distinct hover line selection hint */
                }
                .ui-table.compact td, .ui-table.compact th {
                    padding: var(--density-padding-sm) var(--density-padding-md) !important;
                    font-size: var(--text-sm) !important;
                }
            `}</style>
        </div>
    );
};

export const Thead = ({ children, ...props }) => {
    return (
        <thead style={{
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            ...(props.style || {})
        }} {...props}>
            {children}
        </thead>
    );
};

export const Tbody = ({ children, ...props }) => {
    return (
        <tbody {...props}>
            {children}
        </tbody>
    );
};

export const Tr = ({ children, ...props }) => {
    return (
        <tr
            style={{
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background var(--motion-fast) var(--ease-standard), box-shadow var(--motion-fast) var(--ease-standard)',
                ...(props.style || {})
            }}
            className="ui-tr"
            {...props}
        >
            {children}
        </tr>
    );
};

export const Th = ({ children, ...props }) => {
    return (
        <th
            style={{
                padding: 'var(--density-table-cell-padding)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--text-muted)',
                fontSize: 'var(--text-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                ...(props.style || {})
            }}
            {...props}
        >
            {children}
        </th>
    );
};

export const Td = ({ children, ...props }) => {
    return (
        <td
            style={{
                padding: 'var(--density-table-cell-padding)',
                color: 'var(--text-main)',
                ...(props.style || {})
            }}
            {...props}
        >
            {children}
        </td>
    );
};
