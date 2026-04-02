import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, setSessionExpiredHandler } from '../services/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  username?: string;
  /** Data URL or HTTPS URL from server */
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  handleSessionExpired: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/** Strip developer-style messages; keep user-friendly copy */
function simplifyAuthError(raw: string | undefined): string {
  if (!raw || typeof raw !== 'string') return '';
  const t = raw.trim();
  if (/network|ERR_NETWORK|timeout/i.test(t)) {
    return "We can't reach AfriKAD right now. Check your internet and try again.";
  }
  if (/401|403|unauthoriz|invalid token/i.test(t)) {
    return 'Your session expired. Please sign in again.';
  }
  if (/500|502|503|server/i.test(t)) {
    return 'Something went wrong on our side. Please try again in a few minutes.';
  }
  return t;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
    // Register session expiry handler
    setSessionExpiredHandler(handleSessionExpired);
    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.success) {
        setUser(response.user);
      }
    } catch (error: any) {
      const isNetworkError =
        error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response;
      const serverMsg = error.response?.data?.message;
      const msg =
        serverMsg ||
        (isNetworkError
          ? "We can't reach AfriKAD right now. Check your internet, then try again. If it keeps happening, try again in a few minutes."
          : simplifyAuthError(error.message)) || "Sign in didn't work. Check your email and password and try again.";
      throw new Error(msg);
    }
  };

  const register = async (userData: any) => {
    try {
      const response = await apiService.register(userData);
      if (response.success) {
        setUser(response.user);
      }
    } catch (error: any) {
      const isNetworkError =
        error.message === 'Network Error' || error.code === 'ERR_NETWORK' || !error.response;
      const serverMsg = error.response?.data?.message;
      const msg =
        serverMsg ||
        (isNetworkError
          ? "We can't reach AfriKAD right now. Check your internet, then try again."
          : simplifyAuthError(error.message)) || "We couldn't create your account. Try again in a moment.";
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }
  };

  const handleSessionExpired = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error handling session expiry:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
        handleSessionExpired,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
