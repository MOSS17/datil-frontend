export interface DraftHour {
  _key: string;
  id: string;
  workday_id: string;
  start_time: string;
  end_time: string;
}

export interface DraftWorkday {
  id: string;
  business_id: string;
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  is_enabled: boolean;
  hours: DraftHour[];
}
