import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useBookingAvailability,
  useBookingPage,
  useBookingServices,
} from '@/api/hooks/useBooking';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import type { Service } from '@/api/types/services';
import type { TimeSlot } from '@/api/types/booking';
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
import { extractHhmmFromRfc3339, formatFullDate } from './scheduleUtils';

export default function SchedulePage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    selections,
    clearSelections,
    scheduledDate,
    scheduledStart,
    setSchedule,
  } = useBookingSelection();

  const pageQuery = useBookingPage(slug);
  const servicesQuery = useBookingServices(slug);
  const business = pageQuery.data?.business;

  const initialDate = scheduledDate ? new Date(scheduledDate) : new Date();
  const [visibleYear, setVisibleYear] = useState(initialDate.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(initialDate.getMonth());
  const [detailsOpen, setDetailsOpen] = useState(false);

  const servicesById = useMemo(
    () => buildServicesMap(servicesQuery.data ?? []),
    [servicesQuery.data],
  );

  const availabilityServiceIds = useMemo(
    () => selections.flatMap((sel) => [sel.serviceId, ...sel.extraIds]),
    [selections],
  );

  const availabilityQuery = useBookingAvailability(
    slug,
    scheduledDate,
    availabilityServiceIds,
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

  const isLoading = pageQuery.isLoading || servicesQuery.isLoading;
  const queryError = pageQuery.error ?? servicesQuery.error;

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
              pageQuery.refetch();
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
    setSchedule(iso, null, null);
  };

  const handleSelectTime = (slot: TimeSlot) => {
    setSchedule(scheduledDate, extractHhmmFromRfc3339(slot.start), slot.start);
  };

  const handleCancel = () => {
    clearSelections();
    navigate(`/${slug}`);
  };

  const handleContinue = () => {
    navigate(`/${slug}/datos`);
  };

  const canContinue = Boolean(scheduledDate && scheduledStart);
  const slots = availabilityQuery.data ?? [];
  const availabilityLoading = availabilityQuery.isFetching;
  const showNoSlots =
    Boolean(scheduledDate) && !availabilityLoading && slots.length === 0;

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
            {!scheduledDate ? (
              <EmptyTimeSlots variant="no-date" />
            ) : availabilityLoading ? (
              <p className="font-sans text-body-sm text-muted">Cargando horarios…</p>
            ) : showNoSlots ? (
              <EmptyTimeSlots variant="no-slots" />
            ) : (
              <TimeSlotList
                slots={slots}
                selected={scheduledStart}
                onSelect={handleSelectTime}
              />
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
        location={business?.location}
        totalDuration={totals.duration}
        totalPrice={totals.price}
      />
    </div>
  );
}
