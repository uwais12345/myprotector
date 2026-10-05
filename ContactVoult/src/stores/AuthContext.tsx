// ============================================================
// ConnectDesk — Auth Context
// ============================================================

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { AuthState, User } from '@/types';
import { getInitialAuthState, loginUser, logoutUser, registerUser } from '@/lib/auth';

interface AuthContextValue {
  auth: AuthState;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => getInitialAuthState());

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if ('error' in result) return { error: result.error };
    setAuth({ status: 'authenticated', user: result.user });
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerUser(name, email, password);
    if ('error' in result) return { error: result.error };
    setAuth({ status: 'authenticated', user: result.user });
    return {};
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setAuth({ status: 'unauthenticated', user: null });
  }, []);

  const setUser = useCallback((user: User) => {
    setAuth(prev => ({ ...prev, user }));
  }, []);

  return (
    <AuthContext.Provider value={{ auth, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
