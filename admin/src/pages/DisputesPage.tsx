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
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, MessageSquare, FileText, RotateCcw, Loader2 } from "lucide-react";
import { disputesApi } from "@/lib/api";

const statuses = ["Open", "Under Review", "Resolved", "Rejected"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Open":
      return <Badge className="bg-warning/20 text-warning border-0">Open</Badge>;
    case "Under Review":
      return <Badge className="bg-chart-4/20 text-chart-4 border-0">Under Review</Badge>;
    case "Resolved":
      return <Badge className="bg-success/20 text-success border-0">Resolved</Badge>;
    case "Rejected":
      return <Badge className="bg-primary/20 text-primary border-0">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const DisputesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: disputesData, isLoading } = useQuery({
    queryKey: ["disputes", page, selectedStatuses],
    queryFn: () => disputesApi.getDisputes({ page, limit: 20, status: selectedStatuses[0] }),
  });

  const disputes = disputesData?.disputes || [];
  const totalDisputes = disputesData?.pagination?.total || 0;

  const filteredDisputes = disputes.filter((dispute: any) => {
    const disputeId = dispute.id || dispute._id || '';
    const user = dispute.user || '';
    const merchant = dispute.merchant || '';
    
    const matchesSearch =
      disputeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      merchant.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(dispute.status);

    return matchesSearch && matchesStatus;
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStatuses.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Disputes & Chargebacks</h1>
          <p className="text-muted-foreground">Manage customer disputes and chargeback claims</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Dispute ID, User, or Merchant..."
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
                  {status}
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

        {/* Disputes Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Dispute ID</TableHead>
                <TableHead className="text-muted-foreground">Card</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Merchant</TableHead>
                <TableHead className="text-muted-foreground">Amount</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredDisputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No disputes found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDisputes.map((dispute: any, index: number) => (
                  <TableRow
                    key={dispute.id || dispute._id}
                    className="border-border hover:bg-secondary/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{dispute.id || dispute._id || 'N/A'}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{dispute.card || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{dispute.user || 'N/A'}</TableCell>
                    <TableCell>{dispute.merchant || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{dispute.amount || 'N/A'}</TableCell>
                    <TableCell>{getStatusBadge(dispute.status || 'Open')}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {dispute.date || (dispute.createdAt ? new Date(dispute.createdAt).toLocaleDateString() : 'N/A')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Notes
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8">
                          <FileText className="w-4 h-4 mr-1" />
                          Evidence
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-success">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Refund
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredDisputes.length} of {totalDisputes} disputes
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!disputesData?.pagination || page >= disputesData.pagination.pages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DisputesPage;
