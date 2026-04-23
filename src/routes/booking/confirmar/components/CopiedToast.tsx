import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

interface CopiedToastProps {
  message: string;
  visible: boolean;
}

export function CopiedToast({ message, visible }: CopiedToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed left-1/2 z-50 -translate-x-1/2 transition-opacity duration-200',
        'bottom-[120px] md:bottom-auto md:left-auto md:right-1200 md:top-[88px] md:translate-x-0',
        visible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <div className="flex items-center gap-200 rounded-md bg-surface-secondary px-400 py-300 shadow-sm">
        <Check size={16} strokeWidth={1.75} aria-hidden className="text-icon-primary" />
        <p className="font-sans text-body-sm font-medium text-body-emphasis">{message}</p>
      </div>
    </div>
  );
}
