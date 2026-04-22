import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import type { Category } from '@/api/types/categories';
import { cn } from '@/lib/cn';

interface ExtrasGroupSelectProps {
  label: string;
  options: Category[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ExtrasGroupSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Escribe para buscar un grupo de complementos',
  disabled,
}: ExtrasGroupSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selected = useMemo(
    () => value.map((id) => options.find((o) => o.id === id)).filter(Boolean) as Category[],
    [value, options],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((v) => v !== id));
    else onChange([...value, id]);
    setQuery('');
  };

  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="flex w-full flex-col gap-200">
      <span className="font-sans text-body-sm font-medium text-body-emphasis">{label}</span>
      <div ref={rootRef} className="relative">
        <div
          onClick={() => !disabled && setOpen(true)}
          className={cn(
            'flex min-h-[44px] w-full flex-wrap items-center gap-200 rounded-md border bg-surface px-300 py-200 transition-colors',
            open ? 'border-primary' : 'border-default',
            disabled && 'cursor-not-allowed bg-surface-disabled',
          )}
        >
          {selected.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-200 rounded-md bg-surface-secondary-subtle px-200 py-100 font-sans text-caption text-body-emphasis"
            >
              {cat.name}
              <button
                type="button"
                aria-label={`Quitar ${cat.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  remove(cat.id);
                }}
                className="inline-flex items-center justify-center text-icon-secondary hover:text-body-emphasis"
              >
                <X size={12} strokeWidth={1.75} aria-hidden />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder={selected.length === 0 ? placeholder : ''}
            disabled={disabled}
            className="min-w-[120px] flex-1 bg-transparent font-sans text-body-sm text-body-emphasis placeholder:text-placeholder focus:outline-none"
          />
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="shrink-0 text-muted"
          />
        </div>
        {open && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-10 mt-100 max-h-[240px] overflow-y-auto rounded-md border border-default bg-surface py-200 shadow-md"
          >
            {filtered.length === 0 ? (
              <li className="px-400 py-200 font-sans text-body-sm text-muted">
                No hay grupos disponibles
              </li>
            ) : (
              filtered.map((cat) => {
                const isSelected = value.includes(cat.id);
                return (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => toggle(cat.id)}
                      className={cn(
                        'flex w-full items-center justify-between gap-200 px-400 py-200 text-left font-sans text-body-sm',
                        isSelected
                          ? 'bg-surface-secondary-subtle text-body-emphasis'
                          : 'text-body hover:bg-surface-secondary-subtle',
                      )}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && (
                        <span className="font-sans text-caption text-muted">Seleccionado</span>
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
