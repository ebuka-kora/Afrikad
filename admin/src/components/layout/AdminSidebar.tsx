import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Main nav: only items with backend support or core workflows. Routes for
// Wallets, Cards, FX & Fees, Compliance, Disputes, Reports, System Health,
// and Settings remain in App.tsx — add them back here when those features are wired.
const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "Users", icon: Users },
  { path: "/transactions", label: "Transactions", icon: ArrowLeftRight },
];

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <span className="text-foreground font-semibold text-lg">AfriKAD</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-sm">A</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "p-1.5 rounded-md hover:bg-sidebar-accent transition-colors",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="w-4 h-4 text-sidebar-foreground" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path + "/"));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
              )}
              
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              
              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}

              {/* Active status dot */}
              {isActive && !collapsed && (
                <div className="ml-auto w-2 h-2 rounded-full bg-success pulse-success" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-sidebar-accent hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-sidebar-foreground" />
        </button>
      )}
    </aside>
  );
};
