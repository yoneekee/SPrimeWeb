import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { FileText } from "lucide-react";

const statusData = [
  { name: "작성중 (Draft)", value: 8, color: "hsl(215, 12%, 50%)" },
  { name: "신청/승인중", value: 12, color: "hsl(45, 90%, 55%)" },
  { name: "견적/발주", value: 15, color: "hsl(210, 80%, 55%)" },
  { name: "분납/입고중", value: 6, color: "hsl(185, 72%, 48%)" },
  { name: "검수완료", value: 24, color: "hsl(152, 60%, 45%)" },
  { name: "출고/매출확정", value: 18, color: "hsl(280, 60%, 55%)" },
];

const total = statusData.reduce((s, d) => s + d.value, 0);

const SlipStatusChart = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "450ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">전표 상태 현황</h3>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-32 h-32 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={52}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {statusData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(220, 18%, 12%)",
                  border: "1px solid hsl(220, 14%, 22%)",
                  borderRadius: "8px",
                  fontSize: "11px",
                  color: "hsl(210, 20%, 90%)",
                }}
                formatter={(value: number, name: string) => [`${value}건 (${((value / total) * 100).toFixed(0)}%)`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {statusData.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-foreground">{item.name}</span>
              </div>
              <span className="font-mono text-muted-foreground">{item.value}건</span>
            </div>
          ))}
          <div className="pt-1 border-t border-border flex items-center justify-between text-[11px] font-medium">
            <span className="text-foreground">합계</span>
            <span className="font-mono text-primary">{total}건</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlipStatusChart;