import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { DAY_NAMES } from '../constants';
import type { DraftWorkday } from '../types';
import { DayToggle } from './DayToggle';
import { TimeSelect } from './TimeSelect';

interface DayRowProps {
  day: DraftWorkday;
  onToggle: () => void;
  onChangeHour: (key: string, field: 'start_time' | 'end_time', value: string) => void;
  onAddHour: () => void;
  onRemoveHour: (key: string) => void;
}

export function DayRow({
  day,
  onToggle,
  onChangeHour,
  onAddHour,
  onRemoveHour,
}: DayRowProps) {
  const isDisabled = !day.is_enabled;

  return (
    <div className="flex gap-[64px] items-start justify-center px-600 py-400 w-full">
      <DayToggle
        enabled={day.is_enabled}
        label={DAY_NAMES[day.day]}
        onToggle={onToggle}
      />

      <div className="flex flex-1 min-w-0 flex-col gap-400 items-start">
        {day.hours.map((hour, idx) => (
          <div key={hour._key} className="flex items-center gap-400 w-full">
            <TimeSelect
              value={hour.start_time}
              disabled={isDisabled}
              onChange={(val) => onChangeHour(hour._key, 'start_time', val)}
            />
            <span
              className={cn(
                'font-sans text-body font-medium whitespace-nowrap shrink-0',
                isDisabled ? 'text-disabled' : 'text-body-emphasis',
              )}
            >
              a
            </span>
            <TimeSelect
              value={hour.end_time}
              disabled={isDisabled}
              onChange={(val) => onChangeHour(hour._key, 'end_time', val)}
            />
            {day.hours.length > 1 && !isDisabled && (
              <button
                type="button"
                aria-label="Eliminar horario"
                onClick={() => onRemoveHour(hour._key)}
                className="shrink-0 text-icon-secondary hover:text-icon-primary transition-colors"
              >
                <X aria-hidden size={20} strokeWidth={1.75} />
              </button>
            )}
            {(day.hours.length === 1 || isDisabled) && idx === 0 && (
              <span className="shrink-0 w-[20px]" />
            )}
          </div>
        ))}

        {!isDisabled && (
          <button
            type="button"
            onClick={onAddHour}
            className="flex items-center gap-200 py-100 font-sans text-body-sm font-medium text-accent hover:text-accent/80 transition-colors"
          >
            <Plus aria-hidden size={16} strokeWidth={1.75} />
            Agregar Otro Horario
          </button>
        )}
      </div>
    </div>
  );
}
