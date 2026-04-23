import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatPrice, formatPriceRange, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';

interface ExtraItemProps {
  extra: Service;
  selected: boolean;
  dimmed: boolean;
  onToggle: () => void;
}

export function ExtraItem({ extra, selected, dimmed, onToggle }: ExtraItemProps) {
  const priceLabel =
    extra.max_price && extra.max_price !== extra.min_price
      ? formatPriceRange(extra.min_price, extra.max_price)
      : formatPrice(extra.min_price);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      aria-label={selected ? `Quitar ${extra.name}` : `Agregar ${extra.name}`}
      className={cn(
        'flex w-full items-center gap-400 py-400 text-left transition-opacity',
        'focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2',
        dimmed && 'opacity-40',
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        <p className="font-sans text-body font-bold text-body-emphasis">{extra.name}</p>
        {extra.description ? (
          <p className="font-sans text-caption text-muted">{extra.description}</p>
        ) : null}
        <div className="flex items-center gap-200">
          <span className="font-sans text-body-sm text-primary-400">
            {formatDuration(extra.duration_minutes)}
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
    </button>
  );
}
