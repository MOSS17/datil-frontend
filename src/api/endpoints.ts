export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_CODE: '/auth/resend-code',
  },
  BUSINESS: '/businesses',
  CATEGORIES: '/categories',
  SERVICES: '/services',
  APPOINTMENTS: '/appointments',
  SCHEDULE: {
    WORKDAYS: '/schedule/workdays',
    PERSONAL_TIME: '/schedule/personal-time',
  },
  CALENDAR: '/calendar/integrations',
} as const;
