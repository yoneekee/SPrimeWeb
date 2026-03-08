import { Activity } from "lucide-react";

const lines = [
  { name: "FAB-A フォト工程", status: "running", rate: 98.2, product: "300mmウェーハ" },
  { name: "FAB-B エッチング工程", status: "running", rate: 95.7, product: "DRAMチップ" },
  { name: "PKG-1 パッケージング", status: "maintenance", rate: 0, product: "BGAパッケージ" },
  { name: "FAB-C 成膜工程", status: "running", rate: 91.3, product: "NAND Flash" },
  { name: "TEST-1 検査", status: "running", rate: 99.1, product: "QC検査" },
];

const statusLabel: Record<string, { text: string; dotClass: string }> = {
  running: { text: "稼働中", dotClass: "status-dot-success" },
  maintenance: { text: "整備中", dotClass: "status-dot-warning" },
  stopped: { text: "停止", dotClass: "status-dot-destructive" },
};

const ProductionLine = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">生産ライン状況</h3>
      </div>
      <div className="space-y-2.5">
        {lines.map((line, i) => {
          const s = statusLabel[line.status];
          return (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-md bg-secondary/50">
              <div className={s.dotClass} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-foreground">{line.name}</div>
                <div className="text-[10px] text-muted-foreground">{line.product}</div>
              </div>
              <div className="text-right">
                <div className="data-text text-xs font-semibold text-foreground">
                  {line.status === "running" ? `${line.rate}%` : "—"}
                </div>
                <div className={`text-[10px] ${line.status === "running" ? "text-success" : "text-warning"}`}>
                  {s.text}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionLine;
