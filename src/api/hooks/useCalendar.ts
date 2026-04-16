import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { CalendarIntegration } from '@/api/types/calendar';

export const calendarKeys = {
  all: ['calendar-integrations'] as const,
};

export function useCalendarIntegrations() {
  return useQuery({
    queryKey: calendarKeys.all,
    queryFn: () => apiClient<CalendarIntegration[]>(ENDPOINTS.CALENDAR),
  });
}

export function useConnectCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: string) =>
      apiClient<CalendarIntegration>(ENDPOINTS.CALENDAR, { method: 'POST', body: { provider } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}

export function useDisconnectCalendar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${ENDPOINTS.CALENDAR}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: calendarKeys.all }),
  });
}
