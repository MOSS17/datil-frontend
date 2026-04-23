import { CalendarDays } from 'lucide-react';

export function EmptyTimeSlots() {
  return (
    <div className="flex flex-col items-center justify-center gap-400 rounded-lg bg-surface-secondary-subtle px-500 py-1200 text-center">
      <span aria-hidden className="text-icon-secondary">
        <CalendarDays size={32} strokeWidth={1.25} />
      </span>
      <p className="font-sans text-body-sm text-muted">
        Selecciona una fecha para ver los horarios disponibles.
      </p>
    </div>
  );
}
