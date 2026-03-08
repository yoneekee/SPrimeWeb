import { ShoppingCart } from "lucide-react";

const orders = [
  { id: "ORD-2024-0891", client: "東京エレクトロン(株)", product: "8\" ウェーハ装置", qty: 5, status: "進行中", amount: "¥245,000,000" },
  { id: "ORD-2024-0890", client: "SCREEN HD(株)", product: "CVDチャンバー", qty: 2, status: "完了", amount: "¥180,000,000" },
  { id: "ORD-2024-0889", client: "ディスコ(株)", product: "エッチングモジュール", qty: 8, status: "検収中", amount: "¥92,000,000" },
  { id: "ORD-2024-0888", client: "ルネサス(株)", product: "精密センサー", qty: 120, status: "進行中", amount: "¥36,000,000" },
];

const statusStyle: Record<string, string> = {
  "進行中": "bg-info/20 text-info",
  "完了": "bg-success/20 text-success",
  "検収中": "bg-warning/20 text-warning",
};

const RecentOrders = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 animate-slide-up" style={{ animationDelay: "500ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">최근 수주 현황</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-[10px] text-muted-foreground font-medium text-left py-2 pr-4">주문번호</th>
              <th className="text-[10px] text-muted-foreground font-medium text-left py-2 pr-4">거래처</th>
              <th className="text-[10px] text-muted-foreground font-medium text-left py-2 pr-4">제품</th>
              <th className="text-[10px] text-muted-foreground font-medium text-right py-2 pr-4">수량</th>
              <th className="text-[10px] text-muted-foreground font-medium text-right py-2 pr-4">금액</th>
              <th className="text-[10px] text-muted-foreground font-medium text-center py-2">상태</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                <td className="data-text text-xs text-primary py-2.5 pr-4">{o.id}</td>
                <td className="text-xs text-foreground py-2.5 pr-4">{o.client}</td>
                <td className="text-xs text-muted-foreground py-2.5 pr-4">{o.product}</td>
                <td className="data-text text-xs text-foreground py-2.5 pr-4 text-right">{o.qty}</td>
                <td className="data-text text-xs text-foreground py-2.5 pr-4 text-right">{o.amount}</td>
                <td className="py-2.5 text-center">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusStyle[o.status]}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;