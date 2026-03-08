import { Package } from "lucide-react";

const inventoryData = [
  { name: "실리콘 웨이퍼 (8\")", stock: 1240, max: 2000, unit: "매" },
  { name: "포토마스크", stock: 85, max: 100, unit: "EA" },
  { name: "에칭 용액 (BOE)", stock: 320, max: 500, unit: "L" },
  { name: "CVD 가스 (SiH₄)", stock: 45, max: 200, unit: "kg" },
  { name: "리드프레임", stock: 8500, max: 10000, unit: "EA" },
  { name: "다이싱 블레이드", stock: 12, max: 50, unit: "EA" },
];

const getBarColor = (ratio: number) => {
  if (ratio < 0.25) return "bg-destructive";
  if (ratio < 0.5) return "bg-warning";
  return "bg-primary";
};

const InventoryStatus = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">주요 자재 재고</h3>
      </div>
      <div className="space-y-3">
        {inventoryData.map((item, i) => {
          const ratio = item.stock / item.max;
          return (
            <div key={i} className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-foreground truncate mr-2">{item.name}</span>
                <span className="data-text text-[11px] text-muted-foreground whitespace-nowrap">
                  {item.stock.toLocaleString()} / {item.max.toLocaleString()} {item.unit}
                </span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${getBarColor(ratio)}`}
                  style={{ width: `${ratio * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryStatus;
