import re

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'r') as f:
    content = f.read()

# 1. Update ChartCard definition
old_chart_card = """const ChartCard = ({ title, children, action, headerBorderColor }) => (
    <div style={{
        background: 'var(--bg-card)',
        borderRadius: '10px',
        padding: '24px',
        border: '1px solid var(--border-color)',
    }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: headerBorderColor ? '14px' : '0',
            borderBottom: headerBorderColor ? `2px solid ${headerBorderColor}` : 'none',
        }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>{title}</h3>
            {action && action}
        </div>
        {children}
    </div>
);"""

new_chart_card = """const ChartCard = ({ title, children, action, headerBorderColor }) => (
    <Card style={{ padding: '24px' }}>
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)',
            paddingBottom: headerBorderColor ? 'var(--space-3)' : '0',
            borderBottom: headerBorderColor ? `2px solid ${headerBorderColor}` : 'none',
        }}>
            <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', color: 'var(--text-main)', margin: 0 }}>{title}</h3>
            {action && action}
        </div>
        {children}
    </Card>
);"""

content = content.replace(old_chart_card, new_chart_card)


# 2. Update metric buttons inside the dashboard
old_buttons = """                                            <Button
                                            key={m.id}
                                            onClick={() => setActiveMetric(m.id)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '6px',
                                                border: 'none',
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: activeMetric === m.id ? 'var(--bg-card)' : 'transparent',
                                                color: activeMetric === m.id ? m.color : 'var(--text-muted)',
                                                boxShadow: activeMetric === m.id ? 'var(--shadow-sm)' : 'none'
                                            }}
                                        >
                                            {m.label}
                                        </Button>"""

new_buttons = """                                        <Button
                                            key={m.id}
                                            variant={activeMetric === m.id ? "secondary" : "ghost"}
                                            onClick={() => setActiveMetric(m.id)}
                                            style={{ padding: 'var(--space-2) var(--space-3)', fontSize: '12px' }}
                                        >
                                            <span style={{ color: activeMetric === m.id ? m.color : 'inherit' }}>{m.label}</span>
                                        </Button>"""

content = content.replace(old_buttons, new_buttons)


# 3. Update top 10 clients / vendors ranking dots
old_rank = """                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)',
                                                                fontWeight: 'var(--font-black)', color: 'var(--text-muted)'
                                                            }}>"""
                                                            
new_rank = """                                                            <div style={{
                                                                width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-elevated)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                                                fontWeight: 'var(--font-bold)', color: 'var(--text-muted)', border: '1px solid var(--border-color)'
                                                            }}>"""
                                                            
content = content.replace(old_rank, new_rank)

with open('/home/ruanf/ZEPH/Z.CORE/src/pages/sales/Dashboard.jsx', 'w') as f:
    f.write(content)

print(f"ChartCard and nested element replacements complete.")
