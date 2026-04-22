import { cn } from '@/lib/cn';

interface AllowMultipleToggleProps {
  value: boolean;
  onChange: (next: boolean) => void;
}

const OPTIONS: { value: boolean; label: string }[] = [
  { value: false, label: 'Solo Uno' },
  { value: true, label: 'Varios' },
];

export function AllowMultipleToggle({ value, onChange }: AllowMultipleToggleProps) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-300">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center justify-center rounded-md border px-600 py-300 font-sans text-body-sm font-medium text-primary transition-colors',
              active
                ? 'border-primary bg-surface-secondary'
                : 'border-default bg-surface hover:bg-surface-secondary-subtle',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
