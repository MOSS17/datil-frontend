export interface Category {
  id: string;
  business_id: string;
  name: string;
  description: string;
  allow_multiple: boolean;
  display_order: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
  allow_multiple: boolean;
  display_order: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
