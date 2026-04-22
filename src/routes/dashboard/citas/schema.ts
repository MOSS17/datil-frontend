import { z } from 'zod';
import { PERSONAL_TIME_TYPE } from '@/lib/constants';

const MX_PHONE_RE = /^[0-9]{10}$/;

export const citaFormSchema = z
  .object({
    service_ids: z.array(z.string()).min(1, 'Selecciona al menos un servicio'),
    date: z.string().min(1, 'Selecciona una fecha'),
    start_time: z.string().min(1, 'Selecciona una hora de inicio'),
    end_time: z.string().min(1, 'Selecciona una hora de fin'),
    customer_name: z.string().min(1, 'Ingresa el nombre del cliente'),
    country_code: z.string().min(1),
    customer_phone: z
      .string()
      .regex(MX_PHONE_RE, 'Por favor, ingresa un número de teléfono válido'),
  })
  .refine((v) => v.start_time < v.end_time, {
    message: 'La hora de fin debe ser mayor que la de inicio',
    path: ['end_time'],
  });

export type CitaFormValues = z.infer<typeof citaFormSchema>;

export const tiempoPersonalFormSchema = z
  .object({
    type: z.enum([
      PERSONAL_TIME_TYPE.HOURS,
      PERSONAL_TIME_TYPE.FULL_DAY,
      PERSONAL_TIME_TYPE.DATE_RANGE,
    ]),
    date: z.string().min(1, 'Selecciona una fecha'),
    end_date: z.string().optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    reason: z.string().optional(),
  })
  .refine(
    (v) =>
      v.type !== PERSONAL_TIME_TYPE.HOURS ||
      (Boolean(v.start_time) && Boolean(v.end_time) && v.start_time! < v.end_time!),
    {
      message: 'Ingresa un rango de horas válido',
      path: ['end_time'],
    },
  );

export type TiempoPersonalFormValues = z.infer<typeof tiempoPersonalFormSchema>;
