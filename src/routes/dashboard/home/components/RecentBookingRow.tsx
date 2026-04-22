import type { Appointment } from '@/api/types/appointments';
import { formatPhone } from '@/lib/formatters';
import {
  formatShortDateLower,
  formatTimeOfDay,
  isRecentlyCreated,
} from '../utils';
import { StatusPill } from './StatusPill';

interface RecentBookingRowProps {
  appointment: Appointment;
  now: Date;
}

export function RecentBookingRow({ appointment, now }: RecentBookingRowProps) {
  const services = appointment.services.map((s) => s.service_name).join(' + ');
  const fresh = isRecentlyCreated(appointment.created_at, now);
  const start = new Date(appointment.start_time);

  return (
    <div className="flex items-center justify-between gap-400 px-500 py-400">
      <div className="flex min-w-0 flex-col gap-100">
        <div className="flex flex-col-reverse gap-100 md:flex-row md:items-center">
          <p className="font-sans text-body font-medium text-body-emphasis truncate">
            {appointment.customer_name}
          </p>
          {fresh && <StatusPill kind="new" />}
        </div>
        <p className="font-sans text-caption font-medium truncate">{services}</p>
        <div className="flex items-center gap-200">
          <span className="font-sans text-caption text-muted">
            {formatShortDateLower(start)}
          </span>
          <span aria-hidden className="h-100 w-100 rounded-full bg-neutral-100" />
          <span className="font-sans text-caption text-muted">
            {formatTimeOfDay(appointment.start_time)}
          </span>
        </div>
      </div>
      <p className="font-sans text-body-sm whitespace-nowrap">
        📱 {formatPhone(appointment.customer_phone)}
      </p>
    </div>
  );
}
