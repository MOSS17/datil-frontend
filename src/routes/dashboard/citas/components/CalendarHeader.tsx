import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatMonthYear, formatWeekRange } from '../utils';

interface CalendarHeaderProps {
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onNew: () => void;
}

export function CalendarHeader({
  weekStart,
  onPrevWeek,
  onNextWeek,
  onToday,
  onNew,
}: CalendarHeaderProps) {
  return (
    <header className="flex flex-col gap-500 md:flex-row md:items-end md:justify-between md:gap-600">
      <div className="flex flex-col gap-200">
        <h1 className="font-serif text-h4 text-heading">{formatMonthYear(weekStart)}</h1>
        <p className="max-w-[560px] font-sans text-body-sm text-muted">
          Crea y consulta tus citas de la semana y bloquea horas para que tus clientes no puedan
          agendar.
        </p>
      </div>
      <div className="flex items-center gap-300">
        <div className="inline-flex items-center rounded-md border border-control bg-surface">
          <button
            type="button"
            aria-label="Semana anterior"
            onClick={onPrevWeek}
            className="inline-flex h-1000 w-1000 items-center justify-center text-icon hover:bg-surface-secondary-subtle rounded-l-md"
          >
            <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
          </button>
          <span className="px-200 font-sans text-body-sm font-medium text-body-emphasis">
            {formatWeekRange(weekStart)}
          </span>
          <button
            type="button"
            aria-label="Semana siguiente"
            onClick={onNextWeek}
            className="inline-flex h-1000 w-1000 items-center justify-center text-icon hover:bg-surface-secondary-subtle rounded-r-md"
          >
            <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <Button variant="secondary" onClick={onToday}>
          Hoy
        </Button>
        <Button
          variant="primary"
          leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
          onClick={onNew}
        >
          Nuevo Bloque
        </Button>
      </div>
    </header>
  );
}
