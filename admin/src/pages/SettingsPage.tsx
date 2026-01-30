import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Key, Users, Globe, Bell, Lock } from "lucide-react";

const roles = [
  { name: "Super Admin", access: "Everything", users: 2 },
  { name: "Ops", access: "Users, wallets, cards", users: 5 },
  { name: "Compliance", access: "KYC, AML", users: 3 },
  { name: "Finance", access: "FX, fees, reports", users: 4 },
  { name: "Support", access: "Users, disputes", users: 8 },
];

const SettingsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and security</p>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Users className="w-4 h-4" />
              Roles & Permissions
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Security Settings</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Mandatory 2FA for Admins</p>
                    <p className="text-sm text-muted-foreground">
                      Require two-factor authentication for all admin accounts
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">IP Allowlisting</p>
                    <p className="text-sm text-muted-foreground">
                      Restrict admin access to approved IP addresses
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Action Confirmation Modals</p>
                    <p className="text-sm text-muted-foreground">
                      Require confirmation for sensitive actions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Immutable Audit Logs</p>
                    <p className="text-sm text-muted-foreground">
                      Prevent modification of admin action logs
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-chart-4/10">
                  <Globe className="w-5 h-5 text-chart-4" />
                </div>
                <h3 className="text-lg font-semibold">IP Allowlist</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input placeholder="Enter IP address (e.g., 192.168.1.1)" className="flex-1" />
                  <Button className="bg-primary hover:bg-primary/90">Add IP</Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-mono text-sm">102.89.45.123</span>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Remove
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                    <span className="font-mono text-sm">197.210.78.90</span>
                    <Button variant="ghost" size="sm" className="text-primary">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-success/10">
                    <Key className="w-5 h-5 text-success" />
                  </div>
                  <h3 className="text-lg font-semibold">Roles & Permissions</h3>
                </div>
                <Button className="bg-primary hover:bg-primary/90">Add Role</Button>
              </div>

              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.name}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{role.name}</p>
                        <Badge variant="outline">{role.users} users</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.access}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-warning/10">
                  <Bell className="w-5 h-5 text-warning" />
                </div>
                <h3 className="text-lg font-semibold">Notification Preferences</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Suspicious Activity Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about flagged transactions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">System Health Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified about service degradation
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">KYC Queue Alerts</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when KYC queue exceeds threshold
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="font-medium">Daily Summary Email</p>
                    <p className="text-sm text-muted-foreground">
                      Receive daily platform summary
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
