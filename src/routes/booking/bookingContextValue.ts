import { createContext } from 'react';

export interface BookingSelection {
  id: string;
  serviceId: string;
  extraIds: string[];
}

export interface BookingContextValue {
  selections: BookingSelection[];
  addSelection: (serviceId: string, extraIds: string[]) => string;
  updateSelection: (id: string, extraIds: string[]) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  countForService: (serviceId: string) => number;
}

export const BookingContext = createContext<BookingContextValue | null>(null);
