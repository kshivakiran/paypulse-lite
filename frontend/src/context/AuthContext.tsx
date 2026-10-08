import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';
import { UserInfo, WalletInfo } from '../types';

interface AuthContextType {
  user: UserInfo | null;
  wallet: WalletInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ message: string }>;
  register: (name: string, email: string, password: string) => Promise<{ message: string }>;
  logout: () => void;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('paypulse_token'));

  const logout = useCallback(() => {
    localStorage.removeItem('paypulse_token');
    localStorage.removeItem('paypulse_user');
    setToken(null);
    setUser(null);
    setWallet(null);
  }, []);

  const refreshWallet = useCallback(async () => {
    try {
      const res = await api.get<{ wallet: WalletInfo }>('/wallet');
      setWallet(res.data.wallet);
    } catch (err: any) {
      if (err.response?.status === 401) logout();
    }
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('paypulse_token', res.data.token);
    localStorage.setItem('paypulse_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.wallet) setWallet(res.data.wallet);
    return { message: res.data.message };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('paypulse_token', res.data.token);
    localStorage.setItem('paypulse_user', JSON.stringify(res.data.user));
    setToken(res.data.token);
    setUser(res.data.user);
    if (res.data.wallet) setWallet(res.data.wallet);
    return { message: res.data.message };
  }, []);

  // Restore user from localStorage on mount
  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('paypulse_user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          refreshWallet();
        } catch {
          logout();
        }
      }
    }
  }, [token, refreshWallet, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
