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
  Search,
  Filter,
  MoreVertical,
  Snowflake,
  Trash2,
  RefreshCw,
  DollarSign,
  ShieldAlert,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { cardsApi } from "@/lib/api";

const statuses = ["Active", "Frozen", "Terminated"];
const riskLevels = ["Low", "Medium", "High"];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-success/20 text-success border-0">Active</Badge>;
    case "Frozen":
      return <Badge className="bg-chart-4/20 text-chart-4 border-0">Frozen</Badge>;
    case "Terminated":
      return <Badge className="bg-primary/20 text-primary border-0">Terminated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getRiskIndicator = (risk: string) => {
  switch (risk) {
    case "Low":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-success text-sm">Low</span>
        </div>
      );
    case "Medium":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-warning text-sm">Medium</span>
        </div>
      );
    case "High":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary pulse-danger" />
          <span className="text-primary text-sm">High</span>
        </div>
      );
    default:
      return <span className="text-sm">{risk}</span>;
  }
};

const CardsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedRisks, setSelectedRisks] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data: cardsData, isLoading } = useQuery({
    queryKey: ["cards", page],
    queryFn: () => cardsApi.getCards(page, 20),
  });

  const cards = cardsData?.cards || [];
  const totalCards = cardsData?.pagination?.total || 0;

  const filteredCards = cards.filter((card: any) => {
    const cardId = card.cardId || '';
    const userName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || card.email || '';
    const last4 = cardId.slice(-4) || '';
    
    const matchesSearch =
      cardId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      last4.includes(searchQuery);

    // For now, all cards are "Active" since we don't have status in the model
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes("Active");

    // Risk level not available in current model, default to Low
    const matchesRisk = selectedRisks.length === 0 || selectedRisks.includes("Low");

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleRisk = (risk: string) => {
    setSelectedRisks((prev) =>
      prev.includes(risk) ? prev.filter((r) => r !== risk) : [...prev, risk]
    );
  };

  const clearFilters = () => {
    setSelectedStatuses([]);
    setSelectedRisks([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedStatuses.length > 0 || selectedRisks.length > 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Virtual Cards</h1>
            <p className="text-muted-foreground">Manage virtual card issuance and controls</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? "..." : totalCards.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-chart-4/10">
                <Snowflake className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Frozen Cards</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <ShieldAlert className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Trash2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Terminated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Card ID or User..."
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

          {/* Risk Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <ShieldAlert className="w-4 h-4" />
                Risk Level
                {selectedRisks.length > 0 && (
                  <Badge className="ml-1 bg-primary text-primary-foreground h-5 px-1.5">
                    {selectedRisks.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {riskLevels.map((risk) => (
                <DropdownMenuCheckboxItem
                  key={risk}
                  checked={selectedRisks.includes(risk)}
                  onCheckedChange={() => toggleRisk(risk)}
                >
                  {risk}
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

        {/* Cards Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Card</TableHead>
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Balance</TableHead>
                <TableHead className="text-muted-foreground">Last Used</TableHead>
                <TableHead className="text-muted-foreground">Risk</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : filteredCards.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No cards found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCards.map((card: any, index: number) => {
                  const cardId = card.cardId || '';
                  const last4 = cardId.slice(-4) || 'N/A';
                  const userName = `${card.firstName || ''} ${card.lastName || ''}`.trim() || card.email || 'N/A';
                  
                  return (
                    <TableRow
                      key={card.cardId || card.userId}
                      className={cn(
                        "border-border hover:bg-secondary/50 animate-fade-in"
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-7 rounded bg-gradient-to-r from-muted to-secondary flex items-center justify-center">
                            <span className="text-xs font-mono text-muted-foreground">
                              •••• {last4}
                            </span>
                          </div>
                          <span className="font-mono text-sm text-muted-foreground">{cardId || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{userName}</TableCell>
                      <TableCell>{getStatusBadge("Active")}</TableCell>
                      <TableCell className="font-medium">N/A</TableCell>
                      <TableCell className="text-muted-foreground">
                        {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{getRiskIndicator("Low")}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Snowflake className="w-4 h-4 mr-2" />
                            Freeze Card
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Card
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Set Spending Limit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Block Merchants
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-primary">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Terminate Card
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredCards.length} of {totalCards} cards
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
              disabled={!cardsData?.pagination || page >= cardsData.pagination.pages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CardsPage;
