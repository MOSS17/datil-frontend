import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Appointment } from '@/api/types/appointments';
import type { DashboardData } from '@/api/types/dashboard';
import { dashboardKeys } from './useDashboard';

export interface UseAppointmentsOptions {
  from?: string;
  to?: string;
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (opts: UseAppointmentsOptions) => [...appointmentKeys.all, 'list', opts] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
  unseenCount: () => [...appointmentKeys.all, 'unseen-count'] as const,
};

function buildQuery(opts: UseAppointmentsOptions): string {
  const params = new URLSearchParams();
  if (opts.from) params.set('from', opts.from);
  if (opts.to) params.set('to', opts.to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function useAppointments(opts: UseAppointmentsOptions = {}) {
  return useQuery({
    queryKey: appointmentKeys.list(opts),
    queryFn: () =>
      apiClient<Appointment[]>(`${ENDPOINTS.APPOINTMENTS}${buildQuery(opts)}`),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}`),
  });
}

export interface CreateAppointmentInput {
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  start_time: string;
  end_time?: string;
  service_ids: string[];
  extra_ids?: string[];
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppointmentInput) =>
      apiClient<Appointment>(ENDPOINTS.APPOINTMENTS, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.unseenCount() });
    },
  });
}

export interface UpdateAppointmentInput {
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  start_time: string;
  end_time: string;
  total: number;
  service_ids: string[];
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppointmentInput }) =>
      apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}/status`, {
        method: 'PUT',
        body: { status },
      }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUploadPaymentProof() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('payment_proof', file);
      return apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${ENDPOINTS.APPOINTMENTS}/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.unseenCount() });
    },
  });
}

export function useUnseenCount() {
  return useQuery({
    queryKey: appointmentKeys.unseenCount(),
    queryFn: () =>
      apiClient<{ count: number }>(ENDPOINTS.APPOINTMENTS_UNSEEN_COUNT),
    select: (data) => data.count,
  });
}

interface MarkSeenContext {
  dashboardSnapshots: Array<[readonly unknown[], DashboardData | undefined]>;
  listSnapshots: Array<[readonly unknown[], Appointment[] | undefined]>;
  detailSnapshot: Appointment | undefined;
  unseenCountSnapshot: { count: number } | undefined;
  wasUnseen: boolean;
}

export function useMarkAppointmentSeen() {
  const queryClient = useQueryClient();
  return useMutation<Appointment, Error, string, MarkSeenContext>({
    mutationFn: (id: string) =>
      apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}/seen`, {
        method: 'POST',
      }),
    // Optimistic patch of the cached dashboard + appointment lists so the
    // "new" pill and badge count update instantly. onSettled then invalidates
    // so the canonical state from the server replaces our patch — without
    // this, a row marked seen kept reappearing after the cached query was
    // dropped (e.g. on reload) because we never re-read the canonical list.
    onMutate: async (id) => {
      // Cancel in-flight refetches so they can't overwrite our patch.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: dashboardKeys.all }),
        queryClient.cancelQueries({ queryKey: appointmentKeys.all }),
      ]);

      const stamp = new Date().toISOString();
      const patchAppt = <T extends { id: string; seen_at: string | null }>(a: T): T =>
        a.id === id && !a.seen_at ? { ...a, seen_at: stamp } : a;

      // Snapshot every cache entry we mutate so onError can restore them
      // verbatim. Without this rollback, a failing POST left the UI looking
      // "seen" until the next real fetch, masking backend errors.
      const dashboardSnapshots = queryClient.getQueriesData<DashboardData | undefined>({
        queryKey: dashboardKeys.all,
      });
      const listSnapshots = queryClient.getQueriesData<Appointment[] | undefined>({
        queryKey: appointmentKeys.all,
      });
      const detailSnapshot = queryClient.getQueryData<Appointment | undefined>(
        appointmentKeys.detail(id),
      );
      const unseenCountSnapshot = queryClient.getQueryData<{ count: number } | undefined>(
        appointmentKeys.unseenCount(),
      );

      let wasUnseen = false;

      queryClient.setQueriesData<DashboardData | undefined>(
        { queryKey: dashboardKeys.all },
        (old) => {
          if (!old) return old;
          if (old.latest.some((a) => a.id === id && !a.seen_at)) wasUnseen = true;
          return {
            ...old,
            upcoming: old.upcoming.map(patchAppt),
            latest: old.latest.map(patchAppt),
          };
        },
      );
      queryClient.setQueriesData<Appointment[] | undefined>(
        { queryKey: appointmentKeys.all },
        (old) => {
          if (!old) return old;
          if (old.some((a) => a.id === id && !a.seen_at)) wasUnseen = true;
          return old.map(patchAppt);
        },
      );
      queryClient.setQueryData<Appointment | undefined>(
        appointmentKeys.detail(id),
        (old) => {
          if (old && !old.seen_at) {
            wasUnseen = true;
            return { ...old, seen_at: stamp };
          }
          return old;
        },
      );

      if (wasUnseen) {
        queryClient.setQueryData<{ count: number } | undefined>(
          appointmentKeys.unseenCount(),
          (old) => (old && old.count > 0 ? { count: old.count - 1 } : old),
        );
      }

      return {
        dashboardSnapshots,
        listSnapshots,
        detailSnapshot,
        unseenCountSnapshot,
        wasUnseen,
      };
    },
    onError: (_err, id, context) => {
      if (!context) return;
      for (const [key, data] of context.dashboardSnapshots) {
        queryClient.setQueryData(key, data);
      }
      for (const [key, data] of context.listSnapshots) {
        queryClient.setQueryData(key, data);
      }
      queryClient.setQueryData(appointmentKeys.detail(id), context.detailSnapshot);
      if (context.wasUnseen) {
        queryClient.setQueryData(
          appointmentKeys.unseenCount(),
          context.unseenCountSnapshot,
        );
      }
    },
    onSettled: (_data, _err, id) => {
      // Pull canonical state from the server so the row drops out of latest
      // (or stays, if it failed) instead of relying on a stale optimistic
      // patch that survives until the cache is dropped on reload.
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: appointmentKeys.unseenCount() });
    },
  });
}
