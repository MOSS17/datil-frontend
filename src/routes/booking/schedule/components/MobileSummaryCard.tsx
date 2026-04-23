import { Info } from 'lucide-react';
import { formatPrice } from '@/lib/formatters';

interface MobileSummaryCardProps {
  summaryLabel: string;
  totalPrice: number;
  onOpenDetails: () => void;
}

export function MobileSummaryCard({
  summaryLabel,
  totalPrice,
  onOpenDetails,
}: MobileSummaryCardProps) {
  return (
    <article className="flex items-start gap-400 rounded-lg border border-default bg-surface p-400">
      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <p className="font-sans text-body font-bold text-body-emphasis">Tu Reservación</p>
        <p className="truncate font-sans text-body-sm text-muted">{summaryLabel}</p>
        <p className="font-sans text-body-sm font-bold text-body-emphasis">
          {formatPrice(totalPrice)}
        </p>
      </div>
      <button
        type="button"
        onClick={onOpenDetails}
        className="inline-flex shrink-0 items-center gap-100 rounded-md bg-surface-secondary px-300 py-200 font-sans text-body-sm font-medium text-body-emphasis hover:bg-surface-control focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
      >
        <Info size={14} strokeWidth={1.75} aria-hidden />
        Detalles
      </button>
    </article>
  );
}
