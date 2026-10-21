'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken, clearToken, getToken } from '../api';

const AuthContext = createContext(null);

export const ROLE_LABELS = {
  admin: 'Quản trị viên',
  sales: 'Kinh doanh & Bán hàng',
  production: 'Quản đốc Sản xuất CNC',
  warehouse: 'Thủ kho Phôi & Dao cụ',
  accountant: 'Kế toán Trưởng',
};

export const QUICK_ACCOUNTS = [
  { role: 'admin', email: 'admin@cnc.com', label: 'Quản trị viên (Toàn quyền)' },
  { role: 'sales', email: 'sales@cnc.com', label: 'Kinh doanh (Bán hàng & Báo giá)' },
  { role: 'production', email: 'prod@cnc.com', label: 'Sản xuất CNC (LSX & WIP)' },
  { role: 'warehouse', email: 'kho@cnc.com', label: 'Thủ kho (Phôi & Dao cụ)' },
  { role: 'accountant', email: 'ketoan@cnc.com', label: 'Kế toán (Tài chính & Công nợ)' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate persisted auth against real backend /auth/me on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const storedToken = getToken();
        if (!storedToken) {
          setUser(null);
          setTokenState(null);
          setIsLoading(false);
          return;
        }

        // Verify with real MySQL backend
        setToken(storedToken);
        const res = await api.get('/auth/me');
        if (res && res.data) {
          setUser(res.data);
          setTokenState(storedToken);
          localStorage.setItem('cnc_erp_user', JSON.stringify(res.data));
        } else {
          throw new Error('Invalid user session');
        }
      } catch (err) {
        // Token expired or invalid: reset completely
        clearToken();
        localStorage.removeItem('cnc_erp_user');
        setUser(null);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = async (loginIdentifier, password) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', {
        email: loginIdentifier,
        password,
      });

      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setTokenState(userToken);
      setToken(userToken);
      localStorage.setItem('cnc_erp_user', JSON.stringify(userData));
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { user: userData, token: userToken } = res.data;
      setUser(userData);
      setTokenState(userToken);
      setToken(userToken);
      localStorage.setItem('cnc_erp_user', JSON.stringify(userData));
      return userData;
    } finally {
      setIsLoading(false);
    }
  };

  const quickLogin = async (email) => {
    return await login(email, '123456');
  };

  const logout = () => {
    setUser(null);
    setTokenState(null);
    clearToken();
    localStorage.removeItem('cnc_erp_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickLogin,
        ROLE_LABELS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
