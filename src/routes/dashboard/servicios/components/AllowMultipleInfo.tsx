import { Info } from 'lucide-react';

interface AllowMultipleInfoProps {
  allowMultiple: boolean;
}

export function AllowMultipleInfo({ allowMultiple }: AllowMultipleInfoProps) {
  const message = allowMultiple
    ? 'Tus clientes podrán elegir los servicios que quieran de esta categoría en una sola cita.'
    : 'Tus clientes no podrán elegir dos o más servicios de esta categoría en una sola cita.';

  return (
    <div className="flex items-center gap-200 rounded-md border border-info bg-surface-info-subtle px-400 py-300">
      <Info size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-icon-accent" />
      <p className="font-sans text-body-sm font-medium text-info">{message}</p>
    </div>
  );
}
