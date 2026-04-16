import { TOKEN_KEY } from '@/lib/constants';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const decoded = JSON.parse(atob(payload));
    if (typeof decoded.exp !== 'number') return true;

    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
