export interface Category {
  id: string;
  business_id: string;
  name: string;
  allow_multiple: boolean;
  // The fields below aren't on the backend `categories` table — they exist
  // here only for the public booking flow's mock data (routes/booking/...)
  // which still drives the customer-facing reorderable category UI.
  // Phase 3 will reconcile.
  description?: string;
  display_order?: number;
}

export interface CreateCategoryRequest {
  name: string;
  allow_multiple: boolean;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}
