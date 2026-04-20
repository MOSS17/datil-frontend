// TODO(mocks): dev-only. Matches incoming apiClient calls to mock data so the frontend
// works without a backend. Delete when the real API is wired up.
import {
  mockAppointments,
  mockBusiness,
  mockCalendarIntegrations,
  mockCategories,
  mockPersonalTime,
  mockServices,
  mockUser,
  mockWorkdays,
} from './data';

export const MOCKS_ENABLED =
  import.meta.env.DEV && import.meta.env.VITE_API_MOCKS !== 'false';

const MOCK_LATENCY_MS = 200;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

function stripQuery(path: string): { path: string; query: URLSearchParams } {
  const [base, queryString = ''] = path.split('?');
  return { path: base, query: new URLSearchParams(queryString) };
}

interface MockContext {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
}

interface MockHandler {
  method: string;
  pattern: RegExp;
  handler: (ctx: MockContext, params: string[]) => unknown;
}

function nowId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`;
}

const HANDLERS: MockHandler[] = [
  // ── Auth ─────────────────────────────────────────────────────────────────
  { method: 'GET', pattern: /^\/auth\/me$/, handler: () => mockUser },

  // ── Business ────────────────────────────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/businesses\/slug\/([^/]+)$/,
    handler: (_ctx, [slug]) => ({ ...mockBusiness, slug }),
  },
  {
    method: 'GET',
    pattern: /^\/businesses\/([^/]+)$/,
    handler: (_ctx, [id]) => ({ ...mockBusiness, id }),
  },
  {
    method: 'PUT',
    pattern: /^\/businesses\/([^/]+)$/,
    handler: ({ body }, [id]) => ({
      ...mockBusiness,
      id,
      ...(typeof body === 'object' && body !== null ? body : {}),
    }),
  },

  // ── Categories ──────────────────────────────────────────────────────────
  { method: 'GET', pattern: /^\/categories$/, handler: () => mockCategories },
  {
    method: 'GET',
    pattern: /^\/categories\/([^/]+)$/,
    handler: (_ctx, [id]) =>
      mockCategories.find((c) => c.id === id) ?? mockCategories[0],
  },
  {
    method: 'POST',
    pattern: /^\/categories$/,
    handler: ({ body }) => ({
      id: nowId('cat'),
      business_id: 'dev-business',
      display_order: mockCategories.length + 1,
      ...(typeof body === 'object' && body !== null ? body : {}),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/categories\/([^/]+)$/,
    handler: ({ body }, [id]) => ({
      ...(mockCategories.find((c) => c.id === id) ?? mockCategories[0]),
      ...(typeof body === 'object' && body !== null ? body : {}),
      id,
    }),
  },
  {
    method: 'DELETE',
    pattern: /^\/categories\/([^/]+)$/,
    handler: () => undefined,
  },

  // ── Services ────────────────────────────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/services$/,
    handler: ({ query }) => {
      const categoryId = query.get('category_id');
      return categoryId
        ? mockServices.filter((s) => s.category_id === categoryId)
        : mockServices;
    },
  },
  {
    method: 'GET',
    pattern: /^\/services\/([^/]+)$/,
    handler: (_ctx, [id]) => mockServices.find((s) => s.id === id) ?? mockServices[0],
  },
  {
    method: 'POST',
    pattern: /^\/services$/,
    handler: ({ body }) => ({
      id: nowId('srv'),
      ...(typeof body === 'object' && body !== null ? body : {}),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/services\/([^/]+)$/,
    handler: ({ body }, [id]) => ({
      ...(mockServices.find((s) => s.id === id) ?? mockServices[0]),
      ...(typeof body === 'object' && body !== null ? body : {}),
      id,
    }),
  },
  {
    method: 'DELETE',
    pattern: /^\/services\/([^/]+)$/,
    handler: () => undefined,
  },

  // ── Appointments ────────────────────────────────────────────────────────
  { method: 'GET', pattern: /^\/appointments$/, handler: () => mockAppointments },
  {
    method: 'GET',
    pattern: /^\/appointments\/([^/]+)$/,
    handler: (_ctx, [id]) =>
      mockAppointments.find((a) => a.id === id) ?? mockAppointments[0],
  },
  {
    method: 'POST',
    pattern: /^\/appointments$/,
    handler: ({ body }) => ({
      ...mockAppointments[0],
      id: nowId('apt'),
      ...(typeof body === 'object' && body !== null ? body : {}),
      created_at: new Date().toISOString(),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/appointments\/([^/]+)\/status$/,
    handler: ({ body }, [id]) => ({
      ...(mockAppointments.find((a) => a.id === id) ?? mockAppointments[0]),
      ...(typeof body === 'object' && body !== null ? body : {}),
    }),
  },
  {
    method: 'POST',
    pattern: /^\/appointments\/([^/]+)\/payment-proof$/,
    handler: (_ctx, [id]) => ({
      ...(mockAppointments.find((a) => a.id === id) ?? mockAppointments[0]),
      payment_proof_url: 'https://placehold.co/600x400',
    }),
  },

  // ── Schedule ────────────────────────────────────────────────────────────
  { method: 'GET', pattern: /^\/schedule\/workdays$/, handler: () => mockWorkdays },
  {
    method: 'PUT',
    pattern: /^\/schedule\/workdays$/,
    handler: ({ body }) => (Array.isArray(body) ? body : mockWorkdays),
  },
  {
    method: 'GET',
    pattern: /^\/schedule\/personal-time$/,
    handler: () => mockPersonalTime,
  },
  {
    method: 'POST',
    pattern: /^\/schedule\/personal-time$/,
    handler: ({ body }) => ({
      id: nowId('pt'),
      user_id: 'dev-user',
      ...(typeof body === 'object' && body !== null ? body : {}),
    }),
  },
  {
    method: 'DELETE',
    pattern: /^\/schedule\/personal-time\/([^/]+)$/,
    handler: () => undefined,
  },

  // ── Calendar ────────────────────────────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/calendar\/integrations$/,
    handler: () => mockCalendarIntegrations,
  },
  {
    method: 'POST',
    pattern: /^\/calendar\/integrations$/,
    handler: ({ body }) => ({
      id: nowId('cal'),
      user_id: 'dev-user',
      provider:
        typeof body === 'object' && body !== null && 'provider' in body
          ? (body as { provider: string }).provider
          : 'google',
      connected_at: new Date().toISOString(),
    }),
  },
  {
    method: 'DELETE',
    pattern: /^\/calendar\/integrations\/([^/]+)$/,
    handler: () => undefined,
  },
];

export function resolveMock(
  method: string,
  endpoint: string,
  body: unknown,
): Promise<unknown> | null {
  if (!MOCKS_ENABLED) return null;

  const { path, query } = stripQuery(endpoint);
  const upperMethod = method.toUpperCase();

  for (const entry of HANDLERS) {
    if (entry.method !== upperMethod) continue;
    const match = entry.pattern.exec(path);
    if (!match) continue;
    const params = match.slice(1);
    const value = entry.handler({ method: upperMethod, path, query, body }, params);
    return delay(value);
  }

  return null;
}
