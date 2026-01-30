import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Wallet, CreditCard, DollarSign, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { transactionsApi } from "@/lib/api";

type TxnType = "deposit" | "withdrawal" | "payment" | "fx_conversion" | "card_payment";

const getIcon = (type: TxnType) => {
  switch (type) {
    case "deposit":
    case "withdrawal":
      return <Wallet className="w-4 h-4" />;
    case "payment":
    case "card_payment":
      return <CreditCard className="w-4 h-4" />;
    case "fx_conversion":
      return <ArrowLeftRight className="w-4 h-4" />;
    default:
      return <DollarSign className="w-4 h-4" />;
  }
};

const getStyles = (type: TxnType) => {
  switch (type) {
    case "deposit":
      return { bg: "bg-success/10", text: "text-success" };
    case "withdrawal":
      return { bg: "bg-warning/10", text: "text-warning" };
    case "payment":
    case "card_payment":
      return { bg: "bg-chart-4/10", text: "text-chart-4" };
    case "fx_conversion":
      return { bg: "bg-warning/10", text: "text-warning" };
    default:
      return { bg: "bg-secondary", text: "text-muted-foreground" };
  }
};

const formatAmount = (amount: number, currency: string) =>
  currency === "NGN" ? `₦${amount.toLocaleString()}` : `$${amount.toLocaleString()}`;

const formatMessage = (txn: {
  type: string;
  amount: number;
  currency?: string;
  amountConverted?: number;
  convertedCurrency?: string;
  merchantName?: string;
}) => {
  switch (txn.type) {
    case "deposit":
      return `Deposit ${formatAmount(txn.amount, txn.currency || "NGN")}`;
    case "withdrawal":
      return `Withdrawal ${formatAmount(txn.amount, txn.currency || "NGN")}`;
    case "payment":
    case "card_payment": {
      const amt = formatAmount(txn.amount, txn.currency || "USD");
      return txn.merchantName ? `${amt} at ${txn.merchantName}` : `Payment ${amt}`;
    }
    case "fx_conversion":
      return `FX conversion ${formatAmount(txn.amount, txn.currency || "NGN")} → ${txn.amountConverted != null && txn.convertedCurrency ? formatAmount(txn.amountConverted, txn.convertedCurrency) : "—"}`;
    default:
      return `${txn.type} ${formatAmount(txn.amount, txn.currency || "NGN")}`;
  }
};

export const ActivityFeed = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["activity", "recent"],
    queryFn: () => transactionsApi.getTransactions({ limit: 10 }),
  });

  const transactions = data?.transactions || [];

  return (
    <div className="bg-card rounded-xl border border-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Link to="/transactions" className="text-sm text-primary hover:underline">
          View all
        </Link>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : transactions.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent transactions</div>
        ) : (
          transactions.map((txn: any, index: number) => {
            const type = (txn.type || "deposit") as TxnType;
            const styles = getStyles(type);
            const user = txn.userId
              ? [txn.userId.firstName, txn.userId.lastName].filter(Boolean).join(" ") || "—"
              : "—";

            return (
              <div
                key={txn._id}
                className="flex items-start gap-3 animate-slide-in-left"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={cn("p-2 rounded-lg flex-shrink-0", styles.bg)}>
                  <div className={styles.text}>{getIcon(type)}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{formatMessage(txn)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{user}</span>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
