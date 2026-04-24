import { ChevronDown, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface ServiceOption {
  id: string;
  name: string;
  isExtra?: boolean;
}

interface ServiceChipsSelectProps {
  label: string;
  options: ServiceOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ServiceChipsSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Selecciona servicios',
  disabled,
}: ServiceChipsSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(
    () => value.map((v) => options.find((o) => o.id === v)).filter(Boolean) as ServiceOption[],
    [value, options],
  );

  useEffect(() => {
    if (!open) return;
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
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-10 mt-100 max-h-[240px] overflow-y-auto rounded-md border border-default bg-surface py-200 shadow-md"
          >
            {options.length === 0 && (
              <li className="px-400 py-200 font-sans text-body-sm text-muted">
                No hay servicios disponibles
              </li>
            )}
            {options.map((o) => {
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
                      'flex w-full items-center gap-200 px-400 py-200 text-left font-sans text-body-sm',
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
        )}
      </div>
      {error && <p className="font-sans text-caption text-error">{error}</p>}
    </div>
  );
}
