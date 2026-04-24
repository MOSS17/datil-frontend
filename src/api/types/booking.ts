import type { Business, BusinessApi } from './business';
import type { Category } from './categories';
import type { Service, ServiceApi } from './services';

export interface TimeSlot {
  start: string;
  end: string;
}

export interface BookingService extends Service {
  extras: Service[];
}

export interface BookingServiceApi extends ServiceApi {
  extras: ServiceApi[];
}

export interface BookingPageData {
  business: Business;
  categories: Category[];
}

export interface BookingPageApi {
  business: BusinessApi;
  categories: Category[];
}

export interface ReserveBookingInput {
  customerName: string;
  customerPhone: string;
  startTime: string;
  serviceIds: string[];
  extraIds?: string[];
  paymentProof?: File | null;
}
