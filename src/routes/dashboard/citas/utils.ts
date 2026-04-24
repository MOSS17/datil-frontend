import { DIAS_SEMANA } from '@/lib/constants';
import type { Workday } from '@/api/types/schedule';

export const MONTH_NAMES_ES = [
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

export const DAY_SHORT_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;

export function startOfWeekMon(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMon);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatWeekRange(monday: Date): string {
  const sunday = addDays(monday, 6);
  const mStart = MONTH_NAMES_ES[monday.getMonth()].slice(0, 3);
  const mEnd = MONTH_NAMES_ES[sunday.getMonth()].slice(0, 3);
  return `${monday.getDate()} ${mStart} – ${sunday.getDate()} ${mEnd}`;
}

export function formatMonthYear(date: Date): string {
  return `${MONTH_NAMES_ES[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatLongDateEs(date: Date): string {
  const weekday = DIAS_SEMANA[date.getDay()];
  const month = MONTH_NAMES_ES[date.getMonth()];
  return `${weekday}, ${date.getDate()} de ${month}, ${date.getFullYear()}`;
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatHourLabel(hour: number): string {
  const suffix = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}:00 ${suffix}`;
}

export function formatTimeShort(date: Date): string {
  const minutes = date.getMinutes();
  const hours24 = date.getHours();
  const suffix = hours24 < 12 ? 'am' : 'pm';
  const h = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${h}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

// Returns the IANA timezone's UTC offset as a ±HH:MM string, sampled at noon
// on the given YYYY-MM-DD to avoid DST-boundary ambiguity. Falls back to
// the browser's local offset if the tz is missing or unparseable.
function businessTzOffset(dateIso: string, timeZone: string | undefined): string {
  if (!timeZone) {
    const mins = -new Date(`${dateIso}T12:00:00`).getTimezoneOffset();
    const sign = mins >= 0 ? '+' : '-';
    const abs = Math.abs(mins);
    return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
  }
  try {
    const sample = new Date(`${dateIso}T12:00:00Z`);
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(sample);
    const raw = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    if (raw === 'GMT') return '+00:00';
    const m = raw.match(/GMT([+-])(\d{2}):(\d{2})/);
    return m ? `${m[1]}${m[2]}:${m[3]}` : '+00:00';
  } catch {
    return '+00:00';
  }
}

// Combines a YYYY-MM-DD date and HH:MM wall-clock time into an RFC3339
// string anchored in the business's timezone. The backend parses
// appointment start_time in the business's IANA tz; this produces the
// same instant they'd compute.
export function toBusinessRfc3339(
  date: string,
  time: string,
  timeZone: string | undefined,
): string {
  return `${date}T${time}:00${businessTzOffset(date, timeZone)}`;
}

// Returns true if [startTime, endTime] on `day` is not fully covered by the
// business's configured work hours for that weekday. `startTime`/`endTime`
// are `HH:MM` strings. A disabled or missing workday is always off-hours.
export function rangeIsOutsideBusinessHours(
  day: Date,
  startTime: string,
  endTime: string,
  workdays: Workday[] | undefined,
): boolean {
  if (!workdays) return false;
  const w = workdays.find((x) => x.day === day.getDay());
  if (!w || !w.is_enabled || w.hours.length === 0) return true;
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const rs = sh * 60 + sm;
  const re = eh * 60 + em;
  const blocks = w.hours
    .map((h) => {
      const [hsh, hsm] = h.start_time.split(':').map(Number);
      const [heh, hem] = h.end_time.split(':').map(Number);
      return [hsh * 60 + hsm, heh * 60 + hem] as [number, number];
    })
    .sort((a, b) => a[0] - b[0]);
  let cursor = rs;
  for (const [bs, be] of blocks) {
    if (bs > cursor) break;
    cursor = Math.max(cursor, be);
    if (cursor >= re) return false;
  }
  return cursor < re;
}

export const TIME_OPTIONS: { value: string; label: string }[] = Array.from(
  { length: 24 * 4 },
  (_, i) => {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const suffix = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const label = `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
    return { value, label };
  },
);
