import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { Service } from '@/api/types/services';
import { citaFormSchema, type CitaFormValues } from '../schema';
import { TIME_OPTIONS } from '../utils';
import { ServiceChipsSelect, type ServiceOption } from './ServiceChipsSelect';
import { InfoBanner } from './InfoBanner';

interface CitaFormProps {
  services: Service[];
  defaultDate?: string;
  outsideWorkingHours?: boolean;
  conflictMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: CitaFormValues) => void | Promise<void>;
}

export function CitaForm({
  services,
  defaultDate = '',
  outsideWorkingHours,
  conflictMessage,
  isSubmitting,
  onSubmit,
}: CitaFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitaFormValues>({
    resolver: zodResolver(citaFormSchema),
    defaultValues: {
      service_ids: [],
      date: defaultDate,
      start_time: '',
      end_time: '',
      customer_name: '',
      country_code: '+52',
      customer_phone: '',
    },
  });

  const serviceOptions: ServiceOption[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    isExtra: s.is_extra,
  }));

  return (
    <form
      id="nuevo-bloque-cita-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-500"
    >
      <Controller
        control={control}
        name="service_ids"
        render={({ field }) => (
          <ServiceChipsSelect
            label="Servicios Principales y Complementos"
            options={serviceOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.service_ids?.message}
          />
        )}
      />

      <div className="flex flex-col gap-200">
        <Input
          label="Fecha"
          type="date"
          rightAddon={<CalendarIcon size={16} strokeWidth={1.75} aria-hidden />}
          error={errors.date?.message}
          {...register('date')}
        />
        {!errors.date && outsideWorkingHours && (
          <InfoBanner tone="warning">Este día está fuera de tu horario laboral.</InfoBanner>
        )}
      </div>

      <div className="flex flex-col gap-200">
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
        {conflictMessage && <InfoBanner tone="warning">{conflictMessage}</InfoBanner>}
      </div>

      <Input
        label="Nombre del Cliente"
        placeholder="Ingresa el nombre"
        error={errors.customer_name?.message}
        {...register('customer_name')}
      />

      <div className="flex flex-col gap-200">
        <label
          htmlFor="customer-phone"
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
            id="customer-phone"
            inputMode="numeric"
            placeholder="(555) 123-4567"
            containerClassName="flex-1"
            error={errors.customer_phone?.message}
            {...register('customer_phone')}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-200"
      >
        Agendar Cita
      </Button>
    </form>
  );
}
