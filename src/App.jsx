import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider, useData } from './context/DataContext';
import Home from './pages/Home';

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

// SGI Pages
import Quality from './pages/sgi/Quality';
import Environment from './pages/sgi/Environment';
import Safety from './pages/sgi/Safety';
import SocialResponsibility from './pages/sgi/SocialResponsibility';

// Sales Pages
import QuarterlySalesAnalysis from './pages/sales/QuarterlySalesAnalysis';
import SyntheticSalesSummary from './pages/sales/SyntheticSalesSummary';
import SmartCatalog from './pages/sales/SmartCatalog';
import SalesCampaigns from './pages/sales/SalesCampaigns';

// Purchases Pages
import OrderControl from './pages/purchases/OrderControl';
import PurchaseRequisitions from './pages/purchases/PurchaseRequisitions';
import BranchTransfers from './pages/purchases/BranchTransfers';
import UniformControl from './pages/purchases/UniformControl';
import GiftsControl from './pages/purchases/GiftsControl';
import CentralArea from './pages/purchases/CentralArea';
import SupplierCampaigns from './pages/purchases/SupplierCampaigns';

// Logistics Pages
import WarehouseManagement from './pages/logistics/WarehouseManagement';
import WarehouseTraining from './pages/logistics/WarehouseTraining';

// Financial Pages
import CostCenter from './pages/financial/CostCenter';
import SerasaSPC from './pages/financial/SerasaSPC';
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
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/agendamento" element={<CarrierScheduling />} />

                {/* Protected */}
                {/* Redirect legacy /report to /sales/report */}
                <Route path="/report" element={<Navigate to="/sales/report" replace />} />

                <Route path="/sales/report" element={
                    <ProtectedRoute>
                        <Report />
                    </ProtectedRoute>
                } />

                {/* Redirect legacy /dashboard to /sales/dashboard */}
                <Route path="/dashboard" element={<Navigate to="/sales/dashboard" replace />} />

                <Route path="/sales/dashboard" element={
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                } />

                <Route path="/menu" element={
                    <ProtectedRoute>
                        <Menu />
                    </ProtectedRoute>
                } />

                <Route path="/units" element={
                    <ProtectedRoute>
                        <UnitSelection />
                    </ProtectedRoute>
                } />

                {/* Legacy redirects */}
                <Route path="/delivery-schedule" element={<Navigate to="/logistics/delivery-schedule" replace />} />
                <Route path="/returns" element={<Navigate to="/customer-service/returns" replace />} />

                <Route path="/logistics/delivery-schedule" element={
                    <ProtectedRoute>
                        <DeliverySchedule />
                    </ProtectedRoute>
                } />

                <Route path="/customer-service/returns" element={
                    <ProtectedRoute>
                        <Returns />
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <UserProfile />
                    </ProtectedRoute>
                } />

                {/* SGI Routes with nested paths and redirects */}
                <Route path="/quality" element={<Navigate to="/sgi/quality" replace />} />
                <Route path="/environment" element={<Navigate to="/sgi/environment" replace />} />
                <Route path="/safety" element={<Navigate to="/sgi/safety" replace />} />
                <Route path="/social-responsibility" element={<Navigate to="/sgi/social-responsibility" replace />} />

                <Route path="/sgi/quality" element={
                    <ProtectedRoute>
                        <Quality />
                    </ProtectedRoute>
                } />
                <Route path="/sgi/environment" element={
                    <ProtectedRoute>
                        <Environment />
                    </ProtectedRoute>
                } />
                <Route path="/sgi/safety" element={
                    <ProtectedRoute>
                        <Safety />
                    </ProtectedRoute>
                } />
                <Route path="/sgi/social-responsibility" element={
                    <ProtectedRoute>
                        <SocialResponsibility />
                    </ProtectedRoute>
                } />

                {/* Sales Routes */}
                <Route path="/sales/quarterly-analysis" element={<ProtectedRoute><QuarterlySalesAnalysis /></ProtectedRoute>} />
                <Route path="/sales/synthetic-summary" element={<ProtectedRoute><SyntheticSalesSummary /></ProtectedRoute>} />
                <Route path="/sales/smart-catalog" element={<ProtectedRoute><SmartCatalog /></ProtectedRoute>} />
                <Route path="/sales/campaigns" element={<ProtectedRoute><SalesCampaigns /></ProtectedRoute>} />

                {/* Purchases Routes */}
                <Route path="/purchases/order-control" element={<ProtectedRoute><OrderControl /></ProtectedRoute>} />
                <Route path="/purchases/requisitions" element={<ProtectedRoute><PurchaseRequisitions /></ProtectedRoute>} />
                <Route path="/purchases/branch-transfers" element={<ProtectedRoute><BranchTransfers /></ProtectedRoute>} />
                <Route path="/purchases/uniform-control" element={<ProtectedRoute><UniformControl /></ProtectedRoute>} />
                <Route path="/purchases/gifts-control" element={<ProtectedRoute><GiftsControl /></ProtectedRoute>} />
                <Route path="/purchases/central-area" element={<ProtectedRoute><CentralArea /></ProtectedRoute>} />
                <Route path="/purchases/supplier-campaigns" element={<ProtectedRoute><SupplierCampaigns /></ProtectedRoute>} />

                {/* Logistics Routes */}
                <Route path="/logistics/warehouse-management" element={<ProtectedRoute><WarehouseManagement /></ProtectedRoute>} />
                <Route path="/logistics/warehouse-training" element={<ProtectedRoute><WarehouseTraining /></ProtectedRoute>} />

                {/* Financial Routes */}
                <Route path="/financial/cost-center" element={<ProtectedRoute><CostCenter /></ProtectedRoute>} />
                <Route path="/financial/serasa-spc" element={<ProtectedRoute><SerasaSPC /></ProtectedRoute>} />
                <Route path="/financial/credit-auth" element={<ProtectedRoute><CreditAuth /></ProtectedRoute>} />

                {/* Processes Routes */}
                <Route path="/processes/management" element={<ProtectedRoute><ProcessManagement /></ProtectedRoute>} />
                <Route path="/processes/documentation" element={<ProtectedRoute><Documentation /></ProtectedRoute>} />
                <Route path="/processes/pop" element={<ProtectedRoute><POP /></ProtectedRoute>} />
                <Route path="/processes/flowchart" element={<ProtectedRoute><Flowchart /></ProtectedRoute>} />

                {/* Customer Service Routes */}
                <Route path="/customer-service/rnc" element={<ProtectedRoute><RNC /></ProtectedRoute>} />
                <Route path="/customer-service/technical-assistance" element={<ProtectedRoute><TechnicalAssistance /></ProtectedRoute>} />
                <Route path="/customer-service/supplier-dealing" element={<ProtectedRoute><SupplierDealing /></ProtectedRoute>} />

                {/* AI Routes */}
                <Route path="/ai/agents" element={<ProtectedRoute><AIAgents /></ProtectedRoute>} />
                <Route path="/ai/sales" element={<ProtectedRoute><AISales /></ProtectedRoute>} />

                {/* Operations Routes */}
                <Route path="/logistics/fleet-management" element={<ProtectedRoute><FleetManagement /></ProtectedRoute>} />

                {/* Service Center Routes */}
                <Route path="/service-center/input-management" element={<ProtectedRoute><InputManagement /></ProtectedRoute>} />

                {/* HR Routes */}
                <Route path="/hr/time-tracking" element={<ProtectedRoute><TimeTracking /></ProtectedRoute>} />
                <Route path="/hr/employee-management" element={<ProtectedRoute><EmployeeManagement /></ProtectedRoute>} />

                {/* IT Routes */}
                <Route path="/it/assets" element={<ProtectedRoute><ITAssets /></ProtectedRoute>} />

                {/* Marketing Routes */}
                <Route path="/marketing/offers" element={<ProtectedRoute><Offers /></ProtectedRoute>} />
                <Route path="/marketing/schedule" element={<ProtectedRoute><MarketingSchedule /></ProtectedRoute>} />

                {/* Board Routes */}
                <Route path="/board/dre" element={<ProtectedRoute><DRE /></ProtectedRoute>} />

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
            </Routes>
        </BrowserRouter>
    );
};

function App() {
    return (
        <DataProvider>
            <AppRoutes />
        </DataProvider>
    );
}

export default App;
