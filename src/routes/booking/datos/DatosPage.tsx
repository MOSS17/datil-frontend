import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBusinessBySlug } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import { BookingStepper } from '../components/BookingStepper';
import {
  buildServicesMap,
  calculateSelectionDuration,
  calculateSelectionPrice,
} from '../business/selection';
import {
  DetailsSheet,
  type DetailsSelection,
} from '../schedule/components/DetailsSheet';
import {
  formatFullDateWithYear,
  formatShortDate,
  formatTimeLabel,
  formatTimeRange,
} from '../schedule/scheduleUtils';
import { DatosSkeleton } from './DatosSkeleton';
import { CountryCodeBox } from './components/CountryCodeBox';
import { MobileReservationPill } from './components/MobileReservationPill';
import { DesktopReservationSummary } from './components/DesktopReservationSummary';
import {
  bookingInfoSchema,
  readStoredInfo,
  writeStoredInfo,
  type BookingInfoForm,
} from './schema';

export default function DatosPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selections, scheduledDate, scheduledTime } = useBookingSelection();

  const businessQuery = useBusinessBySlug(slug);
  const servicesQuery = useServices();

  const [detailsOpen, setDetailsOpen] = useState(false);

  const defaults = useMemo(() => readStoredInfo(slug), [slug]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BookingInfoForm>({
    resolver: zodResolver(bookingInfoSchema),
    defaultValues: {
      firstName: defaults.firstName ?? '',
      lastName: defaults.lastName ?? '',
      phone: defaults.phone ?? '',
    },
  });

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

  const totals = useMemo(
    () => ({
      duration: resolvedSelections.reduce((acc, sel) => acc + sel.duration, 0),
      price: resolvedSelections.reduce((acc, sel) => acc + sel.price, 0),
    }),
    [resolvedSelections],
  );

  const summaryLabel = useMemo(
    () =>
      resolvedSelections
        .flatMap((sel) => [sel.service.name, ...sel.extras.map((e) => e.name)])
        .join(' + '),
    [resolvedSelections],
  );

  const dateLine = scheduledDate ? formatFullDateWithYear(scheduledDate) : undefined;
  const timeLine =
    scheduledTime && totals.duration > 0
      ? formatTimeRange(scheduledTime, totals.duration)
      : undefined;
  const shortDate = scheduledDate ? formatShortDate(scheduledDate) : undefined;
  const startTime = scheduledTime ? formatTimeLabel(scheduledTime) : undefined;

  const isLoading = businessQuery.isLoading || servicesQuery.isLoading;
  const queryError = businessQuery.error ?? servicesQuery.error;

  useEffect(() => {
    if (isLoading) return;
    if (selections.length === 0) {
      navigate(`/${slug}`, { replace: true });
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      navigate(`/${slug}/horario`, { replace: true });
    }
  }, [isLoading, selections.length, scheduledDate, scheduledTime, slug, navigate]);

  if (isLoading) {
    return <DatosSkeleton />;
  }

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No pudimos cargar tu información."
            onRetry={() => {
              businessQuery.refetch();
              servicesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (selections.length === 0 || !scheduledDate || !scheduledTime) {
    return <DatosSkeleton />;
  }

  const onSubmit = (data: BookingInfoForm) => {
    writeStoredInfo(slug, data);
    navigate(`/${slug}/confirmar`);
  };

  const handleBack = () => navigate(`/${slug}/horario`);

  return (
    <div className="flex flex-col">
      <div className="px-600 py-600 md:px-1200 md:py-1100">
        <BookingStepper currentStep={3} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="mx-auto flex w-full max-w-[1440px] flex-col md:px-1200"
      >
        <div className="hidden md:block md:pb-400">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-200 py-300 font-sans text-body-sm font-medium text-secondary hover:text-secondary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
            Atrás
          </button>
        </div>

        <div className="grid gap-800 px-400 pb-1100 pt-600 md:grid-cols-[360px_1fr] md:gap-1100 md:px-0 md:pb-1100 md:pt-0">
          <aside className="hidden md:block">
            <DesktopReservationSummary
              selections={resolvedSelections}
              dateLine={dateLine}
              timeLine={timeLine}
              location={businessQuery.data?.location}
              totalPrice={totals.price}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-800">
            <div className="flex flex-col gap-200">
              <h1 className="font-serif text-h5 text-heading">Tu Información</h1>
              <p className="font-sans text-body text-muted">
                Ingresa tus datos para agendar tu cita.
              </p>
            </div>

            <div className="flex flex-col gap-500 md:rounded-lg md:border md:border-default md:bg-surface md:p-600">
              <div className="grid gap-500 md:grid-cols-2 md:gap-400">
                <Input
                  label="Nombre"
                  placeholder="Ingresa tu nombre"
                  autoComplete="given-name"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
                <Input
                  label="Apellidos"
                  placeholder="Ingresa tu apellido"
                  autoComplete="family-name"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
              <div className="flex flex-col gap-200">
                <label
                  htmlFor="booking-phone"
                  className="font-sans text-body-sm font-medium text-body-emphasis"
                >
                  Número de Teléfono de WhatsApp
                </label>
                <div className="flex min-w-0 items-start gap-200">
                  <CountryCodeBox />
                  <Input
                    id="booking-phone"
                    placeholder="(555) 123-4567"
                    inputMode="tel"
                    autoComplete="tel-national"
                    containerClassName="min-w-0 flex-1"
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
              </div>
            </div>

            <div className="md:hidden">
              <MobileReservationPill
                summaryLabel={summaryLabel}
                totalPrice={totals.price}
                shortDate={shortDate}
                startTime={startTime}
                onOpenDetails={() => setDetailsOpen(true)}
              />
            </div>

            <div className="hidden md:flex md:items-center md:justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Continuar con Anticipo
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-600 border-t border-subtle px-600 pb-1100 pt-600 md:hidden">
          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Continuar con Anticipo
          </Button>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-200 font-sans text-body font-medium text-secondary hover:text-secondary-hover focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
          >
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
            Regresar
          </button>
        </div>
      </form>

      <DetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        selections={resolvedSelections}
        location={businessQuery.data?.location}
        totalDuration={totals.duration}
        totalPrice={totals.price}
        dateLine={dateLine}
        timeLine={timeLine}
      />
    </div>
  );
}
