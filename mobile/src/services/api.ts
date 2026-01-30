import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';
import { mockTransactions, mockUser, mockWallet } from '../data/mockData';

// Set to true to use mock data, false to use real API
const USE_MOCK_API = false;

// Session expiry handler (set by AuthContext)
let sessionExpiredHandler: (() => Promise<void>) | null = null;

export const setSessionExpiredHandler = (handler: (() => Promise<void>) | null) => {
  sessionExpiredHandler = handler;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
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
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // Notify AuthContext to clear user state
      if (sessionExpiredHandler) {
        await sessionExpiredHandler();
      }
    }
    return Promise.reject(error);
  }
);

// Real API service
export const realApi = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  }) => {
    const response = await api.put('/auth/profile', profileData);
    if (response.data.success && response.data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  forgotPassword: async (email: string) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyResetToken: async (token: string) => {
    const response = await api.post('/auth/verify-reset-token', { token });
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  forgotPasswordOtp: async (email: string) => {
    const response = await api.post('/auth/forgot-password/otp', { email });
    return response.data;
  },

  resetPasswordOtp: async (email: string, otp: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password/otp', { email, otp, newPassword });
    return response.data;
  },

  // Wallet
  getWalletBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  deposit: async (amount: number) => {
    const response = await api.post('/wallet/deposit', { amount });
    return response.data;
  },

  depositBankTransfer: async (amount: number) => {
    const response = await api.post('/wallet/deposit/bank-transfer', { amount });
    return response.data;
  },

  getBanks: async () => {
    const response = await api.get('/wallet/banks');
    return response.data;
  },

  withdraw: async (amount: number, accountNumber: string, bankCode: string, bankName?: string) => {
    const response = await api.post('/wallet/withdraw', { amount, accountNumber, bankCode, bankName });
    return response.data;
  },

  // Transactions
  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  // Payments
  getFxQuote: async (amountUsd: number) => {
    const response = await api.get('/payment/quote', {
      params: { amountUsd },
    });
    return response.data;
  },

  makePayment: async (amountUsd: number, merchantName?: string) => {
    const response = await api.post('/payment', {
      amountUsd,
      merchantName: merchantName || 'Unknown Merchant',
    });
    return response.data;
  },

  // Cards
  getCard: async () => {
    const response = await api.get('/cards/me');
    return response.data;
  },

  submitKyc: async (data: {
    dateOfBirth: string;
    address: { street: string; city: string; state: string; country: string; zipCode: string };
    countryIdentity: { type: string; number: string; country: string };
    identity: { type: string; number: string; image: string; country: string };
  }) => {
    const response = await api.post('/cards/kyc', data);
    return response.data;
  },

  suspendCard: async (cardId: string, reason?: string) => {
    const response = await api.post(`/cards/${cardId}/suspend`, reason ? { reason } : {});
    return response.data;
  },

  activateCard: async (cardId: string, reason?: string) => {
    const response = await api.post(`/cards/${cardId}/activate`, reason ? { reason } : {});
    return response.data;
  },

  // Support / Chat
  sendChatMessage: async (message: string) => {
    const response = await api.post('/support/chat', { message });
    return response.data;
  },

  getChatHistory: async () => {
    const response = await api.get('/support/chat');
    return response.data;
  },
};

// Mock API service (for development without backend)
export const mockApi = {
  // Auth
  login: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      const mockToken = 'mock-jwt-token';
      await AsyncStorage.setItem('userToken', mockToken);
      await AsyncStorage.setItem('userData', JSON.stringify(mockUser));
      return {
        success: true,
        token: mockToken,
        user: mockUser,
      };
    }
    throw new Error('Invalid credentials');
  },

  register: async (userData: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockToken = 'mock-jwt-token';
    await AsyncStorage.setItem('userToken', mockToken);
    await AsyncStorage.setItem('userData', JSON.stringify({ ...mockUser, ...userData }));
    return {
      success: true,
      token: mockToken,
      user: { ...mockUser, ...userData },
    };
  },

  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    username?: string;
  }) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const currentUserData = await AsyncStorage.getItem('userData');
    const currentUser = currentUserData ? JSON.parse(currentUserData) : mockUser;
    const updatedUser = { ...currentUser, ...profileData };
    await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    return {
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    };
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Mock: always succeeds
    return {
      success: true,
      message: 'Password changed successfully.',
    };
  },

  forgotPassword: async (_email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Check your email.', resetToken: 'mock-reset-token' };
  },

  verifyResetToken: async (_token: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true, valid: true };
  },

  resetPassword: async (_token: string, _newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Password reset successfully. You can now log in.' };
  },

  forgotPasswordOtp: async (_email: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'OTP sent.', otp: '123456' };
  },

  resetPasswordOtp: async (_email: string, _otp: string, _newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Password reset successfully.' };
  },

  // Wallet
  getWalletBalance: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      wallet: mockWallet,
    };
  },

  deposit: async (amount: number) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      wallet: {
        ...mockWallet,
        ngn: mockWallet.ngn + amount,
      },
    };
  },

  depositBankTransfer: async (amount: number) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      message: 'Bank transfer initiated. Fund your wallet by sending NGN to the account below.',
      bankAccount: {
        account_number: '7590031627',
        bank_name: 'wema',
        bank_code: '035',
        account_name: 'AfriKAD Deposit Account',
      },
      expectedAmount: amount,
      fee: 22.5,
      reference: `DEP-BANK-MOCK-${Date.now()}`,
    };
  },

  getBanks: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      banks: [
        { code: '044', name: 'Access Bank' },
        { code: '058', name: 'Guaranty Trust Bank' },
        { code: '033', name: 'United Bank For Africa' },
        { code: '057', name: 'Zenith Bank' },
        { code: '011', name: 'First Bank of Nigeria' },
      ],
    };
  },

  withdraw: async (amount: number, accountNumber: string, bankCode: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      wallet: {
        ...mockWallet,
        ngn: Math.max(0, mockWallet.ngn - amount),
      },
      message: 'Withdrawal initiated successfully',
    };
  },

  // Transactions
  getTransactions: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      transactions: mockTransactions,
    };
  },

  // Payments
  getFxQuote: async (amountUsd: number) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const rate = 1500;
    const baseAmountNgn = amountUsd * rate;
    const fee = Math.max(baseAmountNgn * 0.002, 300);
    const totalAmountNgn = baseAmountNgn + fee;
    
    return {
      success: true,
      quote: {
        amountUsd,
        rate,
        baseAmountNgn,
        fee,
        totalAmountNgn,
      },
    };
  },

  makePayment: async (amountUsd: number, merchantName?: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate FX conversion delay
    
    const rate = 1500;
    const amountNgn = amountUsd * rate + Math.max(amountUsd * rate * 0.002, 300);
    
    return {
      success: true,
      transaction: {
        id: Date.now().toString(),
        amountNgn,
        amountUsd,
        fxRate: rate,
        status: 'completed',
        merchantName: merchantName || 'Unknown Merchant',
      },
      wallet: {
        ngn: mockWallet.ngn - amountNgn,
        usd: mockWallet.usd,
      },
    };
  },

  // Cards (mock)
  getCard: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      card: {
        reference: 'mock-card-ref',
        firstSix: '453212',
        lastFour: '9010',
        pan: '4532123456789010',
        cvv: '123',
        expiryMonth: '12',
        expiryYear: '26',
        brand: 'visa',
        balance: 0,
        status: 'active',
        holderName: 'John Doe',
      },
    };
  },

  submitKyc: async (_data: any) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      message: 'KYC submitted and virtual card created.',
      card: { reference: 'mock-card-ref', status: 'pending' },
    };
  },

  suspendCard: async (cardId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Card suspended.', card: { reference: cardId, status: 'suspended' } };
  },

  activateCard: async (cardId: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Card activated.', card: { reference: cardId, status: 'active' } };
  },

  // Support / Chat (mock)
  sendChatMessage: async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      success: true,
      message: 'Message sent successfully',
      chatMessage: {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toISOString(),
        sender: 'user',
      },
    };
  },

  getChatHistory: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      messages: [],
    };
  },
};

// Export the active API based on configuration (typed as realApi so all callers see full API)
export const apiService: typeof realApi = USE_MOCK_API ? mockApi : realApi;

// For backwards compatibility
export default api;
