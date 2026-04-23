import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface ReservationPreviewCardProps {
  summaryLabel: string;
  totalPrice: number;
  shortDate?: string;
  startTime?: string;
  onOpenDetails: () => void;
}

export function ReservationPreviewCard({
  summaryLabel,
  totalPrice,
  shortDate,
  startTime,
  onOpenDetails,
}: ReservationPreviewCardProps) {
  return (
    <article className="flex items-start gap-400 rounded-md border border-default bg-surface px-500 py-400">
      <div className="flex min-w-0 flex-1 flex-col gap-200">
        <p className="font-serif text-h6 text-body-emphasis">Tu Reservación</p>
        {summaryLabel ? (
          <p className="truncate font-sans text-body-sm font-medium text-muted">
            {summaryLabel}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-200 font-sans text-body-sm">
          {shortDate ? <span className="text-primary-400">{shortDate}</span> : null}
          {shortDate && startTime ? (
            <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
          ) : null}
          {startTime ? <span className="text-primary-400">{startTime}</span> : null}
          {(shortDate || startTime) && totalPrice > 0 ? (
            <span aria-hidden className="h-[4px] w-[4px] rounded-full bg-primary-400" />
          ) : null}
          {totalPrice > 0 ? (
            <span className="font-medium text-body-emphasis">{formatPrice(totalPrice)}</span>
          ) : null}
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenDetails}
        className="inline-flex shrink-0 items-center gap-100 rounded-sm bg-surface-secondary px-200 py-100 font-sans text-body-sm font-medium text-primary hover:bg-surface-control focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
      >
        <Info size={16} strokeWidth={1.75} aria-hidden />
        Detalles
      </button>
    </article>
  );
}
