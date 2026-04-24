import { Check } from 'lucide-react';
import type { TimeSlot } from '@/api/types/booking';
import { cn } from '@/lib/cn';
import { extractHhmmFromRfc3339, formatTimeLabel } from '../scheduleUtils';

interface TimeSlotListProps {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotList({ slots, selected, onSelect }: TimeSlotListProps) {
  return (
    <ul className="flex max-h-[360px] flex-col gap-300 overflow-y-auto pr-200">
      {slots.map((slot) => {
        const isSelected = slot.start === selected;
        const label = formatTimeLabel(extractHhmmFromRfc3339(slot.start));
        return (
          <li key={slot.start}>
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
              <span>{label}</span>
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
