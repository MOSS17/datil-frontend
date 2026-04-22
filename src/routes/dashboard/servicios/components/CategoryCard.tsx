import type { CategoryWithServices } from '../types';
import { CategoryHeader } from './CategoryHeader';
import { ServiceRow } from './ServiceRow';

interface CategoryCardProps {
  group: CategoryWithServices;
  isExtras: boolean;
  onEditCategory?: (id: string) => void;
  onAddService?: (categoryId: string) => void;
  onEditService?: (serviceId: string) => void;
}

export function CategoryCard({
  group,
  isExtras,
  onEditCategory,
  onAddService,
  onEditService,
}: CategoryCardProps) {
  const { category, services } = group;
  return (
    <section className="overflow-hidden rounded-lg border border-subtle bg-surface">
      <CategoryHeader
        category={category}
        serviceCount={services.length}
        isExtras={isExtras}
        onEdit={onEditCategory ? () => onEditCategory(category.id) : undefined}
        onAddService={onAddService ? () => onAddService(category.id) : undefined}
      />
      <div className="flex flex-col">
        {services.map((service, index) => (
          <ServiceRow
            key={service.id}
            service={service}
            isExtras={isExtras}
            isLast={index === services.length - 1}
            onEdit={onEditService ? () => onEditService(service.id) : undefined}
          />
        ))}
      </div>
    </section>
  );
}
