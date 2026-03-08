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

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "전체 대시보드",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    id: "production",
    label: "생산 및 제조",
    icon: Factory,
    path: "/production",
    children: [
      { id: "prod-exec", label: "제품 생산 및 실행", icon: PackageOpen, path: "/production/execution" },
      { id: "prod-ship", label: "출고 및 재고조정", icon: ClipboardList, path: "/production/shipping" },
    ],
  },
  {
    id: "documents",
    label: "전표 및 서류",
    icon: FileText,
    path: "/documents",
    children: [
      { id: "doc-finance", label: "재무제표 조회", icon: FileBarChart, path: "/documents/finance" },
      { id: "doc-bom", label: "BOM 생산전표", icon: Receipt, path: "/documents/bom" },
      { id: "doc-invoice", label: "청구서 / 발주서", icon: FileText, path: "/documents/invoice" },
    ],
  },
  {
    id: "master",
    label: "마스터 관리",
    icon: Database,
    path: "/master",
    children: [
      { id: "master-emp", label: "직원 마스터", icon: Users, path: "/master/employee" },
      { id: "master-item", label: "품목 마스터", icon: Box, path: "/master/item" },
      { id: "master-wh", label: "창고거점 마스터", icon: Warehouse, path: "/master/warehouse" },
    ],
  },
];

const ERPSidebar = () => {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState<string[]>(["dashboard"]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const isActive = (path: string) => location.pathname === path;

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
      className="border-r border-border transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center cursor-pointer">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          {!collapsed && (
            <div className="animate-slide-up">
              <div className="text-sm font-semibold text-foreground tracking-tight">S-Prime ERP</div>
              <div className="text-[10px] text-muted-foreground">반도체 정밀 기기 관리</div>
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
              {menuItems.map((item) => (
                <div key={item.id}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => {
                        if (item.children) {
                          toggleGroup(item.id);
                        }
                        navigate(item.path);
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
                  {!collapsed && item.children && openGroups.includes(item.id) && (
                    <div className="ml-4 pl-4 border-l border-border/50 mt-1 mb-2 space-y-0.5">
                      {item.children.map((sub) => (
                        <SidebarMenuItem key={sub.id}>
                          <SidebarMenuButton
                            onClick={() => navigate(sub.path)}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs transition-all duration-200 ${
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
