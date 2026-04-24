import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Workday, PersonalTime, CreatePersonalTimeRequest } from '@/api/types/schedule';
import { PERSONAL_TIME_TYPE } from '@/lib/constants';

export const scheduleKeys = {
  workdays: ['workdays'] as const,
  personalTime: ['personal-time'] as const,
};

// Backend only persists start_date/end_date/start_time/end_time. `type` and
// `date` are UI niceties that the Calendario filters/cards rely on — derive
// them from the server shape so consumers don't branch.
function hydratePersonalTime(p: PersonalTime): PersonalTime {
  const type = p.start_time
    ? PERSONAL_TIME_TYPE.HOURS
    : p.start_date === p.end_date
      ? PERSONAL_TIME_TYPE.FULL_DAY
      : PERSONAL_TIME_TYPE.DATE_RANGE;
  const date = p.start_date === p.end_date ? p.start_date : undefined;
  return { ...p, type, date };
}

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
    queryFn: async () => {
      const list = await apiClient<PersonalTime[]>(ENDPOINTS.SCHEDULE.PERSONAL_TIME);
      return list.map(hydratePersonalTime);
    },
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
