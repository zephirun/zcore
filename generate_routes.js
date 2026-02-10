import fs from 'fs';

const modulesConfig = {
    sales: [
        { name: 'QuarterlySalesAnalysis', path: '/sales/quarterly-analysis' },
        { name: 'SyntheticSalesSummary', path: '/sales/synthetic-summary' },
        { name: 'SmartCatalog', path: '/sales/smart-catalog' },
        { name: 'SalesCampaigns', path: '/sales/campaigns' }
    ],
    purchases: [
        { name: 'OrderControl', path: '/purchases/order-control' },
        { name: 'PurchaseRequisitions', path: '/purchases/requisitions' },
        { name: 'BranchTransfers', path: '/purchases/branch-transfers' },
        { name: 'UniformControl', path: '/purchases/uniform-control' },
        { name: 'GiftsControl', path: '/purchases/gifts-control' },
        { name: 'CentralArea', path: '/purchases/central-area' },
        { name: 'SupplierCampaigns', path: '/purchases/supplier-campaigns' }
    ],
    logistics: [
        { name: 'WarehouseManagement', path: '/logistics/warehouse-management' },
        { name: 'WarehouseTraining', path: '/logistics/warehouse-training' }
    ],
    financial: [
        { name: 'CostCenter', path: '/financial/cost-center' },
        { name: 'SerasaSPC', path: '/financial/serasa-spc' },
        { name: 'CreditAuth', path: '/financial/credit-auth' }
    ],
    processes: [
        { name: 'ProcessManagement', path: '/processes/management' },
        { name: 'Documentation', path: '/processes/documentation' },
        { name: 'POP', path: '/processes/pop' },
        { name: 'Flowchart', path: '/processes/flowchart' }
    ],
    'customer-service': [
        { name: 'RNC', path: '/customer-service/rnc' },
        { name: 'TechnicalAssistance', path: '/customer-service/technical-assistance' },
        { name: 'SupplierDealing', path: '/customer-service/supplier-dealing' }
    ],
    ai: [
        { name: 'AIAgents', path: '/ai/agents' },
        { name: 'AISales', path: '/ai/sales' }
    ],
    operations: [
        { name: 'FleetManagement', path: '/operations/fleet-management' }
    ],
    'service-center': [
        { name: 'InputManagement', path: '/service-center/input-management' }
    ],
    hr: [
        { name: 'TimeTracking', path: '/hr/time-tracking' },
        { name: 'EmployeeManagement', path: '/hr/employee-management' }
    ],
    it: [
        { name: 'ITAssets', path: '/it/assets' }
    ],
    marketing: [
        { name: 'Offers', path: '/marketing/offers' }
    ],
    board: [
        { name: 'DRE', path: '/board/dre' }
    ]
};

// Generate imports
let imports = '';
Object.entries(modulesConfig).forEach(([folder, modules]) => {
    modules.forEach(({ name }) => {
        imports += `import ${name} from './pages/${folder}/${name}';\n`;
    });
});

// Generate routes
let routes = '';
Object.entries(modulesConfig).forEach(([folder, modules]) => {
    modules.forEach(({ name, path }) => {
        routes += `                <Route path="${path}" element={
                    <ProtectedRoute>
                        <${name} />
                    </ProtectedRoute>
                } />
`;
    });
});

console.log('=== IMPORTS TO ADD AFTER SGI IMPORTS ===\n');
console.log(imports);
console.log('\n=== ROUTES TO ADD AFTER SGI ROUTES ===\n');
console.log(routes);

// Save to file for reference
fs.writeFileSync('app_routes_additions.txt', `IMPORTS:\n${imports}\n\nROUTES:\n${routes}`);
console.log('\n✅ Saved to app_routes_additions.txt');
