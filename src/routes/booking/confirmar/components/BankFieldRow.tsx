import { Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

interface BankFieldRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
  valueBold?: boolean;
  className?: string;
}

export function BankFieldRow({
  label,
  value,
  onCopy,
  valueBold = false,
  className,
}: BankFieldRowProps) {
  return (
    <div className={cn('flex flex-col gap-200', className)}>
      <p className="font-sans text-body-sm font-medium text-muted">{label}</p>
      <div className="flex items-center justify-between gap-300">
        <p
          className={cn(
            'truncate font-sans text-body text-body-emphasis',
            valueBold ? 'font-serif text-body-lg font-semibold' : 'font-medium',
          )}
        >
          {value}
        </p>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copiar ${label.toLowerCase()}`}
            className="inline-flex h-600 w-600 shrink-0 items-center justify-center rounded-sm text-icon hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
          >
            <Copy size={16} strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}
