import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookingContext,
  type BookingContextValue,
  type BookingSelection,
} from './bookingContextValue';

const storageKey = (slug: string) => `datil:booking:${slug}`;
const scheduleKey = (slug: string) => `datil:booking:${slug}:schedule`;

interface StoredSchedule {
  date: string | null;
  time: string | null;
}

function readFromStorage(slug: string): BookingSelection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(storageKey(slug));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'string' &&
        typeof item.serviceId === 'string' &&
        Array.isArray(item.extraIds),
    );
  } catch {
    return [];
  }
}

function readSchedule(slug: string): StoredSchedule {
  if (typeof window === 'undefined') return { date: null, time: null };
  try {
    const raw = sessionStorage.getItem(scheduleKey(slug));
    if (!raw) return { date: null, time: null };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return { date: null, time: null };
    return {
      date: typeof parsed.date === 'string' ? parsed.date : null,
      time: typeof parsed.time === 'string' ? parsed.time : null,
    };
  } catch {
    return { date: null, time: null };
  }
}

function generateId(): string {
  return `sel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

interface BookingProviderProps {
  slug: string;
  children: ReactNode;
}

export function BookingProvider({ slug, children }: BookingProviderProps) {
  const [selections, setSelections] = useState<BookingSelection[]>(() =>
    readFromStorage(slug),
  );
  const [schedule, setScheduleState] = useState<StoredSchedule>(() => readSchedule(slug));
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setSelections(readFromStorage(slug));
    setScheduleState(readSchedule(slug));
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(storageKey(slug), JSON.stringify(selections));
  }, [slug, selections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(scheduleKey(slug), JSON.stringify(schedule));
  }, [slug, schedule]);

  const addSelection = useCallback((serviceId: string, extraIds: string[]) => {
    const id = generateId();
    setSelections((prev) => [...prev, { id, serviceId, extraIds }]);
    return id;
  }, []);

  const updateSelection = useCallback((id: string, extraIds: string[]) => {
    setSelections((prev) =>
      prev.map((sel) => (sel.id === id ? { ...sel, extraIds } : sel)),
    );
  }, []);

  const removeSelection = useCallback((id: string) => {
    setSelections((prev) => prev.filter((sel) => sel.id !== id));
  }, []);

  const clearSelections = useCallback(() => {
    setSelections([]);
    setScheduleState({ date: null, time: null });
  }, []);

  const countForService = useCallback(
    (serviceId: string) =>
      selections.filter((sel) => sel.serviceId === serviceId).length,
    [selections],
  );

  const setSchedule = useCallback((date: string | null, time: string | null) => {
    setScheduleState({ date, time });
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({
      selections,
      addSelection,
      updateSelection,
      removeSelection,
      clearSelections,
      countForService,
      scheduledDate: schedule.date,
      scheduledTime: schedule.time,
      setSchedule,
    }),
    [
      selections,
      addSelection,
      updateSelection,
      removeSelection,
      clearSelections,
      countForService,
      schedule,
      setSchedule,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
