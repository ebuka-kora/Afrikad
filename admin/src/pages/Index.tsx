import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { ChartSection } from "@/components/dashboard/ChartSection";
import {
  Users,
  Wallet,
  DollarSign,
  Loader2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { dashboardApi } from "@/lib/api";

const formatCurrency = (value: number, currency: "NGN" | "USD" = "NGN") => {
  if (currency === "NGN") {
    if (value >= 1000000) {
      return `₦${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `₦${(value / 1000).toFixed(0)}K`;
    }
    return `₦${value.toLocaleString()}`;
  } else {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  }
};

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.getDashboard(),
    refetchInterval: 60000, // Refetch every 60 seconds as fallback (SSE handles real-time updates)
  });

  const dashboard = dashboardData?.dashboard;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, Admin</p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Total Users"
            value={isLoading ? "..." : (dashboard?.users?.total || 0).toLocaleString()}
            icon={<Users className="w-5 h-5" />}
            variant="success"
          />
          <MetricCard
            title="Processing"
            value={isLoading ? "..." : (dashboard?.transactions?.processing || 0).toLocaleString()}
            icon={<Loader2 className="w-5 h-5" />}
          />
          <MetricCard
            title="Total NGN Balance"
            value={
              isLoading
                ? "..."
                : formatCurrency(dashboard?.balances?.ngn || 0, "NGN")
            }
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
          />
          <MetricCard
            title="Total USD Balance"
            value={
              isLoading
                ? "..."
                : formatCurrency(dashboard?.balances?.usd || 0, "USD")
            }
            icon={<DollarSign className="w-5 h-5" />}
          />
          <MetricCard
            title="Locked NGN"
            value={
              isLoading
                ? "..."
                : formatCurrency(dashboard?.balances?.lockedNgn || 0, "NGN")
            }
            icon={<Lock className="w-5 h-5" />}
          />
          <MetricCard
            title="Failed Txns"
            value={isLoading ? "..." : (dashboard?.transactions?.failed || 0).toLocaleString()}
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="danger"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <ChartSection />
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
