import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Padding = 'none' | '400' | '500' | '600' | '800';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: Padding;
  noBorder?: boolean;
}

const paddingClasses: Record<Padding, string> = {
  none: 'p-0',
  '400': 'p-400',
  '500': 'p-500',
  '600': 'p-600',
  '800': 'p-800',
};

export function Card({
  padding = '600',
  noBorder = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-surface',
        !noBorder && 'border border-default',
        paddingClasses[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
