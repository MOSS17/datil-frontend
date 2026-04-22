import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyServiciosProps {
  isExtras: boolean;
  onCreate: () => void;
}

export function EmptyServicios({ isExtras, onCreate }: EmptyServiciosProps) {
  const title = isExtras
    ? 'Aún no tienes grupos de complementos'
    : 'Aún no tienes categorías de servicios';
  const body = isExtras
    ? 'Los complementos son extras opcionales que puedes ofrecer en servicios específicos.'
    : 'Crea una categoría para agrupar los servicios que ofreces en tu catálogo.';
  const cta = isExtras ? 'Nuevo Grupo de Complementos' : 'Nueva Categoría';

  return (
    <div className="flex flex-col items-start gap-400 rounded-lg border border-dashed border-default bg-surface px-600 py-800 md:items-center md:text-center">
      <div className="flex flex-col gap-200 md:items-center">
        <h3 className="font-serif text-h6 text-heading">{title}</h3>
        <p className="font-sans text-body-sm text-muted">{body}</p>
      </div>
      <Button
        onClick={onCreate}
        leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
      >
        {cta}
      </Button>
    </div>
  );
}
