import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Appointment } from '@/api/types/appointments';

export const appointmentKeys = {
  all: ['appointments'] as const,
  detail: (id: string) => [...appointmentKeys.all, id] as const,
};

export function useAppointments() {
  return useQuery({
    queryKey: appointmentKeys.all,
    queryFn: () => apiClient<Appointment[]>(ENDPOINTS.APPOINTMENTS),
  });
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: appointmentKeys.detail(id),
    queryFn: () => apiClient<Appointment>(`${ENDPOINTS.APPOINTMENTS}/${id}`),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: (data: {
      business_id: string;
      customer_name: string;
      customer_phone: string;
      start_time: string;
      service_ids: string[];
    }) => apiClient<Appointment>(ENDPOINTS.APPOINTMENTS, { method: 'POST', body: data }),
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: appointmentKeys.all }),
  });
}
