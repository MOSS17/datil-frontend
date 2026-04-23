import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  BookingContext,
  type BookingContextValue,
  type BookingSelection,
} from './bookingContextValue';

const storageKey = (slug: string) => `datil:booking:${slug}`;

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
  const [lastSlug, setLastSlug] = useState(slug);
  if (slug !== lastSlug) {
    setLastSlug(slug);
    setSelections(readFromStorage(slug));
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(storageKey(slug), JSON.stringify(selections));
  }, [slug, selections]);

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
  }, []);

  const countForService = useCallback(
    (serviceId: string) =>
      selections.filter((sel) => sel.serviceId === serviceId).length,
    [selections],
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      selections,
      addSelection,
      updateSelection,
      removeSelection,
      clearSelections,
      countForService,
    }),
    [selections, addSelection, updateSelection, removeSelection, clearSelections, countForService],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
