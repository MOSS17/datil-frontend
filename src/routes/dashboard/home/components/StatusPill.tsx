import { BellRing } from 'lucide-react';
import { cn } from '@/lib/cn';

type Kind = 'in-progress' | 'next' | 'new';

interface StatusPillProps {
  kind: Kind;
}

const styles: Record<Kind, string> = {
  'in-progress': 'bg-surface-warning-subtle text-warning',
  next: 'bg-surface-info-subtle text-info',
  new: 'bg-surface-accent-subtle text-accent',
};

const labels: Record<Kind, string> = {
  'in-progress': 'En curso',
  next: 'A continuación',
  new: 'Nueva',
};

export function StatusPill({ kind }: StatusPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-100 rounded-full px-200 py-50 font-sans text-caption font-medium whitespace-nowrap',
        styles[kind],
      )}
    >
      {kind === 'new' && <BellRing aria-hidden size={10} strokeWidth={1.75} />}
      {labels[kind]}
    </span>
  );
}
