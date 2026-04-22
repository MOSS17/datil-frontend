import { Pencil, Plus } from 'lucide-react';
import type { Category } from '@/api/types/categories';

interface CategoryHeaderProps {
  category: Category;
  serviceCount: number;
  isExtras: boolean;
  onEdit?: () => void;
  onAddService?: () => void;
}

export function CategoryHeader({
  category,
  serviceCount,
  isExtras,
  onEdit,
  onAddService,
}: CategoryHeaderProps) {
  const perBookingLabel = category.allow_multiple ? 'Varios Por Reserva' : '1 Por Reserva';
  const countLabel = `${serviceCount} ${serviceCount === 1 ? 'Servicio' : 'Servicios'}`;
  const addLabel = isExtras ? 'Agregar Complemento' : 'Agregar Servicio';

  return (
    <div className="flex flex-col gap-200 border-b border-default bg-surface px-600 py-400 md:flex-row md:items-center md:justify-between md:px-800">
      <div className="flex flex-col gap-100 md:flex-row md:items-center md:gap-600">
        <h3 className="font-serif text-h6 text-heading">{category.name}</h3>
        <p className="font-sans text-caption font-semibold text-muted">
          {countLabel} – {perBookingLabel}
        </p>
      </div>
      <div className="flex items-center gap-500 self-end md:justify-end">
        <button
          type="button"
          aria-label={`Editar ${category.name}`}
          onClick={onEdit}
          className="inline-flex h-700 w-700 items-center justify-center rounded-md text-icon hover:bg-surface-secondary-subtle"
        >
          <Pencil size={16} strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onAddService}
          className="inline-flex items-center gap-200 rounded-md px-200 py-100 font-sans text-body-sm font-medium text-primary hover:bg-surface-secondary-subtle"
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden />
          <span>{addLabel}</span>
        </button>
      </div>
    </div>
  );
}
