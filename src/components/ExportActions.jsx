import Button from '@/components/ui/Button';
import React from 'react';
import { formatCurrency, formatPercent } from '../utils/formatters';

const ExportActions = ({ data }) => {

    // Function to handle printing
    const handlePrint = () => {
        window.print();
    };

    // Function to handle Excel Export
    const handleExportExcel = () => {
        if (!data || data.length === 0) return;

        // 1. Define Headers
        const csvHeaders = [
            "ID Cliente",
            "Nome Cliente",
            "Vendedor",
            "Mes 1 - Faturamento", "Mes 1 - Margem %", "Mes 1 - Prazo",
            "Mes 2 - Faturamento", "Mes 2 - Margem %", "Mes 2 - Prazo",
            "Mes 3 - Faturamento", "Mes 3 - Margem %", "Mes 3 - Prazo",
            "Total - Faturamento", "Total - Margem %", "Total - Prazo"
        ];

        // 2. Map Data
        const csvRows = data.map(row => {
            const m1 = row.months[0];
            const m2 = row.months[1];
            const m3 = row.months[2];
            const t = row.total;

            return [
                row.client.id,
                `"${row.client.name}"`,
                `"${row.client.vendor}"`,
                m1.amount.toFixed(2).replace('.', ','),
                (m1.margin_percent * 100).toFixed(1).replace('.', ','),
                Math.round(m1.deadline),
                m2.amount.toFixed(2).replace('.', ','),
                (m2.margin_percent * 100).toFixed(1).replace('.', ','),
                Math.round(m2.deadline),
                m3.amount.toFixed(2).replace('.', ','),
                (m3.margin_percent * 100).toFixed(1).replace('.', ','),
                Math.round(m3.deadline),
                t.amount.toFixed(2).replace('.', ','),
                (t.margin_percent * 100).toFixed(1).replace('.', ','),
                Math.round(t.deadline)
            ].join(';');
        });

        // 3. Assemble CSV Content
        const bom = '\uFEFF';
        const csvContent = bom + csvHeaders.join(';') + '\n' + csvRows.join('\n');

        // 4. Trigger Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `relatorio_analise_vendas_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <Button
                onClick={handlePrint}
                className="btn-export-print"
                style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-sm)',
                    height: '40px'
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Imprimir
            </Button>

            <Button
                onClick={handleExportExcel}
                className="btn-export-excel"
                style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: 'var(--shadow-sm)',
                    height: '40px'
                }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="12" y1="18" x2="12" y2="12"></line>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                </svg>
                Exportar Excel
            </Button>
        </div>
    );
};

export default ExportActions;
