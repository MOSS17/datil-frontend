import { useEffect } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

export type ToastVariant = 'success' | 'error';

interface ToastProps {
  open: boolean;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose: () => void;
}

export function Toast({
  open,
  message,
  variant = 'success',
  duration = 3500,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(t);
  }, [open, duration, onClose]);

  const Icon = variant === 'success' ? Check : AlertCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed bottom-[24px] left-1/2 z-50 -translate-x-1/2 transition-opacity duration-200',
        'md:bottom-[32px]',
        open ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-200 rounded-md px-400 py-300 shadow-sm',
          variant === 'success' && 'bg-surface-secondary',
          variant === 'error' && 'bg-surface-error-subtle',
        )}
      >
        <Icon
          size={16}
          strokeWidth={1.75}
          aria-hidden
          className={cn(
            variant === 'success' && 'text-icon-primary',
            variant === 'error' && 'text-error',
          )}
        />
        <p className="font-sans text-body-sm font-medium text-body-emphasis">{message}</p>
      </div>
    </div>
  );
}
