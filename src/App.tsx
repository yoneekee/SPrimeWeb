import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

import Login from "./pages/Login";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";
import ProductionExecution from "./pages/ProductionExecution";
import ShipmentManagement from "./pages/ShipmentManagement";
import FinancialStatements from "./pages/FinancialStatements";
import BomProductionSlip from "./pages/BomProductionSlip";
import InvoiceManagement from "./pages/InvoiceManagement";
import EmployeeMaster from "./pages/EmployeeMaster";
import ItemMaster from "./pages/ItemMaster";
import WarehouseMaster from "./pages/WarehouseMaster";
import ProductionSlipCreate from "./pages/ProductionSlipCreate";
import ShipmentSlipCreate from "./pages/ShipmentSlipCreate";
import BomSlipCreate from "./pages/BomSlipCreate";
import CompanyIntro from "./pages/CompanyIntro";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/production" element={<ProtectedRoute><PlaceholderPage title="生産・製造" description="生産および製造管理画面です。" /></ProtectedRoute>} />
          <Route path="/production/execution" element={<ProtectedRoute><ProductionExecution /></ProtectedRoute>} />
          <Route path="/production/execution/new" element={<ProtectedRoute><ProductionSlipCreate /></ProtectedRoute>} />
          <Route path="/production/shipping" element={<ProtectedRoute><ShipmentManagement /></ProtectedRoute>} />
          <Route path="/production/shipping/new" element={<ProtectedRoute><ShipmentSlipCreate /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute><PlaceholderPage title="전표 및 서류" description="전표 및 서류 관리 화면입니다." /></ProtectedRoute>} />
          <Route path="/documents/finance" element={<ProtectedRoute><FinancialStatements /></ProtectedRoute>} />
          <Route path="/documents/bom" element={<ProtectedRoute><BomProductionSlip /></ProtectedRoute>} />
          <Route path="/documents/bom/new" element={<ProtectedRoute><BomSlipCreate /></ProtectedRoute>} />
          <Route path="/documents/invoice" element={<ProtectedRoute><InvoiceManagement /></ProtectedRoute>} />
          <Route path="/company" element={<ProtectedRoute><CompanyIntro /></ProtectedRoute>} />
          <Route path="/master" element={<ProtectedRoute><PlaceholderPage title="마스터 관리" description="마스터 데이터 관리 화면입니다." /></ProtectedRoute>} />
          <Route path="/master/employee" element={<ProtectedRoute><EmployeeMaster /></ProtectedRoute>} />
          <Route path="/master/item" element={<ProtectedRoute><ItemMaster /></ProtectedRoute>} />
          <Route path="/master/warehouse" element={<ProtectedRoute><WarehouseMaster /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
