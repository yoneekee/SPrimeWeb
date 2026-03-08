import { Activity } from "lucide-react";

const lines = [
  { name: "FAB-A 포토공정", status: "running", rate: 98.2, product: "300mm 웨이퍼" },
  { name: "FAB-B 에칭공정", status: "running", rate: 95.7, product: "DRAM 칩" },
  { name: "PKG-1 패키징", status: "maintenance", rate: 0, product: "BGA 패키지" },
  { name: "FAB-C 증착공정", status: "running", rate: 91.3, product: "NAND Flash" },
  { name: "TEST-1 검사", status: "running", rate: 99.1, product: "QC 검사" },
];

const statusLabel: Record<string, { text: string; dotClass: string }> = {
  running: { text: "가동중", dotClass: "status-dot-success" },
  maintenance: { text: "정비중", dotClass: "status-dot-warning" },
  stopped: { text: "정지", dotClass: "status-dot-destructive" },
};

const ProductionLine = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "400ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">생산라인 현황</h3>
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
