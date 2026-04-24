import { getToken, removeToken } from '@/auth/token';
import { refreshAccessToken } from '@/auth/refresh';
import { resolveMock } from '@/api/mocks/router';

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(status: number, message: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

// Endpoints whose 401 we must NOT try to refresh against and must NOT
// kick the user to /login for — a 401 here means the credentials in the
// request body are bad, not that the access token expired. Also prevents
// recursion: if /auth/refresh itself 401s, we'd otherwise try to refresh
// it again.
const CREDENTIAL_401 = /^\/auth\/(login|refresh|signup)/;

function buildRequest(
  endpoint: string,
  method: string,
  body: unknown,
  customHeaders: Record<string, string>,
): Request {
  const headers: Record<string, string> = { ...customHeaders };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const isFormData = body instanceof FormData;
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';

  return new Request(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders = {} } = options;

  // TODO(mocks): remove once the backend is wired up.
  const mocked = resolveMock(method, endpoint, body);
  if (mocked) {
    return mocked as Promise<T>;
  }

  let response = await fetch(buildRequest(endpoint, method, body, customHeaders));

  if (response.status === 401 && !CREDENTIAL_401.test(endpoint)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry with the freshly-minted access token. buildRequest reads
      // from getToken(), which now returns the new value.
      response = await fetch(buildRequest(endpoint, method, body, customHeaders));
    }
  }

  if (response.status === 401 && !CREDENTIAL_401.test(endpoint)) {
    removeToken();
    window.location.href = '/login';
    throw new ApiError(401, 'No autorizado');
  }

  if (!response.ok) {
    let message = 'Error del servidor';
    let errors: Record<string, string> | undefined;
    try {
      const data = await response.json();
      message = data.message ?? message;
      errors = data.errors;
    } catch {
      // response body wasn't JSON
    }
    throw new ApiError(response.status, message, errors);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
