import type { Appointment } from '@/api/types/appointments';
import { APPOINTMENT_STATUS, DIAS_SEMANA } from '@/lib/constants';

const MS_DAY = 24 * 60 * 60 * 1000;

const SHORT_MONTHS_ES = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function formatShortDate(date: Date): string {
  const m = SHORT_MONTHS_ES[date.getMonth()];
  return `${date.getDate()} ${m.charAt(0).toUpperCase()}${m.slice(1)}`;
}

export function formatShortDateLower(date: Date): string {
  return `${date.getDate()} ${SHORT_MONTHS_ES[date.getMonth()]}`;
}

export function formatWeekRange(date: Date): string {
  return `${formatShortDate(startOfWeek(date))} - ${formatShortDate(endOfWeek(date))}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatRelativeDay(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  const diffDays = Math.round(
    (startOfDay(d).getTime() - startOfDay(now).getTime()) / MS_DAY,
  );
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays > 1 && diffDays < 7) return DIAS_SEMANA[d.getDay()];
  return formatShortDate(d);
}

export function formatTimeOfDay(iso: string): string {
  const d = new Date(iso);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = ((hours + 11) % 12) + 1;
  return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function formatMetricRevenue(amountCents: number): string {
  return `$${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(amountCents / 100)}`;
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export type AccentKind = 'accent' | 'neutral';

export function getAppointmentAccent(
  appt: Appointment,
  now: Date = new Date(),
): AccentKind {
  if (appt.status === APPOINTMENT_STATUS.CANCELLED) return 'neutral';
  return isSameDay(new Date(appt.start_time), now) ? 'accent' : 'neutral';
}

export type StatusPillKind = 'in-progress' | 'next' | null;

export function getStatusPill(
  appt: Appointment,
  nextUpId: string | null,
  now: Date = new Date(),
): StatusPillKind {
  if (appt.status === APPOINTMENT_STATUS.CANCELLED) return null;
  const t = now.getTime();
  const start = new Date(appt.start_time).getTime();
  const end = new Date(appt.end_time).getTime();
  if (t >= start && t <= end) return 'in-progress';
  if (appt.id === nextUpId) return 'next';
  return null;
}

export function findNextUpId(
  appointments: Appointment[],
  now: Date = new Date(),
): string | null {
  const t = now.getTime();
  const next = appointments
    .filter(
      (a) =>
        a.status !== APPOINTMENT_STATUS.CANCELLED &&
        new Date(a.start_time).getTime() > t,
    )
    .sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )[0];
  return next?.id ?? null;
}

export function isRecentlyCreated(
  createdAt: string,
  now: Date = new Date(),
  days = 3,
): boolean {
  const diff = (now.getTime() - new Date(createdAt).getTime()) / MS_DAY;
  return diff >= 0 && diff < days;
}

export function formatTimeAgo(iso: string, now: Date = new Date()): string {
  const diffSec = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return 'Hace unos segundos';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `Hace ${diffHr} h`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `Hace ${diffDay} ${diffDay === 1 ? 'día' : 'días'}`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `Hace ${diffMonth} ${diffMonth === 1 ? 'mes' : 'meses'}`;
  const diffYear = Math.floor(diffDay / 365);
  return `Hace ${diffYear} ${diffYear === 1 ? 'año' : 'años'}`;
}
