import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Reintentar',
  className,
}: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-start gap-400', className)}>
      <p className="font-sans text-body text-error">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        {retryLabel}
      </Button>
    </div>
  );
}
