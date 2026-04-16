export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
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
