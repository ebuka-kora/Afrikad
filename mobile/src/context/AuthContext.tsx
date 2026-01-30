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
      const msg = error.response?.data?.message
        || (isNetworkError
          ? 'Cannot reach server. Ensure the backend is running and on the same network. On a physical device, set EXPO_PUBLIC_API_HOST to your computer’s IP.'
          : error.message)
        || 'Login failed';
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
      const msg = error.response?.data?.message
        || (isNetworkError
          ? 'Cannot reach server. Ensure the backend is running and on the same network. On a physical device, set EXPO_PUBLIC_API_HOST to your computer’s IP.'
          : error.message)
        || 'Registration failed';
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
