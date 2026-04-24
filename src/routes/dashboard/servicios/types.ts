import type { Category } from '@/api/types/categories';
import type { Service } from '@/api/types/services';

export type ServicesTab = 'principales' | 'complementos';

export interface CategoryWithServices {
  category: Category;
  services: Service[];
}

export function groupServicesByCategory(
  categories: Category[],
  services: Service[],
  filterExtras: boolean,
): CategoryWithServices[] {
  const byCategory = new Map<string, Service[]>();
  for (const svc of services) {
    if (svc.is_extra !== filterExtras) continue;
    const bucket = byCategory.get(svc.category_id) ?? [];
    bucket.push(svc);
    byCategory.set(svc.category_id, bucket);
  }

  // Backend returns categories ordered by created_at; rely on that natural
  // ordering instead of a frontend-defined display_order (which the backend
  // doesn't track). Drag-to-reorder will need a real backend column first.
  // Empty categories are kept so newly-created ones render as empty cards
  // (with an "add service" affordance in CategoryHeader); previously they
  // were filtered out and silently disappeared from the page.
  return categories.map((category) => ({
    category,
    services: (byCategory.get(category.id) ?? [])
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));
}
