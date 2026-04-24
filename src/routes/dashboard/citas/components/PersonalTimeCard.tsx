import { MessageCircleHeart } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { PersonalTime } from '@/api/types/schedule';
import { formatTimeShort, MONTH_NAMES_ES } from '../utils';

interface PersonalTimeCardProps {
  personalTime: PersonalTime;
  className?: string;
}

export function PersonalTimeCard({ personalTime, className }: PersonalTimeCardProps) {
  const hasHours = Boolean(personalTime.start_time && personalTime.end_time);

  let dateLabel = '';
  if (personalTime.date) {
    const d = new Date(`${personalTime.date}T00:00:00`);
    dateLabel = `${d.getDate()} de ${MONTH_NAMES_ES[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
  }

  let timeLabel = '';
  if (hasHours && personalTime.start_time && personalTime.end_time) {
    const [sh, sm] = personalTime.start_time.split(':').map(Number);
    const [eh, em] = personalTime.end_time.split(':').map(Number);
    const start = new Date();
    start.setHours(sh, sm, 0, 0);
    const end = new Date();
    end.setHours(eh, em, 0, 0);
    timeLabel = `${formatTimeShort(start)} – ${formatTimeShort(end)}`;
  }

  return (
    <div
      className={cn(
        'relative flex h-full min-h-0 flex-col gap-100 overflow-hidden rounded-sm bg-surface-control pl-400 pr-300 py-200 font-sans',
        className,
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-surface-disabled-emphasis" />
      <MessageCircleHeart
        size={16}
        strokeWidth={1.75}
        aria-hidden
        className="shrink-0 text-icon-secondary"
      />
      <p className="truncate text-body-sm font-semibold text-muted">Tiempo Personal</p>
      {timeLabel && <p className="text-caption text-muted">{timeLabel}</p>}
      {dateLabel && !timeLabel && <p className="text-caption text-muted">{dateLabel}</p>}
    </div>
  );
}
