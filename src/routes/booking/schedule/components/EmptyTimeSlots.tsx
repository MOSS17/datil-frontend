import { CalendarDays } from 'lucide-react';

interface EmptyTimeSlotsProps {
  variant?: 'no-date' | 'no-slots';
}

const MESSAGES: Record<NonNullable<EmptyTimeSlotsProps['variant']>, string> = {
  'no-date': 'Selecciona una fecha para ver los horarios disponibles.',
  'no-slots': 'No hay horarios disponibles para esta fecha.',
};

export function EmptyTimeSlots({ variant = 'no-date' }: EmptyTimeSlotsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-400 rounded-lg bg-surface-secondary-subtle px-500 py-1200 text-center">
      <span aria-hidden className="text-icon-secondary">
        <CalendarDays size={32} strokeWidth={1.25} />
      </span>
      <p className="font-sans text-body-sm text-muted">{MESSAGES[variant]}</p>
    </div>
  );
}
