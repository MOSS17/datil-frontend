import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar as CalendarIcon,
  Clock,
  Download,
  Pen,
  Save,
  X,
} from 'lucide-react';
import type { Appointment, AppointmentService } from '@/api/types/appointments';
import type { Service } from '@/api/types/services';
import type { Category } from '@/api/types/categories';
import type { Business } from '@/api/types/business';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  ServiceChipsSelect,
  type ServiceOption,
} from '@/routes/dashboard/citas/components/ServiceChipsSelect';
import {
  citaFormSchema,
  type CitaFormValues,
} from '@/routes/dashboard/citas/schema';
import {
  TIME_OPTIONS,
  formatLongDateEs,
  toBusinessRfc3339,
} from '@/routes/dashboard/citas/utils';
import {
  useDeleteAppointment,
  useUpdateAppointment,
} from '@/api/hooks/useAppointments';
import { computeDurationMin } from '@/lib/appointmentEnrich';
import {
  formatDuration,
  formatPhone,
  formatPrice,
} from '@/lib/formatters';
import { ApiError } from '@/api/client';
import { cn } from '@/lib/cn';

type Mode = 'view' | 'edit';

interface BookingDetailDrawerProps {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  services: Service[];
  categories: Category[];
  business?: Business;
  onSaved?: () => void;
  onDeleted?: () => void;
  onError?: (message: string) => void;
}

export function BookingDetailDrawer({
  appointment,
  open,
  onClose,
  services,
  categories,
  business,
  onSaved,
  onDeleted,
  onError,
}: BookingDetailDrawerProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const deleteAppointment = useDeleteAppointment();

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Reset local state when the drawer closes or switches appointments.
  useEffect(() => {
    if (!open) {
      setMode('view');
      setConfirmDeleteOpen(false);
    }
  }, [open]);
  useEffect(() => {
    setMode('view');
    setConfirmDeleteOpen(false);
  }, [appointment?.id]);

  const handleDeleteConfirmed = async () => {
    if (!appointment) return;
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      setConfirmDeleteOpen(false);
      onDeleted?.();
    } catch (err) {
      setConfirmDeleteOpen(false);
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : 'No pudimos eliminar la cita. Inténtalo de nuevo.';
      onError?.(message);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={-1}
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-surface-primary/25 transition-opacity',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={
          mode === 'edit' ? 'Editar cita' : appointment?.customer_name ?? 'Detalles de cita'
        }
        className={cn(
          'fixed inset-0 z-50 flex flex-col bg-surface shadow-xl transition-transform duration-200',
          'md:inset-y-0 md:left-auto md:right-0 md:w-[520px]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {appointment && mode === 'view' && (
          <ViewContent
            appointment={appointment}
            onClose={onClose}
            onEdit={() => setMode('edit')}
          />
        )}
        {appointment && mode === 'edit' && (
          <EditContent
            appointment={appointment}
            services={services}
            categories={categories}
            business={business}
            isDeleting={deleteAppointment.isPending}
            onCancel={() => setMode('view')}
            onSaved={() => {
              onSaved?.();
              setMode('view');
            }}
            onDeleteRequest={() => setConfirmDeleteOpen(true)}
            onError={onError}
          />
        )}
      </aside>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => !deleteAppointment.isPending && setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteConfirmed}
        title="¿Eliminar esta cita?"
        description="Esta acción no se puede deshacer. Se eliminarán los datos del cliente y la reserva."
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        isLoading={deleteAppointment.isPending}
      />
    </>
  );
}

// ─── View mode ─────────────────────────────────────────────────────────────

function ViewContent({
  appointment,
  onClose,
  onEdit,
}: {
  appointment: Appointment;
  onClose: () => void;
  onEdit: () => void;
}) {
  const mains = appointment.services.filter((s) => !s.is_extra);
  const extras = appointment.services.filter((s) => !!s.is_extra);
  const durationMin = computeDurationMin(appointment);
  const hasProof = Boolean(appointment.advance_payment_image_url);
  const proofFilename = useMemo(() => {
    const url = appointment.advance_payment_image_url;
    if (!url) return '';
    try {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.split('/').pop() ?? 'comprobante');
    } catch {
      return url.split('/').pop() ?? 'comprobante';
    }
  }, [appointment.advance_payment_image_url]);

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-600 p-600 md:p-1100">
          <header className="flex items-center justify-between gap-400">
            <h2 className="font-serif text-h4 text-heading">
              {appointment.customer_name}
            </h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onClose}
              className="inline-flex h-800 w-800 items-center justify-center rounded-md text-icon hover:bg-surface-secondary-subtle"
            >
              <X size={24} strokeWidth={1.75} aria-hidden />
            </button>
          </header>

          <hr className="border-t border-subtle" aria-hidden />

          {(mains.length > 0 || extras.length > 0) && (
            <>
              <div className="flex flex-col gap-400">
                {mains.map((m, idx) => (
                  <ServiceGroup
                    key={`${m.service_id}-${idx}`}
                    main={m}
                    extras={idx === mains.length - 1 ? extras : []}
                  />
                ))}
                {mains.length === 0 &&
                  extras.map((e, idx) => (
                    <ServiceGroup
                      key={`${e.service_id}-${idx}`}
                      main={e}
                      extras={[]}
                    />
                  ))}
              </div>
              <hr className="border-t border-default" aria-hidden />
            </>
          )}

          <section aria-label="Fecha y Hora" className="flex flex-col gap-300">
            <p className="font-sans text-body-sm font-medium text-muted">
              Fecha y Hora
            </p>
            <p className="font-sans text-body text-body-emphasis">
              {formatLongDateEs(new Date(appointment.start_time))}
            </p>
            <p className="font-sans text-body text-body-emphasis">
              {formatTimeRange(appointment.start_time, appointment.end_time)}
            </p>
          </section>

          <hr className="border-t border-default" aria-hidden />

          <section aria-label="Total" className="flex flex-col gap-200">
            <div className="flex items-center justify-between text-body-emphasis">
              <p className="font-sans text-body-lg font-semibold">Total</p>
              <p className="font-serif text-h5 font-semibold">
                {formatPrice(appointment.total)}
              </p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-200">
                <Clock aria-hidden size={16} strokeWidth={1.75} className="text-icon" />
                <p className="font-sans text-body-sm font-medium text-body-emphasis">
                  Duración
                </p>
              </div>
              <p className="font-sans text-body-sm text-body-emphasis">
                {formatDuration(durationMin)}
              </p>
            </div>
          </section>

          {hasProof && (
            <>
              <hr className="border-t border-default" aria-hidden />
              <section aria-label="Anticipo" className="flex flex-col gap-300">
                <p className="font-sans text-body-sm font-medium text-muted">
                  Anticipo
                </p>
                <div className="flex items-center justify-between gap-400 rounded-lg bg-surface-secondary-subtle px-300 py-200">
                  <div className="flex min-w-0 items-center gap-400">
                    <img
                      src={appointment.advance_payment_image_url ?? ''}
                      alt=""
                      className="h-1400 w-1400 shrink-0 rounded-md border border-default object-cover"
                    />
                    <p className="truncate font-sans text-body-sm font-semibold text-body-emphasis">
                      {proofFilename}
                    </p>
                  </div>
                  <a
                    href={appointment.advance_payment_image_url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    aria-label="Descargar comprobante"
                    className="inline-flex h-800 w-800 shrink-0 items-center justify-center rounded-md text-icon hover:bg-surface-secondary"
                  >
                    <Download size={24} strokeWidth={1.75} aria-hidden />
                  </a>
                </div>
              </section>
            </>
          )}

          <hr className="border-t border-default" aria-hidden />

          <section aria-label="Teléfono" className="flex flex-col gap-300">
            <p className="font-sans text-body-sm font-medium text-muted">Teléfono</p>
            <p className="font-sans text-body text-body-emphasis">
              {formatPhoneWithCountry(appointment.customer_phone)}
            </p>
          </section>
        </div>
      </div>
      <footer className="border-t border-subtle px-600 py-600 md:px-1100">
        <Button
          variant="secondary"
          fullWidth
          onClick={onEdit}
          leftIcon={<Pen aria-hidden size={16} strokeWidth={1.75} />}
        >
          Editar Cita
        </Button>
      </footer>
    </>
  );
}

function ServiceGroup({
  main,
  extras,
}: {
  main: AppointmentService;
  extras: AppointmentService[];
}) {
  return (
    <div className="flex flex-col gap-400">
      <div className="flex items-start justify-between gap-400">
        <p className="font-sans text-body font-bold text-body-emphasis">
          {main.service_name ?? 'Servicio'}
        </p>
        <div className="flex shrink-0 items-center gap-200">
          <p className="font-sans text-body-sm">{formatDuration(main.duration)}</p>
          <span aria-hidden className="h-100 w-100 rounded-full bg-neutral-300" />
          <p className="font-sans text-body-sm font-bold text-body-emphasis">
            {formatPrice(main.price)}
          </p>
        </div>
      </div>
      {extras.map((extra, idx) => (
        <div
          key={`${extra.service_id}-${idx}`}
          className="flex items-center justify-between gap-400 border-l border-primary bg-surface-secondary-subtle px-400 py-200"
        >
          <p className="font-sans text-body-sm">
            + {extra.service_name ?? 'Complemento'}
          </p>
          <p className="font-sans text-body-sm font-bold text-body-emphasis">
            {formatPrice(extra.price)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Edit mode ─────────────────────────────────────────────────────────────

interface EditContentProps {
  appointment: Appointment;
  services: Service[];
  categories: Category[];
  business?: Business;
  isDeleting: boolean;
  onCancel: () => void;
  onSaved: () => void;
  onDeleteRequest: () => void;
  onError?: (message: string) => void;
}

function EditContent({
  appointment,
  services,
  categories,
  business,
  isDeleting,
  onCancel,
  onSaved,
  onDeleteRequest,
  onError,
}: EditContentProps) {
  const updateAppointment = useUpdateAppointment();

  const defaults = useMemo(() => appointmentToFormValues(appointment), [appointment]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CitaFormValues>({
    resolver: zodResolver(citaFormSchema),
    defaultValues: defaults,
  });

  const serviceOptions: ServiceOption[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    isExtra: s.is_extra,
    categoryId: s.category_id,
  }));
  const categoryGroups = categories.map((c) => ({ id: c.id, name: c.name }));

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateAppointment.mutateAsync({
        id: appointment.id,
        data: {
          customer_name: values.customer_name,
          customer_email: appointment.customer_email,
          customer_phone: `${values.country_code}${values.customer_phone}`,
          start_time: toBusinessRfc3339(
            values.date,
            values.start_time,
            business?.timezone,
          ),
          end_time: toBusinessRfc3339(values.date, values.end_time, business?.timezone),
          total: appointment.total,
        },
      });
      onSaved();
    } catch (err) {
      const message =
        err instanceof ApiError && err.message
          ? err.message
          : 'No pudimos guardar los cambios. Inténtalo de nuevo.';
      onError?.(message);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-600 p-600 md:p-1100">
          <header className="flex items-center justify-between gap-400">
            <h2 className="font-serif text-h4 text-heading">Editar Cita</h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={onCancel}
              className="inline-flex h-800 w-800 items-center justify-center rounded-md text-icon hover:bg-surface-secondary-subtle"
            >
              <X size={24} strokeWidth={1.75} aria-hidden />
            </button>
          </header>

          <Controller
            control={control}
            name="service_ids"
            render={({ field }) => (
              <ServiceChipsSelect
                label="Servicios Principales y Complementos"
                options={serviceOptions}
                categories={categoryGroups}
                value={field.value}
                onChange={field.onChange}
                error={errors.service_ids?.message}
                disabled
              />
            )}
          />

          <Input
            label="Fecha"
            type="date"
            rightAddon={<CalendarIcon size={16} strokeWidth={1.75} aria-hidden />}
            error={errors.date?.message}
            {...register('date')}
          />

          <div className="grid grid-cols-2 gap-300">
            <Select
              label="Inicio"
              options={TIME_OPTIONS}
              placeholder="00:00 AM"
              error={errors.start_time?.message}
              {...register('start_time')}
            />
            <Select
              label="Fin"
              options={TIME_OPTIONS}
              placeholder="00:00 AM"
              error={errors.end_time?.message}
              {...register('end_time')}
            />
          </div>

          <Input
            label="Nombre del Cliente"
            placeholder="Ingresa el nombre"
            error={errors.customer_name?.message}
            {...register('customer_name')}
          />

          <div className="flex flex-col gap-200">
            <label
              htmlFor="edit-customer-phone"
              className="font-sans text-body-sm font-medium text-body-emphasis"
            >
              Número de Teléfono de WhatsApp
            </label>
            <div className="flex items-stretch gap-200">
              <Select
                aria-label="Código de país"
                options={[{ value: '+52', label: '+52' }]}
                containerClassName="w-[88px]"
                {...register('country_code')}
              />
              <Input
                id="edit-customer-phone"
                inputMode="numeric"
                placeholder="(555) 123-4567"
                containerClassName="flex-1"
                error={errors.customer_phone?.message}
                {...register('customer_phone')}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-subtle">
        <div className="flex flex-col gap-300 px-600 py-600 md:px-1100">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isSubmitting || updateAppointment.isPending}
            leftIcon={<Save aria-hidden size={16} strokeWidth={1.75} />}
          >
            Guardar Cambios
          </Button>
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onDeleteRequest}
            disabled={isDeleting}
            leftIcon={<Pen aria-hidden size={16} strokeWidth={1.75} />}
          >
            Eliminar Cita
          </Button>
        </div>
      </footer>
    </form>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatTimeHHMM(iso: string): string {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function formatIsoDateLocal(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatTimeRange(startIso: string, endIso: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${pad2(m)} ${period}`;
  };
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function formatPhoneWithCountry(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && raw.startsWith('+52')) {
    return `+52 ${formatPhone(digits.slice(2))}`;
  }
  if (digits.length === 10) return `+52 ${formatPhone(digits)}`;
  return raw;
}

function appointmentToFormValues(appt: Appointment): CitaFormValues {
  const raw = appt.customer_phone ?? '';
  let countryCode = '+52';
  let phone = raw.replace(/\D/g, '');
  if (raw.startsWith('+')) {
    // Assume 2-digit country code ("+52..."); keep the rest as the local part.
    countryCode = raw.slice(0, 3);
    phone = phone.slice(2);
  }
  return {
    service_ids: appt.services.map((s) => s.service_id),
    date: formatIsoDateLocal(appt.start_time),
    start_time: formatTimeHHMM(appt.start_time),
    end_time: formatTimeHHMM(appt.end_time),
    customer_name: appt.customer_name,
    country_code: countryCode,
    customer_phone: phone,
  };
}
