import { useMemo } from 'react';
import { cn } from '@/lib/cn';
import type { Appointment } from '@/api/types/appointments';
import type { PersonalTime } from '@/api/types/schedule';
import {
  addDays,
  DAY_SHORT_ES,
  formatHourLabel,
  isSameDay,
} from '../utils';
import { AppointmentCard } from './AppointmentCard';
import { PersonalTimeCard } from './PersonalTimeCard';

interface WeekGridProps {
  weekStart: Date;
  appointments: Appointment[];
  personalTimes: PersonalTime[];
  today?: Date;
  startHour?: number;
  endHour?: number;
}

const ROW_HEIGHT_PX = 88;

interface PositionedAppointment {
  appointment: Appointment;
  topPx: number;
  heightPx: number;
  dayIndex: number;
}

interface PositionedPersonalTime {
  personalTime: PersonalTime;
  topPx: number;
  heightPx: number;
  dayIndex: number;
}

export function WeekGrid({
  weekStart,
  appointments,
  personalTimes,
  today,
  startHour = 8,
  endHour = 15,
}: WeekGridProps) {
  const hours = useMemo(
    () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
    [startHour, endHour],
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const minutesSinceStart = (d: Date) => (d.getHours() - startHour) * 60 + d.getMinutes();
  const pxPerMinute = ROW_HEIGHT_PX / 60;

  const positionedAppointments = useMemo<PositionedAppointment[]>(() => {
    const out: PositionedAppointment[] = [];
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

  const positionedPersonalTimes = useMemo<PositionedPersonalTime[]>(() => {
    const out: PositionedPersonalTime[] = [];
    for (const pt of personalTimes) {
      if (!pt.date) continue;
      const dayIndex = days.findIndex(
        (d) =>
          d.getFullYear() === Number(pt.date.slice(0, 4)) &&
          d.getMonth() === Number(pt.date.slice(5, 7)) - 1 &&
          d.getDate() === Number(pt.date.slice(8, 10)),
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
              <span className="font-sans text-body-sm text-muted">{DAY_SHORT_ES[d.getDay()]}</span>
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
          return (
            <div
              key={dayIdx}
              className={cn(
                'relative border-l border-subtle',
                isToday && 'bg-surface-secondary-subtle',
              )}
            >
              {hours.map((_, hIdx) => (
                <div
                  key={hIdx}
                  className="border-b border-subtle"
                  style={{ height: ROW_HEIGHT_PX }}
                />
              ))}

              {positionedPersonalTimes
                .filter((p) => p.dayIndex === dayIdx)
                .map((p) => (
                  <div
                    key={p.personalTime.id}
                    className="absolute inset-x-100"
                    style={{ top: p.topPx, height: p.heightPx }}
                  >
                    <PersonalTimeCard personalTime={p.personalTime} className="h-full" />
                  </div>
                ))}

              {positionedAppointments
                .filter((a) => a.dayIndex === dayIdx)
                .map((a) => (
                  <div
                    key={a.appointment.id}
                    className="absolute inset-x-100"
                    style={{ top: a.topPx, height: a.heightPx }}
                  >
                    <AppointmentCard appointment={a.appointment} className="h-full" />
                  </div>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
