import { useCallback, useEffect, useState } from 'react';
import type { Workday } from '@/api/types/schedule';
import type { DraftWorkday } from './types';
import { defaultHour, toDraft } from './draft';

export function useWorkdayDraft(data: Workday[] | undefined) {
  const [draft, setDraft] = useState<DraftWorkday[]>([]);

  useEffect(() => {
    if (data) setDraft(toDraft(data));
  }, [data]);

  const updateDay = useCallback(
    (day: number, updater: (d: DraftWorkday) => DraftWorkday) => {
      setDraft((prev) => prev.map((d) => (d.day === day ? updater(d) : d)));
    },
    [],
  );

  const toggleDay = useCallback(
    (day: number) => {
      updateDay(day, (d) => ({ ...d, is_enabled: !d.is_enabled }));
    },
    [updateDay],
  );

  const changeHour = useCallback(
    (day: number, key: string, field: 'start_time' | 'end_time', value: string) => {
      updateDay(day, (d) => ({
        ...d,
        hours: d.hours.map((h) => (h._key === key ? { ...h, [field]: value } : h)),
      }));
    },
    [updateDay],
  );

  const addHour = useCallback(
    (day: number, workdayId: string) => {
      updateDay(day, (d) => ({
        ...d,
        hours: [...d.hours, defaultHour(workdayId)],
      }));
    },
    [updateDay],
  );

  const removeHour = useCallback(
    (day: number, key: string) => {
      updateDay(day, (d) => ({
        ...d,
        hours: d.hours.filter((h) => h._key !== key),
      }));
    },
    [updateDay],
  );

  return { draft, toggleDay, changeHour, addHour, removeHour };
}
