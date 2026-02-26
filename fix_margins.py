import re

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'r') as f:
    content = f.read()

# Make sure the top wrapper has space
old_header = """            <PageContainer maxWidth="1600px" title="Dashboard Financeiro">"""
new_header = """            <PageContainer maxWidth="1600px" title="Dashboard Financeiro">"""

# Ensure the filter bar is wrapped or spaced correctly if it sits directly in PageContainer
old_filters = """            {/* Filters Bar */}
            {hasData && (
                <Filters />
            )}"""
new_filters = """            {/* Filters Bar */}
            {hasData && (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <Filters />
                </div>
            )}"""
            
if "marginBottom: 'var(--space-6)'" not in content:
    content = content.replace(old_filters, new_filters)

# Check KPICards margin
old_kpi = """                    <KPICards
                        totals={{
                            amount: metrics.totalBilling,
                            margin_percent: metrics.avgMargin,
                            deadline: metrics.avgTerm
                        }}
                        extraInfo={{ count: filteredData.length }}
                    />"""

new_kpi = """                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <KPICards
                            totals={{
                                amount: metrics.totalBilling,
                                margin_percent: metrics.avgMargin,
                                deadline: metrics.avgTerm
                            }}
                            extraInfo={{ count: filteredData.length }}
                        />
                    </div>"""

if "<div style={{ marginBottom: 'var(--space-6)' }}>\n                        <KPICards" not in content:
    content = content.replace(old_kpi, new_kpi)

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'w') as f:
    f.write(content)

print(f"Margin adjustments complete.")
