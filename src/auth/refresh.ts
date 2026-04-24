import {
  getRefreshToken,
  isTokenExpired,
  setRefreshToken,
  setToken,
} from './token';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

// Dedup in-flight refreshes. When the access token expires, multiple
// concurrent 401s would otherwise each try to consume the single-use
// refresh token — the backend's rotation flow rejects reuse, so all but
// the first would fail. One shared promise means every 401 waits on the
// same refresh round-trip and reads the same resulting access token.
let inflight: Promise<string | null> | null = null;

export function refreshAccessToken(): Promise<string | null> {
  if (inflight) return inflight;

  const refreshToken = getRefreshToken();
  if (!refreshToken || isTokenExpired(refreshToken)) {
    return Promise.resolve(null);
  }

  inflight = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) return null;
      const data = (await res.json()) as RefreshResponse;
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return data.access_token;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}
