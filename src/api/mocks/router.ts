// Mock router. Two modes:
//   VITE_API_MOCKS=true (default) — demo mode. Every API call resolves
//   against the handlers below; no real backend is contacted.
//   VITE_API_MOCKS=false — real-backend mode. Only paths in
//   MOCK_ALLOWLIST still resolve here; everything else falls through to
//   the live backend.
import {
  buildMockBookingServices,
  createDemoAuthResponse,
  mockAppointments,
  mockBusiness,
  mockCategories,
  mockPersonalTime,
  mockServices,
  mockWorkdays,
} from './data';
import type { TimeSlot } from '@/api/types/booking';

export const MOCKS_ENABLED = import.meta.env.VITE_API_MOCKS !== 'false';

// When MOCKS_ENABLED is false, only requests matching one of these patterns
// still hit the mock router. Everything else is proxied to the real backend.
const MOCK_ALLOWLIST: RegExp[] = [];

const MOCK_LATENCY_MS = 200;
const MOCK_TIMEZONE_OFFSET = '-06:00';

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

function formField(body: unknown, key: string): string | null {
  if (body instanceof FormData) {
    const value = body.get(key);
    return typeof value === 'string' ? value : null;
  }
  if (typeof body === 'object' && body !== null && key in body) {
    const v = (body as Record<string, unknown>)[key];
    return typeof v === 'string' ? v : null;
  }
  return null;
}

// Synthesize availability slots from the business's configured workday
// (mockWorkdays, keyed by DOW where 0=Sunday). Walks every enabled hour
// window in 1-hour steps. RFC3339 strings with a fixed business offset so
// the frontend's raw-slice display pattern shows the right wall clock.
function computeMockSlots(dateIso: string): TimeSlot[] {
  if (!dateIso) return [];
  const parts = dateIso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return [];
  const [y, m, d] = parts;
  const date = new Date(y, m - 1, d);
  const dow = date.getDay();
  const workday = mockWorkdays.find((w) => w.day === dow);
  if (!workday || !workday.is_enabled) return [];

  const slots: TimeSlot[] = [];
  for (const hour of workday.hours) {
    const [sh, sm] = hour.start_time.split(':').map(Number);
    const [eh, em] = hour.end_time.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    for (let t = startMin; t + 60 <= endMin; t += 60) {
      const slotStart = fmtHhmm(t);
      const slotEnd = fmtHhmm(t + 60);
      slots.push({
        start: `${dateIso}T${slotStart}:00${MOCK_TIMEZONE_OFFSET}`,
        end: `${dateIso}T${slotEnd}:00${MOCK_TIMEZONE_OFFSET}`,
      });
    }
  }
  return slots;
}

function fmtHhmm(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const HANDLERS: MockHandler[] = [
  // ── Auth ────────────────────────────────────────────────────────────────
  {
    method: 'POST',
    pattern: /^\/auth\/login$/,
    handler: ({ body }) => {
      const email = formField(body, 'email') ?? 'demo@datil.mx';
      return createDemoAuthResponse({ email });
    },
  },
  {
    method: 'POST',
    pattern: /^\/auth\/signup$/,
    handler: ({ body }) => {
      const email = formField(body, 'email') ?? 'demo@datil.mx';
      const name = formField(body, 'name') ?? 'Demo';
      return createDemoAuthResponse({ email, name });
    },
  },
  {
    method: 'POST',
    pattern: /^\/auth\/refresh$/,
    handler: () => createDemoAuthResponse(),
  },
  { method: 'GET', pattern: /^\/auth\/me$/, handler: () => createDemoAuthResponse().user },

  // ── Business (authed dashboard) ─────────────────────────────────────────
  { method: 'GET', pattern: /^\/business$/, handler: () => mockBusiness },
  {
    method: 'PUT',
    pattern: /^\/business$/,
    handler: ({ body }) => ({
      ...mockBusiness,
      ...(typeof body === 'object' && body !== null ? body : {}),
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/business\/bank$/,
    handler: ({ body }) => ({
      ...mockBusiness,
      ...(typeof body === 'object' && body !== null ? body : {}),
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/business\/logo$/,
    handler: () => ({
      ...mockBusiness,
      logo_url: 'https://placehold.co/200x200',
      updated_at: new Date().toISOString(),
    }),
  },

  // ── Public booking flow (unauthed) ──────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/book\/([^/]+)$/,
    handler: (_ctx, [slug]) => ({
      business: { ...mockBusiness, url: slug },
      categories: mockCategories,
    }),
  },
  {
    method: 'GET',
    pattern: /^\/book\/([^/]+)\/services$/,
    handler: () => buildMockBookingServices(),
  },
  {
    method: 'GET',
    pattern: /^\/book\/([^/]+)\/availability$/,
    handler: ({ query }) => computeMockSlots(query.get('date') ?? ''),
  },
  {
    method: 'POST',
    pattern: /^\/book\/([^/]+)\/reserve$/,
    handler: ({ body }) => ({
      ...mockAppointments[0],
      id: nowId('apt'),
      customer_name: formField(body, 'customer_name') ?? 'Cliente Demo',
      customer_phone: formField(body, 'customer_phone') ?? '+5215555555555',
      start_time: formField(body, 'start_time') ?? new Date().toISOString(),
      advance_payment_image_url:
        body instanceof FormData && body.get('payment_proof')
          ? 'https://placehold.co/600x400'
          : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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

  // ── Services (authed dashboard) ─────────────────────────────────────────
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
    method: 'GET',
    pattern: /^\/services\/([^/]+)\/extras$/,
    handler: () => mockServices.filter((s) => s.is_extra),
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

  // ── Dashboard (authed) ──────────────────────────────────────────────────
  {
    method: 'GET',
    pattern: /^\/dashboard$/,
    handler: () => {
      const active = mockAppointments.filter((a) => a.status !== 'cancelled');
      const upcoming = [...active]
        .filter((a) => new Date(a.end_time).getTime() >= Date.now())
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
        .slice(0, 10);
      const latest = [...active]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);
      return {
        today_count: 1,
        week_count: 3,
        monthly_income: active
          .filter((a) => a.status === 'completed')
          .reduce((sum, a) => sum + a.total, 0),
        upcoming,
        latest,
      };
    },
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
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/appointments\/([^/]+)$/,
    handler: ({ body }, [id]) => ({
      ...(mockAppointments.find((a) => a.id === id) ?? mockAppointments[0]),
      ...(typeof body === 'object' && body !== null ? body : {}),
      id,
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'PUT',
    pattern: /^\/appointments\/([^/]+)\/status$/,
    handler: ({ body }, [id]) => ({
      ...(mockAppointments.find((a) => a.id === id) ?? mockAppointments[0]),
      ...(typeof body === 'object' && body !== null ? body : {}),
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'POST',
    pattern: /^\/appointments\/([^/]+)\/payment-proof$/,
    handler: (_ctx, [id]) => ({
      ...(mockAppointments.find((a) => a.id === id) ?? mockAppointments[0]),
      advance_payment_image_url: 'https://placehold.co/600x400',
      updated_at: new Date().toISOString(),
    }),
  },
  {
    method: 'DELETE',
    pattern: /^\/appointments\/([^/]+)$/,
    handler: () => undefined,
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
];

export function resolveMock(
  method: string,
  endpoint: string,
  body: unknown,
): Promise<unknown> | null {
  const { path, query } = stripQuery(endpoint);

  if (!MOCKS_ENABLED && !MOCK_ALLOWLIST.some((re) => re.test(path))) {
    return null;
  }

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
