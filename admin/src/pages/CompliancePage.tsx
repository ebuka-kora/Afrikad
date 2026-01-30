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
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Shield,
  Loader2,
} from "lucide-react";
import { kycApi } from "@/lib/api";

const statuses = ["Pending", "In Review", "Approved", "Rejected"];
const levels = ["Tier 1", "Tier 2"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Approved":
      return <Badge className="bg-success/20 text-success border-0">Approved</Badge>;
    case "Pending":
      return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
    case "In Review":
      return <Badge className="bg-chart-4/20 text-chart-4 border-0">In Review</Badge>;
    case "Rejected":
      return <Badge className="bg-primary/20 text-primary border-0">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const CompliancePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: kycData, isLoading } = useQuery({
    queryKey: ["kyc", page, selectedStatuses, selectedLevels],
    queryFn: () => kycApi.getKyc({ page, limit: 20, status: selectedStatuses[0], level: selectedLevels[0] }),
  });

  const kycQueue = kycData?.kyc || [];
  const totalKyc = kycData?.pagination?.total || 0;

  const filteredKyc = kycQueue.filter((kyc: any) => {
    const userId = kyc.user || kyc.userId || '';
    const kycId = kyc.id || kyc._id || '';
    
    const matchesSearch =
      userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kycId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(kyc.status);

    const matchesLevel =
      selectedLevels.length === 0 || selectedLevels.includes(kyc.level);

    return matchesSearch && matchesStatus && matchesLevel;
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedLevels([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedLevels.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Compliance (KYC/AML)</h1>
          <p className="text-muted-foreground">Review and manage user verification</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <Eye className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">In Review</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">1,842</p>
                <p className="text-sm text-muted-foreground">Approved (30d)</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <XCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-muted-foreground">Rejected (30d)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or KYC ID..."
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

          {/* Level Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                Level
                {selectedLevels.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground h-5 px-1.5">
                    {selectedLevels.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {levels.map((level) => (
                <DropdownMenuCheckboxItem
                  key={level}
                  checked={selectedLevels.includes(level)}
                  onCheckedChange={() => toggleLevel(level)}
                >
                  {level}
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

        {/* KYC Queue */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Level</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Submitted</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredKyc.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No KYC applications found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredKyc.map((kyc: any, index: number) => (
                  <TableRow
                    key={kyc.id || kyc._id}
                    className="border-border hover:bg-secondary/50 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="font-mono text-sm">{kyc.id || kyc._id || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{kyc.user || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{kyc.level || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(kyc.status || 'Pending')}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {kyc.submitted || (kyc.createdAt ? new Date(kyc.createdAt).toLocaleDateString() : 'N/A')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-success">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 text-primary">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
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
            Showing {filteredKyc.length} of {totalKyc} applications
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
              disabled={!kycData?.pagination || page >= kycData.pagination.pages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>

        {/* AML Monitoring */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">AML Monitoring Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Velocity Alerts</p>
              <p className="text-xl font-bold text-warning">3</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Structuring Detected</p>
              <p className="text-xl font-bold text-primary">1</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">High-Risk Countries</p>
              <p className="text-xl font-bold text-warning">5</p>
            </div>
            <div className="p-4 bg-secondary rounded-lg">
              <p className="text-sm text-muted-foreground">Sanction Matches</p>
              <p className="text-xl font-bold text-success">0</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CompliancePage;
