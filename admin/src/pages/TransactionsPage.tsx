import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  RotateCcw,
  Flag,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { transactionsApi } from "@/lib/api";

const statuses = ["completed", "pending", "failed", "processing"];
const types = ["payment", "deposit", "conversion", "withdrawal"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return <Badge className="bg-success/20 text-success border-0">Completed</Badge>;
    case "pending":
      return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
    case "failed":
      return <Badge className="bg-primary/20 text-primary border-0">Failed</Badge>;
    case "processing":
      return <Badge className="bg-warning/20 text-warning border-0">Processing</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "payment":
      return <ArrowUpRight className="w-4 h-4 text-primary" />;
    case "deposit":
      return <ArrowDownLeft className="w-4 h-4 text-success" />;
    case "withdrawal":
      return <ArrowUpRight className="w-4 h-4 text-primary rotate-180" />;
    case "conversion":
      return (
        <div className="w-4 h-4 rounded-full bg-warning/20 flex items-center justify-center">
          <span className="text-warning text-[10px] font-bold">FX</span>
        </div>
      );
    default:
      return null;
  }
};

const TransactionsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", page, selectedStatuses, selectedTypes],
    queryFn: () =>
      transactionsApi.getTransactions({
        page,
        limit: 50,
        status: selectedStatuses[0] || undefined,
        type: selectedTypes[0] || undefined,
      }),
    refetchInterval: 60000, // Poll every 60s as fallback (SSE handles real-time updates)
  });

  const transactions = data?.transactions || [];
  const pagination = data?.pagination;

  const filteredTransactions = transactions.filter((txn: any) => {
    const matchesSearch =
      txn._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (txn.userId?.firstName + " " + txn.userId?.lastName)
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (txn.merchantName || "").toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [status]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [type]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setDateRange(undefined);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedTypes.length > 0 || dateRange;

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "NGN") {
      return `₦${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">Monitor all platform transactions</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">Export Transactions</Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Transaction ID, User, or Merchant..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Status
                {selectedStatuses.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground h-5 px-1.5">
                    {selectedStatuses.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {statuses.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Type Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Type
                {selectedTypes.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground h-5 px-1.5">
                    {selectedTypes.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {types.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() => toggleType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
              Clear filters
            </Button>
          )}
        </div>

        {/* Transactions Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Merchant</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((txn: any, index: number) => (
                  <TableRow
                    key={txn._id}
                    className="border-border hover:bg-secondary/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{txn._id.slice(-8)}</TableCell>
                    <TableCell className="font-medium">
                      {txn.userId?.firstName} {txn.userId?.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(txn.type)}
                        <span>{txn.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(txn.amount || 0, txn.currency || "NGN")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {txn.merchantName || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(txn.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(txn.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(txn);
                              setShowDetailsModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {pagination.total} transactions
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
                {page}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Transaction Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Complete information about this transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-sm">{selectedTransaction._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getTypeIcon(selectedTransaction.type)}
                      <span className="capitalize">{selectedTransaction.type}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="font-semibold">
                      {formatCurrency(selectedTransaction.amount || 0, selectedTransaction.currency || "NGN")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">User</p>
                    <p className="text-sm">
                      {selectedTransaction.userId?.firstName} {selectedTransaction.userId?.lastName}
                    </p>
                  </div>
                </div>

                {/* KoraPay References */}
                {(selectedTransaction.paymentReference || selectedTransaction.metadata?.koraTransactionId || selectedTransaction.metadata?.koraSwapId) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">KoraPay References</h3>
                    <div className="space-y-2">
                      {selectedTransaction.paymentReference && (
                        <div>
                          <p className="text-sm text-muted-foreground">Payment Reference</p>
                          <p className="font-mono text-sm">{selectedTransaction.paymentReference}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata?.koraTransactionId && (
                        <div>
                          <p className="text-sm text-muted-foreground">Kora Transaction ID</p>
                          <p className="font-mono text-sm">{selectedTransaction.metadata.koraTransactionId}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata?.koraSwapId && (
                        <div>
                          <p className="text-sm text-muted-foreground">Kora Swap ID</p>
                          <p className="font-mono text-sm">{selectedTransaction.metadata.koraSwapId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Account Details for Deposits */}
                {selectedTransaction.type === "deposit" && selectedTransaction.metadata?.bank_account && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Bank Account Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTransaction.metadata.bank_account.account_number && (
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-mono text-sm">{selectedTransaction.metadata.bank_account.account_number}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata.bank_account.account_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="text-sm">{selectedTransaction.metadata.bank_account.account_name}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata.bank_account.bank_name && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="text-sm">{selectedTransaction.metadata.bank_account.bank_name}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata.bank_account.bank_code && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Code</p>
                          <p className="text-sm">{selectedTransaction.metadata.bank_account.bank_code}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Bank Account Details for Withdrawals */}
                {selectedTransaction.type === "withdrawal" && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Withdrawal Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTransaction.metadata?.accountNumber && (
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="font-mono text-sm">{selectedTransaction.metadata.accountNumber}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata?.bankName && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Name</p>
                          <p className="text-sm">{selectedTransaction.metadata.bankName}</p>
                        </div>
                      )}
                      {selectedTransaction.metadata?.bankCode && (
                        <div>
                          <p className="text-sm text-muted-foreground">Bank Code</p>
                          <p className="text-sm">{selectedTransaction.metadata.bankCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedTransaction.description && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{selectedTransaction.description}</p>
                  </div>
                )}

                {/* Merchant Name for Payments */}
                {selectedTransaction.merchantName && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground">Merchant</p>
                    <p className="text-sm">{selectedTransaction.merchantName}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default TransactionsPage;
