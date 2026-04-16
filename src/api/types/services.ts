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
  extras?: Service[];
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
}

export interface UpdateServiceRequest extends Partial<CreateServiceRequest> {}
