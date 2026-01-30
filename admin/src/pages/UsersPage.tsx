import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  Eye,
  Ban,
  CreditCard,
  Key,
  Wallet,
} from "lucide-react";
import { usersApi } from "@/lib/api";

const getKycBadge = (status: string) => {
  switch (status) {
    case "Verified":
      return <Badge className="bg-success/20 text-success border-0">Verified</Badge>;
    case "Pending":
      return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
    case "Rejected":
      return <Badge className="bg-primary/20 text-primary border-0">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-success">Active</span>
        </div>
      );
    case "Suspended":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-primary">Suspended</span>
        </div>
      );
    case "Pending":
      return (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-warning">Pending</span>
        </div>
      );
    default:
      return <span>{status}</span>;
  }
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedKycStatuses, setSelectedKycStatuses] = useState<string[]>([]);
  const [selectedUserStatuses, setSelectedUserStatuses] = useState<string[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ["users", page],
    queryFn: () => usersApi.getUsers(page, 20),
  });

  const users = data?.users || [];
  const pagination = data?.pagination;

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      (user.firstName + " " + user.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user._id.toLowerCase().includes(searchQuery.toLowerCase());

    // Note: KYC and status filtering would need to be added to the backend API
    return matchesSearch;
  });

  const toggleKycStatus = (status: string) => {
    setSelectedKycStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleUserStatus = (status: string) => {
    setSelectedUserStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedKycStatuses([]);
    setSelectedUserStatuses([]);
    setSearchQuery("");
  };

  const hasActiveFilters = selectedKycStatuses.length > 0 || selectedUserStatuses.length > 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(0)}K`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">Manage and monitor user accounts</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            Export Users
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">User</TableHead>
                <TableHead className="text-muted-foreground">Email</TableHead>
                <TableHead className="text-muted-foreground">Wallet Balance</TableHead>
                <TableHead className="text-muted-foreground">Join Date</TableHead>
                <TableHead className="text-muted-foreground w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user: any, index: number) => (
                  <TableRow
                    key={user._id}
                    className="border-border hover:bg-secondary/50 animate-fade-in cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => navigate(`/users/${user._id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {user.firstName?.[0] || ""}{user.lastName?.[0] || ""}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(user.wallet?.ngn || 0)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/users/${user._id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
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
              Showing {filteredUsers.length} of {pagination.total} users
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
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
