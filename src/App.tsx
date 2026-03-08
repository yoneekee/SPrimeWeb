import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/production" element={<PlaceholderPage title="생산 및 제조" description="생산 및 제조 관리 화면입니다." />} />
          <Route path="/production/execution" element={<ProductionExecution />} />
          <Route path="/production/execution/new" element={<ProductionSlipCreate />} />
          <Route path="/production/shipping" element={<ShipmentManagement />} />
          <Route path="/production/shipping/new" element={<ShipmentSlipCreate />} />
          <Route path="/documents" element={<PlaceholderPage title="전표 및 서류" description="전표 및 서류 관리 화면입니다." />} />
          <Route path="/documents/finance" element={<FinancialStatements />} />
          <Route path="/documents/bom" element={<BomProductionSlip />} />
          <Route path="/documents/bom/new" element={<BomSlipCreate />} />
          <Route path="/documents/invoice" element={<InvoiceManagement />} />
          <Route path="/master" element={<PlaceholderPage title="마스터 관리" description="마스터 데이터 관리 화면입니다." />} />
          <Route path="/master/employee" element={<EmployeeMaster />} />
          <Route path="/master/item" element={<ItemMaster />} />
          <Route path="/master/warehouse" element={<WarehouseMaster />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
