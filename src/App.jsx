import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Home from './pages/Home';
import PostAuthLayout from './components/PostAuthLayout';

import Admin from './pages/AdminPanel'; // Updated to AdminPanel
import Report from './pages/sales/Report';
import Dashboard from './pages/sales/Dashboard';
import UnitSelection from './pages/UnitSelection';
import Menu from './pages/Menu';
import DeliverySchedule from './pages/logistics/DeliverySchedule';
import Returns from './pages/customer-service/Returns';
import UserProfile from './pages/UserProfile';
import DataUpload from './pages/DataUpload';
import CarrierScheduling from './pages/logistics/CarrierScheduling';
import TeamDashboard from './pages/team/TeamDashboard';
import ActivityTracker from './components/ActivityTracker';
import UserAudit from './pages/admin/UserAudit';


// Sales Pages
import QuarterlySalesAnalysis from './pages/sales/QuarterlySalesAnalysis';
import SyntheticSalesSummary from './pages/sales/SyntheticSalesSummary';
import SmartCatalog from './pages/sales/SmartCatalog';
import SalesCampaigns from './pages/sales/SalesCampaigns';
import ClientRecords from './pages/sales/ClientRecords';
import SalesTeamRecords from './pages/sales/SalesTeamRecords';
import SalesIntelligence from './pages/sales/SalesIntelligence';

// Purchases Pages
import OrderControl from './pages/purchases/OrderControl';
import PurchaseRequisitions from './pages/purchases/PurchaseRequisitions';
import BranchTransfers from './pages/purchases/BranchTransfers';
import UniformControl from './pages/purchases/UniformControl';
import GiftsControl from './pages/purchases/GiftsControl';
import CentralArea from './pages/purchases/CentralArea';
import SupplierCampaigns from './pages/purchases/SupplierCampaigns';
import PurchasingIntelligence from './pages/purchases/PurchasingIntelligence';

// Logistics Pages
import WarehouseManagement from './pages/logistics/WarehouseManagement';
import WarehouseTraining from './pages/logistics/WarehouseTraining';

// Financial Pages
import CostCenter from './pages/financial/CostCenter';
import SerasaSPC from './pages/financial/SerasaSPC';
import FinancialIntelligence from './pages/financial/FinancialIntelligence';
import CreditAuth from './pages/financial/CreditAuth';

// Processes Pages
import ProcessManagement from './pages/processes/ProcessManagement';
import Documentation from './pages/processes/Documentation';
import POP from './pages/processes/POP';
import Flowchart from './pages/processes/Flowchart';

// Customer Service Pages
import RNC from './pages/customer-service/RNC';
import TechnicalAssistance from './pages/customer-service/TechnicalAssistance';
import SupplierDealing from './pages/customer-service/SupplierDealing';

// AI Pages
import AIAgents from './pages/ai/AIAgents';
import AISales from './pages/ai/AISales';

// Operations Pages
import FleetManagement from './pages/logistics/FleetManagement';

// Service Center Pages
import InputManagement from './pages/service-center/InputManagement';

// HR Pages
import TimeTracking from './pages/hr/TimeTracking';
import EmployeeManagement from './pages/hr/EmployeeManagement';

// IT Pages
import ITAssets from './pages/it/ITAssets';

// Marketing Pages
import Offers from './pages/marketing/Offers';
import MarketingSchedule from './pages/marketing/MarketingSchedule';

// Board Pages
import DRE from './pages/board/DRE';

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
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
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
                    <Route path="/sales/quarterly-analysis" element={<QuarterlySalesAnalysis />} />
                    <Route path="/sales/synthetic-summary" element={<SyntheticSalesSummary />} />
                    <Route path="/sales/smart-catalog" element={<SmartCatalog />} />
                    <Route path="/sales/campaigns" element={<SalesCampaigns />} />
                    <Route path="/sales/client-records" element={<ClientRecords />} />
                    <Route path="/sales/team-records" element={<SalesTeamRecords />} />
                    <Route path="/sales/intelligence" element={<SalesIntelligence />} />

                    {/* Purchases Routes */}
                    <Route path="/purchases/order-control" element={<OrderControl />} />
                    <Route path="/purchases/requisitions" element={<PurchaseRequisitions />} />
                    <Route path="/purchases/branch-transfers" element={<BranchTransfers />} />
                    <Route path="/purchases/uniform-control" element={<UniformControl />} />
                    <Route path="/purchases/gifts-control" element={<GiftsControl />} />
                    <Route path="/purchases/central-area" element={<CentralArea />} />
                    <Route path="/purchases/supplier-campaigns" element={<SupplierCampaigns />} />
                    <Route path="/purchases/intelligence" element={<PurchasingIntelligence />} />

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
            </Routes>
        </BrowserRouter>
    );
};

const ThemeController = () => {
    const { theme } = useData();

    React.useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-main', '#121212'); // Main page dark bg
            root.style.setProperty('--text-main', '#e0e0e0');
            root.style.setProperty('--bg-card', '#1e1e1e');
            root.style.setProperty('--bg-header', 'rgba(30, 30, 30, 0.85)'); // Dark header
            root.style.setProperty('--border-color', '#333333');
            root.style.setProperty('--bg-input', '#2c2c2c');
            root.style.setProperty('--text-muted', '#b0b0b0');
            root.style.setProperty('--border-input', '#444444');
            // Add more as needed
        } else {
            root.style.setProperty('--bg-main', '#FAFAFA');
            root.style.setProperty('--text-main', '#1A1A1A');
            root.style.setProperty('--bg-card', '#FFFFFF');
            root.style.setProperty('--bg-header', 'rgba(255, 255, 255, 0.85)'); // Light header
            root.style.setProperty('--border-color', '#E5E7EB');
            root.style.setProperty('--bg-input', '#F8F9FA');
            root.style.setProperty('--text-muted', '#666666');
            root.style.setProperty('--border-input', '#E9ecef');
        }
    }, [theme]);

    return null;
};

function App() {
    return (
        <DataProvider>
            <ThemeController />
            <AppRoutes />
        </DataProvider>
    );
}

export default App;
