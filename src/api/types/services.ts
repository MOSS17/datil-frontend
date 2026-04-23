export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  duration_minutes: number;
  advance_payment_amount: number;
  is_extra: boolean;
  is_active: boolean;
}

export interface CreateServiceRequest {
  category_id: string;
  name: string;
  description: string;
  min_price: number;
  max_price: number;
  duration_minutes: number;
  advance_payment_amount: number;
  is_extra: boolean;
  is_active: boolean;
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}

export interface ServiceApi {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  min_price: number;
  max_price: number | null;
  duration: number;
  advance_payment_amount: number | null;
  is_extra: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceApiRequest {
  category_id: string;
  name: string;
  description?: string | null;
  min_price: number;
  max_price?: number | null;
  duration: number;
  advance_payment_amount?: number | null;
  is_extra: boolean;
  is_active?: boolean | null;
}
