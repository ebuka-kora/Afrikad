import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Wallet, DollarSign, TrendingUp, ArrowRightLeft } from "lucide-react";

const WalletsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Wallets & Balances</h1>
            <p className="text-muted-foreground">Platform-wide wallet overview and reconciliation</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">Reconcile</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total NGN Balance"
            value="₦2.4B"
            change={{ value: "+18.2%", trend: "up" }}
            icon={<Wallet className="w-5 h-5" />}
            variant="success"
          />
          <MetricCard
            title="Total USD Liability"
            value="$1.52M"
            change={{ value: "+12.8%", trend: "up" }}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <MetricCard
            title="Platform Float"
            value="₦842M"
            change={{ value: "+5.4%", trend: "up" }}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <MetricCard
            title="FX Spread Revenue"
            value="₦24.5M"
            change={{ value: "+22.1%", trend: "up" }}
            icon={<ArrowRightLeft className="w-5 h-5" />}
            variant="success"
          />
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Reconciliation Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">NGN Inflow (Today)</p>
              <p className="text-2xl font-bold text-success">₦124,500,000</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">USD Outflow (Today)</p>
              <p className="text-2xl font-bold text-primary">$78,250</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fee Revenue (Today)</p>
              <p className="text-2xl font-bold">₦1,245,000</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WalletsPage;
