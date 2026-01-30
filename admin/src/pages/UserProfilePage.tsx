import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  User,
  Wallet,
  CreditCard,
  History,
  FileText,
  Activity,
  Ban,
  Key,
  Snowflake,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  Download,
  Loader2,
} from "lucide-react";
import { usersApi, transactionsApi, cardsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Active":
      return <Badge className="bg-success/20 text-success border-0">Active</Badge>;
    case "Suspended":
      return <Badge className="bg-primary/20 text-primary border-0">Suspended</Badge>;
    case "Pending":
      return <Badge className="bg-warning/20 text-warning border-0">Pending</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getKycBadge = (hasKyc: boolean) => {
  if (hasKyc) {
    return <Badge className="bg-success/20 text-success border-0">Verified</Badge>;
  }
  return <Badge className="bg-primary/20 text-primary border-0">Not Available</Badge>;
};

const getTransactionIcon = (type: string) => {
  switch (type) {
    case "Card Spend":
      return <ArrowUpRight className="w-4 h-4 text-primary" />;
    case "Wallet Fund":
      return <ArrowDownLeft className="w-4 h-4 text-success" />;
    case "Conversion":
      return (
        <div className="w-4 h-4 rounded-full bg-warning/20 flex items-center justify-center">
          <span className="text-warning text-[10px] font-bold">FX</span>
        </div>
      );
    default:
      return null;
  }
};

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user data
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.getUser(userId!),
    enabled: !!userId,
    retry: 1,
  });

  // Fetch user transactions
  const { data: transactionsData, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ["user-transactions", userId],
    queryFn: () => transactionsApi.getTransactions({ userId: userId!, limit: 50 }),
    enabled: !!userId,
    retry: 1,
  });

  // Fetch user cards
  const { data: cardsData, isLoading: cardsLoading, error: cardsError } = useQuery({
    queryKey: ["user-cards", userId],
    queryFn: () => cardsApi.getCards(1, 100),
    enabled: !!userId,
    retry: 1,
  });

  const user = userData?.user;
  const transactions = transactionsData?.transactions || [];
  const allCards = cardsData?.cards || [];
  const userCards = allCards.filter((card: any) => card.userId === userId);

  if (userLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (userError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">Error loading user data</p>
          <p className="text-sm text-muted-foreground">
            {userError instanceof Error ? userError.message : 'Unknown error'}
          </p>
          <Button onClick={() => navigate("/users")} variant="outline">
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-muted-foreground">User not found</p>
          <Button onClick={() => navigate("/users")} variant="outline">
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email;
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A";
  const walletNgn = user.wallet?.ngn || 0;
  const walletUsd = user.wallet?.usd || 0;
  const hasKyc = !!(user.dateOfBirth || user.koraCardholderReference || user.countryIdentity || user.identity);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/users")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-xl">
                    {userName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold">{userName}</h1>
                    <Badge className="bg-success/20 text-success border-0">Active</Badge>
                  </div>
                  <p className="text-muted-foreground">{user._id || userId}</p>
                </div>
              </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Key className="w-4 h-4" />
              Reset PIN
            </Button>
            <Button variant="outline" className="gap-2">
              <Snowflake className="w-4 h-4" />
              Freeze Cards
            </Button>
            <Button variant="outline" className="gap-2 text-primary border-primary hover:bg-primary/10">
              <Ban className="w-4 h-4" />
              Suspend
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="overview" className="gap-2">
              <User className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="wallets" className="gap-2">
              <Wallet className="w-4 h-4" />
              Wallets
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-2">
              <CreditCard className="w-4 h-4" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="transactions" className="gap-2">
              <History className="w-4 h-4" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="kyc" className="gap-2">
              <FileText className="w-4 h-4" />
              KYC Documents
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="w-4 h-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{user.phone}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Joined</p>
                      <p className="font-medium">{joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KYC Status */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    KYC Status
                    {getKycBadge(hasKyc)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Level</p>
                      <p className="font-medium">
                        {hasKyc ? "Cardholder (Kora Virtual Card)" : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Account Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">NGN Wallet</span>
                    <span className="font-bold text-success">₦{walletNgn.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">USD Wallet</span>
                    <span className="font-bold">${walletUsd.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Active Cards</span>
                    <span className="font-medium">{userCards.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-medium">{transactions.length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                <CardDescription>Last 5 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Merchant</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.slice(0, 5).map((txn: any) => (
                        <TableRow key={txn._id} className="border-border hover:bg-secondary/50">
                          <TableCell className="font-mono text-sm">{txn._id?.toString().slice(-8)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(txn.type)}
                              <span>{txn.type || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {txn.currency === 'NGN' ? '₦' : '$'}{txn.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{txn.merchantName || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallets Tab */}
          <TabsContent value="wallets" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                      <span className="text-success font-bold text-sm">₦</span>
                    </div>
                    NGN Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">₦{walletNgn.toLocaleString()}</p>
                    <p className="text-muted-foreground">Available Balance</p>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Credit</Button>
                    <Button variant="outline" className="flex-1">Debit</Button>
                    <Button variant="outline" className="flex-1">Lock</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-chart-4/20 flex items-center justify-center">
                      <span className="text-chart-4 font-bold text-sm">$</span>
                    </div>
                    USD Wallet
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-3xl font-bold">${walletUsd.toLocaleString()}</p>
                    <p className="text-muted-foreground">Available Balance</p>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">Credit</Button>
                    <Button variant="outline" className="flex-1">Debit</Button>
                    <Button variant="outline" className="flex-1">Lock</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Wallet Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-xl font-bold">{transactions.length}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">Active Cards</p>
                    <p className="text-xl font-bold">{userCards.length}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">NGN Balance</p>
                    <p className="text-xl font-bold">₦{walletNgn.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-secondary rounded-lg">
                    <p className="text-sm text-muted-foreground">USD Balance</p>
                    <p className="text-xl font-bold">${walletUsd.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-6">
            {cardsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : userCards.length === 0 ? (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No cards found for this user</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userCards.map((card: any) => (
                  <Card key={card.cardId} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-12 h-8 rounded bg-gradient-to-r from-muted to-secondary flex items-center justify-center">
                            <span className="text-xs font-mono text-muted-foreground">
                              •••• {card.cardId?.slice(-4) || 'N/A'}
                            </span>
                          </div>
                          {card.cardId || 'N/A'}
                        </CardTitle>
                        <Badge className="bg-success/20 text-success border-0">Active</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">User</span>
                        <span className="font-medium">{card.firstName} {card.lastName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <Separator />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Snowflake className="w-4 h-4 mr-1" />
                          Freeze
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>All transactions for this user</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                      <TableHead className="text-muted-foreground">Type</TableHead>
                      <TableHead className="text-muted-foreground">Amount</TableHead>
                      <TableHead className="text-muted-foreground">Merchant</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((txn: any) => (
                        <TableRow key={txn._id} className="border-border hover:bg-secondary/50">
                          <TableCell className="font-mono text-sm">{txn._id?.toString().slice(-8)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(txn.type)}
                              <span>{txn.type || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {txn.currency === 'NGN' ? '₦' : '$'}{txn.amount?.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">{txn.merchantName || '-'}</TableCell>
                          <TableCell>
                            <Badge className={
                              txn.status === 'completed' ? 'bg-success/20 text-success border-0' :
                              txn.status === 'failed' ? 'bg-primary/20 text-primary border-0' :
                              'bg-warning/20 text-warning border-0'
                            }>
                              {txn.status || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Documents Tab */}
          <TabsContent value="kyc" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>KYC Documents</CardTitle>
                    <CardDescription>User verification documents</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Level:</span>
                    <Badge variant="outline">
                      {hasKyc ? "Cardholder" : "N/A"}
                    </Badge>
                    {getKycBadge(hasKyc)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hasKyc ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">Identity</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date of Birth</span>
                          <span className="font-medium">
                            {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BVN</span>
                          <span className="font-mono text-xs">
                            {user.countryIdentity?.number || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID Type</span>
                          <span className="font-medium">
                            {user.identity?.type
                              ? user.identity.type.toString().replace(/_/g, " ").toUpperCase()
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID Number</span>
                          <span className="font-mono text-xs">
                            {user.identity?.number || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ID Country</span>
                          <span className="font-medium">
                            {user.identity?.country || user.countryIdentity?.country || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-muted-foreground">Address & Card</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Street</span>
                          <span className="font-medium">
                            {user.address?.street || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">City</span>
                          <span className="font-medium">
                            {user.address?.city || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">State</span>
                          <span className="font-medium">
                            {user.address?.state || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Country</span>
                          <span className="font-medium">
                            {user.address?.country || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ZIP Code</span>
                          <span className="font-medium">
                            {user.address?.zipCode || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cardholder Ref</span>
                          <span className="font-mono text-xs truncate max-w-[200px]">
                            {user.koraCardholderReference || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Virtual Card ID</span>
                          <span className="font-mono text-xs truncate max-w-[200px]">
                            {user.koraVirtualCardId || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center py-8">
                      No KYC data has been submitted for this user yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No activity found</p>
                  ) : (
                    transactions.slice(0, 10).map((txn: any) => (
                      <div
                        key={txn._id}
                        className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg"
                      >
                        <div className="p-2 bg-background rounded-full">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{txn.type || 'Transaction'}</p>
                          <p className="text-sm text-muted-foreground">
                            {txn.merchantName || 'Transaction'} - {txn.currency === 'NGN' ? '₦' : '$'}{txn.amount?.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {txn.createdAt ? formatDistanceToNow(new Date(txn.createdAt), { addSuffix: true }) : 'N/A'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default UserProfilePage;
