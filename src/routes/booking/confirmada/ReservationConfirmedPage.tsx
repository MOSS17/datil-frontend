import { useEffect, useMemo } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusinessBySlug } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import { formatPrice } from '@/lib/formatters';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import {
  buildServicesMap,
  calculateSelectionDuration,
  calculateSelectionPrice,
} from '../business/selection';
import {
  formatFullDateShortWeekday,
  formatTimeRange,
} from '../schedule/scheduleUtils';
import { readStoredInfo } from '../datos/schema';

function formatMexicanPhone(digits: string): string {
  if (digits.length !== 10) return digits;
  return `+52 ${digits.slice(0, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
}

export default function ReservationConfirmedPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selections, scheduledDate, scheduledTime, clearSelections } = useBookingSelection();

  const businessQuery = useBusinessBySlug(slug);
  const servicesQuery = useServices();

  const servicesById = useMemo(
    () => buildServicesMap(servicesQuery.data ?? []),
    [servicesQuery.data],
  );

  const resolved = useMemo(
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
        .filter((s): s is NonNullable<typeof s> => s !== null),
    [selections, servicesById],
  );

  const totals = useMemo(() => {
    const duration = resolved.reduce((acc, sel) => acc + sel.duration, 0);
    const price = resolved.reduce((acc, sel) => acc + sel.price, 0);
    const advance = resolved.reduce(
      (acc, sel) => acc + (sel.service.advance_payment_amount ?? 0),
      0,
    );
    return { duration, price, advance, remaining: Math.max(price - advance, 0) };
  }, [resolved]);

  const summaryLabel = useMemo(
    () =>
      resolved
        .flatMap((sel) => [sel.service.name, ...sel.extras.map((e) => e.name)])
        .join(' + '),
    [resolved],
  );

  const storedPhone = useMemo(() => readStoredInfo(slug).phone, [slug]);
  const phoneLabel = storedPhone ? formatMexicanPhone(storedPhone) : null;

  const dateLine = scheduledDate ? formatFullDateShortWeekday(scheduledDate) : null;
  const timeLine =
    scheduledTime && totals.duration > 0
      ? formatTimeRange(scheduledTime, totals.duration)
      : null;

  const isLoading = businessQuery.isLoading || servicesQuery.isLoading;
  const queryError = businessQuery.error ?? servicesQuery.error;

  useEffect(() => {
    if (isLoading) return;
    if (selections.length === 0 || !scheduledDate || !scheduledTime) {
      navigate(`/${slug}`, { replace: true });
    }
  }, [isLoading, selections.length, scheduledDate, scheduledTime, slug, navigate]);

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No pudimos cargar tu confirmación."
            onRetry={() => {
              businessQuery.refetch();
              servicesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (isLoading || selections.length === 0 || !scheduledDate || !scheduledTime) {
    return null;
  }

  const handleBookAnother = () => {
    clearSelections();
    navigate(`/${slug}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-[520px] flex-col items-center gap-600 px-600 pb-1100 pt-1100 md:pt-1300">
      <div
        aria-hidden
        className="flex h-1400 w-1400 items-center justify-center rounded-full bg-surface-success-subtle"
      >
        <Check size={32} strokeWidth={1.75} className="text-icon" aria-hidden />
      </div>

      <div className="flex flex-col items-center gap-300 text-center">
        <h1 className="font-serif text-h5 text-heading md:text-h4">Reserva Confirmada</h1>
        <p className="font-sans text-body text-primary-400">
          Su cita ha sido reservada con éxito. Hemos enviado un mensaje de confirmación a tu
          WhatsApp{phoneLabel ? ` (${phoneLabel})` : ''}.
        </p>
      </div>

      <div className="flex w-full flex-col gap-500 rounded-lg border border-control bg-surface p-600 md:p-700">
        <DetailRow label="Servicio" value={summaryLabel} />
        <Divider />
        {dateLine ? (
          <>
            <DetailRow label="Fecha" value={dateLine} />
            <Divider />
          </>
        ) : null}
        {timeLine ? (
          <>
            <DetailRow label="Hora" value={timeLine} />
            <Divider />
          </>
        ) : null}
        {businessQuery.data?.location ? (
          <>
            <DetailRow label="Lugar" value={businessQuery.data.location} />
            <Divider />
          </>
        ) : null}
        <div className="flex items-start justify-between gap-400">
          <p className="font-sans text-body-sm text-muted">Resto a pagar</p>
          <p className="font-serif text-h6 font-bold text-body-emphasis">
            {formatPrice(totals.remaining)}
          </p>
        </div>
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={handleBookAnother}
        leftIcon={<CalendarDays size={16} strokeWidth={1.75} aria-hidden />}
        className="border-subtle"
      >
        Agendar Otra Cita
      </Button>
    </div>
  );
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-400">
      <p className="shrink-0 font-sans text-body-sm text-muted">{label}</p>
      <p className="text-right font-sans text-body-sm font-medium text-body-emphasis">{value}</p>
    </div>
  );
}

function Divider() {
  return <div aria-hidden className="h-px w-full bg-surface-secondary" />;
}
