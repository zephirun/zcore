import fs from 'fs';

const pathMappings = {
    'sales-analysis': '/sales/quarterly-analysis',
    'synthetic-sales-summary': '/sales/synthetic-summary',
    'smart-catalog': '/sales/smart-catalog',
    'sales-campaigns': '/sales/campaigns',
    'order-control': '/purchases/order-control',
    'purchase-requisitions': '/purchases/requisitions',
    'branch-transfers': '/purchases/branch-transfers',
    'uniform-control': '/purchases/uniform-control',
    'gifts-control': '/purchases/gifts-control',
    'central-area': '/purchases/central-area',
    'supplier-campaigns': '/purchases/supplier-campaigns',
    'warehouse-management': '/logistics/warehouse-management',
    'warehouse-training': '/logistics/warehouse-training',
    'cost-center': '/financial/cost-center',
    'serasa-spc': '/financial/serasa-spc',
    'credit-auth': '/financial/credit-auth',
    'processes': '/processes/management',
    'process-docs': '/processes/documentation',
    'process-pop': '/processes/pop',
    'process-flowchart': '/processes/flowchart',
    'rnc': '/customer-service/rnc',
    'technical-assistance': '/customer-service/technical-assistance',
    'supplier-dealing': '/customer-service/supplier-dealing',
    'ai-agents': '/ai/agents',
    'ai-sales': '/ai/sales',
    'fleet-management': '/operations/fleet-management',
    'input-management': '/service-center/input-management',
    'time-tracking': '/hr/time-tracking',
    'employee-management': '/hr/employee-management',
    'it-assets': '/it/assets',
    'marketing-offers': '/marketing/offers',
    'dre': '/board/dre'
};

// Read menuConfig.jsx
let content = fs.readFileSync('src/config/menuConfig.jsx', 'utf-8');

// Replace paths
Object.entries(pathMappings).forEach(([id, path]) => {
    // Match pattern: id: 'module-id', ... path: '#'
    const regex = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?path:\\s*)'#'`, 'g');
    content = content.replace(regex, `$1'${path}'`);
});

// Write back
fs.writeFileSync('src/config/menuConfig.jsx', content);

console.log('✅ menuConfig.jsx updated with correct paths!');
