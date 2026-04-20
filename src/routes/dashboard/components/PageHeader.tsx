import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, actions, className }: PageHeaderProps) {
  return (
    <header className={cn('flex items-start justify-between gap-400', className)}>
      <div className="flex flex-col gap-100">
        <h1 className="font-serif text-h4 text-heading">{title}</h1>
        {subtitle && (
          <p className="font-sans text-body-sm text-muted">{subtitle}</p>
        )}
      </div>
      {actions}
    </header>
  );
}
