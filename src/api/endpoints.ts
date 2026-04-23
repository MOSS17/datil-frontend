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
  SCHEDULE: {
    WORKDAYS: '/schedule/workdays',
    PERSONAL_TIME: '/schedule/personal-time',
  },
  CALENDAR: '/calendar/integrations',
} as const;
