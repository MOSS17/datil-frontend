import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

function normalize(s: string) {
  return s
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export interface ServiceOption {
  id: string;
  name: string;
  isExtra?: boolean;
  categoryId?: string;
}

export interface ServiceCategoryGroup {
  id: string;
  name: string;
}

interface ServiceChipsSelectProps {
  label: string;
  options: ServiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  /**
   * Optional ordered list of categories. When provided, options are grouped
   * by `categoryId` under each category's name. Options without a matching
   * category fall under a "Sin categoría" group at the end.
   */
  categories?: ServiceCategoryGroup[];
}

export function ServiceChipsSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Selecciona servicios',
  disabled,
  categories,
}: ServiceChipsSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const selected = useMemo(
    () => value.map((v) => options.find((o) => o.id === v)).filter(Boolean) as ServiceOption[],
    [value, options],
  );

  useEffect(() => {
    if (!open) {
      setSearch('');
      return;
    }
    // Focus search input when dropdown opens.
    const timer = window.setTimeout(() => searchRef.current?.focus(), 0);
    const handlePointer = (e: MouseEvent | TouchEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('touchstart', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('touchstart', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const hasMainSelected = useMemo(
    () => selected.some((s) => !s.isExtra),
    [selected],
  );

  const toggle = (optId: string) => {
    const opt = options.find((o) => o.id === optId);
    if (!opt) return;
    const isSelected = value.includes(optId);

    if (isSelected) {
      const next = value.filter((v) => v !== optId);
      // If removing the last main service, also drop all complementos.
      if (!opt.isExtra) {
        const stillHasMain = next.some(
          (id) => !options.find((o) => o.id === id)?.isExtra,
        );
        if (!stillHasMain) {
          onChange(next.filter((id) => !options.find((o) => o.id === id)?.isExtra));
          return;
        }
      }
      onChange(next);
      return;
    }

    // Adding: block complementos when no main service is selected.
    if (opt.isExtra && !hasMainSelected) return;
    onChange([...value, optId]);
  };

  const grouped = useMemo(() => {
    const q = normalize(search.trim());
    const matchesService = (o: ServiceOption, categoryName?: string) => {
      if (!q) return true;
      if (normalize(o.name).includes(q)) return true;
      if (categoryName && normalize(categoryName).includes(q)) return true;
      return false;
    };

    if (!categories || categories.length === 0) {
      return [
        { id: '__all__', name: '', options: options.filter((o) => matchesService(o)) },
      ].filter((g) => g.options.length > 0);
    }
    const buckets = new Map<string, ServiceOption[]>();
    for (const c of categories) buckets.set(c.id, []);
    const uncategorized: ServiceOption[] = [];
    for (const o of options) {
      const bucket = o.categoryId ? buckets.get(o.categoryId) : undefined;
      if (bucket) bucket.push(o);
      else uncategorized.push(o);
    }
    const groups = categories
      .map((c) => ({
        id: c.id,
        name: c.name,
        options: (buckets.get(c.id) ?? []).filter((o) => matchesService(o, c.name)),
      }))
      .filter((g) => g.options.length > 0);
    const filteredUncategorized = uncategorized.filter((o) =>
      matchesService(o, 'Sin categoría'),
    );
    if (filteredUncategorized.length > 0) {
      groups.push({
        id: '__uncategorized__',
        name: 'Sin categoría',
        options: filteredUncategorized,
      });
    }
    return groups;
  }, [options, categories, search]);

  const remove = (optId: string) => {
    const opt = options.find((o) => o.id === optId);
    const next = value.filter((v) => v !== optId);
    // If removing the last main service, also drop all complementos.
    if (opt && !opt.isExtra) {
      const stillHasMain = next.some(
        (id) => !options.find((o) => o.id === id)?.isExtra,
      );
      if (!stillHasMain) {
        onChange(next.filter((id) => !options.find((o) => o.id === id)?.isExtra));
        return;
      }
    }
    onChange(next);
  };

  return (
    <div className="flex w-full flex-col gap-200">
      <label
        htmlFor={id}
        className="font-sans text-body-sm font-medium text-body-emphasis"
      >
        {label}
      </label>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          id={id}
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-invalid={error ? true : undefined}
          className={cn(
            'flex min-h-[44px] w-full items-center justify-between gap-200 rounded-md border bg-surface px-300 py-200 text-left transition-colors focus:outline-none',
            error ? 'border-error' : 'border-default',
            open && 'border-primary',
            disabled && 'cursor-not-allowed bg-surface-disabled text-disabled',
          )}
        >
          <div className="flex flex-wrap items-center gap-200">
            {selected.length === 0 ? (
              <span className="font-sans text-body-sm text-placeholder">{placeholder}</span>
            ) : (
              selected.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-200 rounded-md bg-surface-secondary-subtle px-200 py-100 font-sans text-caption text-body-emphasis"
                >
                  {s.name}
                  <button
                    type="button"
                    aria-label={`Quitar ${s.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(s.id);
                    }}
                    className="inline-flex items-center justify-center text-icon-secondary hover:text-body-emphasis"
                  >
                    <X size={12} strokeWidth={1.75} aria-hidden />
                  </button>
                </span>
              ))
            )}
          </div>
          <ChevronDown
            size={16}
            strokeWidth={1.75}
            aria-hidden
            className="shrink-0 text-muted"
          />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-full z-10 mt-100 flex max-h-[320px] flex-col rounded-md border border-default bg-surface shadow-md">
            <div className="flex items-center gap-200 border-b border-subtle px-300 py-200">
              <Search
                aria-hidden
                size={16}
                strokeWidth={1.75}
                className="shrink-0 text-icon-secondary"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar servicio..."
                aria-label="Buscar servicio"
                className="w-full bg-transparent font-sans text-body-sm text-body-emphasis placeholder:text-placeholder focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Borrar búsqueda"
                  onClick={() => {
                    setSearch('');
                    searchRef.current?.focus();
                  }}
                  className="inline-flex items-center justify-center text-icon-secondary hover:text-body-emphasis"
                >
                  <X size={14} strokeWidth={1.75} aria-hidden />
                </button>
              )}
            </div>
            <ul role="listbox" className="flex-1 overflow-y-auto py-200">
            {options.length === 0 && (
              <li className="px-400 py-200 font-sans text-body-sm text-muted">
                No hay servicios disponibles
              </li>
            )}
            {options.length > 0 && grouped.length === 0 && (
              <li className="px-400 py-200 font-sans text-body-sm text-muted">
                No se encontraron servicios
              </li>
            )}
            {grouped.map((group, groupIndex) => (
              <li key={group.id}>
                {group.name && (
                  <div
                    role="presentation"
                    className={cn(
                      'px-400 pb-100 pt-200 font-sans text-caption font-semibold uppercase tracking-wide text-muted',
                      groupIndex > 0 && 'border-t border-subtle mt-200',
                    )}
                  >
                    {group.name}
                  </div>
                )}
                <ul role="group" aria-label={group.name || undefined}>
                  {group.options.map((o) => {
                    const isSelected = value.includes(o.id);
                    const isBlocked = !!o.isExtra && !hasMainSelected;
                    return (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={() => toggle(o.id)}
                          disabled={isBlocked}
                          aria-disabled={isBlocked}
                          title={isBlocked ? 'Selecciona un servicio primero' : undefined}
                          className={cn(
                            'flex w-full items-center gap-200 py-200 pr-400 text-left font-sans text-body-sm',
                            group.name ? 'pl-600' : 'pl-400',
                            isBlocked
                              ? 'cursor-not-allowed text-disabled'
                              : isSelected
                                ? 'bg-surface-secondary-subtle text-body-emphasis'
                                : 'text-body hover:bg-surface-secondary-subtle',
                          )}
                        >
                          <span className="flex-1 truncate">{o.name}</span>
                          {o.isExtra && (
                            <span className="font-sans text-caption text-muted">Complemento</span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            </ul>
          </div>
        )}
      </div>
      {error && <p className="font-sans text-caption text-error">{error}</p>}
    </div>
  );
}
