import type { Service, CreateServiceRequest } from '@/api/types/services';
import type { ServiceFormValues } from './schema';

export const DURATION_OPTIONS: { value: number; label: string }[] = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '1 hr 30 min' },
  { value: 120, label: '2 hr' },
  { value: 150, label: '2 hr 30 min' },
  { value: 180, label: '3 hr' },
  { value: 240, label: '4 hr' },
  { value: 300, label: '5 hr' },
  { value: 360, label: '6 hr' },
];

const CENTS = 100;

export function formToCreateRequest(
  values: ServiceFormValues,
  isExtra: boolean,
): CreateServiceRequest {
  const priceCents = Math.round(values.price * CENTS);
  const maxCents =
    values.priceType === 'rango' && values.priceMax !== undefined
      ? Math.round(values.priceMax * CENTS)
      : priceCents;
  const advanceCents =
    values.requireAdvance && values.advanceAmount !== undefined
      ? Math.round(values.advanceAmount * CENTS)
      : 0;

  return {
    category_id: values.categoryId,
    name: values.name,
    description: values.description,
    min_price: priceCents,
    max_price: maxCents,
    duration_minutes: values.durationMinutes,
    advance_payment_amount: advanceCents,
    is_extra: isExtra,
    is_active: values.isActive,
  };
}

export function serviceToFormValues(service: Service): ServiceFormValues {
  const isRange = service.max_price > service.min_price;
  const hasAdvance = service.advance_payment_amount > 0;
  return {
    categoryId: service.category_id,
    name: service.name,
    description: service.description,
    priceType: isRange ? 'rango' : 'fijo',
    price: service.min_price / CENTS,
    priceMax: isRange ? service.max_price / CENTS : undefined,
    durationMinutes: service.duration_minutes,
    requireAdvance: hasAdvance,
    advanceAmount: hasAdvance ? service.advance_payment_amount / CENTS : undefined,
    extrasGroupIds: [],
    isActive: service.is_active,
  };
}

export function emptyFormValues(categoryId: string): ServiceFormValues {
  return {
    categoryId,
    name: '',
    description: '',
    priceType: 'fijo',
    price: 0,
    priceMax: undefined,
    durationMinutes: 60,
    requireAdvance: false,
    advanceAmount: undefined,
    extrasGroupIds: [],
    isActive: true,
  };
}
