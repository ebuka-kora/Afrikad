import { AdminLayout } from "@/components/layout/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Server,
  CreditCard,
  DollarSign,
  Webhook,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const services = [
  {
    name: "Payment Gateway",
    description: "Paystack / Flutterwave",
    status: "operational",
    latency: "45ms",
    uptime: "99.99%",
    lastIncident: "32 days ago",
  },
  {
    name: "Card Issuer API",
    description: "Virtual card provider",
    status: "degraded",
    latency: "320ms",
    uptime: "99.85%",
    lastIncident: "2 hours ago",
  },
  {
    name: "FX Provider",
    description: "Currency exchange API",
    status: "operational",
    latency: "89ms",
    uptime: "99.97%",
    lastIncident: "14 days ago",
  },
  {
    name: "Webhook Service",
    description: "Event notifications",
    status: "operational",
    latency: "12ms",
    uptime: "100%",
    lastIncident: "Never",
  },
  {
    name: "Database",
    description: "PostgreSQL cluster",
    status: "operational",
    latency: "8ms",
    uptime: "99.99%",
    lastIncident: "45 days ago",
  },
  {
    name: "Authentication",
    description: "User auth & sessions",
    status: "operational",
    latency: "23ms",
    uptime: "100%",
    lastIncident: "Never",
  },
];

const recentLogs = [
  {
    id: 1,
    type: "admin",
    message: "User #4521 suspended by Admin",
    timestamp: "14:32:21",
    severity: "warning",
  },
  {
    id: 2,
    type: "system",
    message: "Card Issuer API latency spike detected",
    timestamp: "14:28:45",
    severity: "error",
  },
  {
    id: 3,
    type: "user",
    message: "Batch KYC verification completed (12 users)",
    timestamp: "14:15:33",
    severity: "info",
  },
  {
    id: 4,
    type: "system",
    message: "Database backup completed successfully",
    timestamp: "14:00:00",
    severity: "info",
  },
  {
    id: 5,
    type: "admin",
    message: "FX rate updated: ₦1605/$1",
    timestamp: "13:45:12",
    severity: "info",
  },
  {
    id: 6,
    type: "system",
    message: "Webhook delivery failed to external endpoint",
    timestamp: "13:30:45",
    severity: "error",
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "operational":
      return <CheckCircle className="w-5 h-5 text-success" />;
    case "degraded":
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "down":
      return <XCircle className="w-5 h-5 text-primary" />;
    default:
      return null;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "operational":
      return <Badge className="bg-success/20 text-success border-0">Operational</Badge>;
    case "degraded":
      return <Badge className="bg-warning/20 text-warning border-0">Degraded</Badge>;
    case "down":
      return <Badge className="bg-primary/20 text-primary border-0">Down</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getServiceIcon = (name: string) => {
  if (name.includes("Payment")) return <DollarSign className="w-5 h-5" />;
  if (name.includes("Card")) return <CreditCard className="w-5 h-5" />;
  if (name.includes("FX")) return <Activity className="w-5 h-5" />;
  if (name.includes("Webhook")) return <Webhook className="w-5 h-5" />;
  return <Server className="w-5 h-5" />;
};

const getSeverityStyles = (severity: string) => {
  switch (severity) {
    case "error":
      return "text-primary";
    case "warning":
      return "text-warning";
    default:
      return "text-muted-foreground";
  }
};

const SystemHealthPage = () => {
  const operationalCount = services.filter((s) => s.status === "operational").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Monitor service status and logs</p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                operationalCount === services.length
                  ? "bg-success/10"
                  : "bg-warning/10"
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full",
                  operationalCount === services.length
                    ? "bg-success pulse-success"
                    : "bg-warning pulse-danger"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  operationalCount === services.length
                    ? "text-success"
                    : "text-warning"
                )}
              >
                {operationalCount}/{services.length} Systems Operational
              </span>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, index) => (
            <div
              key={service.name}
              className={cn(
                "bg-card rounded-xl border p-5 transition-all duration-300 hover:scale-[1.02] animate-fade-in",
                service.status === "operational"
                  ? "border-border"
                  : service.status === "degraded"
                  ? "border-warning/50 glow-warning"
                  : "border-primary/50 glow-primary"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      service.status === "operational"
                        ? "bg-success/10 text-success"
                        : service.status === "degraded"
                        ? "bg-warning/10 text-warning"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {getServiceIcon(service.name)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-xs text-muted-foreground">{service.description}</p>
                  </div>
                </div>
                {getStatusIcon(service.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  {getStatusBadge(service.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Latency</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      parseInt(service.latency) > 200 ? "text-warning" : "text-success"
                    )}
                  >
                    {service.latency}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime (30d)</span>
                  <span className="text-sm font-medium text-success">{service.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Incident</span>
                  <span className="text-sm text-muted-foreground">{service.lastIncident}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Logs Section */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">Recent Logs</h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-success" />
                Info
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-warning" />
                Warning
              </Badge>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Error
              </Badge>
            </div>
          </div>

          <div className="space-y-2 font-mono text-sm">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.timestamp}
                </span>
                <span
                  className={cn(
                    "uppercase text-xs font-semibold px-2 py-0.5 rounded",
                    log.type === "admin"
                      ? "bg-chart-4/20 text-chart-4"
                      : log.type === "system"
                      ? "bg-chart-5/20 text-chart-5"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {log.type}
                </span>
                <span className={getSeverityStyles(log.severity)}>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SystemHealthPage;
