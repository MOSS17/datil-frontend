// Demo-mode fixtures. When VITE_API_MOCKS is on, these back every API call —
// no real backend required. This is the prod "demo" deploy target.
import type { AuthResponse, User } from '@/api/types/auth';
import type { BookingServiceApi } from '@/api/types/booking';
import type { BusinessApi } from '@/api/types/business';
import type { Category } from '@/api/types/categories';
import type { ServiceApi } from '@/api/types/services';
import type { Appointment } from '@/api/types/appointments';
import type { Workday, PersonalTime } from '@/api/types/schedule';

export const mockUser: User = {
  id: 'dev-user',
  email: 'jane@ardenstudio',
  name: 'Lupita Urias',
  business_id: 'dev-business',
};

export const mockBusiness: BusinessApi = {
  id: 'dev-business',
  name: 'Lupita Urias Makeup Artist',
  description:
    'Maquillaje profesional para novias, eventos y sesiones editoriales en Culiacán.',
  url: 'lupita-urias',
  logo_url: null,
  location: 'Culiacán, Sinaloa',
  beneficiary_clabe: '012180001234567890',
  bank_name: 'BBVA',
  beneficiary_name: 'Guadalupe Urias Soto',
  timezone: 'America/Mexico_City',
  created_at: '2025-08-01T15:00:00.000Z',
  updated_at: '2025-08-01T15:00:00.000Z',
};

export const mockCategories: Category[] = [
  {
    id: 'cat-makeup',
    business_id: 'dev-business',
    name: 'Maquillaje',
    description: 'Servicios de maquillaje profesional',
    allow_multiple: false,
    display_order: 1,
  },
  {
    id: 'cat-hair',
    business_id: 'dev-business',
    name: 'Peinado',
    description: 'Peinados para eventos y novias',
    allow_multiple: false,
    display_order: 2,
  },
  {
    id: 'cat-extras',
    business_id: 'dev-business',
    name: 'Extras',
    description: 'Servicios adicionales',
    allow_multiple: true,
    display_order: 3,
  },
  {
    id: 'cat-peinados',
    business_id: 'dev-business',
    name: 'Peinados',
    description: 'Complementos de peinado',
    allow_multiple: true,
    display_order: 4,
  },
];

export const mockServices: ServiceApi[] = [
  {
    id: 'srv-social',
    category_id: 'cat-makeup',
    name: 'Maquillaje Social',
    description: 'Maquillaje para eventos de día o noche.',
    min_price: 120000,
    max_price: 150000,
    duration: 60,
    advance_payment_amount: 30000,
    is_extra: false,
    is_active: true,
  },
  {
    id: 'srv-bride',
    category_id: 'cat-makeup',
    name: 'Maquillaje de Novia',
    description: 'Incluye prueba previa y retoque el día del evento.',
    min_price: 450000,
    max_price: 600000,
    duration: 120,
    advance_payment_amount: 100000,
    is_extra: false,
    is_active: true,
  },
  {
    id: 'srv-editorial',
    category_id: 'cat-makeup',
    name: 'Maquillaje Editorial',
    description: 'Para sesiones fotográficas o pasarela.',
    min_price: 200000,
    max_price: 250000,
    duration: 90,
    advance_payment_amount: 50000,
    is_extra: false,
    is_active: true,
  },
  {
    id: 'srv-updo',
    category_id: 'cat-hair',
    name: 'Peinado de Evento',
    description: 'Recogido o semirecogido con accesorios.',
    min_price: 100000,
    max_price: 180000,
    duration: 75,
    advance_payment_amount: 30000,
    is_extra: false,
    is_active: true,
  },
  {
    id: 'srv-blowout',
    category_id: 'cat-hair',
    name: 'Blower Profesional',
    description: 'Secado y styling.',
    min_price: 60000,
    max_price: null,
    duration: 45,
    advance_payment_amount: null,
    is_extra: false,
    is_active: true,
  },
  {
    id: 'srv-lashes',
    category_id: 'cat-extras',
    name: 'Pestañas Postizas',
    description: 'Aplicación de pestañas para complementar el maquillaje.',
    min_price: 25000,
    max_price: 40000,
    duration: 15,
    advance_payment_amount: null,
    is_extra: true,
    is_active: true,
  },
  {
    id: 'srv-airbrush',
    category_id: 'cat-extras',
    name: 'Acabado Airbrush',
    description: 'Upgrade del maquillaje base a técnica airbrush.',
    min_price: 50000,
    max_price: null,
    duration: 0,
    advance_payment_amount: null,
    is_extra: true,
    is_active: true,
  },
  {
    id: 'srv-ondas',
    category_id: 'cat-peinados',
    name: 'Ondas o Planchado',
    description: 'Maquillaje completo para eventos especiales, bodas y fiestas.',
    min_price: 25000,
    max_price: null,
    duration: 30,
    advance_payment_amount: null,
    is_extra: true,
    is_active: true,
  },
  {
    id: 'srv-semirecogido',
    category_id: 'cat-peinados',
    name: 'Semi Recogido',
    description: 'Maquillaje completo para eventos especiales, bodas y fiestas.',
    min_price: 65000,
    max_price: null,
    duration: 30,
    advance_payment_amount: null,
    is_extra: true,
    is_active: true,
  },
  {
    id: 'srv-recogido',
    category_id: 'cat-peinados',
    name: 'Recogido',
    description: 'Maquillaje completo para eventos especiales, bodas y fiestas.',
    min_price: 35000,
    max_price: 45000,
    duration: 30,
    advance_payment_amount: null,
    is_extra: true,
    is_active: true,
  },
];

function iso(dateStr: string) {
  return new Date(dateStr).toISOString();
}

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    user_id: 'usr-ana',
    customer_name: 'Ana Sofía Ríos',
    customer_email: null,
    customer_phone: '6671234567',
    status: 'confirmed',
    start_time: iso('2026-04-18T16:00:00-06:00'),
    end_time: iso('2026-04-18T17:00:00-06:00'),
    total: 150000,
    advance_payment_image_url: 'https://placehold.co/600x400',
    services: [
      {
        appointment_id: 'apt-001',
        service_id: 'srv-social',
        service_name: 'Maquillaje Social',
        price: 150000,
        duration: 60,
        is_extra: false,
      },
    ],
    created_at: iso('2026-04-10T12:00:00-06:00'),
    updated_at: iso('2026-04-10T12:00:00-06:00'),
  },
  {
    id: 'apt-002',
    user_id: 'usr-marta',
    customer_name: 'Marta Elena Vázquez',
    customer_email: 'marta@example.com',
    customer_phone: '6679876543',
    status: 'pending',
    start_time: iso('2026-04-20T09:00:00-06:00'),
    end_time: iso('2026-04-20T11:15:00-06:00'),
    total: 625000,
    advance_payment_image_url: null,
    services: [
      {
        appointment_id: 'apt-002',
        service_id: 'srv-bride',
        service_name: 'Maquillaje de Novia',
        price: 600000,
        duration: 120,
        is_extra: false,
      },
      {
        appointment_id: 'apt-002',
        service_id: 'srv-lashes',
        service_name: 'Pestañas Postizas',
        price: 25000,
        duration: 15,
        is_extra: true,
      },
    ],
    created_at: iso('2026-04-12T18:30:00-06:00'),
    updated_at: iso('2026-04-12T18:30:00-06:00'),
  },
  {
    id: 'apt-003',
    user_id: 'usr-paty',
    customer_name: 'Paty González',
    customer_email: null,
    customer_phone: '6675551212',
    status: 'completed',
    start_time: iso('2026-04-05T11:00:00-06:00'),
    end_time: iso('2026-04-05T12:15:00-06:00'),
    total: 160000,
    advance_payment_image_url: 'https://placehold.co/600x400',
    services: [
      {
        appointment_id: 'apt-003',
        service_id: 'srv-updo',
        service_name: 'Peinado de Evento',
        price: 160000,
        duration: 75,
        is_extra: false,
      },
    ],
    created_at: iso('2026-03-28T10:00:00-06:00'),
    updated_at: iso('2026-04-05T12:15:00-06:00'),
  },
  {
    id: 'apt-004',
    user_id: 'usr-cecilia',
    customer_name: 'Cecilia Torres',
    customer_email: null,
    customer_phone: '6672223344',
    status: 'cancelled',
    start_time: iso('2026-04-14T14:00:00-06:00'),
    end_time: iso('2026-04-14T15:30:00-06:00'),
    total: 225000,
    advance_payment_image_url: null,
    services: [
      {
        appointment_id: 'apt-004',
        service_id: 'srv-editorial',
        service_name: 'Maquillaje Editorial',
        price: 225000,
        duration: 90,
        is_extra: false,
      },
    ],
    created_at: iso('2026-04-06T09:30:00-06:00'),
    updated_at: iso('2026-04-13T08:00:00-06:00'),
  },
  {
    id: 'apt-005',
    user_id: 'usr-laura',
    customer_name: 'Laura Camacho',
    customer_email: 'laura@example.com',
    customer_phone: '6673334455',
    status: 'confirmed',
    start_time: iso('2026-04-22T17:30:00-06:00'),
    end_time: iso('2026-04-22T19:00:00-06:00'),
    total: 210000,
    advance_payment_image_url: 'https://placehold.co/600x400',
    services: [
      {
        appointment_id: 'apt-005',
        service_id: 'srv-social',
        service_name: 'Maquillaje Social',
        price: 135000,
        duration: 60,
        is_extra: false,
      },
      {
        appointment_id: 'apt-005',
        service_id: 'srv-blowout',
        service_name: 'Blower Profesional',
        price: 60000,
        duration: 45,
        is_extra: false,
      },
      {
        appointment_id: 'apt-005',
        service_id: 'srv-lashes',
        service_name: 'Pestañas Postizas',
        price: 25000,
        duration: 15,
        is_extra: true,
      },
    ],
    created_at: iso('2026-04-13T21:00:00-06:00'),
    updated_at: iso('2026-04-13T21:00:00-06:00'),
  },
];

export const mockWorkdays: Workday[] = [
  { id: 'wd-0', business_id: 'dev-business', day: 0, is_enabled: false, hours: [] },
  {
    id: 'wd-1',
    business_id: 'dev-business',
    day: 1,
    is_enabled: true,
    hours: [{ id: 'wh-1', workday_id: 'wd-1', start_time: '09:00', end_time: '18:00' }],
  },
  {
    id: 'wd-2',
    business_id: 'dev-business',
    day: 2,
    is_enabled: true,
    hours: [{ id: 'wh-2', workday_id: 'wd-2', start_time: '09:00', end_time: '18:00' }],
  },
  {
    id: 'wd-3',
    business_id: 'dev-business',
    day: 3,
    is_enabled: true,
    hours: [{ id: 'wh-3', workday_id: 'wd-3', start_time: '09:00', end_time: '18:00' }],
  },
  {
    id: 'wd-4',
    business_id: 'dev-business',
    day: 4,
    is_enabled: true,
    hours: [{ id: 'wh-4', workday_id: 'wd-4', start_time: '09:00', end_time: '20:00' }],
  },
  {
    id: 'wd-5',
    business_id: 'dev-business',
    day: 5,
    is_enabled: true,
    hours: [
      { id: 'wh-5a', workday_id: 'wd-5', start_time: '09:00', end_time: '13:00' },
      { id: 'wh-5b', workday_id: 'wd-5', start_time: '15:00', end_time: '20:00' },
    ],
  },
  {
    id: 'wd-6',
    business_id: 'dev-business',
    day: 6,
    is_enabled: true,
    hours: [{ id: 'wh-6', workday_id: 'wd-6', start_time: '10:00', end_time: '15:00' }],
  },
];

export const mockPersonalTime: PersonalTime[] = [
  {
    id: 'pt-001',
    user_id: 'dev-user',
    type: 'full_day',
    date: '2026-04-25',
    start_date: '2026-04-25',
    end_date: '2026-04-25',
    start_time: '',
    end_time: '',
    reason: 'Cita médica',
  },
  {
    id: 'pt-002',
    user_id: 'dev-user',
    type: 'date_range',
    date: '',
    start_date: '2026-05-10',
    end_date: '2026-05-14',
    start_time: '',
    end_time: '',
    reason: 'Vacaciones',
  },
  {
    id: 'pt-003',
    user_id: 'dev-user',
    type: 'hours',
    date: '2026-04-19',
    start_date: '2026-04-19',
    end_date: '2026-04-19',
    start_time: '12:00',
    end_time: '14:00',
    reason: 'Comida con proveedor',
  },
];

// Base64url-encode a JSON payload into the standard JWT segment format.
// Pad stripped so the result is URL-safe and JWT-shaped.
function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// Produces a JWT-shaped token that passes the client-side `isTokenExpired`
// check (exp one year out). The signature segment is unverified client-side,
// so any placeholder suffices for the demo.
export function createDemoToken(): string {
  const header = b64url({ alg: 'HS256', typ: 'JWT' });
  const payload = b64url({
    sub: 'dev-user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  });
  return `${header}.${payload}.demo`;
}

export function createDemoAuthResponse(overrides?: Partial<User>): AuthResponse {
  return {
    access_token: createDemoToken(),
    refresh_token: createDemoToken(),
    user: { ...mockUser, ...overrides },
  };
}

// Shape `/book/{slug}/services` response: each main service gets every
// `is_extra` service attached as `extras[]`. The customer UI filters extras
// per-category downstream; attaching all of them keeps the mock simple and
// exercises the "service has extras" UX.
export function buildMockBookingServices(): BookingServiceApi[] {
  const extras = mockServices.filter((s) => s.is_extra);
  return mockServices.map((s) => ({
    ...s,
    extras: s.is_extra ? [] : extras,
  }));
}
