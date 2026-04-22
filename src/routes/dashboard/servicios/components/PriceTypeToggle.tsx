import { cn } from '@/lib/cn';

type PriceType = 'fijo' | 'rango';

interface PriceTypeToggleProps {
  value: PriceType;
  onChange: (next: PriceType) => void;
}

const OPTIONS: { value: PriceType; label: string }[] = [
  { value: 'fijo', label: 'Fijo' },
  { value: 'rango', label: 'Rango' },
];

export function PriceTypeToggle({ value, onChange }: PriceTypeToggleProps) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-300">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
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
