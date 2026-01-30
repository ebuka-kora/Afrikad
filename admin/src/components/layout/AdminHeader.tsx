import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ChevronDown, LogOut, User, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export const AdminHeader = () => {
  const [notifications] = useState(3);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      {/* Search */}
      <div className="relative w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search User / Card / Transaction ID..."
          className="pl-10 bg-secondary border-border focus:ring-primary"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs"
                >
                  {notifications}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-3 py-2 border-b border-border">
              <h4 className="font-semibold">Notifications</h4>
            </div>
            <div className="py-2">
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-warning pulse-danger" />
                  <span className="font-medium">Suspicious Transaction</span>
                </div>
                <span className="text-xs text-muted-foreground">User #4521 flagged for review</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="font-medium">KYC Approved</span>
                </div>
                <span className="text-xs text-muted-foreground">12 users verified today</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium">System Alert</span>
                </div>
                <span className="text-xs text-muted-foreground">Card issuer API latency detected</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">AD</span>
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.role || "Admin"}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-primary" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
