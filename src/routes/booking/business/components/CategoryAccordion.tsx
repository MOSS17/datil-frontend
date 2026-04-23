import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Service } from '@/api/types/services';
import type { Category } from '@/api/types/categories';
import { ServiceCard } from './ServiceCard';

interface CategoryAccordionProps {
  category: Category;
  services: Service[];
  expanded: boolean;
  onToggle: () => void;
  countForService: (serviceId: string) => number;
  onServiceClick: (service: Service) => void;
}

export function CategoryAccordion({
  category,
  services,
  expanded,
  onToggle,
  countForService,
  onServiceClick,
}: CategoryAccordionProps) {
  return (
    <section className="flex flex-col gap-800 border-b border-default pb-800 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={`accordion-panel-${category.id}`}
        className="flex items-center justify-between gap-400"
      >
        <h2 className="font-serif text-h6 text-heading">{category.name}</h2>
        <span aria-hidden className="text-icon">
          {expanded ? (
            <ChevronUp size={24} strokeWidth={1.75} />
          ) : (
            <ChevronDown size={24} strokeWidth={1.75} />
          )}
        </span>
      </button>
      {expanded ? (
        <div
          id={`accordion-panel-${category.id}`}
          className={cn('grid gap-400 md:grid-cols-2 md:gap-600 lg:grid-cols-3')}
        >
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selectedCount={countForService(service.id)}
              onClick={() => onServiceClick(service)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
