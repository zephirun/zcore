import re

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'r') as f:
    content = f.read()

# Add imports for PageContainer and Card
content = content.replace("import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';", "import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/Table';\nimport PageContainer from '@/components/ui/PageContainer';\nimport Card from '@/components/ui/Card';")

# 1. Main wrapper
old_main = """            <main style={{ padding: '24px 40px', maxWidth: '1600px', margin: '0 auto' }}>"""
new_main = """            <PageContainer maxWidth="1600px" title="Dashboard Financeiro">"""
content = content.replace(old_main, new_main)

# 2. End main wrapper
content = content.replace("            </main>", "            </PageContainer>")

# 3. No data card
old_no_data = """                    <div style={{
                        background: 'var(--bg-card)',
                        padding: '60px 40px',
                        borderRadius: '16px',
                        textAlign: 'center',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>"""
new_no_data = """                    <Card style={{ padding: '60px 40px', textAlign: 'center' }}>"""
content = content.replace(old_no_data, new_no_data)

# 4. Blank state card
old_blank_state = """                    <div style={{
                        padding: '80px',
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-card)',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        boxShadow: 'var(--shadow-sm)'
                    }}>"""
new_blank_state = """                    <Card style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>"""
content = content.replace(old_blank_state, new_blank_state)

# Replace remaining closing divs for those two
# We need to be careful as there are other divs. We know the exact structure
content = content.replace("""                        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Nenhum dado disponível</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '20px' }}>
                            Faça o upload de um arquivo CSV na página de <strong>Admin</strong> para visualizar os dados aqui.
                        </p>
                        <Button
                            onClick={handleRefresh}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--text-main)',
                                color: 'var(--bg-main)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            🔄 Verificar se há dados novos
                        </Button>
                    </div>""", """                        <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Nenhum dado disponível</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '20px' }}>
                            Faça o upload de um arquivo CSV na página de <strong>Admin</strong> para visualizar os dados aqui.
                        </p>
                        <Button
                            onClick={handleRefresh}
                            style={{
                                padding: '10px 20px',
                                background: 'var(--text-main)',
                                color: 'var(--bg-main)',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '13px',
                                fontFamily: 'var(--font-main)',
                            }}
                        >
                            🔄 Verificar se há dados novos
                        </Button>
                    </Card>""")

content = content.replace("""                        <h1 style={{ color: 'var(--text-main)', marginBottom: '10px', fontWeight: '800' }}>Bem-vindo ao Dashboard</h1>
                        <p style={{ fontSize: '18px' }}>
                            Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                            ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                        </p>
                    </div>""", """                        <h1 style={{ color: 'var(--text-main)', marginBottom: '10px', fontWeight: '800' }}>Bem-vindo ao Dashboard</h1>
                        <p style={{ fontSize: '18px' }}>
                            Para visualizar os dados, selecione um <strong>Vendedor</strong>, um <strong>Cliente</strong><br />
                            ou escolha a opção <strong>"Selecionar Todos"</strong> nos filtros acima.
                        </p>
                    </Card>""")


# Find the ChartCard components inside the file to see how they are implemented
with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'w') as f:
    f.write(content)

print(f"Layout replacements complete.")
