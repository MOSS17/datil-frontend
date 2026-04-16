import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Business } from '@/api/types/business';

export const businessKeys = {
  all: ['business'] as const,
  detail: (id: string) => [...businessKeys.all, id] as const,
  bySlug: (slug: string) => [...businessKeys.all, 'slug', slug] as const,
};

export function useBusiness(id: string) {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: () => apiClient<Business>(`${ENDPOINTS.BUSINESS}/${id}`),
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: businessKeys.bySlug(slug),
    queryFn: () => apiClient<Business>(`${ENDPOINTS.BUSINESS}/slug/${slug}`),
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) =>
      apiClient<Business>(`${ENDPOINTS.BUSINESS}/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}
