import re

file_path = 'src/pages/board/StrategicDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Replace Imports
content = content.replace("import { fetchDetailedKPIs, fetchCachedDashboard } from '../../services/oracleService';", "import { useDetailedKPIsQuery } from '@/hooks/useSalesQueries';\nimport Card from '@/components/ui/Card';\nimport PageContainer from '@/components/ui/PageContainer';")
content = content.replace("import Button from '@/components/ui/Button';", "import Button from '@/components/ui/Button';")

# Replace State and Effect with useQuery
old_state_block = """    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    // Goal Constant
    const MONTHLY_GOAL = 12000000;

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const cached = await fetchCachedDashboard();
                if (cached && cached.data) {
                    setData(cached.data.kpis);
                } else {
                    const kpis = await fetchDetailedKPIs();
                    setData(kpis);
                }
            } catch (error) {
                console.error("Error loading strategic data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);"""

new_query_block = """    // State managed by React Query
    const { data: kpisData, isLoading, isError } = useDetailedKPIsQuery();
    const data = kpisData || null;

    // Goal Constant
    const MONTHLY_GOAL = 12000000;"""

content = content.replace(old_state_block, new_query_block)

# Replace old loading return with PageContainer Skeleton logic implicitly
old_loading_return = """    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'var(--text-muted)' }}>
                <span>Carregando Visão Estratégica...</span>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>"""

new_container_return = """    const [isExporting, setIsExporting] = useState(false);

    return (
        <PageContainer 
            title="Radar Estratégico" 
            subtitle="Visão executiva consolidada para tomada de decisão."
            isLoading={isLoading}
            actions={
                <Button variant="ghost" onClick={() => navigate('/menu')}>
                    Voltar ao Menu
                </Button>
            }
        >"""

if old_loading_return in content:
    content = content.replace(old_loading_return, new_container_return)
else:
    print("WARNING: Could not find exact old loading return in StrategicDashboard.jsx.")

# Replace header block
old_header_block = """            {/* Heading */}
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.04em' }}>
                        Radar Estratégico
                    </h1>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                        Visão executiva consolidada para tomada de decisão.
                    </p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/menu')}
                >
                    Voltar ao Menu
                </Button>
            </div>"""

content = content.replace(old_header_block, "") # Header is now handled by PageContainer

# Replace closing div for page container
content = content.replace("            </div>\n        </div>\n    );\n};", "            </div>\n        </PageContainer>\n    );\n};")

# Replace StrategicCard with UI Card + Auto Skeleton logic
old_strategic_card = """const StrategicCard = ({ title, children }) => (
    <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        padding: 'var(--density-card-padding)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {title}
            </h2>
        </div>
        {children}
    </div>
);"""

new_strategic_card = """const StrategicCard = ({ title, isLoading, children }) => (
    <Card isLoading={isLoading} style={{ position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {title}
            </h2>
        </div>
        {children}
    </Card>
);"""

if old_strategic_card in content:
   content = content.replace(old_strategic_card, new_strategic_card)
else:
    print("WARNING: Could not find StrategicCard definition.")

# Add isLoading propagation to StrategicCard usages (they now inherit from the page container, or we can pass it down explicitly. The PageContainer's isLoading covers the whole page, so we don't necessarily need to pass it down to individual cards if PageContainer handles it globally. However, for a true progressive loading, passing down is better, but PageContainer does a full layout shift. Let's stick with PageContainer's global loading for this page to match the old behavior but with a skeleton.)

with open(file_path, 'w') as f:
    f.write(content)
