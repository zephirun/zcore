import re

file_path = 'src/pages/sales/ClientRecords.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace Table imports with DataGrid
content = content.replace("import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';", "import DataGrid from '@/components/ui/DataGrid';")

# Define DataGrid columns inside the component
columns_def = """    const columns = useMemo(() => [
        {
            key: 'name',
            label: 'Cliente / ID',
            sortable: true,
            width: '250px',
            render: (row) => (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
                    <div style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', whiteSpace: 'normal' }}>{row.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ID: {row.id}</div>
                </div>
            )
        },
        { key: 'vendor', label: 'Vendedor Freq.', sortable: true, width: '150px' },
        { 
            key: 'totalRevenue', 
            label: 'Faturamento (Tri)', 
            sortable: true, 
            align: 'right',
            width: '180px',
            render: (row) => <div style={{ fontWeight: 'var(--font-semibold)' }}>{formatCurrency(row.totalRevenue)}</div> 
        },
        { 
            key: 'avgMargin', 
            label: 'Margem', 
            sortable: true, 
            align: 'right',
            width: '120px',
            render: (row) => <div style={{ fontWeight: 'var(--font-semibold)', color: row.avgMargin < 0.1 ? 'var(--color-danger)' : 'var(--color-success)' }}>{formatPercent(row.avgMargin)}</div> 
        },
        { 
            key: 'healthColor', 
            label: 'Saúde', 
            sortable: false, 
            align: 'center',
            width: '100px',
            render: (row) => (
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: row.healthColor, margin: '0 auto', boxShadow: `0 0 8px ${row.healthColor}` }} />
            )
        },
        {
            key: 'action',
            label: 'Ação',
            sortable: false,
            align: 'center',
            width: '120px',
            render: () => <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>VER FICHA</Button>
        }
    ], []);

    const displayClients = viewMode === 'dashboard' ? filteredClients.slice(0, 50) : filteredClients;
"""

content = content.replace("    const displayClients = viewMode === 'dashboard' ? filteredClients.slice(0, 50) : filteredClients;", columns_def)

# Replace the table rendering
old_table_block = """                        <Table>
                            <Thead>
                                <Tr style={{ backgroundColor: 'var(--bg-card-dim, rgba(0,0,0,0.2))' }}>
                                    <Th style={{ textAlign: 'left' }}>Cliente / ID</Th>
                                    <Th style={{ textAlign: 'left' }}>Vendedor Freq.</Th>
                                    <Th style={{ textAlign: 'right' }}>Faturamento (Tri)</Th>
                                    <Th style={{ textAlign: 'right' }}>Margem</Th>
                                    <Th style={{ textAlign: 'center' }}>Saúde</Th>
                                    <Th style={{ textAlign: 'center' }}>Ação</Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {displayClients.map(client => (
                                    <Tr
                                        key={client.id}
                                        onClick={() => { setSelectedClientId(client.id); setViewMode('detail'); }}
                                        style={{ cursor: 'pointer' }}
                                        className="table-row hover-row"
                                    >
                                        <Td>
                                            <div style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)' }}>{client.name}</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>ID: {client.id}</div>
                                        </Td>
                                        <Td style={{ fontSize: '13px' }}>
                                            {client.vendor}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: 'var(--font-semibold)' }}>
                                            {formatCurrency(client.totalRevenue)}
                                        </Td>
                                        <Td style={{ textAlign: 'right', fontWeight: 'var(--font-semibold)', color: client.avgMargin < 0.1 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                                            {formatPercent(client.avgMargin)}
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '12px', height: '12px', borderRadius: '50%', backgroundColor: client.healthColor,
                                                margin: '0 auto', boxShadow: `0 0 8px ${client.healthColor}`
                                            }} />
                                        </Td>
                                        <Td style={{ textAlign: 'center' }}>
                                            <Button variant="outline" size="sm">
                                                VER FICHA
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}
                            </Tbody>
                        </Table>
                        {displayClients.length === 0 && (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Nenhum cliente encontrado.
                            </div>
                        )}"""

new_grid_block = """                        {displayClients.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                                Nenhum cliente encontrado.
                            </div>
                        ) : (
                            <DataGrid 
                                columns={columns} 
                                data={displayClients} 
                                height="600px" 
                                onRowClick={(row) => { setSelectedClientId(row.id); setViewMode('detail'); }} 
                            />
                        )}"""

if old_table_block in content:
    content = content.replace(old_table_block, new_grid_block)
else:
    print("WARNING: Could not find exact Table block to replace in ClientRecords.jsx. Falling back to regex.")
    content = re.sub(r'<Table>.*?</Table>\s*\{displayClients\.length === 0.*?\}', new_grid_block, content, flags=re.DOTALL)

with open(file_path, 'w') as f:
    f.write(content)
