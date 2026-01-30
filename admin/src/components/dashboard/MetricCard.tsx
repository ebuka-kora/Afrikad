import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    trend: "up" | "down";
  };
  icon: ReactNode;
  variant?: "default" | "success" | "warning" | "danger";
}

export const MetricCard = ({ title, value, change, icon, variant = "default" }: MetricCardProps) => {
  const variantStyles = {
    default: "border-border",
    success: "border-success/30 glow-success",
    warning: "border-warning/30 glow-warning",
    danger: "border-primary/30 glow-primary",
  };

  const iconBgStyles = {
    default: "bg-secondary",
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-primary/10",
  };

  const iconColorStyles = {
    default: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-primary",
  };

  return (
    <div
      className={cn(
        "bg-card rounded-xl p-5 border transition-all duration-300 hover:scale-[1.02] animate-fade-in",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1.5">
              {change.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-success" />
              ) : (
                <TrendingDown className="w-4 h-4 text-primary" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  change.trend === "up" ? "text-success" : "text-primary"
                )}
              >
                {change.value}
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconBgStyles[variant])}>
          <div className={iconColorStyles[variant]}>{icon}</div>
        </div>
      </div>
    </div>
  );
};
