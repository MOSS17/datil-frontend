import { useEffect, useMemo, useState } from 'react';

import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatPriceRange, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';
import { ExtraItem } from './ExtraItem';
import type { ExtraGroup } from '../selection';

interface ExtrasSheetProps {
  open: boolean;
  service: Service | null;
  extraGroups: ExtraGroup[];
  initialExtraIds?: string[];
  mode: 'add' | 'edit';
  onClose: () => void;
  onConfirm: (extraIds: string[]) => void;
}

export function ExtrasSheet({
  open,
  service,
  extraGroups,
  initialExtraIds,
  mode,
  onClose,
  onConfirm,
}: ExtrasSheetProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => initialExtraIds ?? []);
  const sessionKey = open && service ? `${service.id}:${(initialExtraIds ?? []).join(',')}` : null;
  const [lastKey, setLastKey] = useState<string | null>(sessionKey);
  if (sessionKey !== lastKey) {
    setLastKey(sessionKey);
    setSelectedIds(sessionKey === null ? [] : initialExtraIds ?? []);
  }

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const extrasById = useMemo(() => {
    const map = new Map<string, Service>();
    for (const group of extraGroups) {
      for (const extra of group.extras) map.set(extra.id, extra);
    }
    return map;
  }, [extraGroups]);

  const anySelected = selectedIds.length > 0;

  const totalPrice = useMemo(() => {
    if (!service) return 0;
    let total = service.min_price;
    for (const id of selectedIds) {
      const extra = extrasById.get(id);
      if (extra) total += extra.min_price;
    }
    return total;
  }, [service, selectedIds, extrasById]);

  const toggle = (extraId: string) => {
    setSelectedIds((prev) =>
      prev.includes(extraId) ? prev.filter((id) => id !== extraId) : [...prev, extraId],
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
  };

  const servicePriceLabel = service
    ? service.max_price && service.max_price !== service.min_price
      ? formatPriceRange(service.min_price, service.max_price)
      : formatPrice(service.min_price)
    : '';

  const ctaLabel =
    mode === 'edit'
      ? `Actualizar reserva ${formatPrice(totalPrice)}`
      : `Agregar a la reserva ${formatPrice(totalPrice)}`;

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
        aria-label={service ? `Complementos para ${service.name}` : 'Complementos'}
        className={cn(
          'fixed inset-x-0 bottom-0 top-[80px] z-50 flex flex-col bg-surface shadow-xl transition-transform duration-200',
          'rounded-t-xl md:inset-y-0 md:left-auto md:right-0 md:top-0 md:w-[400px] md:rounded-none',
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
        {service ? (
          <>
            <header className="flex flex-col items-center gap-200 px-500 pb-400 md:items-start md:px-600">
              <h2 className="text-center font-serif text-h5 text-heading md:text-left md:text-h4">
                {service.name}
              </h2>
              <div className="flex items-center gap-200">
                <span className="font-sans text-body-sm text-primary-400">
                  {formatDuration(service.duration_minutes)}
                </span>
                <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
                <span className="font-sans text-body-sm font-bold text-body-emphasis">
                  {servicePriceLabel}
                </span>
              </div>
              <p className="pt-400 text-center font-sans text-body text-body md:pt-200 md:text-left">
                Agrega un Complemento a tu Servicio
              </p>
            </header>
            <div className="flex-1 overflow-y-auto px-500 pb-400 md:px-600">
              {extraGroups.length === 0 ? (
                <p className="py-400 font-sans text-body-sm text-muted">
                  Este servicio no tiene complementos disponibles.
                </p>
              ) : (
                <div className="flex flex-col gap-400">
                  {extraGroups.map((group) => (
                    <div key={group.category.id} className="flex flex-col">
                      <h3 className="pb-200 font-serif text-h6 text-heading">
                        {group.category.name}
                      </h3>
                      <ul className="flex flex-col divide-y divide-border">
                        {group.extras.map((extra) => (
                          <li key={extra.id}>
                            <ExtraItem
                              extra={extra}
                              selected={selectedIds.includes(extra.id)}
                              dimmed={anySelected && !selectedIds.includes(extra.id)}
                              onToggle={() => toggle(extra.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <footer className="border-t border-subtle bg-surface px-500 py-400 md:px-600">
              <Button
                fullWidth
                onClick={handleConfirm}
                leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
              >
                {ctaLabel}
              </Button>
            </footer>
          </>
        ) : null}
      </aside>
    </>
  );
}
