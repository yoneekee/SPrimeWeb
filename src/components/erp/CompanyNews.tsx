import { Newspaper, Clock } from "lucide-react";

const newsItems = [
  { title: "8인치 웨이퍼 생산라인 가동률 98% 달성", time: "2시간 전", type: "success" as const },
  { title: "품질관리 ISO 9001 갱신 심사 완료", time: "5시간 전", type: "info" as const },
  { title: "3분기 원자재 단가 협상 결과 공유", time: "1일 전", type: "warning" as const },
  { title: "신규 클린룸 장비 도입 일정 확정", time: "2일 전", type: "info" as const },
  { title: "안전교육 미이수자 알림", time: "3일 전", type: "destructive" as const },
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
        <h3 className="text-sm font-semibold text-foreground">Company News</h3>
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
