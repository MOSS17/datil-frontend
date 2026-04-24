import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  GoogleAuthorizeResponse,
  IcsConnection,
} from '@/api/types/calendar';

export const calendarKeys = {
  ics: ['calendar', 'ics'] as const,
};

// No GET endpoint exists yet for calendar integrations. ICS connection
// state lives in the query cache, written by the mutations below. A page
// reload drops it back to "disconnected"; the user can re-click Conectar
// and the backend (idempotent) hands back the same URL. Follow-up: real
// GET so state survives reloads.
export function useIcsConnection() {
  return useQuery<IcsConnection | null>({
    queryKey: calendarKeys.ics,
    queryFn: () => Promise.resolve(null),
    enabled: false,
    initialData: null,
    staleTime: Infinity,
  });
}

export function useConnectIcs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<IcsConnection>(ENDPOINTS.CALENDAR.ICS_CONNECT, { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(calendarKeys.ics, data);
      // Trigger the OS Subscribe dialog. No-ops on platforms without a
      // webcal:// handler — connected state is still set above so the
      // user can grab the HTTPS url from "Más opciones".
      window.location.href = data.webcal_url;
    },
  });
}

export function useRotateIcsToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<IcsConnection>(ENDPOINTS.CALENDAR.ICS_ROTATE, { method: 'POST' }),
    onSuccess: (data) => {
      qc.setQueryData(calendarKeys.ics, data);
    },
  });
}

export function useDisconnectIcs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiClient<void>(ENDPOINTS.CALENDAR.ICS_DISCONNECT, { method: 'DELETE' }),
    onSuccess: () => {
      qc.setQueryData(calendarKeys.ics, null);
    },
  });
}

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

export function useDisconnectGoogle() {
  return useMutation({
    mutationFn: () =>
      apiClient<void>(ENDPOINTS.CALENDAR.GOOGLE_DISCONNECT, { method: 'DELETE' }),
  });
}
