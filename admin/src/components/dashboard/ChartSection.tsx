import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { dashboardApi } from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  completed: "hsl(110, 100%, 55%)",
  failed: "hsl(0, 84%, 50%)",
  processing: "hsl(37, 91%, 55%)",
  pending: "hsl(0, 0%, 60%)",
};

const formatChartCurrency = (value: number, currency: "NGN" | "USD" = "NGN") => {
  if (value >= 1000000) return currency === "NGN" ? `₦${(value / 1000000).toFixed(1)}M` : `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return currency === "NGN" ? `₦${(value / 1000).toFixed(0)}K` : `$${(value / 1000).toFixed(0)}K`;
  return currency === "NGN" ? `₦${value.toLocaleString()}` : `$${value.toLocaleString()}`;
};

const CustomTooltip = ({
  active,
  payload,
  label,
  currency = "NGN",
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string }>;
  label?: string;
  currency?: "NGN" | "USD";
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? formatChartCurrency(entry.value, currency) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartSection = () => {
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), 7), "yyyy-MM-dd");

  const { data: volumeData, isLoading: volumeLoading } = useQuery({
    queryKey: ["charts", "volume", startDate, endDate],
    queryFn: () => dashboardApi.getVolumeCharts("day", startDate, endDate),
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ["charts", "status", startDate, endDate],
    queryFn: () => dashboardApi.getStatusCharts(startDate, endDate),
  });

  const ngnChartData = (volumeData?.ngnVolume || []).map((x: { _id: { year: number; month: number; day: number }; volume: number }) => ({
    name: format(new Date(x._id.year, x._id.month - 1, x._id.day), "MMM d"),
    value: x.volume,
  }));

  const usdChartData = (volumeData?.usdVolume || []).map((x: { _id: { year: number; month: number; day: number }; volume: number }) => ({
    name: format(new Date(x._id.year, x._id.month - 1, x._id.day), "MMM d"),
    value: x.volume,
  }));

  const pieData = (statusData?.statusBreakdown || []).map((x: { _id: string; count: number }) => ({
    name: x._id.charAt(0).toUpperCase() + x._id.slice(1),
    value: x.count,
    color: STATUS_COLORS[x._id] || "hsl(0, 0%, 60%)",
  })).filter((d: { value: number }) => d.value > 0);

  const hasVolume = ngnChartData.length > 0 || usdChartData.length > 0;
  const hasStatus = pieData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* NGN Volume */}
      <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">NGN Volume (7d)</h3>
        <div className="h-64">
          {volumeLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : !ngnChartData.length ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">No NGN volume data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ngnChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} tickFormatter={(v) => formatChartCurrency(v, "NGN")} />
                <Tooltip content={<CustomTooltip currency="NGN" />} />
                <Line type="monotone" dataKey="value" stroke="hsl(110, 100%, 55%)" strokeWidth={2} dot={{ fill: "hsl(110, 100%, 55%)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "hsl(110, 100%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* USD Volume */}
      <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
        <h3 className="text-lg font-semibold mb-4">USD Volume (7d)</h3>
        <div className="h-64">
          {volumeLoading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : !usdChartData.length ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">No USD volume data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usdChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 18%)" />
                <XAxis dataKey="name" stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} />
                <YAxis stroke="hsl(0, 0%, 60%)" fontSize={12} tickLine={false} tickFormatter={(v) => formatChartCurrency(v, "USD")} />
                <Tooltip content={<CustomTooltip currency="USD" />} />
                <Line type="monotone" dataKey="value" stroke="hsl(210, 100%, 55%)" strokeWidth={2} dot={{ fill: "hsl(210, 100%, 55%)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "hsl(210, 100%, 55%)" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transaction Distribution */}
      <div className="bg-card rounded-xl border border-border p-5 animate-fade-in lg:col-span-2">
        <h3 className="text-lg font-semibold mb-4">Transaction Distribution</h3>
        <div className="h-64 flex items-center justify-center">
          {statusLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : !hasStatus ? (
            <div className="text-muted-foreground">No transaction data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {pieData.map((entry: { color?: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => value.toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {hasStatus && (
          <div className="flex justify-center gap-6 mt-4 flex-wrap">
            {pieData.map((item: { name: string; value: number; color?: string }) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
