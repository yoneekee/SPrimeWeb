import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Factory,
  FileText,
  Database,
  ChevronDown,
  ChevronRight,
  PackageOpen,
  ClipboardList,
  Receipt,
  FileBarChart,
  Users,
  Box,
  Warehouse,
  Cpu,
  Building2,
  List,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

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

const companyItem: MenuItem = {
  id: "company",
  label: "会社紹介",
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

const ERPSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-expand parent groups based on current route
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

  // Update open groups when route changes
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

  const openGroup = (id: string) => {
    setOpenGroups((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleMouseEnter = () => {
    if (collapsed) {
      hoverTimeoutRef.current = setTimeout(() => {
        toggleSidebar();
      }, 200);
    }
  };

  const handleMouseLeave = () => {
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
          {!collapsed && (
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
              {/* 회사 소개 - top item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate(companyItem.path)}
                  className={`group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                    isActive(companyItem.path)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <companyItem.icon className={`w-4 h-4 flex-shrink-0 ${isActive(companyItem.path) ? "text-primary" : ""}`} />
                  {!collapsed && <span className="text-sm flex-1 truncate">{companyItem.label}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              {!collapsed && <div className="mx-4 my-1.5 border-b border-border/50" />}
              {menuItems.map((item) => (
                <div key={item.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.children) {
                          toggleGroup(item.id);
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.path) ? "text-primary" : ""}`} />
                      {!collapsed && (
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

                  {/* Sub items */}
                  {!collapsed && item.children && (
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
                                onClick={() => navigate(sub.path)}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-colors duration-200 ${
                                  isActive(sub.path)
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                                }`}
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
        {!collapsed && (
          <div className="text-[10px] text-muted-foreground text-center">
            Powered by S-Prime Corp.
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default ERPSidebar;
