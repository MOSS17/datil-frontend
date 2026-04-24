import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Appointment } from '@/api/types/appointments';
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
  start: string | null;
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
  if (typeof window === 'undefined') return { date: null, time: null, start: null };
  try {
    const raw = sessionStorage.getItem(scheduleKey(slug));
    if (!raw) return { date: null, time: null, start: null };
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return { date: null, time: null, start: null };
    }
    return {
      date: typeof parsed.date === 'string' ? parsed.date : null,
      time: typeof parsed.time === 'string' ? parsed.time : null,
      start: typeof parsed.start === 'string' ? parsed.start : null,
    };
  } catch {
    return { date: null, time: null, start: null };
  }
}

function generateId(): string {
  return `sel-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function selectionsFingerprint(selections: BookingSelection[]): string {
  return selections
    .map((s) => `${s.serviceId}:${[...s.extraIds].sort().join(',')}`)
    .sort()
    .join('|');
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
  const [reservedAppointment, setReservedAppointmentState] =
    useState<Appointment | null>(null);
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setSelections(readFromStorage(slug));
    setScheduleState(readSchedule(slug));
    setReservedAppointmentState(null);
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(storageKey(slug), JSON.stringify(selections));
  }, [slug, selections]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(scheduleKey(slug), JSON.stringify(schedule));
  }, [slug, schedule]);

  // When the cart changes, invalidate the picked time slot — its availability
  // query key depends on service_ids, so a stale scheduledStart would target
  // the old cart's duration.
  const fingerprint = selectionsFingerprint(selections);
  const [lastFingerprint, setLastFingerprint] = useState(fingerprint);
  if (fingerprint !== lastFingerprint) {
    setLastFingerprint(fingerprint);
    setScheduleState((prev) => ({ date: prev.date, time: null, start: null }));
  }

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
    setScheduleState({ date: null, time: null, start: null });
    setReservedAppointmentState(null);
  }, []);

  const countForService = useCallback(
    (serviceId: string) =>
      selections.filter((sel) => sel.serviceId === serviceId).length,
    [selections],
  );

  const setSchedule = useCallback(
    (date: string | null, time: string | null, start: string | null) => {
      setScheduleState({ date, time, start });
    },
    [],
  );

  const setReservedAppointment = useCallback((appt: Appointment | null) => {
    setReservedAppointmentState(appt);
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
      scheduledStart: schedule.start,
      setSchedule,
      reservedAppointment,
      setReservedAppointment,
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
      reservedAppointment,
      setReservedAppointment,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
