import { useContext } from 'react';
import { BookingContext, type BookingContextValue } from './bookingContextValue';

export function useBookingSelection(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBookingSelection must be used within BookingProvider');
  return ctx;
}
