import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import ERPSidebar from "./ERPSidebar";
import { Bell, Search, User } from "lucide-react";

interface ERPLayoutProps {
  children: React.ReactNode;
}

const ERPLayout = ({ children }: ERPLayoutProps) => {
  return (
    <SidebarProvider>
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
            <div className="flex items-center gap-3">
              <div className="relative">
                <Bell className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
              </div>
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-3.5 h-3.5 text-primary" />
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
