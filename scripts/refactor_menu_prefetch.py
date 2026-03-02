import re

file_path = 'src/pages/Menu.jsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add React Query Imports
content = content.replace("import { useNavigate, useSearchParams } from 'react-router-dom';", "import { useNavigate, useSearchParams } from 'react-router-dom';\nimport { useQueryClient } from '@tanstack/react-query';\nimport { QUERY_KEYS } from '../lib/react-query';\nimport { fetchSalesData, fetchDetailedKPIs, fetchClientRecords } from '../services/oracleService';")

# Extract hook setup inside Menu component
menu_hook_block = """const Menu = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name, activeUnit } = useData();"""

menu_query_hook_block = """const Menu = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const { userRole, allowedModules, name, activeUnit } = useData();"""

content = content.replace(menu_hook_block, menu_query_hook_block)

# Add prefetch function
prefetch_function = """    const handlePrefetch = (modulePath) => {
        // Core Sales & Analysis Views
        if (modulePath.includes('/sales/analysis') || modulePath.includes('/sales/synthetic-summary')) {
            queryClient.prefetchQuery({ queryKey: ['sales', 'monthly-billing'], queryFn: () => fetchSalesData(activeUnit) });
        }
        
        // Strategic Board
        if (modulePath.includes('/board/strategic')) {
            queryClient.prefetchQuery({ queryKey: ['sales', 'detailed-kpis'], queryFn: () => fetchDetailedKPIs() });
        }
        
        // Client Records (CRM basis)
        if (modulePath.includes('/sales/client-records')) {
            queryClient.prefetchQuery({ queryKey: QUERY_KEYS.clients.all(activeUnit), queryFn: () => fetchClientRecords(activeUnit) });
        }
    };"""

content = content.replace("    const getGreeting = () => {", prefetch_function + "\n\n    const getGreeting = () => {")

# Pass prefetch down to ModuleCard from the map loop
old_module_card_render = """                                        <ModuleCard
                                            module={module}
                                            categoryColor={catColor}
                                            onClick={(m) => {
                                                if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                                else navigate(m.path);
                                            }}
                                        />"""

new_module_card_render = """                                        <ModuleCard
                                            module={module}
                                            categoryColor={catColor}
                                            onHover={(m) => handlePrefetch(m.path)}
                                            onClick={(m) => {
                                                if (m.path.startsWith('http')) window.open(m.path, '_blank');
                                                else navigate(m.path);
                                            }}
                                        />"""

content = content.replace(old_module_card_render, new_module_card_render)

# Update ModuleCard implementation to accept and trigger onHover
old_module_card_def = "const ModuleCard = ({ module, categoryColor, onClick }) => {"
new_module_card_def = "const ModuleCard = ({ module, categoryColor, onClick, onHover }) => {"
content = content.replace(old_module_card_def, new_module_card_def)

old_hover_trigger = "            onMouseEnter={() => setIsHovered(true)}"
new_hover_trigger = "            onMouseEnter={() => { setIsHovered(true); if (onHover) onHover(module); }}"
content = content.replace(old_hover_trigger, new_hover_trigger)


with open(file_path, 'w') as f:
    f.write(content)
