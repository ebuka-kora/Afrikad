import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success && response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('adminToken');
  },
};

// Admin Dashboard API
export const dashboardApi = {
  getDashboard: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/dashboard?${params.toString()}`);
    return response.data;
  },
  getVolumeCharts: async (period: 'hour' | 'day' | 'week' | 'month' = 'day', startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/charts/volume?${params.toString()}`);
    return response.data;
  },
  getStatusCharts: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await api.get(`/admin/charts/status?${params.toString()}`);
    return response.data;
  },
};

// Users API
export const usersApi = {
  getUsers: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  },
  getUser: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.userId) queryParams.append('userId', params.userId);

    const response = await api.get(`/admin/transactions?${queryParams.toString()}`);
    return response.data;
  },
  getTransaction: async (transactionId: string) => {
    const response = await api.get(`/admin/transactions/${transactionId}`);
    return response.data;
  },
  exportCsv: async (params: { type?: string; status?: string; userId?: string; startDate?: string; endDate?: string; limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append('type', params.type);
    if (params.status) queryParams.append('status', params.status);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const response = await api.get(`/admin/transactions/export?${queryParams.toString()}`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

// Wallets API
export const walletsApi = {
  getWallets: async () => {
    const response = await api.get('/admin/wallets');
    return response.data;
  },
};

// Cards API
export const cardsApi = {
  getCards: async (page: number = 1, limit: number = 20) => {
    const response = await api.get(`/admin/cards?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Admin health
export const healthApi = {
  getHealth: async () => {
    const response = await api.get('/admin/health');
    return response.data;
  },
};

// Disputes API
export const disputesApi = {
  getDisputes: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);

    const response = await api.get(`/admin/disputes?${queryParams.toString()}`);
    return response.data;
  },
};

// KYC/Compliance API
export const kycApi = {
  getKyc: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    level?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.status) queryParams.append('status', params.status);
    if (params.level) queryParams.append('level', params.level);

    const response = await api.get(`/admin/kyc?${queryParams.toString()}`);
    return response.data;
  },
};

export default api;
