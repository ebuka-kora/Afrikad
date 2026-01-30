import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Calculator, DollarSign } from "lucide-react";

const FxFeesPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">FX & Fees Management</h1>
          <p className="text-muted-foreground">Configure exchange rates and fee structures</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FX Rate Control */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-warning/10">
                <TrendingUp className="w-5 h-5 text-warning" />
              </div>
              <h3 className="text-lg font-semibold">FX Rate Control</h3>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Live Market Rate</p>
                  <p className="text-2xl font-bold">₦1,590 / $1</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm">2 min ago</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label>AfriKAD Rate (Editable)</Label>
                <div className="flex gap-3">
                  <Input type="number" defaultValue="1605" className="flex-1" />
                  <Button className="bg-primary hover:bg-primary/90">Update</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current spread: <span className="text-warning font-semibold">0.94%</span> (₦15 per $1)
                </p>
              </div>
            </div>
          </div>

          {/* Fee Configuration */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <DollarSign className="w-5 h-5 text-chart-4" />
              </div>
              <h3 className="text-lg font-semibold">Fee Configuration</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Funding Fee</Label>
                  <span className="text-sm font-medium">1.5%</span>
                </div>
                <Slider defaultValue={[1.5]} max={5} step={0.1} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Conversion Fee</Label>
                  <span className="text-sm font-medium">0.5%</span>
                </div>
                <Slider defaultValue={[0.5]} max={3} step={0.1} />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label>Card Usage Fee</Label>
                  <span className="text-sm font-medium">$0.50</span>
                </div>
                <Slider defaultValue={[0.5]} max={2} step={0.1} />
              </div>

              <Button className="w-full bg-primary hover:bg-primary/90">Save Fee Changes</Button>
            </div>
          </div>
        </div>

        {/* Impact Simulator */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-success/10">
              <Calculator className="w-5 h-5 text-success" />
            </div>
            <h3 className="text-lg font-semibold">Impact Simulator</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Projected Monthly Revenue</p>
              <p className="text-3xl font-bold text-success">₦45.2M</p>
              <p className="text-xs text-muted-foreground mt-1">Based on current fee structure</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">FX Spread Revenue</p>
              <p className="text-3xl font-bold text-warning">₦28.5M</p>
              <p className="text-xs text-muted-foreground mt-1">At 0.94% spread</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Platform Revenue</p>
              <p className="text-3xl font-bold">₦73.7M</p>
              <p className="text-xs text-muted-foreground mt-1">Combined monthly estimate</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FxFeesPage;
