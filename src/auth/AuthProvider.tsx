import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getToken, setToken, removeToken, isTokenExpired } from './token';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/api/types/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken || isTokenExpired(storedToken)) {
      removeToken();
      setIsLoading(false);
      return;
    }

    setTokenState(storedToken);
    apiClient<User>(ENDPOINTS.AUTH.ME)
      .then((user) => {
        setUser(user);
      })
      .catch(() => {
        removeToken();
        setTokenState(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setTokenState(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext>
  );
}
