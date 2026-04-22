import { cn } from '@/lib/cn';
import type { ServicesTab } from '../types';

interface ServiciosTabsProps {
  value: ServicesTab;
  onChange: (tab: ServicesTab) => void;
}

const TABS: { value: ServicesTab; label: string }[] = [
  { value: 'principales', label: 'Principales' },
  { value: 'complementos', label: 'Complementos' },
];

export function ServiciosTabs({ value, onChange }: ServiciosTabsProps) {
  return (
    <div role="tablist" className="flex items-center border-b border-subtle">
      {TABS.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex items-center justify-center px-600 py-100 font-sans text-body transition-colors',
              '-mb-px border-b',
              active
                ? 'border-primary font-semibold text-primary'
                : 'border-transparent text-primary hover:text-body-emphasis',
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
