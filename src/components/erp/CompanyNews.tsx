import { Newspaper, Clock } from "lucide-react";

const newsItems = [
  { title: "8インチウェーハ生産ライン稼働率98%達成", time: "2時間前", type: "success" as const },
  { title: "品質管理ISO 9001更新審査完了", time: "5時間前", type: "info" as const },
  { title: "第3四半期 原材料単価交渉結果共有", time: "1日前", type: "warning" as const },
  { title: "新規クリーンルーム設備導入日程確定", time: "2日前", type: "info" as const },
  { title: "安全教育未受講者通知", time: "3日前", type: "destructive" as const },
];

const statusColors = {
  success: "status-dot-success",
  info: "bg-info",
  warning: "status-dot-warning",
  destructive: "status-dot-destructive",
};

const CompanyNews = () => {
  return (
    <div className="card-glow border-glow rounded-lg bg-card p-4 h-full animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">社内ニュース</h3>
      </div>
      <div className="space-y-3">
        {newsItems.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-2.5 rounded-md bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
          >
            <div className={`mt-1.5 ${statusColors[item.type]} w-2 h-2 rounded-full flex-shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground leading-relaxed truncate">{item.title}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyNews;
