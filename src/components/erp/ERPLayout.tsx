import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ERPSidebar from "./ERPSidebar";
import { Bell, Search, User, Sun, Moon, Info, CheckCircle2, AlertTriangle, X, LogIn, LogOut, Settings, UserCircle } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface Notification {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "success", title: "승인 완료", message: "SLP20240307-001 전표가 최종 승인되었습니다.", time: "5분 전", read: false },
  { id: "2", type: "warning", title: "재고 부족 경고", message: "바이톤 O-링 (Φ300) 안전재고 이하입니다.", time: "12분 전", read: false },
  { id: "3", type: "info", title: "분납 입고", message: "실리콘 웨이퍼 300mm 1차 분납 300EA 입고 완료.", time: "1시간 전", read: true },
  { id: "4", type: "info", title: "신규 전표", message: "정수현님이 출고전표 SHP20240310-001을 신청했습니다.", time: "2시간 전", read: true },
  { id: "5", type: "success", title: "검수 완료", message: "SLP20240304-002 전표 검수가 완료되었습니다.", time: "3시간 전", read: true },
];

const notifIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success": return <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />;
    case "warning": return <AlertTriangle className="w-3.5 h-3.5 text-warning flex-shrink-0" />;
    default: return <Info className="w-3.5 h-3.5 text-info flex-shrink-0" />;
  }
};

interface ERPLayoutProps {
  children: React.ReactNode;
}

const ERPLayout = ({ children }: ERPLayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userPanelRef.current && !userPanelRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (notifOpen || userMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen, userMenuOpen]);

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <ERPSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">검색...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              {/* Notification Bell */}
              <div className="relative" ref={panelRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotifOpen((v) => !v)}
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground relative"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {notifOpen && (
                  <div className="absolute right-0 top-9 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-semibold text-foreground">알림</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">
                            모두 읽음
                          </button>
                        )}
                        <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">알림이 없습니다</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-b-0 transition-colors cursor-pointer hover:bg-secondary/50 ${
                              !n.read ? "bg-primary/5" : ""
                            }`}
                            onClick={() =>
                              setNotifications((prev) =>
                                prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
                              )
                            }
                          >
                            <div className="mt-0.5">{notifIcon(n.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium text-foreground">{n.title}</span>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                              <span className="text-[10px] text-muted-foreground/70 mt-0.5">{n.time}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative" ref={userPanelRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-9 w-64 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-semibold text-foreground">내 계정</span>
                      <button onClick={() => setUserMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                          <UserCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{user?.name || "사용자"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors">
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        설정
                      </button>
                      <button
                        onClick={() => { logout(); navigate("/login", { replace: true }); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-destructive hover:bg-secondary/50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ERPLayout;
