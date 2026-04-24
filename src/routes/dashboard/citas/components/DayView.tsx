import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Appointment } from '@/api/types/appointments';
import type { PersonalTime, Workday } from '@/api/types/schedule';
import {
  addDays,
  DAY_SHORT_ES,
  formatHourLabel,
  formatTimeShort,
  isSameDay,
} from '../utils';
import { AppointmentCard } from './AppointmentCard';
import { PersonalTimeCard } from './PersonalTimeCard';
import type { RangeSelection } from './WeekGrid';

interface DayViewProps {
  weekStart: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  appointments: Appointment[];
  personalTimes: PersonalTime[];
  workdays?: Workday[];
  today?: Date;
  startHour?: number;
  endHour?: number;
  onSelectRange?: (range: RangeSelection) => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

const ROW_HEIGHT_PX = 96;
const SNAP_MINUTES = 15;

function minutesToHHMM(startHour: number, minutesSinceStart: number): string {
  const total = startHour * 60 + Math.max(0, minutesSinceStart);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function makeDateAtMinutes(startHour: number, minutes: number): Date {
  const total = startHour * 60 + minutes;
  const d = new Date();
  d.setHours(Math.floor(total / 60), total % 60, 0, 0);
  return d;
}

interface DragState {
  startMinutes: number;
  endMinutes: number;
  moved: boolean;
}

export function DayView({
  weekStart,
  selectedDay,
  onSelectDay,
  appointments,
  personalTimes,
  workdays,
  today,
  startHour = 0,
  endHour = 23,
  onSelectRange,
  onSelectAppointment,
}: DayViewProps) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const pxPerMinute = ROW_HEIGHT_PX / 60;
  const totalMinutes = (endHour - startHour + 1) * 60;
  const minutesSinceStart = (d: Date) => (d.getHours() - startHour) * 60 + d.getMinutes();

  const colRef = useRef<HTMLDivElement | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  // Current time tick, refreshed once a minute so the "now" indicator
  // moves down as real time advances.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const showNowLine = today ? isSameDay(selectedDay, today) : false;

  const yToSnappedMinutes = (y: number): number => {
    const raw = y / pxPerMinute;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    return Math.max(0, Math.min(totalMinutes, snapped));
  };

  // Off-hour ranges on the selected day derived from the business's
  // workdays. If the day is disabled or has no hour ranges, the entire
  // column is off-hours.
  const offHours = useMemo(() => {
    if (!workdays) return [[0, totalMinutes]] as Array<[number, number]>;
    const dow = selectedDay.getDay();
    const w = workdays.find((x) => x.day === dow);
    if (!w || !w.is_enabled || w.hours.length === 0) {
      return [[0, totalMinutes]] as Array<[number, number]>;
    }
    const on: Array<[number, number]> = [];
    for (const h of w.hours) {
      const [sh, sm] = h.start_time.split(':').map(Number);
      const [eh, em] = h.end_time.split(':').map(Number);
      const s = Math.max(0, (sh - startHour) * 60 + sm);
      const e = Math.min(totalMinutes, (eh - startHour) * 60 + em);
      if (e > s) on.push([s, e]);
    }
    on.sort((a, b) => a[0] - b[0]);
    const off: Array<[number, number]> = [];
    let cursor = 0;
    for (const [s, e] of on) {
      if (s > cursor) off.push([cursor, s]);
      cursor = Math.max(cursor, e);
    }
    if (cursor < totalMinutes) off.push([cursor, totalMinutes]);
    return off;
  }, [workdays, selectedDay, startHour, totalMinutes]);

  // Blocked minute ranges on the selected day (appointments + personal
  // time). Used to clamp a new-range drag so it can't spill into an
  // occupied slot. Off-hours are NOT blocked — they render as a grey
  // overlay but the user is allowed to drag across them and will be asked
  // to confirm an out-of-hours booking.
  const blocked = useMemo(() => {
    const out: Array<[number, number]> = [];
    for (const a of appointments) {
      const start = new Date(a.start_time);
      if (!isSameDay(start, selectedDay)) continue;
      const s = minutesSinceStart(start);
      const e = minutesSinceStart(new Date(a.end_time));
      if (e > s) out.push([s, e]);
    }
    for (const pt of personalTimes) {
      if (!pt.date) continue;
      const y = Number(pt.date.slice(0, 4));
      const m = Number(pt.date.slice(5, 7)) - 1;
      const d = Number(pt.date.slice(8, 10));
      if (
        selectedDay.getFullYear() !== y ||
        selectedDay.getMonth() !== m ||
        selectedDay.getDate() !== d
      )
        continue;
      if (pt.start_time && pt.end_time) {
        const [sh, sm] = pt.start_time.split(':').map(Number);
        const [eh, em] = pt.end_time.split(':').map(Number);
        const s = (sh - startHour) * 60 + sm;
        const e = (eh - startHour) * 60 + em;
        if (e > s) out.push([s, e]);
      } else {
        out.push([0, totalMinutes]);
      }
    }
    return out;
  }, [appointments, personalTimes, selectedDay, startHour, totalMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  const clampDragEnd = (start: number, candidate: number): number => {
    if (candidate >= start) {
      let limit = totalMinutes;
      for (const [bs] of blocked) {
        if (bs >= start && bs < limit) limit = bs;
      }
      return Math.min(candidate, limit);
    }
    let limit = 0;
    for (const [, be] of blocked) {
      if (be <= start && be > limit) limit = be;
    }
    return Math.max(candidate, limit);
  };
  // Ref pattern so the drag's `useEffect` closure always sees the latest
  // clamp function without having to re-subscribe pointer listeners when
  // `blocked` changes.
  const clampDragEndRef = useRef(clampDragEnd);
  clampDragEndRef.current = clampDragEnd;

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: PointerEvent) => {
      const current = dragRef.current;
      if (!current || !colRef.current) return;
      const rect = colRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const raw = yToSnappedMinutes(y);
      const endMinutes = clampDragEndRef.current(current.startMinutes, raw);
      if (endMinutes !== current.endMinutes) {
        setDrag({
          ...current,
          endMinutes,
          moved: current.moved || endMinutes !== current.startMinutes,
        });
      }
    };
    const handleUp = () => {
      const current = dragRef.current;
      if (!current) return;
      let startM = Math.min(current.startMinutes, current.endMinutes);
      let endM = Math.max(current.startMinutes, current.endMinutes);
      if (!current.moved || endM - startM < SNAP_MINUTES) {
        const extended = Math.min(totalMinutes, startM + 60);
        endM = clampDragEndRef.current(startM, extended);
      }
      if (endM <= startM) endM = startM + SNAP_MINUTES;
      onSelectRange?.({
        day: selectedDay,
        startTime: minutesToHHMM(startHour, startM),
        endTime: minutesToHHMM(startHour, endM),
      });
      setDrag(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [drag, onSelectRange, pxPerMinute, selectedDay, startHour, totalMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const rect = colRef.current?.getBoundingClientRect();
    if (!rect) return;
    const y = e.clientY - rect.top;
    const startMinutes = yToSnappedMinutes(y);
    setDrag({ startMinutes, endMinutes: startMinutes, moved: false });
  };

  const dayAppointments = appointments.filter((a) =>
    isSameDay(new Date(a.start_time), selectedDay),
  );
  const dayPersonalTimes = personalTimes.filter((p) => {
    if (!p.date) return false;
    const y = Number(p.date.slice(0, 4));
    const m = Number(p.date.slice(5, 7)) - 1;
    const d = Number(p.date.slice(8, 10));
    return (
      selectedDay.getFullYear() === y &&
      selectedDay.getMonth() === m &&
      selectedDay.getDate() === d
    );
  });

  const dragTop = drag ? Math.min(drag.startMinutes, drag.endMinutes) * pxPerMinute : 0;
  const dragHeight = drag
    ? Math.max(
        SNAP_MINUTES * pxPerMinute,
        Math.abs(drag.endMinutes - drag.startMinutes) * pxPerMinute,
      )
    : 0;

  // Scroll the main page so business hours (or current time on today) are
  // in view on mount and whenever the selected day changes. Mobile uses the
  // page's native scroll rather than an inner scroll container.
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    let targetMinutes: number;
    if (today && isSameDay(selectedDay, today)) {
      const nowMin = today.getHours() * 60 + today.getMinutes();
      targetMinutes = Math.max(0, nowMin - 60);
    } else if (offHours.length === 0 || offHours[0][0] > 0) {
      targetMinutes = 0;
    } else {
      targetMinutes = Math.max(0, offHours[0][1] - 60);
    }
    const rect = el.getBoundingClientRect();
    const pageY = rect.top + window.scrollY + targetMinutes * pxPerMinute;
    window.scrollTo({ top: Math.max(0, pageY - 80), behavior: 'auto' });
  }, [selectedDay, offHours, pxPerMinute, today]);

  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-stretch gap-200 overflow-x-auto">
        {days.map((d, i) => {
          const isSelected = isSameDay(d, selectedDay);
          const isToday = today ? isSameDay(d, today) : false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDay(d)}
              className={cn(
                'flex min-w-[56px] flex-col items-center gap-100 rounded-full px-300 py-200 font-sans text-body-sm transition-colors',
                isSelected && 'border border-default',
                !isSelected && 'border border-transparent',
              )}
            >
              <span
                className={cn(
                  isToday ? 'text-accent' : isSelected ? 'text-body-emphasis' : 'text-muted',
                )}
              >
                {DAY_SHORT_ES[d.getDay()]}
              </span>
              <span
                className={cn(
                  'font-serif',
                  isToday ? 'text-accent' : isSelected ? 'text-body-emphasis' : 'text-muted',
                )}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <div
        ref={gridRef}
        className="relative grid rounded-lg"
        style={{ gridTemplateColumns: '56px minmax(0, 1fr)' }}
      >
          <div className="flex flex-col">
            {hours.map((h, idx) => (
              <div
                key={h}
                className="flex items-start justify-end pr-200"
                style={{ height: ROW_HEIGHT_PX }}
              >
                <span
                  className="font-sans text-caption text-muted"
                  style={idx === 0 ? undefined : { transform: 'translateY(-50%)' }}
                >
                  {formatHourLabel(h)}
                </span>
              </div>
            ))}
          </div>

          <div
            ref={colRef}
            onPointerDown={handlePointerDown}
            className="relative cursor-crosshair border-l border-subtle select-none touch-none"
          >
            {hours.map((_, i) => (
              <div
                key={i}
                className="border-b border-subtle transition-colors hover:bg-surface-accent-subtle"
                style={{ height: ROW_HEIGHT_PX }}
              />
            ))}

            {offHours.map(([s, e2], i) => (
              <div
                key={`off-${i}`}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bg-surface-disabled/70"
                style={{ top: s * pxPerMinute, height: (e2 - s) * pxPerMinute }}
              />
            ))}

            {drag && drag.moved && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 flex items-start rounded-sm border border-accent bg-surface-accent-subtle/80 px-300 py-100"
                style={{ top: dragTop, height: dragHeight }}
              >
                <span className="font-sans text-caption font-medium text-accent">
                  {formatTimeShort(
                    makeDateAtMinutes(startHour, Math.min(drag.startMinutes, drag.endMinutes)),
                  )}{' '}
                  –{' '}
                  {formatTimeShort(
                    makeDateAtMinutes(
                      startHour,
                      Math.max(drag.startMinutes, drag.endMinutes) ||
                        Math.min(drag.startMinutes, drag.endMinutes) + SNAP_MINUTES,
                    ),
                  )}
                </span>
              </div>
            )}

            {dayPersonalTimes.map((p) => {
              if (!p.start_time || !p.end_time) {
                return (
                  <div
                    key={p.id}
                    className="absolute inset-x-0 cursor-default"
                    style={{ top: 0, height: hours.length * ROW_HEIGHT_PX }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <PersonalTimeCard personalTime={p} className="h-full" />
                  </div>
                );
              }
              const [sh, sm] = p.start_time.split(':').map(Number);
              const [eh, em] = p.end_time.split(':').map(Number);
              const topPx = Math.max(0, (sh - startHour) * 60 + sm) * pxPerMinute;
              const heightPx = Math.max(
                40,
                ((eh - startHour) * 60 + em - ((sh - startHour) * 60 + sm)) * pxPerMinute,
              );
              return (
                <div
                  key={p.id}
                  className="absolute inset-x-0 cursor-default"
                  style={{ top: topPx, height: heightPx }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <PersonalTimeCard personalTime={p} className="h-full" />
                </div>
              );
            })}

            {dayAppointments.map((a) => {
              const start = new Date(a.start_time);
              const end = new Date(a.end_time);
              const topPx = Math.max(0, minutesSinceStart(start) * pxPerMinute);
              const heightPx = Math.max(
                40,
                (minutesSinceStart(end) - minutesSinceStart(start)) * pxPerMinute,
              );
              return (
                <button
                  type="button"
                  key={a.id}
                  className={cn(
                    'absolute inset-x-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                    onSelectAppointment ? 'cursor-pointer' : 'cursor-default',
                  )}
                  style={{ top: topPx, height: heightPx }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onSelectAppointment?.(a)}
                  aria-label={`Ver detalles de cita de ${a.customer_name}`}
                >
                  <AppointmentCard appointment={a} className="h-full" />
                </button>
              );
            })}

            {showNowLine && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 z-10 h-0 border-t-2 border-accent"
                style={{ top: minutesSinceStart(now) * pxPerMinute }}
              >
                <div className="absolute -left-[6px] -top-[7px] h-[12px] w-[12px] rounded-full bg-surface-accent" />
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
