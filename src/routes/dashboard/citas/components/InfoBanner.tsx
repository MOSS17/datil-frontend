import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface InfoBannerProps {
  children: ReactNode;
  tone?: 'info' | 'warning';
  className?: string;
}

export function InfoBanner({ children, tone = 'info', className }: InfoBannerProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-300 rounded-md px-400 py-300',
        tone === 'info' && 'bg-surface-info-subtle',
        tone === 'warning' && 'bg-surface-warning-subtle',
        className,
      )}
    >
      <Info
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className={cn(
          'mt-25 shrink-0',
          tone === 'info' && 'text-icon-info',
          tone === 'warning' && 'text-icon-warning',
        )}
      />
      <p
        className={cn(
          'font-sans text-body-sm',
          tone === 'info' && 'text-info',
          tone === 'warning' && 'text-warning',
        )}
      >
        {children}
      </p>
    </div>
  );
}
