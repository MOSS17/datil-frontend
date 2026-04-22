import { Info } from 'lucide-react';

export function ExtraInfoAside() {
  return (
    <aside className="flex items-start gap-300 rounded-md border border-info bg-surface-info-subtle px-400 py-300">
      <Info size={20} strokeWidth={1.75} aria-hidden className="mt-50 shrink-0 text-icon-accent" />
      <p className="font-sans text-body-sm font-medium text-info">
        Para mostrarlo a tus clientas como extra a un servicio principal, asegúrate de agregarlo a la lista de extras al editar o crear el servicio.
      </p>
    </aside>
  );
}
