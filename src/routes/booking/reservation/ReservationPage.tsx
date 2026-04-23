import { useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCategories } from '@/api/hooks/useCategories';
import { useServices } from '@/api/hooks/useServices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import { formatPrice, formatDuration } from '@/lib/formatters';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import { ExtrasSheet } from '../business/components/ExtrasSheet';
import {
  buildServicesMap,
  calculateSelectionDuration,
  calculateSelectionPrice,
  groupExtrasByCategory,
} from '../business/selection';
import { SelectionItem } from './components/SelectionItem';
import { ReservationSkeleton } from './components/ReservationSkeleton';

export default function ReservationPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selections, removeSelection, updateSelection } = useBookingSelection();

  const categoriesQuery = useCategories();
  const servicesQuery = useServices();

  const [editingId, setEditingId] = useState<string | null>(null);

  const servicesById = useMemo(
    () => buildServicesMap(servicesQuery.data ?? []),
    [servicesQuery.data],
  );

  const extraGroups = useMemo(
    () =>
      groupExtrasByCategory(
        servicesQuery.data ?? [],
        categoriesQuery.data ?? [],
      ),
    [servicesQuery.data, categoriesQuery.data],
  );

  const totals = useMemo(() => {
    let price = 0;
    let duration = 0;
    for (const sel of selections) {
      price += calculateSelectionPrice(sel, servicesById);
      duration += calculateSelectionDuration(sel, servicesById);
    }
    return { price, duration };
  }, [selections, servicesById]);

  const editingSelection = editingId
    ? selections.find((sel) => sel.id === editingId) ?? null
    : null;
  const editingService: Service | null = editingSelection
    ? servicesById.get(editingSelection.serviceId) ?? null
    : null;

  const isLoading = categoriesQuery.isLoading || servicesQuery.isLoading;
  const queryError = categoriesQuery.error ?? servicesQuery.error;

  if (isLoading) {
    return <ReservationSkeleton />;
  }

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No pudimos cargar tu reservación."
            onRetry={() => {
              categoriesQuery.refetch();
              servicesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-500 px-600 py-1200 text-center">
        <p className="font-serif text-h4 text-heading">Tu Reservación</p>
        <p className="font-sans text-body text-muted">
          Aún no has agregado servicios. Elige un servicio para comenzar.
        </p>
        <Button onClick={() => navigate(`/${slug}`)}>Ver servicios</Button>
      </div>
    );
  }

  const handleReservar = () => {
    navigate(`/${slug}/horario`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-800 px-600 py-800">
      <Link
        to={`/${slug}`}
        className="inline-flex items-center gap-200 self-start font-sans text-body-lg font-semibold text-secondary hover:text-secondary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
      >
        <ChevronLeft size={24} strokeWidth={2} aria-hidden />
        <span className="hidden md:inline">Regresar</span>
        <span className="md:hidden">Atrás</span>
      </Link>

      <h1 className="text-center font-serif text-h4-mobile text-heading md:text-h4">
        Tu Reservación
      </h1>

      <div className="flex flex-col divide-y divide-border-default">
        {selections.map((selection) => {
          const service = servicesById.get(selection.serviceId);
          if (!service) return null;
          const extras = selection.extraIds
            .map((id) => servicesById.get(id))
            .filter((s): s is Service => Boolean(s));
          return (
            <SelectionItem
              key={selection.id}
              service={service}
              extras={extras}
              onEdit={extraGroups.length > 0 ? () => setEditingId(selection.id) : undefined}
              onRemove={() => removeSelection(selection.id)}
            />
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-300 pt-400">
        <Button fullWidth size="lg" onClick={handleReservar}>
          Reservar {formatPrice(totals.price)} | {formatDuration(totals.duration)}
        </Button>
        <p className="font-sans text-body-sm text-muted">
          Solamente te pedirémos un anticipo
        </p>
      </div>

      <ExtrasSheet
        open={editingSelection !== null}
        service={editingService}
        extraGroups={extraGroups}
        initialExtraIds={editingSelection?.extraIds ?? []}
        mode="edit"
        onClose={() => setEditingId(null)}
        onConfirm={(extraIds) => {
          if (editingSelection) {
            updateSelection(editingSelection.id, extraIds);
          }
          setEditingId(null);
        }}
      />
    </div>
  );
}
