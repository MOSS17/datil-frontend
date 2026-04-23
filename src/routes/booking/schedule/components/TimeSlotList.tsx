import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatTimeLabel } from '../scheduleUtils';

interface TimeSlotListProps {
  slots: readonly string[];
  selected: string | null;
  onSelect: (hhmm: string) => void;
}

export function TimeSlotList({ slots, selected, onSelect }: TimeSlotListProps) {
  return (
    <ul className="flex flex-col gap-300">
      {slots.map((slot) => {
        const isSelected = slot === selected;
        return (
          <li key={slot}>
            <button
              type="button"
              onClick={() => onSelect(slot)}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-center justify-center gap-300 rounded-md border py-300 font-sans text-body-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
                isSelected
                  ? 'border-primary bg-surface-secondary text-body-emphasis'
                  : 'border-default bg-surface text-primary hover:bg-surface-secondary-subtle',
              )}
            >
              <span>{formatTimeLabel(slot)}</span>
              {isSelected ? (
                <Check size={16} strokeWidth={2} aria-hidden className="shrink-0" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
