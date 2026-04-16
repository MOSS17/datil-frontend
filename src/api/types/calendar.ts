import type { CalendarProvider } from '@/lib/constants';

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: CalendarProvider;
  connected_at: string;
}
