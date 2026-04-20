import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

const roundedClasses: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
};

export function Skeleton({ rounded = 'md', className, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse bg-neutral-50', roundedClasses[rounded], className)}
      {...rest}
    />
  );
}
