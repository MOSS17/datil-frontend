import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';

interface MetricCardProps {
  icon: ReactNode;
  label: string;
  labelMobile?: string;
  meta: string;
  metaMobile?: string;
  value: string;
  caption?: string;
}

export function MetricCard({
  icon,
  label,
  labelMobile,
  meta,
  metaMobile,
  value,
  caption,
}: MetricCardProps) {
  const mobileLabel = labelMobile ?? label;
  const mobileMeta = metaMobile ?? meta;

  return (
    <Card
      padding="none"
      className="flex flex-1 min-w-0 flex-col self-stretch"
    >
      <div className="flex flex-col items-start px-300 py-200 md:hidden">
        <p className="font-serif text-h6 text-heading">{value}</p>
        <p className="font-sans text-caption font-medium text-primary-400">
          {mobileLabel}
        </p>
        <p className="font-sans text-caption text-accent">{mobileMeta}</p>
      </div>
      <div className="hidden flex-col gap-200 p-500 md:flex">
        <div className="flex items-center justify-between gap-200">
          <div className="flex items-center gap-200 min-w-0">
            <span className="shrink-0 text-icon" aria-hidden>
              {icon}
            </span>
            <span className="font-sans text-body-sm font-medium text-primary truncate">
              {label}
            </span>
          </div>
          <span className="font-sans text-body-sm font-semibold text-accent whitespace-nowrap">
            {meta}
          </span>
        </div>
        <p className="font-serif text-h4 text-heading">{value}</p>
        {caption && <p className="font-sans text-caption text-muted">{caption}</p>}
      </div>
    </Card>
  );
}
