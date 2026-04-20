import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { useAuth } from '@/auth/AuthContext';
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
    enabled: Boolean(id),
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: businessKeys.bySlug(slug),
    queryFn: () => apiClient<Business>(`${ENDPOINTS.BUSINESS}/slug/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useMyBusiness() {
  const { user } = useAuth();
  return useBusiness(user?.business_id ?? '');
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Business> }) =>
      apiClient<Business>(`${ENDPOINTS.BUSINESS}/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

// TODO(backend): logo upload endpoint is not implemented yet.
// Expected contract: POST /businesses/:id/logo with multipart/form-data (field "logo").
// Response: updated Business with logo_url. Replace the throw below once the backend ships.
export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id: _id, file: _file }: { id: string; file: File }) => {
      throw new Error('Subida de logo aún no implementada en el backend');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}
