import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getToken, setToken, removeToken, isTokenExpired } from './token';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { User } from '@/api/types/auth';

// TODO(auth): dev-only bypass so the dashboard is reachable without a backend.
// Remove before shipping — or gate on `import.meta.env.VITE_AUTH_BYPASS === 'true'`.
const DEV_BYPASS_AUTH = import.meta.env.DEV;
const DEV_USER: User = {
  id: 'dev-user',
  email: 'jane@ardenstudio',
  name: 'Lupita Urias',
  business_id: 'dev-business',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_BYPASS_AUTH ? DEV_USER : null);
  const [token, setTokenState] = useState<string | null>(
    DEV_BYPASS_AUTH ? 'dev-token' : null,
  );
  const [isLoading, setIsLoading] = useState(!DEV_BYPASS_AUTH);

  useEffect(() => {
    if (DEV_BYPASS_AUTH) return;

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
    if (DEV_BYPASS_AUTH) return;
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
