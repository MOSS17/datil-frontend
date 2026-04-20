import { z } from 'zod';

export const configuracionSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(40, 'Máximo 40 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().max(280, 'Máximo 280 caracteres').optional().or(z.literal('')),
});

export type ConfiguracionFormValues = z.infer<typeof configuracionSchema>;
