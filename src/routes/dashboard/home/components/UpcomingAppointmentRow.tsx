import type { Appointment } from '@/api/types/appointments';
import { cn } from '@/lib/cn';
import { computeDurationMin } from '@/lib/appointmentEnrich';
import {
  formatRelativeDay,
  formatShortDate,
  formatTimeOfDay,
  getAppointmentAccent,
  getStatusPill,
} from '../utils';
import { StatusPill } from './StatusPill';

interface UpcomingAppointmentRowProps {
  appointment: Appointment;
  nextUpId: string | null;
  now: Date;
  onSelect?: (appointment: Appointment) => void;
}

export function UpcomingAppointmentRow({
  appointment,
  nextUpId,
  now,
  onSelect,
}: UpcomingAppointmentRowProps) {
  const services =
    appointment.services
      .map((s) => s.service_name)
      .filter((name): name is string => Boolean(name))
      .join(' + ') || 'Cita';
  const duration = computeDurationMin(appointment);
  const accent = getAppointmentAccent(appointment, now);
  const pill = getStatusPill(appointment, nextUpId, now);
  const start = new Date(appointment.start_time);

  return (
    <button
      type="button"
      onClick={() => onSelect?.(appointment)}
      className="flex w-full items-center gap-400 bg-surface p-400 text-left transition-colors hover:bg-surface-secondary-subtle focus:outline-none focus-visible:bg-surface-secondary-subtle md:px-500 md:py-400"
    >
      <div className="flex shrink-0 flex-col gap-50 md:w-1300">
        <p className="font-sans text-body-sm font-medium text-body-emphasis">
          {formatRelativeDay(appointment.start_time, now)}
        </p>
        <p className="font-sans text-caption text-muted">{formatShortDate(start)}</p>
      </div>
      <div
        aria-hidden
        className={cn(
          'w-[3px] shrink-0 self-stretch rounded-xs md:h-900 md:self-center',
          accent === 'accent' ? 'bg-surface-accent' : 'bg-surface-control',
        )}
      />
      <div className="flex flex-1 min-w-0 flex-col gap-50">
        <div className="flex flex-col-reverse gap-100 md:flex-row md:items-center">
          <p className="font-sans text-body font-medium text-body-emphasis truncate">
            {appointment.customer_name}
          </p>
          {pill && <StatusPill kind={pill} />}
        </div>
        <p className="font-sans text-body-sm truncate">{services}</p>
      </div>
      <div className="flex w-1400 shrink-0 flex-col gap-50 items-end md:items-start">
        <p className="font-sans text-body-sm font-medium text-body-emphasis">
          {formatTimeOfDay(appointment.start_time)}
        </p>
        <p className="font-sans text-caption text-muted">
          {duration} min
        </p>
      </div>
    </button>
  );
}
