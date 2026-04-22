import { cn } from '@/lib/cn';
import type { Appointment } from '@/api/types/appointments';
import { formatTimeShort } from '../utils';

interface AppointmentCardProps {
  appointment: Appointment;
  className?: string;
}

export function AppointmentCard({ appointment, className }: AppointmentCardProps) {
  const start = new Date(appointment.start_time);
  const end = new Date(appointment.end_time);
  const main = appointment.services.find((s) => !s.is_extra) ?? appointment.services[0];
  const extras = appointment.services.filter((s) => s.is_extra);

  return (
    <div
      className={cn(
        'flex h-full min-h-0 flex-col gap-100 overflow-hidden rounded-sm border-l-sm border-primary bg-surface-secondary px-300 py-200 font-sans',
        className,
      )}
    >
      <p className="truncate text-body-sm font-medium text-body-emphasis">
        {main?.service_name ?? 'Cita'}
      </p>
      <p className="truncate text-caption text-muted">{appointment.customer_name}</p>
      <p className="text-caption text-muted">
        {formatTimeShort(start)} – {formatTimeShort(end)}
      </p>
      {extras.length > 0 && (
        <p className="truncate text-caption text-accent">
          + {extras.map((e) => e.service_name).join(', ')}
        </p>
      )}
    </div>
  );
}
