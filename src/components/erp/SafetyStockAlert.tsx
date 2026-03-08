import { AlertTriangle } from "lucide-react";

const alertItems = [
  { code: "RAW-ORING-VT", name: "バイトン O-リング (Φ300)", stockQty: 25, safetyStock: 50, unit: "EA" },
  { code: "RAW-GAS-N2", name: "高純度窒素ガス (N₂)", stockQty: 15, safetyStock: 20, unit: "SET" },
  { code: "SEMI-RF-GEN", name: "RF発生器ユニット", stockQty: 3, safetyStock: 5, unit: "EA" },
  { code: "RAW-CAP-HV", name: "高圧セラミックコンデンサ", stockQty: 40, safetyStock: 60, unit: "EA" },
];

const SafetyStockAlert = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-foreground">安全在庫割れ警告</h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/20 text-destructive font-medium">
          {alertItems.length}件
        </span>
      </div>
      <div className="space-y-2">
        {alertItems.map((item, i) => {
          const ratio = item.stockQty / item.safetyStock;
          return (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-md bg-destructive/5 border border-destructive/10">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-primary">{item.code}</span>
                  <span className="text-xs text-foreground truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-destructive transition-all duration-700"
                      style={{ width: `${Math.min(ratio * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-destructive whitespace-nowrap">
                    {item.stockQty} / {item.safetyStock} {item.unit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SafetyStockAlert;
