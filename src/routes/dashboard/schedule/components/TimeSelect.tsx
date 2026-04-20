import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { TIME_OPTIONS } from '../constants';

interface TimeSelectProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  id?: string;
}

export function TimeSelect({ value, disabled, onChange, id }: TimeSelectProps) {
  return (
    <div className="relative flex flex-1 min-w-0">
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full appearance-none rounded-md border py-300 pl-300 pr-800 font-sans text-body-sm transition-colors',
          disabled
            ? 'border-disabled text-disabled bg-surface cursor-not-allowed'
            : 'border-default text-body-emphasis bg-surface cursor-pointer hover:border-primary focus:outline-none focus:border-primary',
        )}
      >
        {TIME_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden
        size={14}
        strokeWidth={1.75}
        className={cn(
          'pointer-events-none absolute right-300 top-1/2 -translate-y-1/2',
          disabled ? 'text-disabled' : 'text-icon-secondary',
        )}
      />
    </div>
  );
}
