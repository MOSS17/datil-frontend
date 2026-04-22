import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'Ingresa un nombre'),
  allowMultiple: z.boolean(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export const serviceFormSchema = z
  .object({
    categoryId: z.string().min(1, 'Selecciona una categoría'),
    name: z.string().trim().min(1, 'Ingresa un nombre'),
    description: z.string().trim(),
    priceType: z.enum(['fijo', 'rango']),
    price: z
      .number({ error: (issue) => (issue.input === undefined ? 'Ingresa un precio' : 'Ingresa un precio válido') })
      .min(0, 'El precio no puede ser negativo'),
    priceMax: z
      .number({ error: 'Ingresa un precio máximo' })
      .min(0, 'El precio no puede ser negativo')
      .optional(),
    durationMinutes: z.number().int().nonnegative('Selecciona una duración'),
    requireAdvance: z.boolean(),
    advanceAmount: z.number().min(0, 'El anticipo no puede ser negativo').optional(),
    extrasGroupIds: z.array(z.string()),
    isActive: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.priceType === 'rango') {
      if (values.priceMax === undefined || Number.isNaN(values.priceMax)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['priceMax'],
          message: 'Ingresa un precio máximo',
        });
      } else if (values.priceMax < values.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['priceMax'],
          message: 'El máximo debe ser mayor o igual al mínimo',
        });
      }
    }
    if (values.requireAdvance) {
      if (values.advanceAmount === undefined || Number.isNaN(values.advanceAmount)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['advanceAmount'],
          message: 'Ingresa la cantidad del anticipo',
        });
      } else if (values.advanceAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['advanceAmount'],
          message: 'El anticipo debe ser mayor a 0',
        });
      } else if (values.advanceAmount > values.price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['advanceAmount'],
          message: 'El anticipo no puede superar el precio',
        });
      }
    }
  });

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
