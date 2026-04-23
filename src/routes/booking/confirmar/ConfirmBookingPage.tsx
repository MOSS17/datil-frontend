import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBusinessBySlug } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import { formatPrice } from '@/lib/formatters';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import { BookingStepper } from '../components/BookingStepper';
import {
  buildServicesMap,
  calculateSelectionDuration,
  calculateSelectionPrice,
} from '../business/selection';
import { DetailsSheet, type DetailsSelection } from '../schedule/components/DetailsSheet';
import { DesktopReservationSummary } from '../datos/components/DesktopReservationSummary';
import {
  formatFullDateWithYear,
  formatShortDate,
  formatTimeLabel,
  formatTimeRange,
} from '../schedule/scheduleUtils';
import { ConfirmBookingSkeleton } from './ConfirmBookingSkeleton';
import { BankFieldRow } from './components/BankFieldRow';
import { CopiedToast } from './components/CopiedToast';
import { PaymentProofUploader } from './components/PaymentProofUploader';
import { ReservationPreviewCard } from './components/ReservationPreviewCard';
import { UPLOAD_ERROR_MESSAGES, validatePaymentProof, type UploadError } from './schema';

const COPY_TOAST_DURATION_MS = 2500;

export default function ConfirmBookingPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selections, scheduledDate, scheduledTime } = useBookingSelection();

  const businessQuery = useBusinessBySlug(slug);
  const servicesQuery = useServices();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<UploadError | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith('image/')) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), COPY_TOAST_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

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

  const totals = useMemo(() => {
    const duration = resolvedSelections.reduce((acc, sel) => acc + sel.duration, 0);
    const price = resolvedSelections.reduce((acc, sel) => acc + sel.price, 0);
    const advance = resolvedSelections.reduce(
      (acc, sel) => acc + (sel.service.advance_payment_amount ?? 0),
      0,
    );
    return { duration, price, advance, remaining: Math.max(price - advance, 0) };
  }, [resolvedSelections]);

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
    return <ConfirmBookingSkeleton />;
  }

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No pudimos cargar tu reservación."
            onRetry={() => {
              businessQuery.refetch();
              servicesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (selections.length === 0 || !scheduledDate || !scheduledTime || !businessQuery.data) {
    return <ConfirmBookingSkeleton />;
  }

  const business = businessQuery.data;

  const handleCopy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setToastMessage(`${label} copiada, lista para pegar.`);
    } catch {
      setToastMessage('No pudimos copiar. Inténtalo de nuevo.');
    }
  };

  const handleSelectFile = (next: File) => {
    const error = validatePaymentProof(next);
    if (error) {
      setUploadError(error);
      return;
    }
    setFile(next);
    setUploadError(null);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    const error = validatePaymentProof(file);
    if (error) {
      setUploadError(error);
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      navigate(`/${slug}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => navigate(`/${slug}/datos`);

  const uploadErrorMessage = uploadError ? UPLOAD_ERROR_MESSAGES[uploadError] : null;
  const remainingLabel =
    totals.remaining > 0
      ? `El resto del pago ( ${formatPrice(totals.remaining)} ) se cobrará el día de la cita.`
      : 'El resto del pago se cobrará el día de la cita.';
  const mobileRemainingLabel =
    totals.remaining > 0
      ? `* El resto del pago ( ${formatPrice(totals.remaining)} MXN ) se cobrará el día de la cita.`
      : '* El resto del pago se cobrará el día de la cita.';

  return (
    <div className="flex flex-col">
      <div className="px-600 py-600 md:px-1200 md:py-1100">
        <BookingStepper currentStep={4} />
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col md:px-1200">
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

        <div className="grid gap-800 px-400 pb-1100 pt-600 md:grid-cols-[360px_1fr] md:gap-1100 md:px-0 md:pt-0">
          <aside className="hidden md:block">
            <DesktopReservationSummary
              selections={resolvedSelections}
              dateLine={dateLine}
              timeLine={timeLine}
              location={business.location}
              totalPrice={totals.price}
            />
          </aside>

          <section className="flex min-w-0 flex-col gap-500">
            <div className="flex flex-col gap-200">
              <h1 className="font-serif text-h5 text-heading">Anticipo</h1>
              <p className="font-sans text-body text-muted md:hidden">
                Realiza la transferencia del anticipo a esta cuenta y añade el comprobante.
              </p>
            </div>

            <div className="hidden flex-col gap-600 rounded-lg border border-default bg-surface p-600 md:flex">
              <p className="font-sans text-body text-body-emphasis">
                Realiza la transferencia del anticipo de{' '}
                <span className="font-bold">{formatPrice(totals.advance)}</span> a esta cuenta y
                añade el comprobante.
              </p>

              <div
                className="grid gap-x-400 gap-y-500"
                style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
              >
                <BankFieldRow
                  label="Total del anticipo"
                  value={formatPrice(totals.advance)}
                  valueBold
                  className="col-start-1 row-start-1"
                />
                <BankFieldRow
                  label="Banco"
                  value={business.bank_name}
                  className="col-start-2 row-start-1"
                />
                <BankFieldRow
                  label="Tipo de cuenta"
                  value="Débito"
                  className="col-start-3 row-start-1"
                />
                <BankFieldRow
                  label="Nombre del beneficiario"
                  value={business.bank_holder}
                  onCopy={() => handleCopy(business.bank_holder, 'Nombre')}
                  className="col-start-2 row-start-2"
                />
                <BankFieldRow
                  label="Clabe"
                  value={business.clabe}
                  onCopy={() => handleCopy(business.clabe, 'Clabe')}
                  className="col-start-1 row-start-3"
                />
              </div>

              <div className="h-px w-full bg-surface-control" />

              <div className="flex flex-col gap-200">
                <p className="font-sans text-body-sm font-medium text-body-emphasis">
                  Comprobante de Pago
                </p>
                <p className="font-sans text-caption text-muted">
                  Sube el comprobante de pago (JPG, PNG o PDF)
                </p>
                <PaymentProofUploader
                  variant="desktop"
                  file={file}
                  previewUrl={previewUrl}
                  error={uploadErrorMessage}
                  onSelect={handleSelectFile}
                  onRemove={handleRemoveFile}
                />
              </div>

              <div className="flex items-center gap-300 rounded-md border border-info bg-surface-info-subtle px-400 py-300">
                <Info size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-icon-info" />
                <p className="font-sans text-body font-medium text-info">{remainingLabel}</p>
              </div>
            </div>

            <div className="flex flex-col gap-500 md:hidden">
              <div className="flex flex-col gap-400 rounded-lg">
                <MobileBankRow label="Banco" value={business.bank_name} />
                <MobileDivider />
                <MobileBankRow
                  label="Clabe"
                  value={business.clabe}
                  onCopy={() => handleCopy(business.clabe, 'Clabe')}
                />
                <MobileDivider />
                <MobileBankRow
                  label="Nombre del beneficiario"
                  value={business.bank_holder}
                  onCopy={() => handleCopy(business.bank_holder, 'Nombre')}
                />
                <MobileDivider />
                <MobileBankRow label="Tipo" value="Débito" />
                <MobileDivider />
                <div className="flex items-center justify-between">
                  <p className="font-sans text-body-sm text-muted">Total del anticipo</p>
                  <p className="font-serif text-h5 font-bold text-body-emphasis">
                    {formatPrice(totals.advance)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-300">
                <h2 className="font-serif text-h5 text-heading">Comprobante de Pago</h2>
                <p className="font-sans text-body text-muted">
                  Sube el comprobante de pago del anticipo (JPG, PNG o PDF)
                </p>
                <PaymentProofUploader
                  variant="mobile"
                  file={file}
                  previewUrl={previewUrl}
                  error={uploadErrorMessage}
                  onSelect={handleSelectFile}
                  onRemove={handleRemoveFile}
                />
              </div>

              <ReservationPreviewCard
                summaryLabel={summaryLabel}
                totalPrice={totals.price}
                shortDate={shortDate}
                startTime={startTime}
                onOpenDetails={() => setDetailsOpen(true)}
              />
            </div>

            <div className="hidden md:flex md:items-center md:justify-end">
              <Button
                type="button"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                leftIcon={<Check size={16} strokeWidth={1.75} aria-hidden />}
              >
                Confirmar Reserva
              </Button>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-500 border-t border-subtle px-600 pb-1100 pt-600 md:hidden">
          <p className="font-sans text-body text-muted">{mobileRemainingLabel}</p>
          <Button
            type="button"
            size="lg"
            fullWidth
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Check size={16} strokeWidth={1.75} aria-hidden />}
          >
            Confirmar Reserva
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
      </div>

      <DetailsSheet
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        selections={resolvedSelections}
        location={business.location}
        totalDuration={totals.duration}
        totalPrice={totals.price}
        dateLine={dateLine}
        timeLine={timeLine}
      />

      <CopiedToast message={toastMessage ?? ''} visible={Boolean(toastMessage)} />
    </div>
  );
}

interface MobileBankRowProps {
  label: string;
  value: string;
  onCopy?: () => void;
}

function MobileBankRow({ label, value, onCopy }: MobileBankRowProps) {
  return (
    <div className="flex flex-col gap-200">
      <p className="font-sans text-body-sm font-medium text-muted">{label}</p>
      <div className="flex items-center justify-between gap-300">
        <p className="truncate font-sans text-body font-medium text-body-emphasis">{value}</p>
        {onCopy ? (
          <button
            type="button"
            onClick={onCopy}
            aria-label={`Copiar ${label.toLowerCase()}`}
            className="inline-flex h-600 w-600 shrink-0 items-center justify-center rounded-sm text-icon hover:bg-surface-secondary-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-border-primary focus-visible:ring-offset-2"
          >
            <Copy size={16} strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function MobileDivider() {
  return <div className="h-px w-full bg-surface-secondary" aria-hidden />;
}
