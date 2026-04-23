import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import {
  buildMonthGrid,
  DAY_HEADERS,
  formatMonth,
} from '../scheduleUtils';

interface CalendarProps {
  visibleYear: number;
  visibleMonth: number; // 0-indexed
  selectedIso: string | null;
  onSelect: (iso: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function Calendar({
  visibleYear,
  visibleMonth,
  selectedIso,
  onSelect,
  onPrev,
  onNext,
}: CalendarProps) {
  const cells = buildMonthGrid(visibleYear, visibleMonth);

  return (
    <div className="flex flex-col gap-600 rounded-lg border border-default bg-surface p-500 md:p-600">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Mes anterior"
          className="flex h-800 w-800 items-center justify-center rounded-md border border-control text-icon hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
        >
          <ChevronLeft size={16} strokeWidth={1.75} aria-hidden />
        </button>
        <p className="font-sans text-body font-medium text-body-emphasis">
          {formatMonth(visibleYear, visibleMonth)}
        </p>
        <button
          type="button"
          onClick={onNext}
          aria-label="Mes siguiente"
          className="flex h-800 w-800 items-center justify-center rounded-md border border-control text-icon hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
        >
          <ChevronRight size={16} strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <div
        role="grid"
        aria-label={`Calendario ${formatMonth(visibleYear, visibleMonth)}`}
        className="flex flex-col gap-300"
      >
        <div role="row" className="grid grid-cols-7 gap-100">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              role="columnheader"
              className="py-200 text-center font-sans text-body-sm text-muted"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-100">
          {cells.map((cell, idx) => {
            if (!cell.inMonth) {
              return <div key={`empty-${idx}`} role="gridcell" />;
            }
            const selected = selectedIso === cell.iso;
            const disabled = cell.isPast;
            return (
              <div key={cell.iso} role="gridcell" className="flex justify-center">
                <button
                  type="button"
                  onClick={() => !disabled && onSelect(cell.iso)}
                  disabled={disabled}
                  aria-pressed={selected}
                  aria-label={cell.iso}
                  className={cn(
                    'flex h-[36px] w-[36px] items-center justify-center rounded-md font-sans text-body-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
                    selected && 'bg-surface-primary text-on-color',
                    !selected && !disabled && cell.isToday && 'border border-primary text-primary',
                    !selected && !disabled && !cell.isToday && 'text-primary hover:bg-surface-secondary-subtle',
                    disabled && 'cursor-not-allowed text-disabled',
                  )}
                >
                  {cell.day}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
