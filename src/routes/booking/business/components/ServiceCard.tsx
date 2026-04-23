import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, formatPriceRange, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';

interface ServiceCardProps {
  service: Service;
  selectedCount: number;
  dimmed?: boolean;
  onClick: () => void;
}

export function ServiceCard({ service, selectedCount, dimmed = false, onClick }: ServiceCardProps) {
  const selected = selectedCount > 0;
  const priceLabel =
    service.max_price && service.max_price !== service.min_price
      ? formatPriceRange(service.min_price, service.max_price)
      : formatPrice(service.min_price);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Agregar ${service.name}`}
      className={cn(
        'flex w-full items-center gap-400 rounded-lg border border-default bg-surface px-800 py-400 text-left transition-colors',
        'hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
        dimmed && 'opacity-40',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        <p className="font-sans text-body font-bold text-body-emphasis">{service.name}</p>
        {service.description ? (
          <p className="font-sans text-caption text-muted">{service.description}</p>
        ) : null}
        <div className="flex items-center gap-200">
          <span className="font-sans text-body-sm text-primary-400">
            {formatDuration(service.duration_minutes)}
          </span>
          <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
          <span className="font-sans text-body-sm font-bold text-body-emphasis">
            {priceLabel}
          </span>
        </div>
      </div>
      <span
        aria-hidden
        className={cn(
          'flex h-800 w-800 shrink-0 items-center justify-center rounded-full',
          selected ? 'bg-surface-primary text-on-color' : 'bg-surface-secondary text-icon',
        )}
      >
        {selected ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={1.75} />}
      </span>
      {selectedCount > 1 ? (
        <span className="sr-only">{selectedCount} seleccionados</span>
      ) : null}
    </button>
  );
}
