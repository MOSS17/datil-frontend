import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AppleConnectRequest,
  CalendarIntegration,
  GoogleAuthorizeResponse,
} from '@/api/types/calendar';
import type { CalendarProvider } from '@/lib/constants';

export function useConnectGoogle() {
  return useMutation({
    mutationFn: () =>
      apiClient<GoogleAuthorizeResponse>(ENDPOINTS.CALENDAR.GOOGLE_CONNECT, {
        method: 'POST',
      }),
    onSuccess: (res) => {
      window.location.assign(res.authorize_url);
    },
  });
}

export function useConnectApple() {
  return useMutation({
    mutationFn: (body: AppleConnectRequest) =>
      apiClient<CalendarIntegration>(ENDPOINTS.CALENDAR.APPLE_CONNECT, {
        method: 'POST',
        body,
      }),
  });
}

export function useDisconnectCalendar() {
  return useMutation({
    mutationFn: (provider: CalendarProvider) =>
      apiClient<void>(ENDPOINTS.CALENDAR.disconnect(provider), { method: 'DELETE' }),
  });
}
