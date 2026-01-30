import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, TrendingUp, DollarSign, CreditCard, AlertTriangle } from "lucide-react";

const reports = [
  {
    name: "Daily Funding Report",
    description: "NGN wallet funding summary",
    icon: DollarSign,
    lastGenerated: "Today, 00:00",
  },
  {
    name: "Monthly Revenue Report",
    description: "Complete revenue breakdown",
    icon: TrendingUp,
    lastGenerated: "Jan 1, 2024",
  },
  {
    name: "FX Profit Report",
    description: "Currency exchange margins",
    icon: DollarSign,
    lastGenerated: "Jan 1, 2024",
  },
  {
    name: "Card Usage Report",
    description: "Virtual card transactions",
    icon: CreditCard,
    lastGenerated: "Today, 00:00",
  },
  {
    name: "Failed Transactions Report",
    description: "Declined and failed transactions",
    icon: AlertTriangle,
    lastGenerated: "Today, 00:00",
  },
];

const ReportsPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Reports & Exports</h1>
            <p className="text-muted-foreground">Generate and download platform reports</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Custom Date Range
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report, index) => {
            const Icon = report.icon;
            return (
              <div
                key={report.name}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Last: {report.lastGenerated}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <FileText className="w-3 h-3" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Download className="w-3 h-3" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;
