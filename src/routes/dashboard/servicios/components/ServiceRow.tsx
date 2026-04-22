import { Pencil } from 'lucide-react';
import type { Service } from '@/api/types/services';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/cn';

interface ServiceRowProps {
  service: Service;
  isExtras: boolean;
  isLast: boolean;
  onEdit?: () => void;
}

export function ServiceRow({ service, isExtras, isLast, onEdit }: ServiceRowProps) {
  const durationLabel =
    isExtras && service.duration_minutes === 0
      ? 'No Aumenta Duración'
      : `${service.duration_minutes} min`;
  const inactive = !service.is_active;

  return (
    <div
      className={cn(
        'flex flex-col gap-100 bg-surface-secondary-subtle px-600 py-400 md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)_minmax(0,0.9fr)_minmax(0,0.6fr)_auto] md:items-center md:gap-600 md:px-800',
        !isLast && 'border-b border-default',
      )}
    >
      <div className="flex items-center gap-200">
        <p
          className={cn(
            'font-sans text-body font-semibold',
            inactive ? 'text-disabled' : 'text-body-emphasis',
          )}
        >
          {service.name}
        </p>
        {inactive && (
          <span className="inline-flex items-center rounded-full bg-surface-disabled px-200 py-25 font-sans text-caption font-medium text-muted">
            No Disponible
          </span>
        )}
      </div>
      <p className={cn('font-sans text-caption', inactive ? 'text-disabled' : 'text-body')}>
        {service.description}
      </p>
      <p
        className={cn(
          'order-3 font-sans text-body-sm md:text-left',
          inactive ? 'text-disabled' : 'text-body',
        )}
      >
        {durationLabel}
      </p>
      <p
        className={cn(
          'order-4 font-sans text-body-sm font-semibold md:text-left',
          inactive ? 'text-disabled' : 'text-body-emphasis',
        )}
      >
        {formatPrice(service.min_price)}
      </p>
      <button
        type="button"
        aria-label={`Editar ${service.name}`}
        onClick={onEdit}
        className="order-5 inline-flex h-700 w-700 items-center justify-center self-end rounded-md text-icon hover:bg-surface md:self-center"
      >
        <Pencil size={16} strokeWidth={1.75} aria-hidden />
      </button>
    </div>
  );
}
