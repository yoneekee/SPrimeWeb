import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { name: "1月", 生産量: 4200, 不良数: 120, 出荷量: 3800 },
  { name: "2月", 生産量: 5100, 不良数: 95, 出荷量: 4600 },
  { name: "3月", 生産量: 4800, 不良数: 140, 出荷量: 4200 },
  { name: "4月", 生産量: 5500, 不良数: 88, 出荷量: 5100 },
  { name: "5月", 生産量: 6200, 不良数: 72, 出荷量: 5800 },
  { name: "6月", 生産量: 5900, 不良数: 105, 出荷量: 5400 },
  { name: "7月", 生産量: 6800, 不良数: 65, 出荷量: 6300 },
];

const tabs = ["生産推移", "品質分析", "出荷状況"] as const;

const DashboardChart = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("生産推移");

  return (
    <div className="card-glow border-glow rounded-lg bg-card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">生産状況モニタリング</h3>
        <div className="flex gap-1 bg-secondary rounded-md p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[11px] rounded transition-all duration-200 ${
                activeTab === tab
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(185, 72%, 48%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(185, 72%, 48%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradShip" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(210, 80%, 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 12%, 50%)", fontSize: 11 }}
              axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220, 18%, 12%)",
                border: "1px solid hsl(220, 14%, 22%)",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(210, 20%, 90%)",
              }}
            />
            {activeTab === "生産推移" && (
              <>
                <Area type="monotone" dataKey="生産量" stroke="hsl(185, 72%, 48%)" fill="url(#gradProd)" strokeWidth={2} />
                <Area type="monotone" dataKey="出荷量" stroke="hsl(210, 80%, 55%)" fill="url(#gradShip)" strokeWidth={2} />
              </>
            )}
            {activeTab === "品質分析" && (
              <Area type="monotone" dataKey="不良数" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%, 0.1)" strokeWidth={2} />
            )}
            {activeTab === "出荷状況" && (
              <Area type="monotone" dataKey="出荷量" stroke="hsl(152, 60%, 45%)" fill="hsl(152, 60%, 45%, 0.1)" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
