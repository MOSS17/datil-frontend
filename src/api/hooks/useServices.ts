import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  CreateServiceRequest,
  Service,
  ServiceApi,
  ServiceApiRequest,
  UpdateServiceRequest,
} from '@/api/types/services';

export const serviceKeys = {
  all: ['services'] as const,
  byCategory: (categoryId: string) => [...serviceKeys.all, 'category', categoryId] as const,
  detail: (id: string) => [...serviceKeys.all, id] as const,
  extras: (id: string) => [...serviceKeys.all, id, 'extras'] as const,
};

function fromApi(s: ServiceApi): Service {
  return {
    id: s.id,
    category_id: s.category_id,
    name: s.name,
    description: s.description ?? '',
    min_price: s.min_price,
    max_price: s.max_price ?? s.min_price,
    duration_minutes: s.duration,
    advance_payment_amount: s.advance_payment_amount ?? 0,
    is_extra: s.is_extra,
    is_active: s.is_active,
  };
}

function toApi(s: CreateServiceRequest): ServiceApiRequest {
  return {
    category_id: s.category_id,
    name: s.name,
    description: s.description.length > 0 ? s.description : null,
    min_price: s.min_price,
    max_price: s.max_price > s.min_price ? s.max_price : null,
    duration: s.duration_minutes,
    advance_payment_amount: s.advance_payment_amount > 0 ? s.advance_payment_amount : null,
    is_extra: s.is_extra,
    is_active: s.is_active,
  };
}

function toApiPatch(s: UpdateServiceRequest): Partial<ServiceApiRequest> {
  const body: Partial<ServiceApiRequest> = {};
  if (s.category_id !== undefined) body.category_id = s.category_id;
  if (s.name !== undefined) body.name = s.name;
  if (s.description !== undefined) {
    body.description = s.description.length > 0 ? s.description : null;
  }
  if (s.min_price !== undefined) body.min_price = s.min_price;
  if (s.max_price !== undefined) {
    body.max_price =
      s.min_price !== undefined && s.max_price > s.min_price ? s.max_price : null;
  }
  if (s.duration_minutes !== undefined) body.duration = s.duration_minutes;
  if (s.advance_payment_amount !== undefined) {
    body.advance_payment_amount = s.advance_payment_amount > 0 ? s.advance_payment_amount : null;
  }
  if (s.is_extra !== undefined) body.is_extra = s.is_extra;
  if (s.is_active !== undefined) body.is_active = s.is_active;
  return body;
}

export function useServices(categoryId?: string) {
  return useQuery({
    queryKey: categoryId ? serviceKeys.byCategory(categoryId) : serviceKeys.all,
    queryFn: async () => {
      const params = categoryId ? `?category_id=${categoryId}` : '';
      const data = await apiClient<ServiceApi[]>(`${ENDPOINTS.SERVICES}${params}`);
      return data.map(fromApi);
    },
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async () =>
      fromApi(await apiClient<ServiceApi>(`${ENDPOINTS.SERVICES}/${id}`)),
    enabled: Boolean(id),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServiceRequest) =>
      fromApi(
        await apiClient<ServiceApi>(ENDPOINTS.SERVICES, {
          method: 'POST',
          body: toApi(data),
        }),
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateServiceRequest }) =>
      fromApi(
        await apiClient<ServiceApi>(`${ENDPOINTS.SERVICES}/${id}`, {
          method: 'PUT',
          body: toApiPatch(data),
        }),
      ),
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

export function useServiceExtras(id: string) {
  return useQuery({
    queryKey: serviceKeys.extras(id),
    queryFn: async () => {
      const data = await apiClient<ServiceApi[]>(`${ENDPOINTS.SERVICES}/${id}/extras`);
      return data.map(fromApi);
    },
    enabled: Boolean(id),
  });
}

export function useAddServiceExtra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, extraId }: { serviceId: string; extraId: string }) =>
      apiClient<void>(`${ENDPOINTS.SERVICES}/${serviceId}/extras`, {
        method: 'POST',
        body: { extra_id: extraId },
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.extras(vars.serviceId) });
    },
  });
}

export function useRemoveServiceExtra() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, extraId }: { serviceId: string; extraId: string }) =>
      apiClient<void>(`${ENDPOINTS.SERVICES}/${serviceId}/extras/${extraId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.extras(vars.serviceId) });
    },
  });
}
