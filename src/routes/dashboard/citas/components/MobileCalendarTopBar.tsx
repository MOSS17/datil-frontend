import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatMonthYear } from '../utils';

interface MobileCalendarTopBarProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onNew: () => void;
}

export function MobileCalendarTopBar({
  weekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  onNew,
}: MobileCalendarTopBarProps) {
  return (
    <div className="flex flex-col gap-400 md:hidden">
      <div className="flex items-center justify-end gap-300">
        <button
          type="button"
          onClick={onToday}
          className="inline-flex items-center rounded-md border border-control bg-surface px-400 py-200 font-sans text-body-sm font-medium text-body-emphasis"
        >
          Hoy
        </button>
        <button
          type="button"
          aria-label="Nuevo Bloque"
          onClick={onNew}
          className="inline-flex h-900 w-900 items-center justify-center rounded-md bg-surface-primary text-on-color hover:bg-surface-primary-hover"
        >
          <Plus size={18} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <p className="font-sans text-body-sm text-muted">
        Consulta tus citas de la semana y bloquea horas para que tus clientes no puedan agendar.
      </p>
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-h4-mobile text-heading">{formatMonthYear(weekStart)}</h1>
        <div className="flex items-center gap-200">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={onPrevWeek}
            className="inline-flex h-900 w-900 items-center justify-center rounded-md border border-control bg-surface text-icon"
          >
            <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Semana siguiente"
            onClick={onNextWeek}
            className="inline-flex h-900 w-900 items-center justify-center rounded-md border border-control bg-surface text-icon"
          >
            <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
