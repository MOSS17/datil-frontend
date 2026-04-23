import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusinessBySlug } from '@/api/hooks/useBusiness';
import { useCategories } from '@/api/hooks/useCategories';
import { useServices } from '@/api/hooks/useServices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import { BookingStepper } from '../components/BookingStepper';
import {
  buildServicesMap,
  calculateSelectionDuration,
  calculateSelectionPrice,
} from '../business/selection';
import { Calendar } from './components/Calendar';
import { TimeSlotList } from './components/TimeSlotList';
import { EmptyTimeSlots } from './components/EmptyTimeSlots';
import { SelectionSummaryBar } from './components/SelectionSummaryBar';
import { MobileSummaryCard } from './components/MobileSummaryCard';
import { DetailsSheet, type DetailsSelection } from './components/DetailsSheet';
import { ScheduleSkeleton } from './ScheduleSkeleton';
import { DEFAULT_TIME_SLOTS, formatFullDate } from './scheduleUtils';

export default function SchedulePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    selections,
    clearSelections,
    scheduledDate,
    scheduledTime,
    setSchedule,
  } = useBookingSelection();

  const businessQuery = useBusinessBySlug(slug);
  const servicesQuery = useServices();
  const categoriesQuery = useCategories();

  const initialDate = scheduledDate ? new Date(scheduledDate) : new Date();
  const [visibleYear, setVisibleYear] = useState(initialDate.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(initialDate.getMonth());
  const [detailsOpen, setDetailsOpen] = useState(false);

  const servicesById = useMemo(
    () => buildServicesMap(servicesQuery.data ?? []),
    [servicesQuery.data],
  );

  const resolvedSelections = useMemo<DetailsSelection[]>(
    () =>
      selections
        .map((sel) => {
          const service = servicesById.get(sel.serviceId);
          if (!service) return null;
          const extras = sel.extraIds
            .map((id) => servicesById.get(id))
            .filter((s): s is Service => Boolean(s));
          return {
            id: sel.id,
            service,
            extras,
            duration: calculateSelectionDuration(sel, servicesById),
            price: calculateSelectionPrice(sel, servicesById),
          };
        })
        .filter((s): s is DetailsSelection => s !== null),
    [selections, servicesById],
  );

  const summaryLabel = useMemo(() => {
    if (resolvedSelections.length === 0) return '';
    return resolvedSelections
      .flatMap((sel) => [sel.service.name, ...sel.extras.map((e) => e.name)])
      .join(' + ');
  }, [resolvedSelections]);

  const totals = useMemo(
    () => ({
      duration: resolvedSelections.reduce((acc, sel) => acc + sel.duration, 0),
      price: resolvedSelections.reduce((acc, sel) => acc + sel.price, 0),
    }),
    [resolvedSelections],
  );

  const isLoading =
    businessQuery.isLoading || servicesQuery.isLoading || categoriesQuery.isLoading;
  const queryError = businessQuery.error ?? servicesQuery.error ?? categoriesQuery.error;

  if (isLoading) {
    return <ScheduleSkeleton />;
  }

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No pudimos cargar la disponibilidad."
            onRetry={() => {
              businessQuery.refetch();
              servicesQuery.refetch();
              categoriesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (selections.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-500 px-600 py-1200 text-center">
        <p className="font-serif text-h4 text-heading">Fecha y Hora</p>
        <p className="font-sans text-body text-muted">
          Primero elige al menos un servicio.
        </p>
        <Button onClick={() => navigate(`/${slug}`)}>Ver servicios</Button>
      </div>
    );
  }

  const handlePrevMonth = () => {
    const prev = new Date(visibleYear, visibleMonth - 1, 1);
    setVisibleYear(prev.getFullYear());
    setVisibleMonth(prev.getMonth());
  };

  const handleNextMonth = () => {
    const next = new Date(visibleYear, visibleMonth + 1, 1);
    setVisibleYear(next.getFullYear());
    setVisibleMonth(next.getMonth());
  };

  const handleSelectDate = (iso: string) => {
    setSchedule(iso, null);
  };

  const handleSelectTime = (hhmm: string) => {
    setSchedule(scheduledDate, hhmm);
  };

  const handleCancel = () => {
    clearSelections();
    navigate(`/${slug}`);
  };

  const handleContinue = () => {
    navigate(`/${slug}/datos`);
  };

  const canContinue = Boolean(scheduledDate && scheduledTime);

  return (
    <div className="flex flex-col">
      <div className="py-600 md:py-700">
        <BookingStepper currentStep={2} />
      </div>

      <div className="hidden md:block">
        <SelectionSummaryBar
          summaryLabel={summaryLabel}
          totalDuration={totals.duration}
          totalPrice={totals.price}
          onCancel={handleCancel}
        />
      </div>

      <div className="mx-auto w-full max-w-[1440px] px-600 py-600 md:px-1200 md:py-800">
        <div className="grid gap-600 md:grid-cols-[2fr_1fr] md:gap-800">
          <div className="flex flex-col gap-400">
            <h2 className="font-serif text-h5 text-heading md:text-h4">
              <span className="md:hidden">Seleccionar una Fecha</span>
              <span className="hidden md:inline">Selecciona una Fecha</span>
            </h2>
            <Calendar
              visibleYear={visibleYear}
              visibleMonth={visibleMonth}
              selectedIso={scheduledDate}
              onSelect={handleSelectDate}
              onPrev={handlePrevMonth}
              onNext={handleNextMonth}
            />
          </div>

          <div className="flex flex-col gap-400">
            <div className="flex flex-col gap-100">
              <h2 className="font-serif text-h5 text-heading md:text-h4">
                Horarios Disponibles
              </h2>
              {scheduledDate ? (
                <p className="font-sans text-body-sm text-muted">
                  {formatFullDate(scheduledDate)}
                </p>
              ) : null}
            </div>
            {scheduledDate ? (
              <TimeSlotList
                slots={DEFAULT_TIME_SLOTS}
                selected={scheduledTime}
                onSelect={handleSelectTime}
              />
            ) : (
              <EmptyTimeSlots />
            )}
          </div>
        </div>

        <div className="mt-600 md:hidden">
          <MobileSummaryCard
            summaryLabel={summaryLabel}
            totalPrice={totals.price}
            onOpenDetails={() => setDetailsOpen(true)}
          />
        </div>

        <div className="mt-800 flex flex-col items-center gap-400 md:items-end">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            fullWidth
            className="md:w-auto"
          >
            Continuar
          </Button>
          <button
            type="button"
            onClick={handleCancel}
            className="font-sans text-body-sm font-medium text-primary hover:text-primary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2 md:hidden"
          >
            ← Cancelar
          </button>
        </div>
      </div>

      <DetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        selections={resolvedSelections}
        location={businessQuery.data?.location}
        totalDuration={totals.duration}
        totalPrice={totals.price}
      />
    </div>
  );
}
