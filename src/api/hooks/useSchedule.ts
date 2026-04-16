import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Workday, PersonalTime, CreatePersonalTimeRequest } from '@/api/types/schedule';

export const scheduleKeys = {
  workdays: ['workdays'] as const,
  personalTime: ['personal-time'] as const,
};

export function useWorkdays() {
  return useQuery({
    queryKey: scheduleKeys.workdays,
    queryFn: () => apiClient<Workday[]>(ENDPOINTS.SCHEDULE.WORKDAYS),
  });
}

export function useUpdateWorkdays() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Workday[]) =>
      apiClient<Workday[]>(ENDPOINTS.SCHEDULE.WORKDAYS, { method: 'PUT', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.workdays }),
  });
}

export function usePersonalTime() {
  return useQuery({
    queryKey: scheduleKeys.personalTime,
    queryFn: () => apiClient<PersonalTime[]>(ENDPOINTS.SCHEDULE.PERSONAL_TIME),
  });
}

export function useCreatePersonalTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePersonalTimeRequest) =>
      apiClient<PersonalTime>(ENDPOINTS.SCHEDULE.PERSONAL_TIME, { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.personalTime }),
  });
}

export function useDeletePersonalTime() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${ENDPOINTS.SCHEDULE.PERSONAL_TIME}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: scheduleKeys.personalTime }),
  });
}
