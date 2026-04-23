export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
] as const;

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const PERSONAL_TIME_TYPE = {
  HOURS: 'hours',
  FULL_DAY: 'full_day',
  DATE_RANGE: 'date_range',
} as const;

export type PersonalTimeType = (typeof PERSONAL_TIME_TYPE)[keyof typeof PERSONAL_TIME_TYPE];

export const CALENDAR_PROVIDER = {
  GOOGLE: 'google',
  APPLE: 'apple',
} as const;

export type CalendarProvider = (typeof CALENDAR_PROVIDER)[keyof typeof CALENDAR_PROVIDER];

export const TOKEN_KEY = 'datil_token';
export const REFRESH_TOKEN_KEY = 'datil_refresh_token';
export const USER_KEY = 'datil_user';
