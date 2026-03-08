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
  { name: "1월", 생산량: 4200, 불량률: 120, 출하량: 3800 },
  { name: "2월", 생산량: 5100, 불량률: 95, 출하량: 4600 },
  { name: "3월", 생산량: 4800, 불량률: 140, 출하량: 4200 },
  { name: "4월", 생산량: 5500, 불량률: 88, 출하량: 5100 },
  { name: "5월", 생산량: 6200, 불량률: 72, 출하량: 5800 },
  { name: "6월", 생산량: 5900, 불량률: 105, 출하량: 5400 },
  { name: "7월", 생산량: 6800, 불량률: 65, 출하량: 6300 },
];

const tabs = ["생산 추이", "품질 분석", "출하 현황"] as const;

const DashboardChart = () => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("생산 추이");

  return (
    <div className="card-glow border-glow rounded-lg bg-card p-5 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-foreground">생산 현황 모니터링</h3>
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
            {activeTab === "생산 추이" && (
              <>
                <Area type="monotone" dataKey="생산량" stroke="hsl(185, 72%, 48%)" fill="url(#gradProd)" strokeWidth={2} />
                <Area type="monotone" dataKey="출하량" stroke="hsl(210, 80%, 55%)" fill="url(#gradShip)" strokeWidth={2} />
              </>
            )}
            {activeTab === "품질 분석" && (
              <Area type="monotone" dataKey="불량률" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%, 0.1)" strokeWidth={2} />
            )}
            {activeTab === "출하 현황" && (
              <Area type="monotone" dataKey="출하량" stroke="hsl(152, 60%, 45%)" fill="hsl(152, 60%, 45%, 0.1)" strokeWidth={2} />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
