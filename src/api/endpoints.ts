export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/signup',
    REFRESH: '/auth/refresh',
    // The endpoints below are not implemented server-side (email verification
    // and password reset are out of scope per PHASES.md). Pages that import
    // them will fail at runtime — they're kept here only so dead UI compiles.
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_CODE: '/auth/resend-code',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  BUSINESS: '/business',
  CATEGORIES: '/categories',
  SERVICES: '/services',
  APPOINTMENTS: '/appointments',
  APPOINTMENTS_UNSEEN_COUNT: '/appointments/unseen-count',
  DASHBOARD: '/dashboard',
  SCHEDULE: {
    WORKDAYS: '/schedule/workdays',
    PERSONAL_TIME: '/schedule/personal-time',
  },
  CALENDAR: {
    GOOGLE_CONNECT: '/calendar/google/connect',
    GOOGLE_DISCONNECT: '/calendar/google',
    ICS_CONNECT: '/calendar/ics/connect',
    ICS_ROTATE: '/calendar/ics/rotate',
    ICS_DISCONNECT: '/calendar/ics',
  },
  BOOK: (slug: string) => ({
    page: `/book/${slug}`,
    services: `/book/${slug}/services`,
    availability: `/book/${slug}/availability`,
    reserve: `/book/${slug}/reserve`,
  }),
} as const;
