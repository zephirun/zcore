import React from 'react';

export const Table = ({ children, className = '', compact = false, ...props }) => {
    return (
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table
                style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    textAlign: 'left',
                    fontSize: 'var(--text-sm)',
                    ...(props.style || {})
                }}
                className={`ui-table ${compact ? 'compact' : ''} ${className}`}
                {...props}
            >
                {children}
            </table>
        </div>
    );
};

export const Thead = ({ children, ...props }) => {
    return (
        <thead style={{ borderBottom: '1px solid var(--border-color)', ...(props.style || {}) }} {...props}>
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
                fontSize: '12px',
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
