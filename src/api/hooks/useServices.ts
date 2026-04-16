import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '@/api/types/services';

export const serviceKeys = {
  all: ['services'] as const,
  byCategory: (categoryId: string) => [...serviceKeys.all, 'category', categoryId] as const,
  detail: (id: string) => [...serviceKeys.all, id] as const,
};

export function useServices(categoryId?: string) {
  return useQuery({
    queryKey: categoryId ? serviceKeys.byCategory(categoryId) : serviceKeys.all,
    queryFn: () => {
      const params = categoryId ? `?category_id=${categoryId}` : '';
      return apiClient<Service[]>(`${ENDPOINTS.SERVICES}${params}`);
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => apiClient<Service>(`${ENDPOINTS.SERVICES}/${id}`),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateServiceRequest) =>
      apiClient<Service>(ENDPOINTS.SERVICES, { method: 'POST', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      apiClient<Service>(`${ENDPOINTS.SERVICES}/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient<void>(`${ENDPOINTS.SERVICES}/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
