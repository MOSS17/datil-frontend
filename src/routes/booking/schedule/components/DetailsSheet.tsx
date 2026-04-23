import { useEffect } from 'react';
import { Clock, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';

export interface DetailsSelection {
  id: string;
  service: Service;
  extras: Service[];
  duration: number;
  price: number;
}

interface DetailsSheetProps {
  open: boolean;
  onClose: () => void;
  selections: DetailsSelection[];
  location?: string | null;
  totalDuration: number;
  totalPrice: number;
  dateLine?: string;
  timeLine?: string;
}

export function DetailsSheet({
  open,
  onClose,
  selections,
  location,
  totalDuration,
  totalPrice,
  dateLine,
  timeLine,
}: DetailsSheetProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-surface-primary/25 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalles de tu reservación"
        className={cn(
          'fixed inset-x-0 bottom-0 top-[80px] z-50 flex flex-col bg-surface shadow-xl transition-transform duration-200',
          'rounded-t-xl md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[440px] md:rounded-none',
          open ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:translate-y-0',
        )}
      >
        <div className="flex items-start justify-end px-500 pt-500 md:px-600 md:pt-600">
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="inline-flex h-800 w-800 items-center justify-center rounded-md text-icon hover:bg-surface-secondary-subtle"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
        <header className="px-500 pb-500 text-center md:px-600 md:text-left">
          <h2 className="font-serif text-h5 text-heading md:text-h4">
            Detalles de tu Reservación
          </h2>
        </header>
        <div className="flex-1 overflow-y-auto px-500 pb-400 md:px-600">
          <section className="flex flex-col gap-300">
            <h3 className="font-sans text-body-sm text-muted">Servicios</h3>
            <ul className="flex flex-col">
              {selections.map((sel, index) => (
                <li
                  key={sel.id}
                  className={cn(
                    'flex flex-col gap-200 py-400',
                    index < selections.length - 1 && 'border-b border-default',
                  )}
                >
                  <div className="flex items-start justify-between gap-400">
                    <p className="min-w-0 flex-1 font-sans text-body font-bold text-body-emphasis">
                      {sel.service.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-200">
                      <span className="font-sans text-body-sm text-primary-400">
                        {formatDuration(sel.service.duration_minutes)}
                      </span>
                      <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
                      <span className="font-sans text-body-sm font-bold text-body-emphasis">
                        {formatPrice(sel.service.min_price)}
                      </span>
                    </div>
                  </div>
                  {sel.extras.map((extra) => (
                    <div
                      key={extra.id}
                      className="flex items-start justify-between gap-400 rounded-md border-l-[3px] border-accent bg-surface-secondary-subtle px-400 py-300"
                    >
                      <p className="min-w-0 flex-1 font-sans text-body-sm font-medium text-body-emphasis">
                        + {extra.name}
                      </p>
                      <span className="shrink-0 font-sans text-body-sm font-bold text-body-emphasis">
                        {formatPrice(extra.min_price)}
                      </span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </section>
          {dateLine || timeLine ? (
            <section className="flex flex-col gap-300 border-t border-default py-500">
              <h3 className="font-sans text-body-sm text-muted">Fecha y Hora</h3>
              {dateLine ? (
                <p className="font-sans text-body font-medium text-body-emphasis">
                  {dateLine}
                </p>
              ) : null}
              {timeLine ? (
                <p className="font-sans text-body font-medium text-body-emphasis">
                  {timeLine}
                </p>
              ) : null}
            </section>
          ) : null}
          {location ? (
            <section className="flex flex-col gap-200 border-t border-default py-500">
              <h3 className="font-sans text-body-sm text-muted">Lugar</h3>
              <p className="font-sans text-body font-medium text-body-emphasis">
                {location}
              </p>
            </section>
          ) : null}
        </div>
        <footer className="border-t border-default px-500 py-500 md:px-600">
          <div className="flex items-center justify-between">
            <p className="font-sans text-body-lg font-bold text-body-emphasis">Total</p>
            <p className="font-sans text-body-lg font-bold text-body-emphasis">
              {formatPrice(totalPrice)}
            </p>
          </div>
          <div className="flex items-center justify-between pt-200">
            <div className="flex items-center gap-200 font-sans text-body-sm text-primary-400">
              <Clock size={16} strokeWidth={1.75} aria-hidden />
              <span>Duración</span>
            </div>
            <p className="font-sans text-body-sm text-primary-400">
              {formatDuration(totalDuration)}
            </p>
          </div>
        </footer>
      </aside>
    </>
  );
}
