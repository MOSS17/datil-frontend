import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { Appointment } from '@/api/types/appointments';
import type { PersonalTime } from '@/api/types/schedule';
import { addDays, DAY_SHORT_ES, formatHourLabel, isSameDay } from '../utils';
import { AppointmentCard } from './AppointmentCard';
import { PersonalTimeCard } from './PersonalTimeCard';

interface DayViewProps {
  weekStart: Date;
  selectedDay: Date;
  onSelectDay: (day: Date) => void;
  appointments: Appointment[];
  personalTimes: PersonalTime[];
  today?: Date;
  startHour?: number;
  endHour?: number;
}

const ROW_HEIGHT_PX = 96;

export function DayView({
  weekStart,
  selectedDay,
  onSelectDay,
  appointments,
  personalTimes,
  today,
  startHour = 8,
  endHour = 15,
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
  const minutesSinceStart = (d: Date) => (d.getHours() - startHour) * 60 + d.getMinutes();

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

        <div className="relative border-l border-subtle">
          {hours.map((_, i) => (
            <div
              key={i}
              className="border-b border-subtle"
              style={{ height: ROW_HEIGHT_PX }}
            />
          ))}

          {dayPersonalTimes.map((p) => {
            if (!p.start_time || !p.end_time) {
              return (
                <div
                  key={p.id}
                  className="absolute inset-x-0"
                  style={{ top: 0, height: hours.length * ROW_HEIGHT_PX }}
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
                className="absolute inset-x-0"
                style={{ top: topPx, height: heightPx }}
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
                className="absolute inset-x-0"
                style={{ top: topPx, height: heightPx }}
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
