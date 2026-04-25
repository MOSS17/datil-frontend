import type { AppointmentStatus } from '@/lib/constants';

export interface AppointmentService {
  appointment_id: string;
  service_id: string;
  price: number;
  duration: number;
  // Optional client-side enrichment fields — backend does not emit them.
  // Populated in-memory by joining against the services catalog.
  service_name?: string;
  is_extra?: boolean;
}

export interface Appointment {
  id: string;
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  status: AppointmentStatus;
  start_time: string;
  end_time: string;
  total: number;
  advance_payment_image_url: string | null;
  services: AppointmentService[];
  seen_at: string | null;
  created_at: string;
  updated_at: string;
}
