import { Factory, Package, TrendingUp, AlertTriangle } from "lucide-react";
import ERPLayout from "@/components/erp/ERPLayout";
import KPICard from "@/components/erp/KPICard";
import DashboardChart from "@/components/erp/DashboardChart";
import CompanyNews from "@/components/erp/CompanyNews";
import InventoryStatus from "@/components/erp/InventoryStatus";
import ProductionLine from "@/components/erp/ProductionLine";
import RecentOrders from "@/components/erp/RecentOrders";

const Index = () => {
  return (
    <ERPLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-foreground">전체 대시보드</h1>
            <p className="text-xs text-muted-foreground mt-0.5">반도체 정밀 기기 통합 관리 시스템</p>
          </div>
          <div className="data-text text-[11px] text-muted-foreground">
            최종 업데이트: {new Date().toLocaleString("ko-KR")}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KPICard
            title="월간 생산량"
            value="12,345"
            change="+8.2%"
            trend="up"
            icon={Factory}
            delay={0}
          />
          <KPICard
            title="재고 회전율"
            value="4.8회"
            change="+1.2%"
            trend="up"
            icon={Package}
            delay={50}
          />
          <KPICard
            title="월간 매출"
            value="₩5.53억"
            change="+12.5%"
            trend="up"
            icon={TrendingUp}
            delay={100}
          />
          <KPICard
            title="불량률"
            value="1.23%"
            change="-0.5%"
            trend="down"
            icon={AlertTriangle}
            delay={150}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Chart - spans 2 cols */}
          <div className="lg:col-span-2">
            <DashboardChart />
          </div>
          {/* News */}
          <CompanyNews />
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <InventoryStatus />
          <ProductionLine />
          <div className="lg:col-span-1">
            {/* Placeholder for additional widget */}
          </div>
        </div>

        {/* Orders table */}
        <RecentOrders />
      </div>
    </ERPLayout>
  );
};

export default Index;
