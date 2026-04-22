import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PERSONAL_TIME_TYPE } from '@/lib/constants';
import { tiempoPersonalFormSchema, type TiempoPersonalFormValues } from '../schema';
import { TIME_OPTIONS } from '../utils';
import { InfoBanner } from './InfoBanner';

interface TiempoPersonalFormProps {
  defaultDate?: string;
  defaultStartTime?: string;
  defaultEndTime?: string;
  infoMessage?: string | null;
  isSubmitting?: boolean;
  onSubmit: (values: TiempoPersonalFormValues) => void | Promise<void>;
}

const DURATION_OPTIONS = [
  { value: PERSONAL_TIME_TYPE.HOURS, label: 'Horas' },
  { value: PERSONAL_TIME_TYPE.FULL_DAY, label: 'Día completo' },
  { value: PERSONAL_TIME_TYPE.DATE_RANGE, label: 'Rango de fechas' },
];

export function TiempoPersonalForm({
  defaultDate = '',
  defaultStartTime,
  defaultEndTime,
  infoMessage,
  isSubmitting,
  onSubmit,
}: TiempoPersonalFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TiempoPersonalFormValues>({
    resolver: zodResolver(tiempoPersonalFormSchema),
    defaultValues: {
      type: PERSONAL_TIME_TYPE.HOURS,
      date: defaultDate,
      start_time: defaultStartTime ?? '10:00',
      end_time: defaultEndTime ?? '11:00',
    },
  });

  const type = watch('type');
  const showTimes = type === PERSONAL_TIME_TYPE.HOURS;
  const showEndDate = type === PERSONAL_TIME_TYPE.DATE_RANGE;

  return (
    <form
      id="nuevo-bloque-tiempo-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-500"
    >
      <Select
        label="Duración"
        options={DURATION_OPTIONS}
        leftIcon={<Clock size={16} strokeWidth={1.75} aria-hidden />}
        {...register('type')}
      />

      <Input
        label="Fecha"
        type="date"
        rightAddon={<CalendarIcon size={16} strokeWidth={1.75} aria-hidden />}
        error={errors.date?.message}
        {...register('date')}
      />

      {showEndDate && (
        <Input
          label="Fecha de fin"
          type="date"
          rightAddon={<CalendarIcon size={16} strokeWidth={1.75} aria-hidden />}
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      )}

      {showTimes && (
        <div className="grid grid-cols-2 gap-300">
          <Select
            label="Inicio"
            options={TIME_OPTIONS}
            error={errors.start_time?.message}
            {...register('start_time')}
          />
          <Select
            label="Fin"
            options={TIME_OPTIONS}
            error={errors.end_time?.message}
            {...register('end_time')}
          />
        </div>
      )}

      {infoMessage && <InfoBanner tone="info">{infoMessage}</InfoBanner>}

      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isSubmitting}
        className="mt-200"
      >
        Agendar Tiempo Personal
      </Button>
    </form>
  );
}
