import re

file_path = 'src/pages/financial/ClientSummary.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace Table imports with DataGrid
content = content.replace("import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';", "import DataGrid from '@/components/ui/DataGrid';")

# Define DataGrid columns inside the component
columns_def = """    const columns = useMemo(() => [
        {
            key: 'vendedor',
            label: 'Vendedor',
            sortable: true,
            width: '150px',
            render: (row) => row.repre?.split('Vendedor: ')[1]?.split(' ')[0] || '-'
        },
        { 
            key: 'docto', 
            label: 'Docto', 
            sortable: true,
            width: '120px',
            render: (row) => <span style={{ fontWeight: 'var(--font-semibold)' }}>{row.docto}</span>
        },
        { 
            key: 'emissao', 
            label: 'Emissão', 
            sortable: true, 
            width: '120px',
            render: (row) => formatDate(row.emissao)
        },
        { 
            key: 'vencto', 
            label: 'Vencimento', 
            sortable: true, 
            width: '120px',
            render: (row) => <span style={{ fontWeight: row.seq === 1 ? 'var(--font-bold)' : 'var(--font-medium)' }}>{formatDate(row.vencto)}</span>
        },
        { 
            key: 'seq', 
            label: 'Situação', 
            sortable: true, 
            align: 'center',
            width: '120px',
            render: (row) => (
                <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase',
                    background: row.seq === 1 ? 'var(--color-error-dim)' : row.seq === 2 ? 'var(--color-info-dim)' : row.seq === 3 ? 'var(--color-warning-dim)' : row.seq === 5 ? 'var(--color-success-dim)' : 'rgba(0,0,0,0.05)',
                    color: row.seq === 1 ? 'var(--color-error)' : row.seq === 2 ? 'var(--color-info)' : row.seq === 3 ? 'var(--color-warning)' : row.seq === 5 ? 'var(--color-success)' : 'var(--text-muted)'
                }}>
                    {row.seq === 1 ? 'Vencido' : row.seq === 2 ? 'A Vencer' : row.seq === 3 ? 'Cheque' : row.seq === 4 ? 'Carteira' : 'Crédito'}
                </span>
            )
        },
        {
            key: 'valor',
            label: 'Valor',
            sortable: true,
            align: 'right',
            width: '150px',
            render: (row) => <span style={{ fontWeight: 'var(--font-bold)' }}>{formatCurrency(row.valor)}</span>
        }
    ], []);

    const detailsTotal = useMemo(() => {
"""

content = content.replace("    const detailsTotal = useMemo(() => {", columns_def)

new_grid_block = """                        <DataGrid
                            columns={columns}
                            data={detailsFilteredData}
                            height="400px"
                            emptyMessage="Nenhum título encontrado para este filtro."
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-color)' }}>
                            <div style={{ fontWeight: 'var(--font-bold)', marginRight: '24px' }}>TOTAL:</div>
                            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-black)', color: 'var(--color-error)' }}>
                                {formatCurrency(detailsTotal)}
                            </div>
                        </div>"""

content = re.sub(r'<Table>.*?</Table>', new_grid_block, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
