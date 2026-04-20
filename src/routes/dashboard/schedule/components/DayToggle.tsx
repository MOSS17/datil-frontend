import { cn } from '@/lib/cn';

interface DayToggleProps {
  enabled: boolean;
  label: string;
  onToggle: () => void;
}

export function DayToggle({ enabled, label, onToggle }: DayToggleProps) {
  return (
    <div className="flex items-center gap-400 shrink-0 w-[133px]">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`${enabled ? 'Desactivar' : 'Activar'} ${label}`}
        onClick={onToggle}
        className={cn(
          'relative flex h-[24px] w-[44px] shrink-0 rounded-full p-[2px] transition-colors',
          enabled
            ? 'bg-surface-primary items-end justify-end'
            : 'bg-surface-disabled-emphasis items-start justify-start',
        )}
      >
        <span className="block h-[20px] w-[20px] rounded-full bg-surface" />
      </button>
      <span className="font-sans text-body font-medium text-body-emphasis whitespace-nowrap">
        {label}
      </span>
    </div>
  );
}
