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

  return categories
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map((category) => ({
      category,
      services: (byCategory.get(category.id) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter((group) => group.services.length > 0);
}
