import type { Appointment } from './appointments';

export interface DashboardData {
  today_count: number;
  week_count: number;
  monthly_income: number;
  upcoming: Appointment[];
  latest: Appointment[];
}
