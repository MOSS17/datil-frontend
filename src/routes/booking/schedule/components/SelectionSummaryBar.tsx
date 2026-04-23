import { formatPrice, formatDuration } from '@/lib/formatters';

interface SelectionSummaryBarProps {
  summaryLabel: string;
  totalDuration: number;
  totalPrice: number;
  onCancel: () => void;
}

export function SelectionSummaryBar({
  summaryLabel,
  totalDuration,
  totalPrice,
  onCancel,
}: SelectionSummaryBarProps) {
  return (
    <div className="w-full bg-surface-secondary">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-400 px-600 py-400 md:px-1200">
        <div className="flex min-w-0 items-center gap-200">
          <p className="truncate font-sans text-body-sm text-body-emphasis">
            {summaryLabel}
          </p>
          <span aria-hidden className="shrink-0 font-sans text-body-sm text-muted">•</span>
          <span className="shrink-0 font-sans text-body-sm text-primary-400">
            {formatDuration(totalDuration)}
          </span>
          <span aria-hidden className="shrink-0 font-sans text-body-sm text-muted">•</span>
          <span className="shrink-0 font-sans text-body-sm font-bold text-body-emphasis">
            {formatPrice(totalPrice)}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 font-sans text-body-sm font-medium text-primary hover:text-primary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
