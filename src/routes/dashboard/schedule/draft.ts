import type { Workday } from '@/api/types/schedule';
import type { DraftHour, DraftWorkday } from './types';

export function defaultHour(workdayId: string): DraftHour {
  return {
    _key: crypto.randomUUID(),
    id: '',
    workday_id: workdayId,
    start_time: '09:00',
    end_time: '17:00',
  };
}

export function toDraft(workdays: Workday[]): DraftWorkday[] {
  return workdays.map((w) => ({
    ...w,
    hours:
      w.hours.length > 0
        ? w.hours.map((h) => ({ ...h, _key: h.id }))
        : [defaultHour(w.id)],
  }));
}

export function toWorkdays(drafts: DraftWorkday[]): Workday[] {
  return drafts.map(({ hours, ...rest }) => ({
    ...rest,
    hours: hours.map(({ _key: _k, ...h }) => h),
  }));
}
