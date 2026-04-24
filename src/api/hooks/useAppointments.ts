import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Appointment } from '@/api/types/appointments';
import { dashboardKeys } from './useDashboard';

export interface UseAppointmentsOptions {
  from?: string;
  to?: string;
}

export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (opts: UseAppointmentsOptions) => [...appointmentKeys.all, 'list', opts] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
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
    },
  });
}
