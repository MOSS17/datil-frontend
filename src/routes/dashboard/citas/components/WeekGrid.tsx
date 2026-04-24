import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import type { Appointment } from '@/api/types/appointments';
import type { PersonalTime } from '@/api/types/schedule';
import {
  addDays,
  DAY_SHORT_ES,
  formatHourLabel,
  formatTimeShort,
  isSameDay,
} from '../utils';
import { AppointmentCard } from './AppointmentCard';
import { PersonalTimeCard } from './PersonalTimeCard';

export interface RangeSelection {
  day: Date;
  startTime: string;
  endTime: string;
}

interface WeekGridProps {
  weekStart: Date;
  appointments: Appointment[];
  personalTimes: PersonalTime[];
  today?: Date;
  startHour?: number;
  endHour?: number;
  onSelectRange?: (range: RangeSelection) => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

const ROW_HEIGHT_PX = 88;
const SNAP_MINUTES = 15;

function minutesToHHMM(startHour: number, minutesSinceStart: number): string {
  const total = startHour * 60 + Math.max(0, minutesSinceStart);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

interface DragState {
  dayIndex: number;
  startMinutes: number;
  endMinutes: number;
  moved: boolean;
}

export function WeekGrid({
  weekStart,
  appointments,
  personalTimes,
  today,
  startHour = 8,
  endHour = 15,
  onSelectRange,
  onSelectAppointment,
}: WeekGridProps) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const dayColRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const pxPerMinute = ROW_HEIGHT_PX / 60;
  const totalMinutes = (endHour - startHour + 1) * 60;
  const minutesSinceStart = (d: Date) => (d.getHours() - startHour) * 60 + d.getMinutes();

  const yToSnappedMinutes = (y: number): number => {
    const raw = y / pxPerMinute;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    return Math.max(0, Math.min(totalMinutes, snapped));
  };

  // Blocked minute ranges (appointments + personal time) indexed by day.
  // Used while dragging a new-range selection so the end of the drag can't
  // spill into an already-occupied slot. `minutesSinceStart` omitted from
  // deps intentionally: it closes over a stable `startHour`.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blockedByDay = useMemo(() => {
    const map: Array<Array<[number, number]>> = Array.from(
      { length: 7 },
      () => [],
    );
    for (const a of appointments) {
      const start = new Date(a.start_time);
      const end = new Date(a.end_time);
      const dayIdx = days.findIndex((d) => isSameDay(d, start));
      if (dayIdx === -1) continue;
      const s = minutesSinceStart(start);
      const e = minutesSinceStart(end);
      if (e > s) map[dayIdx].push([s, e]);
    }
    for (const pt of personalTimes) {
      if (!pt.date) continue;
      const y = Number(pt.date.slice(0, 4));
      const m = Number(pt.date.slice(5, 7)) - 1;
      const d = Number(pt.date.slice(8, 10));
      const dayIdx = days.findIndex(
        (day) =>
          day.getFullYear() === y && day.getMonth() === m && day.getDate() === d,
      );
      if (dayIdx === -1) continue;
      if (pt.start_time && pt.end_time) {
        const [sh, sm] = pt.start_time.split(':').map(Number);
        const [eh, em] = pt.end_time.split(':').map(Number);
        const s = (sh - startHour) * 60 + sm;
        const e = (eh - startHour) * 60 + em;
        if (e > s) map[dayIdx].push([s, e]);
      } else {
        map[dayIdx].push([0, totalMinutes]);
      }
    }
    return map;
  }, [appointments, personalTimes, days, startHour, totalMinutes]);

  // Clamp a drag end so the selected range [min(start,end), max(start,end)]
  // never overlaps a blocked interval. Start is assumed to land in free
  // space (cards stop pointer-down propagation), so we only need to cap the
  // far edge of the drag.
  const clampDragEnd = (
    dayIndex: number,
    start: number,
    candidate: number,
  ): number => {
    const blocked = blockedByDay[dayIndex] ?? [];
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

  useEffect(() => {
    if (!drag) return;

    const handleMove = (e: PointerEvent) => {
      const current = dragRef.current;
      if (!current) return;
      const cell = dayColRefs.current[current.dayIndex];
      if (!cell) return;
      const rect = cell.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const raw = yToSnappedMinutes(y);
      const endMinutes = clampDragEnd(current.dayIndex, current.startMinutes, raw);
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
        endM = clampDragEnd(current.dayIndex, startM, extended);
      }
      if (endM <= startM) endM = startM + SNAP_MINUTES;

      onSelectRange?.({
        day: days[current.dayIndex],
        startTime: minutesToHHMM(startHour, startM),
        endTime: minutesToHHMM(startHour, endM),
      });
      setDrag(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', () => setDrag(null));
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [drag, days, onSelectRange, pxPerMinute, startHour, totalMinutes]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, dayIndex: number) => {
    if (e.button !== 0) return;
    const cell = dayColRefs.current[dayIndex];
    if (!cell) return;
    const rect = cell.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const startMinutes = yToSnappedMinutes(y);
    setDrag({
      dayIndex,
      startMinutes,
      endMinutes: startMinutes,
      moved: false,
    });
  };

  const positionedAppointments = useMemo(() => {
    const out: Array<{
      appointment: Appointment;
      topPx: number;
      heightPx: number;
      dayIndex: number;
    }> = [];
    for (const appt of appointments) {
      const start = new Date(appt.start_time);
      const end = new Date(appt.end_time);
      const dayIndex = days.findIndex((d) => isSameDay(d, start));
      if (dayIndex === -1) continue;
      const topPx = Math.max(0, minutesSinceStart(start) * pxPerMinute);
      const heightPx = Math.max(
        32,
        (minutesSinceStart(end) - minutesSinceStart(start)) * pxPerMinute,
      );
      out.push({ appointment: appt, topPx, heightPx, dayIndex });
    }
    return out;
  }, [appointments, days, pxPerMinute, startHour]); // eslint-disable-line react-hooks/exhaustive-deps

  const positionedPersonalTimes = useMemo(() => {
    const out: Array<{
      personalTime: PersonalTime;
      topPx: number;
      heightPx: number;
      dayIndex: number;
    }> = [];
    for (const pt of personalTimes) {
      const date = pt.date;
      if (!date) continue;
      const dayIndex = days.findIndex(
        (d) =>
          d.getFullYear() === Number(date.slice(0, 4)) &&
          d.getMonth() === Number(date.slice(5, 7)) - 1 &&
          d.getDate() === Number(date.slice(8, 10)),
      );
      if (dayIndex === -1) continue;

      if (pt.start_time && pt.end_time) {
        const [sh, sm] = pt.start_time.split(':').map(Number);
        const [eh, em] = pt.end_time.split(':').map(Number);
        const topPx = Math.max(0, (sh - startHour) * 60 + sm) * pxPerMinute;
        const heightPx = Math.max(
          32,
          ((eh - startHour) * 60 + em - ((sh - startHour) * 60 + sm)) * pxPerMinute,
        );
        out.push({ personalTime: pt, topPx, heightPx, dayIndex });
      } else {
        out.push({
          personalTime: pt,
          topPx: 0,
          heightPx: hours.length * ROW_HEIGHT_PX,
          dayIndex,
        });
      }
    }
    return out;
  }, [personalTimes, days, hours.length, pxPerMinute, startHour]);

  return (
    <div className="overflow-hidden rounded-lg border border-default bg-surface">
      <div
        className="grid border-b border-subtle"
        style={{ gridTemplateColumns: '72px repeat(7, minmax(0, 1fr))' }}
      >
        <div aria-hidden />
        {days.map((d, i) => {
          const isToday = today ? isSameDay(d, today) : false;
          return (
            <div
              key={i}
              className={cn(
                'flex items-center justify-center gap-200 border-l border-subtle px-400 py-300',
                isToday && 'bg-surface-secondary-subtle',
              )}
            >
              <span className="font-sans text-body-sm text-muted">
                {DAY_SHORT_ES[d.getDay()]}
              </span>
              <span
                className={cn(
                  'inline-flex h-700 w-700 items-center justify-center font-sans text-body-sm',
                  isToday
                    ? 'rounded-full bg-surface-accent text-on-color'
                    : 'text-body-emphasis',
                )}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      <div
        className="relative grid"
        style={{ gridTemplateColumns: '72px repeat(7, minmax(0, 1fr))' }}
      >
        <div className="flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="flex items-start justify-end px-300 pt-200"
              style={{ height: ROW_HEIGHT_PX }}
            >
              <span className="font-sans text-caption text-muted">{formatHourLabel(h)}</span>
            </div>
          ))}
        </div>

        {days.map((d, dayIdx) => {
          const isToday = today ? isSameDay(d, today) : false;
          const dragOnThisDay = drag && drag.dayIndex === dayIdx;
          const dragTop = dragOnThisDay
            ? Math.min(drag.startMinutes, drag.endMinutes) * pxPerMinute
            : 0;
          const dragHeight = dragOnThisDay
            ? Math.max(
                SNAP_MINUTES * pxPerMinute,
                Math.abs(drag.endMinutes - drag.startMinutes) * pxPerMinute,
              )
            : 0;
          const dragStartLabel = dragOnThisDay
            ? formatTimeShort(makeDateAtMinutes(startHour, Math.min(drag.startMinutes, drag.endMinutes)))
            : '';
          const dragEndLabel = dragOnThisDay
            ? formatTimeShort(
                makeDateAtMinutes(
                  startHour,
                  Math.max(drag.startMinutes, drag.endMinutes) ||
                    Math.min(drag.startMinutes, drag.endMinutes) + SNAP_MINUTES,
                ),
              )
            : '';

          return (
            <div
              key={dayIdx}
              ref={(el) => {
                dayColRefs.current[dayIdx] = el;
              }}
              onPointerDown={(e) => handlePointerDown(e, dayIdx)}
              className={cn(
                'relative cursor-crosshair border-l border-subtle select-none touch-none',
                isToday && 'bg-surface-secondary-subtle',
              )}
            >
              {hours.map((_, hIdx) => (
                <div
                  key={hIdx}
                  className="border-b border-subtle transition-colors hover:bg-surface-accent-subtle"
                  style={{ height: ROW_HEIGHT_PX }}
                />
              ))}

              {dragOnThisDay && drag.moved && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 flex items-start rounded-sm border border-accent bg-surface-accent-subtle/80 px-300 py-100"
                  style={{ top: dragTop, height: dragHeight }}
                >
                  <span className="font-sans text-caption font-medium text-accent">
                    {dragStartLabel} – {dragEndLabel}
                  </span>
                </div>
              )}

              {positionedPersonalTimes
                .filter((p) => p.dayIndex === dayIdx)
                .map((p) => (
                  <div
                    key={p.personalTime.id}
                    className="absolute inset-x-0 cursor-default"
                    style={{ top: p.topPx, height: p.heightPx }}
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <PersonalTimeCard personalTime={p.personalTime} className="h-full" />
                  </div>
                ))}

              {positionedAppointments
                .filter((a) => a.dayIndex === dayIdx)
                .map((a) => (
                  <button
                    type="button"
                    key={a.appointment.id}
                    className={cn(
                      'absolute inset-x-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                      onSelectAppointment ? 'cursor-pointer' : 'cursor-default',
                    )}
                    style={{ top: a.topPx, height: a.heightPx }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onSelectAppointment?.(a.appointment)}
                    aria-label={`Ver detalles de cita de ${a.appointment.customer_name}`}
                  >
                    <AppointmentCard appointment={a.appointment} className="h-full" />
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function makeDateAtMinutes(startHour: number, minutes: number): Date {
  const total = startHour * 60 + minutes;
  const d = new Date();
  d.setHours(Math.floor(total / 60), total % 60, 0, 0);
  return d;
}
