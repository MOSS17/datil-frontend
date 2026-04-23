import { Pencil, X } from 'lucide-react';
import { formatPrice, formatPriceRange, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';

interface SelectionItemProps {
  service: Service;
  extras: Service[];
  onEdit?: () => void;
  onRemove: () => void;
}

export function SelectionItem({ service, extras, onEdit, onRemove }: SelectionItemProps) {
  const priceLabel =
    service.max_price && service.max_price !== service.min_price
      ? formatPriceRange(service.min_price, service.max_price)
      : formatPrice(service.min_price);

  return (
    <article className="flex flex-col gap-400 py-400">
      <div className="flex flex-col gap-200 md:flex-row md:items-start md:justify-between md:gap-400">
        <div className="flex min-w-0 flex-1 flex-col gap-200">
          <p className="font-sans text-body font-bold text-body-emphasis">{service.name}</p>
          {service.description ? (
            <p className="font-sans text-caption text-muted">{service.description}</p>
          ) : null}
          <div className="flex items-center gap-400 pt-200">
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-100 font-sans text-body-sm text-primary-400 hover:text-primary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
            >
              <X size={16} strokeWidth={1.75} aria-hidden />
              Eliminar
            </button>
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-100 font-sans text-body-sm text-primary-400 hover:text-primary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
              >
                <Pencil size={16} strokeWidth={1.75} aria-hidden />
                Editar
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-200 md:pt-100">
          <span className="font-sans text-body-sm text-primary-400">
            {formatDuration(service.duration_minutes)}
          </span>
          <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
          <span className="font-sans text-body-sm font-bold text-body-emphasis">
            {priceLabel}
          </span>
        </div>
      </div>
      {extras.length > 0 ? (
        <div className="flex flex-col gap-200">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="flex items-start gap-400 rounded-md border-l-[3px] border-accent bg-surface-secondary-subtle px-400 py-300"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-100">
                <p className="font-sans text-body-sm font-bold text-body-emphasis">
                  {extra.name}
                </p>
                {extra.description ? (
                  <p className="font-sans text-caption text-muted">{extra.description}</p>
                ) : null}
              </div>
              <span className="shrink-0 font-sans text-body-sm font-bold text-body-emphasis">
                +{formatPrice(extra.min_price)}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
