import { cn } from '@/lib/cn';
import type { Category } from '@/api/types/categories';

export const ALL_TAB = '__all__';

interface CategoryTabsProps {
  categories: Category[];
  value: string;
  onChange: (next: string) => void;
}

export function CategoryTabs({ categories, value, onChange }: CategoryTabsProps) {
  const tabs = [{ id: ALL_TAB, name: 'Todos' }, ...categories.map((c) => ({ id: c.id, name: c.name }))];
  return (
    <div className="w-full border-b border-subtle">
      <div
        className="mx-auto flex w-full max-w-[1440px] items-center gap-0 overflow-x-auto px-600 md:justify-center md:px-1200"
        role="tablist"
      >
        {tabs.map((tab) => {
          const active = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative shrink-0 px-600 py-100 font-sans text-body transition-colors',
                active
                  ? 'font-bold text-primary'
                  : 'font-normal text-primary hover:text-primary-hover',
              )}
            >
              {tab.name}
              {active ? (
                <span
                  aria-hidden
                  className="absolute inset-x-600 -bottom-px block h-px bg-primary"
                />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
