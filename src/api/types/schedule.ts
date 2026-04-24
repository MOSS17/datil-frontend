import type { PersonalTimeType } from '@/lib/constants';

export interface WorkHour {
  id: string;
  workday_id: string;
  start_time: string;
  end_time: string;
}

export interface Workday {
  id: string;
  business_id: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  is_enabled: boolean;
  hours: WorkHour[];
}

export interface PersonalTime {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  // Backend schema doesn't persist start/end clock times for full-day or
  // date-range blocks — they're only set for the `hours` variant.
  start_time?: string;
  end_time?: string;
  // Derived client-side from the date/time columns above. The backend has
  // no columns for these, so they don't round-trip.
  type?: PersonalTimeType;
  date?: string;
  reason?: string;
}

export interface CreatePersonalTimeRequest {
  type: PersonalTimeType;
  date?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  reason?: string;
}
