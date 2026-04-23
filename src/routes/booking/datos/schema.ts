import { z } from 'zod';

export const bookingInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'Por favor, ingresa tu nombre'),
  lastName: z.string().trim().min(1, 'Por favor, ingresa tu apellido'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Por favor, ingresa un número de teléfono válido'),
});

export type BookingInfoForm = z.infer<typeof bookingInfoSchema>;

const storageKey = (slug: string) => `datil:booking:${slug}:info`;

export function readStoredInfo(slug: string): Partial<BookingInfoForm> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = sessionStorage.getItem(storageKey(slug));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return {};
    return {
      firstName: typeof parsed.firstName === 'string' ? parsed.firstName : undefined,
      lastName: typeof parsed.lastName === 'string' ? parsed.lastName : undefined,
      phone: typeof parsed.phone === 'string' ? parsed.phone : undefined,
    };
  } catch {
    return {};
  }
}

export function writeStoredInfo(slug: string, data: BookingInfoForm): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(storageKey(slug), JSON.stringify(data));
}
