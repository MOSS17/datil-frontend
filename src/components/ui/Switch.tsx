import { cn } from '@/lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled,
  className,
}: SwitchProps) {
  return (
    <label
      className={cn(
        'inline-flex items-center gap-300 font-sans text-body-sm font-medium text-body-emphasis',
        disabled && 'cursor-not-allowed text-disabled',
        !disabled && 'cursor-pointer',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel ?? label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-[24px] w-[44px] shrink-0 items-center rounded-full p-[2px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
          checked ? 'bg-surface-primary' : 'bg-surface-control',
          disabled && 'opacity-60',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'block h-[20px] w-[20px] rounded-full bg-surface shadow-sm transition-transform',
            checked ? 'translate-x-[20px]' : 'translate-x-0',
          )}
        />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
