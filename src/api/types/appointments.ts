import type { AppointmentStatus } from '@/lib/constants';

export interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;
  duration_minutes: number;
  is_extra: boolean;
}

export interface Appointment {
  id: string;
  business_id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  status: AppointmentStatus;
  start_time: string;
  end_time: string;
  total_price: number;
  total_duration: number;
  payment_proof_url: string;
  services: AppointmentService[];
  created_at: string;
}
