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
import type { RangeSelection } from './WeekGrid';

interface DayViewProps {
  weekStart: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  appointments: Appointment[];
  personalTimes: PersonalTime[];
  today?: Date;
  startHour?: number;
  endHour?: number;
  onSelectRange?: (range: RangeSelection) => void;
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
  today,
  startHour = 8,
  endHour = 15,
  onSelectRange,
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
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  dragRef.current = drag;

  const yToSnappedMinutes = (y: number): number => {
    const raw = y / pxPerMinute;
    const snapped = Math.round(raw / SNAP_MINUTES) * SNAP_MINUTES;
    return Math.max(0, Math.min(totalMinutes, snapped));
  };

  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: PointerEvent) => {
      const current = dragRef.current;
      if (!current || !colRef.current) return;
      const rect = colRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const endMinutes = yToSnappedMinutes(y);
      if (endMinutes !== current.endMinutes) {
        setDrag({ ...current, endMinutes, moved: true });
      }
    };
    const handleUp = () => {
      const current = dragRef.current;
      if (!current) return;
      let startM = Math.min(current.startMinutes, current.endMinutes);
      let endM = Math.max(current.startMinutes, current.endMinutes);
      if (!current.moved || endM - startM < SNAP_MINUTES) {
        endM = Math.min(totalMinutes, startM + 60);
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
        className="relative grid rounded-lg"
        style={{ gridTemplateColumns: '72px minmax(0, 1fr)' }}
      >
        <div className="flex flex-col">
          {hours.map((h) => (
            <div
              key={h}
              className="flex items-start justify-start pt-100 pr-200"
              style={{ height: ROW_HEIGHT_PX }}
            >
              <span className="font-sans text-caption text-muted">{formatHourLabel(h)}</span>
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
              <div
                key={a.id}
                className="absolute inset-x-0 cursor-default"
                style={{ top: topPx, height: heightPx }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <AppointmentCard appointment={a} className="h-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
