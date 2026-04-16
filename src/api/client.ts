import { getToken, removeToken } from '@/auth/token';

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

export async function apiClient<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders = {} } = options;

  const headers: Record<string, string> = { ...customHeaders };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
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
