import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './lib/react-query.js';
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
import PostAuthLayout from './components/PostAuthLayout';
import GlobalSkeleton from './components/ui/GlobalSkeleton';

const Admin = lazy(() => import('./pages/AdminPanel')); // Updated to AdminPanel
const Report = lazy(() => import('./pages/sales/Report'));
const Dashboard = lazy(() => import('./pages/sales/Dashboard'));
const UnitSelection = lazy(() => import('./pages/UnitSelection'));
const Menu = lazy(() => import('./pages/Menu'));
const DeliverySchedule = lazy(() => import('./pages/logistics/DeliverySchedule'));
const Returns = lazy(() => import('./pages/customer-service/Returns'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const DataUpload = lazy(() => import('./pages/DataUpload'));
const CarrierScheduling = lazy(() => import('./pages/logistics/CarrierScheduling'));
const TeamDashboard = lazy(() => import('./pages/team/TeamDashboard'));
import ActivityTracker from './components/ActivityTracker';
const UserAudit = lazy(() => import('./pages/admin/UserAudit'));


// Sales Pages
const SyntheticSalesSummary = lazy(() => import('./pages/sales/SyntheticSalesSummary'));
const SmartCatalog = lazy(() => import('./pages/sales/SmartCatalog'));
const SalesCampaigns = lazy(() => import('./pages/sales/SalesCampaigns'));
const ClientRecords = lazy(() => import('./pages/sales/ClientRecords'));
const SalesTeamRecords = lazy(() => import('./pages/sales/SalesTeamRecords'));
const SalesIntelligence = lazy(() => import('./pages/sales/SalesIntelligence'));
const SalesSimulation = lazy(() => import('./pages/sales/SalesSimulation'));
const SalesAnalysis = lazy(() => import('./pages/sales/SalesAnalysis'));

// Purchases Pages
const OrderControl = lazy(() => import('./pages/purchases/OrderControl'));
const PurchaseRequisitions = lazy(() => import('./pages/purchases/PurchaseRequisitions'));
const BranchTransfers = lazy(() => import('./pages/purchases/BranchTransfers'));
const UniformControl = lazy(() => import('./pages/purchases/UniformControl'));
const GiftsControl = lazy(() => import('./pages/purchases/GiftsControl'));
const CentralArea = lazy(() => import('./pages/purchases/CentralArea'));
const SupplierCampaigns = lazy(() => import('./pages/purchases/SupplierCampaigns'));
const PurchasingIntelligence = lazy(() => import('./pages/purchases/PurchasingIntelligence'));
const BrandsAndBuyers = lazy(() => import('./pages/purchases/BrandsAndBuyers'));

// Logistics Pages
const WarehouseManagement = lazy(() => import('./pages/logistics/WarehouseManagement'));
const WarehouseTraining = lazy(() => import('./pages/logistics/WarehouseTraining'));

// Financial Pages
const CostCenter = lazy(() => import('./pages/financial/CostCenter'));
const SerasaSPC = lazy(() => import('./pages/financial/SerasaSPC'));
const FinancialIntelligence = lazy(() => import('./pages/financial/FinancialIntelligence'));
const CreditAuth = lazy(() => import('./pages/financial/CreditAuth'));
const ClientSummary = lazy(() => import('./pages/financial/ClientSummary'));

// Processes Pages
const ProcessManagement = lazy(() => import('./pages/processes/ProcessManagement'));
const Documentation = lazy(() => import('./pages/processes/Documentation'));
const POP = lazy(() => import('./pages/processes/POP'));
const Flowchart = lazy(() => import('./pages/processes/Flowchart'));

// Customer Service Pages
const RNC = lazy(() => import('./pages/customer-service/RNC'));
const TechnicalAssistance = lazy(() => import('./pages/customer-service/TechnicalAssistance'));
const SupplierDealing = lazy(() => import('./pages/customer-service/SupplierDealing'));

// AI Pages
const AIAgents = lazy(() => import('./pages/ai/AIAgents'));
const AISales = lazy(() => import('./pages/ai/AISales'));

// Operations Pages
const FleetManagement = lazy(() => import('./pages/logistics/FleetManagement'));

// Service Center Pages
const InputManagement = lazy(() => import('./pages/service-center/InputManagement'));

// HR Pages
const TimeTracking = lazy(() => import('./pages/hr/TimeTracking'));
const EmployeeManagement = lazy(() => import('./pages/hr/EmployeeManagement'));

// IT Pages
const ITAssets = lazy(() => import('./pages/it/ITAssets'));

// Marketing Pages
const Offers = lazy(() => import('./pages/marketing/Offers'));
const MarketingSchedule = lazy(() => import('./pages/marketing/MarketingSchedule'));

// Board Pages
const DRE = lazy(() => import('./pages/board/DRE'));
const StrategicDashboard = lazy(() => import('./pages/board/StrategicDashboard'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useData();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Admin Route Component - Extra check for role
const AdminRoute = ({ children }) => {
    const { isAuthenticated, userRole } = useData();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (userRole !== 'admin') {
        return <Navigate to="/report" replace />; // Back to report if viewer tries admin
    }
    return children;
};

// Main App Structure
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <ActivityTracker />
            <Suspense fallback={<GlobalSkeleton />}><Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/agendamento" element={<CarrierScheduling />} />
                {/* <Route path="/equipe" element={<TeamDashboard />} /> Moved to Protected Routes */}

                {/* Protected Routes Wrapper */}
                <Route element={
                    <ProtectedRoute>
                        <PostAuthLayout>
                            <Outlet />
                        </PostAuthLayout>
                    </ProtectedRoute>
                }>
                    {/* Redirect legacy /report to /sales/report */}
                    <Route path="/report" element={<Navigate to="/sales/report" replace />} />
                    <Route path="/sales/report" element={<Report />} />

                    {/* Redirect legacy /dashboard to /sales/dashboard */}
                    <Route path="/dashboard" element={<Navigate to="/sales/dashboard" replace />} />
                    <Route path="/sales/dashboard" element={<Dashboard />} />

                    <Route path="/menu" element={<Menu />} />
                    <Route path="/units" element={<UnitSelection />} />

                    {/* Legacy redirects */}
                    <Route path="/delivery-schedule" element={<Navigate to="/logistics/delivery-schedule" replace />} />
                    <Route path="/returns" element={<Navigate to="/customer-service/returns" replace />} />

                    <Route path="/logistics/delivery-schedule" element={<DeliverySchedule />} />
                    <Route path="/customer-service/returns" element={<Returns />} />
                    <Route path="/profile" element={<UserProfile />} />

                    {/* Sales Routes */}
                    <Route path="/sales/synthetic-summary" element={<SyntheticSalesSummary />} />
                    <Route path="/sales/smart-catalog" element={<SmartCatalog />} />
                    <Route path="/sales/campaigns" element={<SalesCampaigns />} />
                    <Route path="/sales/client-records" element={<ClientRecords />} />
                    <Route path="/sales/team-records" element={<SalesTeamRecords />} />
                    <Route path="/sales/intelligence" element={<SalesIntelligence />} />
                    <Route path="/sales/simulation" element={<SalesSimulation />} />
                    <Route path="/sales/analysis" element={<SalesAnalysis />} />

                    {/* Purchases Routes */}
                    <Route path="/purchases/order-control" element={<OrderControl />} />
                    <Route path="/purchases/requisitions" element={<PurchaseRequisitions />} />
                    <Route path="/purchases/branch-transfers" element={<BranchTransfers />} />
                    <Route path="/purchases/uniform-control" element={<UniformControl />} />
                    <Route path="/purchases/gifts-control" element={<GiftsControl />} />
                    <Route path="/purchases/central-area" element={<CentralArea />} />
                    <Route path="/purchases/supplier-campaigns" element={<SupplierCampaigns />} />
                    <Route path="/purchases/intelligence" element={<PurchasingIntelligence />} />
                    <Route path="/purchases/brands-buyers" element={<BrandsAndBuyers />} />

                    {/* Team Routes */}
                    <Route path="/equipe" element={<TeamDashboard />} />

                    {/* Logistics Routes */}
                    <Route path="/logistics/warehouse-management" element={<WarehouseManagement />} />
                    <Route path="/logistics/warehouse-training" element={<WarehouseTraining />} />

                    {/* Financial Routes */}
                    <Route path="/financial/cost-center" element={<CostCenter />} />
                    <Route path="/financial/serasa-spc" element={<SerasaSPC />} />
                    <Route path="/financial/intelligence" element={<FinancialIntelligence />} />
                    <Route path="/financial/credit-auth" element={<CreditAuth />} />
                    <Route path="/financial/client-summary" element={<ClientSummary />} />

                    {/* Processes Routes */}
                    <Route path="/processes/management" element={<ProcessManagement />} />
                    <Route path="/processes/documentation" element={<Documentation />} />
                    <Route path="/processes/pop" element={<POP />} />
                    <Route path="/processes/flowchart" element={<Flowchart />} />

                    {/* Customer Service Routes */}
                    <Route path="/customer-service/rnc" element={<RNC />} />
                    <Route path="/customer-service/technical-assistance" element={<TechnicalAssistance />} />
                    <Route path="/customer-service/supplier-dealing" element={<SupplierDealing />} />

                    {/* AI Routes */}
                    <Route path="/ai/agents" element={<AIAgents />} />
                    <Route path="/ai/sales" element={<AISales />} />

                    {/* Operations Routes */}
                    <Route path="/logistics/fleet-management" element={<FleetManagement />} />

                    {/* Service Center Routes */}
                    <Route path="/service-center/input-management" element={<InputManagement />} />

                    {/* HR Routes */}
                    <Route path="/hr/time-tracking" element={<TimeTracking />} />
                    <Route path="/hr/employee-management" element={<EmployeeManagement />} />

                    {/* IT Routes */}
                    <Route path="/it/assets" element={<ITAssets />} />

                    {/* Marketing Routes */}
                    <Route path="/marketing/offers" element={<Offers />} />
                    <Route path="/marketing/schedule" element={<MarketingSchedule />} />

                    {/* Board Routes */}
                    <Route path="/board/dre" element={<DRE />} />
                    <Route path="/board/strategic" element={<StrategicDashboard />} />

                    {/* Admin Only */}
                    <Route path="/admin" element={
                        <AdminRoute>
                            <Admin />
                        </AdminRoute>
                    } />

                    <Route path="/admin/upload" element={
                        <AdminRoute>
                            <DataUpload />
                        </AdminRoute>
                    } />

                    <Route path="/admin/audit" element={
                        <AdminRoute>
                            <UserAudit />
                        </AdminRoute>
                    } />
                </Route>
            </Routes></Suspense>
        </BrowserRouter>
    );
};

const ThemeController = () => {
    const { theme } = useData();

    React.useEffect(() => {
        const root = document.documentElement;
        // Set the data-theme attribute which index.css uses
        root.setAttribute('data-theme', theme);

        // Remove manual property overrides to allow index.css to handle them consistently
        root.style.removeProperty('--bg-main');
        root.style.removeProperty('--text-main');
        root.style.removeProperty('--bg-card');

        // Let CSS variables in index.css handle the background (no inline override)
        document.body.style.backgroundColor = '';
    }, [theme]);

    return null;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <DataProvider>
                <ThemeController />
                <ToastProvider>
                    <AppRoutes />
                </ToastProvider>
            </DataProvider>
            {/* Devtools only appear in development mode */}
            <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
        </QueryClientProvider>
    );
}

export default App;
