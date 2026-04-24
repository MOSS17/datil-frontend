import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import {
  getStoredUser,
  getToken,
  isTokenExpired,
  removeToken,
  setRefreshToken,
  setStoredUser,
  setToken,
} from './token';
import type { User } from '@/api/types/auth';

const DEV_BYPASS_AUTH = false;
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

    // Hydrate from localStorage. The user object is persisted at login time
    // (see `login` below) so we don't need a /auth/me round-trip on every
    // boot — the access token alone is enough to know the session is live.
    const storedToken = getToken();
    if (!storedToken || isTokenExpired(storedToken)) {
      removeToken();
      setIsLoading(false);
      return;
    }

    setTokenState(storedToken);
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(
    (newToken: string, newUser: User, newRefreshToken?: string) => {
      setToken(newToken);
      setStoredUser(newUser);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
      setTokenState(newToken);
      setUser(newUser);
    },
    [],
  );

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
