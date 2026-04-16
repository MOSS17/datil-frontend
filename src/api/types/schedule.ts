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
  type: PersonalTimeType;
  date: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

export interface CreatePersonalTimeRequest {
  type: PersonalTimeType;
  date?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  reason: string;
}
