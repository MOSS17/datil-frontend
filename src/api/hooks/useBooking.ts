import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type { Appointment } from '@/api/types/appointments';
import type {
  BookingPageApi,
  BookingPageData,
  BookingService,
  BookingServiceApi,
  ReserveBookingInput,
  TimeSlot,
} from '@/api/types/booking';
import type { Business, BusinessApi } from '@/api/types/business';
import type { Service, ServiceApi } from '@/api/types/services';

export const bookingKeys = {
  all: ['booking'] as const,
  page: (slug: string) => [...bookingKeys.all, 'page', slug] as const,
  services: (slug: string) => [...bookingKeys.all, 'services', slug] as const,
  availability: (slug: string, date: string, serviceIds: string[]) =>
    [
      ...bookingKeys.all,
      'availability',
      slug,
      date,
      [...serviceIds].sort().join(','),
    ] as const,
};

function businessFromApi(b: BusinessApi): Business {
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
    created_at: b.created_at,
    updated_at: b.updated_at,
  };
}

function serviceFromApi(s: ServiceApi): Service {
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

function bookingServiceFromApi(s: BookingServiceApi): BookingService {
  return {
    ...serviceFromApi(s),
    extras: (s.extras ?? []).map(serviceFromApi),
  };
}

export function useBookingPage(slug: string) {
  return useQuery({
    queryKey: bookingKeys.page(slug),
    queryFn: async (): Promise<BookingPageData> => {
      const data = await apiClient<BookingPageApi>(ENDPOINTS.BOOK(slug).page);
      return {
        business: businessFromApi(data.business),
        categories: data.categories ?? [],
      };
    },
    enabled: Boolean(slug),
  });
}

export function useBookingServices(slug: string) {
  return useQuery({
    queryKey: bookingKeys.services(slug),
    queryFn: async (): Promise<BookingService[]> => {
      const data = await apiClient<BookingServiceApi[]>(ENDPOINTS.BOOK(slug).services);
      return data.filter((s) => s.is_active).map(bookingServiceFromApi);
    },
    enabled: Boolean(slug),
  });
}

export function useBookingAvailability(
  slug: string,
  date: string | null,
  serviceIds: string[],
) {
  return useQuery({
    queryKey: bookingKeys.availability(slug, date ?? '', serviceIds),
    queryFn: async (): Promise<TimeSlot[]> => {
      const params = new URLSearchParams({
        date: date!,
        service_ids: serviceIds.join(','),
      });
      return apiClient<TimeSlot[]>(
        `${ENDPOINTS.BOOK(slug).availability}?${params.toString()}`,
      );
    },
    enabled: Boolean(slug && date && serviceIds.length > 0),
  });
}

export function useReserveBooking(slug: string) {
  return useMutation({
    mutationFn: (input: ReserveBookingInput) => {
      const formData = new FormData();
      formData.append('customer_name', input.customerName);
      formData.append('customer_phone', input.customerPhone);
      formData.append('start_time', input.startTime);
      // Go's r.Form parses repeated keys into a []string. The `[]` suffix
      // is literal — backend reads r.Form["service_ids"], so we post
      // without brackets.
      for (const id of input.serviceIds) {
        formData.append('service_ids', id);
      }
      for (const id of input.extraIds ?? []) {
        formData.append('extra_ids', id);
      }
      if (input.paymentProof) {
        formData.append('payment_proof', input.paymentProof);
      }
      return apiClient<Appointment>(ENDPOINTS.BOOK(slug).reserve, {
        method: 'POST',
        body: formData,
      });
    },
  });
}
