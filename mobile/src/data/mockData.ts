// Mock data for development

export interface MockTransaction {
  id: string;
  merchant: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: 'success' | 'failed' | 'pending';
  date: string;
  type?: 'deposit' | 'payment' | 'withdrawal';
}

export interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export const mockTransactions: MockTransaction[] = [
  { id: "1", merchant: "Netflix", amount: 12.99, currency: "USD", status: "success", date: "2026-01-08", type: "payment" },
  { id: "2", merchant: "Spotify", amount: 5.99, currency: "USD", status: "success", date: "2026-01-07", type: "payment" },
  { id: "3", merchant: "Amazon", amount: 45.20, currency: "USD", status: "success", date: "2026-01-06", type: "payment" },
  { id: "4", merchant: "Apple Store", amount: 99.99, currency: "USD", status: "failed", date: "2026-01-05", type: "payment" },
  { id: "5", merchant: "Deposit", amount: 50000, currency: "NGN", status: "success", date: "2026-01-04", type: "deposit" },
];

export const mockUser: MockUser = {
  id: "1",
  firstName: "Tunde",
  lastName: "Adebayo",
  email: "tunde@example.com",
  phone: "+2348012345678",
};

export const mockWallet = {
  ngn: 245000,
  usd: 153.22,
  lockedNgn: 0,
};
