'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import api from './api';
import { User, ApiResponse, LoginResponse } from './types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from cookie on mount
  useEffect(() => {
    const savedToken = Cookies.get('lms_token');
    if (savedToken) {
      setToken(savedToken);
      api.get<ApiResponse<{ user: User }>>('/auth/me')
        .then((res) => {
          // The response might be res.data.data.user or res.data.data depending on API
          const userData = res.data.data;
          if ('user' in userData) {
            setUser(userData.user);
          } else {
            setUser(userData as unknown as User);
          }
        })
        .catch(() => {
          Cookies.remove('lms_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    const { token: newToken, user: newUser } = res.data.data;
    Cookies.set('lms_token', newToken, { expires: 7 });
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post<ApiResponse<User>>('/auth/register', { name, email, password });
    // After register, auto-login
    const loginRes = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, password });
    const { token: newToken, user: newUser } = loginRes.data.data;
    Cookies.set('lms_token', newToken, { expires: 7 });
    setToken(newToken);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    Cookies.remove('lms_token');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
