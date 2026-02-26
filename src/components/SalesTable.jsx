import Button from '@/components/ui/Button';

import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';

const SalesTable = ({ reportData, totals, currentPage, onPageChange, totalRows, rowsPerPage }) => {
    // Styles for the compact corporate look
    const headerStyle = {
        background: 'var(--bg-input)',
        color: 'var(--text-muted)',
        padding: '10px 12px',
        fontSize: '11px',
        fontWeight: '800',
        textAlign: 'center',
        borderRight: '1px solid var(--border-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    };

    const cellStyle = {
        padding: '10px 12px',
        fontSize: '14px',
        borderBottom: '1px solid var(--border-color)',
        borderRight: '1px solid var(--border-color)',
        color: 'var(--text-main)'
    };

    const numberStyle = {
        ...cellStyle,
        textAlign: 'right',
        fontFamily: 'var(--font-main)'
    };

    const paginationButtonStyle = {
        padding: '8px 16px',
        fontSize: '14px',
        border: '1px solid var(--border-color)',
        background: 'var(--bg-input)',
        cursor: 'pointer',
        borderRadius: '4px',
        color: 'var(--text-main)'
    };

    const activePaginationButtonStyle = {
        ...paginationButtonStyle,
        background: 'var(--color-primary)',
        color: 'white',
        borderColor: 'var(--color-primary)'
    };

    const totalPages = Math.ceil(totalRows / rowsPerPage);

    const getMonthName = (subtractMonths) => {
        const d = new Date();
        d.setDate(1);
        d.setMonth(d.getMonth() - subtractMonths);
        return d.toLocaleDateString('pt-BR', { month: 'long' }).toUpperCase();
    };

    const headers = {
        m1: getMonthName(3),
        m2: getMonthName(2),
        m3: getMonthName(1)
    };

    return (
        <div className="table-container" style={{ padding: '20px 40px' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Mostrando <strong>{reportData.length}</strong> de <strong>{totalRows}</strong> registros
                </div>
                {totalPages > 1 && (
                    <div style={{ display: 'flex', gap: '5px' }}>
                        <Button
                            disabled={currentPage === 1}
                            onClick={() => onPageChange(currentPage - 1)}
                            style={{ ...paginationButtonStyle, opacity: currentPage === 1 ? 0.5 : 1 }}
                        >
                            &larr; Anterior
                        </Button>
                        <span style={{ padding: '5px 10px', fontSize: '13px', fontWeight: 'bold' }}>
                            {currentPage} / {totalPages}
                        </span>
                        <Button
                            disabled={currentPage === totalPages}
                            onClick={() => onPageChange(currentPage + 1)}
                            style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
                        >
                            Próxima &rarr;
                        </Button>
                    </div>
                )}
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #999' }}>
                <thead>
                    <tr>
                        <th style={{ ...headerStyle, textAlign: 'left', width: '30%', background: 'var(--bg-input)' }}>CLIENTE / ID / VEND. / REPRES.</th>
                        <th colSpan="3" style={headerStyle}>{headers.m1}</th>
                        <th colSpan="3" style={headerStyle}>{headers.m2}</th>
                        <th colSpan="3" style={headerStyle}>{headers.m3}</th>
                        <th colSpan="3" style={headerStyle}>TOTAL</th>
                    </tr>
                    <tr style={{ background: 'var(--bg-input)', color: 'var(--text-main)' }}>
                        <th></th>
                        {[1, 2, 3, 4].map((block) => (
                            <React.Fragment key={block}>
                                <th style={{ ...headerStyle, background: 'var(--bg-card)', fontSize: '11px', borderRight: '1px solid var(--border-color)' }}>FATURAMENTO</th>
                                <th style={{ ...headerStyle, background: 'var(--bg-card)', fontSize: '11px', borderRight: '1px solid var(--border-color)' }}>MARGEM</th>
                                <th style={{ ...headerStyle, background: 'var(--bg-card)', fontSize: '11px', borderRight: '1px solid var(--border-color)' }}>PRAZO</th>
                            </React.Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {reportData.map((row) => (
                        <tr key={row.client.id} style={{ background: 'var(--bg-card)' }}>
                            <td style={{ ...cellStyle, verticalAlign: 'top' }}>
                                <div style={{ fontWeight: 'bold' }}>{row.client.name} - {row.client.id}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{row.client.vendor} | {row.client.representative}</div>
                            </td>

                            {row.months.map((month, idx) => (
                                <React.Fragment key={idx}>
                                    <td style={numberStyle}>{formatCurrency(month.amount).replace('R$', '').trim()}</td>
                                    <td style={numberStyle}>{formatPercent(month.margin_percent)}</td>
                                    <td style={numberStyle}>{Math.round(month.deadline)}</td>
                                </React.Fragment>
                            ))}

                            <td style={{ ...numberStyle, fontWeight: 'bold', background: 'var(--bg-input)' }}>
                                {formatCurrency(row.total.amount).replace('R$', '').trim()}
                            </td>
                            <td style={{ ...numberStyle, fontWeight: 'bold', background: 'var(--bg-input)' }}>
                                {formatPercent(row.total.margin_percent)}
                            </td>
                            <td style={{ ...numberStyle, fontWeight: 'bold', background: 'var(--bg-input)' }}>
                                {Math.round(row.total.deadline)}
                            </td>
                        </tr>
                    ))}

                    <tr className="total-row" style={{ borderTop: '2px solid #000' }}>
                        <td style={{ ...cellStyle, textAlign: 'right', fontWeight: 'bold' }}>TOTAIS GERAIS:</td>

                        <GrandTotalCells reportData={reportData} />

                        <td style={{ ...numberStyle, fontWeight: 'bold' }}>{formatCurrency(totals.amount).replace('R$', '').trim()}</td>
                        <td style={{ ...numberStyle, fontWeight: 'bold' }}>{formatPercent(totals.margin_percent)}</td>
                        <td style={{ ...numberStyle, fontWeight: 'bold' }}>{Math.round(totals.deadline)}</td>
                    </tr>
                </tbody>
            </table>

            {totalPages > 1 && (
                <div className="no-print" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <Button
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}
                        style={{ ...paginationButtonStyle, opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        &larr; Anterior
                    </Button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                            <Button
                                key={pageNum}
                                onClick={() => onPageChange(pageNum)}
                                style={currentPage === pageNum ? activePaginationButtonStyle : paginationButtonStyle}
                            >
                                {pageNum}
                            </Button>
                        );
                    })}

                    {totalPages > 5 && (
                        <>
                            <span style={{ padding: '5px' }}>...</span>
                            <Button
                                onClick={() => onPageChange(totalPages)}
                                style={currentPage === totalPages ? activePaginationButtonStyle : paginationButtonStyle}
                            >
                                {totalPages}
                            </Button>
                        </>
                    )}

                    <Button
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}
                        style={{ ...paginationButtonStyle, opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        Próxima &rarr;
                    </Button>
                </div>
            )}
        </div>
    );
};

const GrandTotalCells = ({ reportData }) => {
    const montlyTotals = [0, 1, 2].map(monthIdx => {
        const totalAmount = reportData.reduce((sum, row) => sum + row.months[monthIdx].amount, 0);
        const totalMarginRevenue = reportData.reduce((sum, row) => sum + (row.months[monthIdx].margin_percent * row.months[monthIdx].amount), 0);
        const avgMargin = totalAmount ? totalMarginRevenue / totalAmount : 0;
        const avgDeadline = reportData.reduce((sum, row) => sum + row.months[monthIdx].deadline, 0) / (reportData.length || 1);

        return { amount: totalAmount, margin: avgMargin, deadline: avgDeadline };
    });

    const numberStyle = {
        padding: '4px 8px',
        fontSize: '11px',
        textAlign: 'right',
        fontFamily: 'Arial, sans-serif',
        borderBottom: '1px solid #ccc',
        borderRight: '1px solid #eee',
        fontWeight: 'bold'
    };

    return (
        <>
            {montlyTotals.map((t, idx) => (
                <React.Fragment key={idx}>
                    <td style={numberStyle}>{formatCurrency(t.amount).replace('R$', '').trim()}</td>
                    <td style={numberStyle}>{formatPercent(t.margin)}</td>
                    <td style={numberStyle}>{Math.round(t.deadline)}</td>
                </React.Fragment>
            ))}
        </>
    );
};

export default SalesTable;
