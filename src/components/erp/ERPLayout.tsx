/**
 * ERPLayout – Root layout shell.
 * Renders sidebar (desktop) or Sheet drawer (mobile), top header, and footer.
 */
import { useState, useRef, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ERPSidebar from "./ERPSidebar";
import { Bell, Search, User, Sun, Moon, Info, CheckCircle2, AlertTriangle, X, LogOut, Settings, UserCircle, Menu } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface Notification {
  id: string;
  type: "info" | "success" | "warning";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const mockNotifications: Notification[] = [
  { id: "1", type: "success", title: "承認完了", message: "SLP20240307-001 伝票が最終承認されました。", time: "5分前", read: false },
  { id: "2", type: "warning", title: "在庫不足警告", message: "バイトン Oリング（Φ300）が安全在庫以下です。", time: "12分前", read: false },
  { id: "3", type: "info", title: "分納入庫", message: "シリコンウェーハ 300mm 1次分納 300EA 入庫完了。", time: "1時間前", read: true },
  { id: "4", type: "info", title: "新規伝票", message: "伊藤真一さんが出庫伝票 SHP20240310-001を申請しました。", time: "2時間前", read: true },
  { id: "5", type: "success", title: "検収完了", message: "SLP20240304-002 伝票の検収が完了しました。", time: "3時間前", read: true },
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
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    displayName: user?.name || "",
    phone: "",
    department: "",
  });
  const [notifications, setNotifications] = useState(mockNotifications);
  const panelRef = useRef<HTMLDivElement>(null);
  const userPanelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

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
        {/* Desktop sidebar – hidden on mobile */}
        {!isMobile && <ERPSidebar />}

        {/* Mobile Sheet drawer */}
        {isMobile && (
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>メニュー</SheetTitle>
              </SheetHeader>
              <ERPSidebar onNavigate={() => setMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-12 flex items-center justify-between border-b border-border px-4 bg-background flex-shrink-0">
            <div className="flex items-center gap-3">
              {isMobile ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              ) : (
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
              )}
              <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">検索...</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="h-7 px-2.5 gap-1.5 relative rounded-full bg-secondary ring-1 ring-border shadow-sm hover:bg-secondary/80 hover:opacity-90 text-xs"
              >
                {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-warning" />}
                <span className="hidden sm:inline text-[10px] font-medium">{theme === "dark" ? "ダーク" : "ライト"}</span>
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
                  <div className="absolute right-0 top-9 w-80 border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up bg-background">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-semibold text-foreground">通知</span>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[10px] text-primary hover:underline">
                            すべて既読
                          </button>
                        )}
                        <button onClick={() => setNotifOpen(false)} className="text-muted-foreground hover:text-foreground">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-muted-foreground">通知はありません</div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`flex items-start gap-2.5 px-4 py-2.5 border-b border-border last:border-b-0 transition-colors cursor-pointer hover:bg-muted ${
                              !n.read ? "bg-secondary" : "bg-background"
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
                  <div className="absolute right-0 top-9 w-64 bg-background border border-border rounded-lg shadow-xl z-50 overflow-hidden animate-slide-up">
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                      <span className="text-xs font-semibold text-foreground">マイアカウント</span>
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
                          <p className="text-xs font-medium text-foreground">{user?.name || "ユーザー"}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{user?.email || ""}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-foreground hover:bg-secondary/50 transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        設定
                      </button>
                      <button
                        onClick={() => { logout(); navigate("/login", { replace: true }); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-xs text-destructive hover:bg-secondary/50 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        ログアウト
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

          <footer className="h-10 flex items-center justify-between px-4 border-t border-border bg-background text-[11px] text-muted-foreground flex-shrink-0">
            <span>© {new Date().getFullYear()} S-Prime ERP</span>
            <span>v1.0.0</span>
          </footer>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">ユーザー設定</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                <UserCircle className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user?.name || "ユーザー"}</p>
                <p className="text-xs text-muted-foreground">ID: {user?.email || ""}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">表示名</Label>
                <Input
                  value={settingsForm.displayName}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, displayName: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="名前を入力してください"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">連絡先</Label>
                <Input
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, phone: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="03-XXXX-XXXX"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">部署</Label>
                <Input
                  value={settingsForm.department}
                  onChange={(e) => setSettingsForm((f) => ({ ...f, department: e.target.value }))}
                  className="h-9 text-sm"
                  placeholder="所属部署"
                />
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-foreground">テーマ</p>
                <p className="text-[11px] text-muted-foreground">画面の明るさを変更します</p>
              </div>
              <Button variant="outline" size="sm" onClick={toggleTheme} className="h-8 text-xs gap-1.5">
                {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {theme === "dark" ? "ライトモード" : "ダークモード"}
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(false)}>キャンセル</Button>
              <Button size="sm" onClick={() => setSettingsOpen(false)}>保存</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default ERPLayout;
