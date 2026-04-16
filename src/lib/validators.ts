import { z } from 'zod';

export const emailSchema = z.string().email('Correo electrónico inválido');

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, 'Debe ser un número de teléfono de 10 dígitos');

export const clabeSchema = z
  .string()
  .regex(/^\d{18}$/, 'La CLABE debe tener 18 dígitos');

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido');

export const priceSchema = z.number().positive('El precio debe ser mayor a 0');
