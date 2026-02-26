import re

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'r') as f:
    content = f.read()

# Add import
content = content.replace("import Button from '@/components/ui/Button';", "import Button from '@/components/ui/Button';\nimport { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';")

# 1. Monthly Performance Table
table1_old = """                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '16px', textAlign: 'left', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mês</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Faturamento</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Margem</th>
                                            <th style={{ padding: '16px', textAlign: 'right', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Prazo Médio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyPerformance.map((month, idx) => (
                                            <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover-row">
                                                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-main)', fontWeight: '600' }}>{month.month}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(month.revenue)}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(month.margin)}</td>
                                                <td style={{ padding: '16px', textAlign: 'right', fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{month.deadline.toFixed(0)} dias</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>"""

table1_new = """                                <Table>
                                    <Thead>
                                        <Tr>
                                            <Th style={{ textAlign: 'left' }}>Mês</Th>
                                            <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                            <Th style={{ textAlign: 'right' }}>Margem</Th>
                                            <Th style={{ textAlign: 'right' }}>Prazo Médio</Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody>
                                        {monthlyPerformance.map((month, idx) => (
                                            <Tr key={idx} className="hover-row">
                                                <Td style={{ fontWeight: 'var(--font-semibold)' }}>{month.month}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(month.revenue)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(month.margin)}</Td>
                                                <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{month.deadline.toFixed(0)} dias</Td>
                                            </Tr>
                                        ))}
                                    </Tbody>
                                </Table>"""

content = content.replace(table1_old, table1_new)

# 2. Top Clients Table
table2_old = """                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Cliente</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topClients.map((client, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <Link
                                                                to={`/sales/client-records?id=${client.id}`}
                                                                title="Ver Ficha"
                                                                style={{
                                                                    color: 'var(--color-info, #3b82f6)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    padding: '6px',
                                                                    background: 'rgba(59, 130, 246, 0.08)',
                                                                    borderRadius: '6px',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="9" cy="7" r="4"></circle>
                                                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                                </svg>
                                                            </Link>
                                                            <div>
                                                                <div style={{ fontWeight: '600', marginBottom: '2px' }}>{client.name}</div>
                                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                                                    {client.vendor} <span style={{ opacity: 0.5 }}>|</span> {client.representative} <span style={{ opacity: 0.5 }}>|</span> ID: {client.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(client.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(client.margin)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>"""

table2_new = """                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Cliente</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topClients.map((client, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                            <Link
                                                                to={`/sales/client-records?id=${client.id}`}
                                                                title="Ver Ficha"
                                                                style={{
                                                                    color: 'var(--color-info)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    padding: 'var(--space-2)',
                                                                    background: 'var(--color-info-dim)',
                                                                    borderRadius: 'var(--radius-sm)',
                                                                    transition: 'all 0.2s'
                                                                }}
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                                                    <circle cx="9" cy="7" r="4"></circle>
                                                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                                                </svg>
                                                            </Link>
                                                            <div>
                                                                <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>{client.name}</div>
                                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                                                                    {client.vendor} <span style={{ opacity: 0.5 }}>|</span> {client.representative} <span style={{ opacity: 0.5 }}>|</span> ID: {client.id}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(client.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(client.margin)}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>"""

content = content.replace(table2_old, table2_new)

# 3. Top Vendors Table
table3_old = """                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Vendedor</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topVendors.map((vendor, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: '800', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: '600' }}>{vendor.name}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(vendor.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(vendor.margin)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{vendor.clients}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>"""

table3_new = """                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Vendedor</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                                <Th style={{ textAlign: 'right' }}>Clientes</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topVendors.map((vendor, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)',
                                                                fontWeight: 'var(--font-black)', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: 'var(--font-semibold)' }}>{vendor.name}</div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(vendor.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(vendor.margin)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{vendor.clients}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>"""

content = content.replace(table3_old, table3_new)

# 4. Top Representatives Table
table4_old = """                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <tr style={{ background: 'var(--bg-input)' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Representante</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Faturamento</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Margem</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', borderBottom: '2px solid var(--border-color)', textTransform: 'uppercase' }}>Clientes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topRepresentatives.map((rep, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                    <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-main)' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: '800', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: '600' }}>{rep.name}</div>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatCurrency(rep.revenue)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{formatPercent(rep.margin)}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '13px', color: 'var(--text-main)', fontWeight: '500' }}>{rep.clients}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>"""

table4_new = """                                    <Table compact>
                                        <Thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
                                            <Tr style={{ background: 'var(--bg-input)' }}>
                                                <Th style={{ textAlign: 'left' }}>Representante</Th>
                                                <Th style={{ textAlign: 'right' }}>Faturamento</Th>
                                                <Th style={{ textAlign: 'right' }}>Margem</Th>
                                                <Th style={{ textAlign: 'right' }}>Clientes</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {topRepresentatives.map((rep, idx) => (
                                                <Tr key={idx}>
                                                    <Td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)',
                                                                fontWeight: 'var(--font-black)', color: 'var(--text-muted)'
                                                            }}>
                                                                {idx + 1}
                                                            </div>
                                                            <div style={{ fontWeight: 'var(--font-semibold)' }}>{rep.name}</div>
                                                        </div>
                                                    </Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatCurrency(rep.revenue)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{formatPercent(rep.margin)}</Td>
                                                    <Td style={{ textAlign: 'right', fontWeight: 'var(--font-medium)' }}>{rep.clients}</Td>
                                                </Tr>
                                            ))}
                                        </Tbody>
                                    </Table>"""

content = content.replace(table4_old, table4_new)

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'w') as f:
    f.write(content)

print(f"Modifications complete.")
