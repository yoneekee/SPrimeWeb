/**
 * ERPSidebar – Main navigation sidebar.
 * Desktop: hover-expand behavior with collapsible icon mode.
 * Mobile: rendered inside a Sheet; all interactions are tap/click based.
 * @prop onNavigate – optional callback fired after a nav link is tapped (used to close mobile drawer).
 */
import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Factory, FileText, Database, ChevronDown, ChevronRight,
  PackageOpen, ClipboardList, Receipt, FileBarChart, Users, Box, Warehouse, Cpu, Building2, List,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SubItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  children?: SubItem[];
}

interface ERPSidebarProps {
  /** Called after navigation occurs – used by mobile Sheet to auto-close */
  onNavigate?: () => void;
}

const companyItem: MenuItem = {
  id: "company",
  label: "プログラム紹介",
  icon: Building2,
  path: "/company",
};

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "全体ダッシュボード",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    id: "production",
    label: "生産・製造",
    icon: Factory,
    path: "/production",
    children: [
      { id: "prod-list", label: "生産出庫伝票一覧", icon: List, path: "/production/slips" },
      { id: "prod-exec", label: "製品生産および実行", icon: PackageOpen, path: "/production/execution" },
      { id: "prod-ship", label: "出庫および在庫調整", icon: ClipboardList, path: "/production/shipping" },
    ],
  },
  {
    id: "documents",
    label: "伝票・書類",
    icon: FileText,
    path: "/documents",
    children: [
      { id: "doc-finance", label: "財務諸表照会", icon: FileBarChart, path: "/documents/finance" },
      { id: "doc-bom", label: "BOM生産伝票", icon: Receipt, path: "/documents/bom" },
      { id: "doc-invoice", label: "請求書・発注書", icon: FileText, path: "/documents/invoice" },
    ],
  },
  {
    id: "master",
    label: "マスタ管理",
    icon: Database,
    path: "/master",
    children: [
      { id: "master-emp", label: "社員マスタ", icon: Users, path: "/master/employee" },
      { id: "master-item", label: "品目マスタ", icon: Box, path: "/master/item" },
      { id: "master-wh", label: "倉庫拠点マスタ", icon: Warehouse, path: "/master/warehouse" },
    ],
  },
];

const ERPSidebar = ({ onNavigate }: ERPSidebarProps) => {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mobile, sidebar is always rendered expanded inside a Sheet
  const isCollapsed = isMobile ? false : collapsed;

  const getInitialOpenGroups = () => {
    const groups: string[] = [];
    menuItems.forEach((item) => {
      if (item.children?.some((sub) => location.pathname.startsWith(sub.path))) {
        groups.push(item.id);
      }
    });
    return groups.length > 0 ? groups : ["dashboard"];
  };

  const [openGroups, setOpenGroups] = useState<string[]>(getInitialOpenGroups);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.children?.some((sub) => location.pathname.startsWith(sub.path))) {
        setOpenGroups((prev) => (prev.includes(item.id) ? prev : [...prev, item.id]));
      }
    });
  }, [location.pathname]);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  // Hover-expand only on desktop
  const handleMouseEnter = () => {
    if (isMobile) return;
    if (collapsed) {
      hoverTimeoutRef.current = setTimeout(() => {
        toggleSidebar();
      }, 200);
    }
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!collapsed) {
      toggleSidebar();
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // On mobile, render a plain nav without the Sidebar wrapper (it's inside a Sheet already)
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground tracking-tight">S-Prime ERP</div>
              <div className="text-[10px] text-muted-foreground">半導体精密機器管理</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {/* Company intro */}
          <button
            onClick={() => handleNav(companyItem.path)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm transition-colors",
              isActive(companyItem.path)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <companyItem.icon className={cn("w-4 h-4 flex-shrink-0", isActive(companyItem.path) && "text-primary")} />
            <span className="truncate">{companyItem.label}</span>
          </button>

          <div className="mx-3 my-1.5 border-b border-border/50" />

          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    toggleGroup(item.id);
                  } else {
                    handleNav(item.path);
                  }
                }}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm transition-colors",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive(item.path) && "text-primary")} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                {item.children && (
                  <span className="text-muted-foreground">
                    {openGroups.includes(item.id) ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </span>
                )}
              </button>

              {/* Sub items with animated expand */}
              {item.children && (
                <div
                  className="ml-4 pl-4 border-l border-border/50 overflow-hidden"
                  style={{
                    display: "grid",
                    gridTemplateRows: openGroups.includes(item.id) ? "1fr" : "0fr",
                    transition: "grid-template-rows 250ms ease",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="space-y-0.5 py-1">
                      {item.children.map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => handleNav(sub.path)}
                          className={cn(
                            "flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs transition-colors",
                            isActive(sub.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          )}
                        >
                          <sub.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="text-[10px] text-muted-foreground text-center">
            Powered by S-Prime Corp.
          </div>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center cursor-pointer">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          {!isCollapsed && (
           <div>
              <div className="text-sm font-semibold text-foreground tracking-tight">S-Prime ERP</div>
              <div className="text-[10px] text-muted-foreground">半導体精密機器管理</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => handleNav(companyItem.path)}
                  className={cn(
                    "group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                    isActive(companyItem.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <companyItem.icon className={cn("w-4 h-4 flex-shrink-0", isActive(companyItem.path) && "text-primary")} />
                  {!isCollapsed && <span className="text-sm flex-1 truncate">{companyItem.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!isCollapsed && <div className="mx-4 my-1.5 border-b border-border/50" />}
              {menuItems.map((item) => (
                <div key={item.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.children) {
                          toggleGroup(item.id);
                        } else {
                          handleNav(item.path);
                        }
                      }}
                      className={cn(
                        "group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200",
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive(item.path) && "text-primary")} />
                      {!isCollapsed && (
                        <>
                          <span className="text-sm flex-1 truncate">{item.label}</span>
                          {item.children && (
                            <span className="text-muted-foreground">
                              {openGroups.includes(item.id) ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </span>
                          )}
                        </>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {!isCollapsed && item.children && (
                    <div
                      className="ml-4 pl-4 border-l border-border/50 overflow-hidden"
                      style={{
                        display: "grid",
                        gridTemplateRows: openGroups.includes(item.id) ? "1fr" : "0fr",
                        transition: "grid-template-rows 250ms ease",
                      }}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="space-y-0.5 py-1">
                          {item.children.map((sub) => (
                            <SidebarMenuItem key={sub.id}>
                              <SidebarMenuButton
                                onClick={() => handleNav(sub.path)}
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors duration-200",
                                  isActive(sub.path)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                )}
                              >
                                <sub.icon className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{sub.label}</span>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {!isCollapsed && (
          <div className="text-[10px] text-muted-foreground text-center">
            Powered by S-Prime Corp.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ERPSidebar;
