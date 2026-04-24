import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Business,
  BusinessApi,
  UpdateBankRequest,
  UpdateBusinessRequest,
} from '@/api/types/business';

export const businessKeys = {
  all: ['business'] as const,
  detail: (id: string) => [...businessKeys.all, id] as const,
  bySlug: (slug: string) => [...businessKeys.all, 'slug', slug] as const,
};

function fromApi(b: BusinessApi): Business {
  return {
    id: b.id,
    name: b.name,
    description: b.description ?? '',
    slug: b.url,
    logo_url: b.logo_url ?? '',
    location: b.location ?? '',
    clabe: b.beneficiary_clabe ?? '',
    bank_name: b.bank_name ?? '',
    bank_holder: b.beneficiary_name ?? '',
    timezone: b.timezone,
    created_at: b.created_at,
    updated_at: b.updated_at,
  };
}

export function useMyBusiness() {
  return useQuery({
    queryKey: businessKeys.all,
    queryFn: async () => fromApi(await apiClient<BusinessApi>(ENDPOINTS.BUSINESS)),
  });
}

export function useBusiness(id: string) {
  return useQuery({
    queryKey: businessKeys.detail(id),
    queryFn: async () => fromApi(await apiClient<BusinessApi>(`${ENDPOINTS.BUSINESS}/${id}`)),
    enabled: Boolean(id),
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: businessKeys.bySlug(slug),
    queryFn: async () =>
      fromApi(await apiClient<BusinessApi>(`${ENDPOINTS.BUSINESS}/slug/${slug}`)),
    enabled: Boolean(slug),
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; location?: string; description?: string }) => {
      const body: UpdateBusinessRequest = {
        name: data.name,
        location: data.location && data.location.length > 0 ? data.location : null,
        description:
          data.description && data.description.length > 0 ? data.description : null,
      };
      return fromApi(
        await apiClient<BusinessApi>(ENDPOINTS.BUSINESS, { method: 'PUT', body }),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useUpdateBusinessBank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateBankRequest) =>
      fromApi(
        await apiClient<BusinessApi>(`${ENDPOINTS.BUSINESS}/bank`, {
          method: 'PUT',
          body: data,
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}

export function useUploadBusinessLogo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file }: { id?: string; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      return fromApi(
        await apiClient<BusinessApi>(`${ENDPOINTS.BUSINESS}/logo`, {
          method: 'PUT',
          body: formData,
        }),
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: businessKeys.all }),
  });
}
