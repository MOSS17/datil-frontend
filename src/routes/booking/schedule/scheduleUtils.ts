const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'] as const;
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const;

export const DAY_HEADERS = WEEKDAY_LABELS;

export function formatMonth(year: number, month: number): string {
  return `${MONTH_NAMES[month]} ${year}`;
}

export interface CalendarCell {
  date: Date;
  iso: string; // YYYY-MM-DD
  day: number;
  inMonth: boolean;
  isToday: boolean;
  isPast: boolean;
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  // getDay: 0 = Sunday, 6 = Saturday. We want Monday as first column (Mon=0, Sun=6).
  const weekdaySunday = firstOfMonth.getDay();
  const weekdayMonday = (weekdaySunday + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = startOfDay(new Date());
  const cells: CalendarCell[] = [];

  for (let i = 0; i < weekdayMonday; i++) {
    cells.push({
      date: new Date(0),
      iso: '',
      day: 0,
      inMonth: false,
      isToday: false,
      isPast: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      date,
      iso: toIsoDate(date),
      day,
      inMonth: true,
      isToday: date.getTime() === today.getTime(),
      isPast: date.getTime() < today.getTime(),
    });
  }

  // Pad to complete the last week if needed
  while (cells.length % 7 !== 0) {
    cells.push({
      date: new Date(0),
      iso: '',
      day: 0,
      inMonth: false,
      isToday: false,
      isPast: false,
    });
  }

  return cells;
}

const SPANISH_WEEKDAYS = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
] as const;

const SPANISH_WEEKDAYS_SHORT = [
  'Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb',
] as const;

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatFullDate(iso: string): string {
  const date = parseIsoDate(iso);
  return `${SPANISH_WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTH_NAMES[date.getMonth()]}`;
}

export function formatFullDateWithYear(iso: string): string {
  const date = parseIsoDate(iso);
  const month = MONTH_NAMES[date.getMonth()].toLowerCase();
  return `${SPANISH_WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${month} de ${date.getFullYear()}`;
}

export function formatFullDateShortWeekday(iso: string): string {
  const date = parseIsoDate(iso);
  const month = MONTH_NAMES[date.getMonth()].toLowerCase();
  return `${SPANISH_WEEKDAYS_SHORT[date.getDay()]}, ${date.getDate()} de ${month} de ${date.getFullYear()}`;
}

export function formatShortDate(iso: string): string {
  const date = parseIsoDate(iso);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  return `${dd}/${mm}/${yy}`;
}

export function addMinutesToHhmm(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const endH = Math.floor(total / 60) % 24;
  const endM = total % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

export function formatTimeRange(startHhmm: string, durationMinutes: number): string {
  const endHhmm = addMinutesToHhmm(startHhmm, durationMinutes);
  return `${formatTimeLabel(startHhmm)} – ${formatTimeLabel(endHhmm)}`;
}

// Backend returns availability slots as RFC3339 with the business-local offset
// baked in (e.g. "2026-04-25T10:00:00-07:00"). The HH:MM portion is the
// authoritative display value — do NOT re-parse through Date, which would
// re-timezone it to the browser's local offset.
export function extractHhmmFromRfc3339(iso: string): string {
  return iso.slice(11, 16);
}

export function formatTimeLabel(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour12 = ((h + 11) % 12) + 1;
  const ampm = h < 12 ? 'AM' : 'PM';
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
}
