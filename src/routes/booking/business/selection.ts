import type { Category } from '@/api/types/categories';
import type { Service } from '@/api/types/services';
import type { BookingSelection } from '../bookingContextValue';


export interface ExtraGroup {
  category: Category;
  extras: Service[];
}

export function groupExtrasByCategory(
  services: Service[],
  categories: Category[],
): ExtraGroup[] {
  const extras = services.filter((s) => s.is_extra && s.is_active);
  const byCategory = new Map<string, Service[]>();
  for (const extra of extras) {
    const list = byCategory.get(extra.category_id) ?? [];
    list.push(extra);
    byCategory.set(extra.category_id, list);
  }
  return categories
    .filter((cat) => byCategory.has(cat.id))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((category) => ({
      category,
      extras: (byCategory.get(category.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      ),
    }));
}

export interface ServiceCategoryGroup {
  category: Category;
  services: Service[];
}

export function groupServicesByMainCategory(
  services: Service[],
  categories: Category[],
): ServiceCategoryGroup[] {
  const mainServices = services.filter((s) => !s.is_extra && s.is_active);
  const byCategory = new Map<string, Service[]>();
  for (const svc of mainServices) {
    const list = byCategory.get(svc.category_id) ?? [];
    list.push(svc);
    byCategory.set(svc.category_id, list);
  }
  return categories
    .filter((cat) => byCategory.has(cat.id))
    .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((category) => ({
      category,
      services: (byCategory.get(category.id) ?? []).sort((a, b) =>
        a.name.localeCompare(b.name, 'es'),
      ),
    }));
}

export function servicePriceAmount(service: Service): number {
  return service.min_price;
}

export function calculateSelectionPrice(
  selection: BookingSelection,
  servicesById: Map<string, Service>,
): number {
  const service = servicesById.get(selection.serviceId);
  if (!service) return 0;
  let total = servicePriceAmount(service);
  for (const extraId of selection.extraIds) {
    const extra = servicesById.get(extraId);
    if (extra) total += servicePriceAmount(extra);
  }
  return total;
}

export function calculateSelectionDuration(
  selection: BookingSelection,
  servicesById: Map<string, Service>,
): number {
  const service = servicesById.get(selection.serviceId);
  if (!service) return 0;
  let total = service.duration_minutes;
  for (const extraId of selection.extraIds) {
    const extra = servicesById.get(extraId);
    if (extra) total += extra.duration_minutes;
  }
  return total;
}

export function buildServicesMap(services: Service[]): Map<string, Service> {
  return new Map(services.map((svc) => [svc.id, svc]));
}
