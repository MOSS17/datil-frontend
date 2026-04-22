import { Controller, useFormContext } from 'react-hook-form';
import type { Category } from '@/api/types/categories';
import { Checkbox } from '@/components/ui/Checkbox';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { DURATION_OPTIONS } from '../serviceFormMapping';
import type { ServiceFormValues } from '../schema';
import { PriceTypeToggle } from './PriceTypeToggle';

interface ServiceFormProps {
  categories: Category[];
}

export function ServiceForm({ categories }: ServiceFormProps) {
  const {
    register,
    control,
    formState: { errors },
    watch,
  } = useFormContext<ServiceFormValues>();

  const priceType = watch('priceType');
  const requireAdvance = watch('requireAdvance');

  return (
    <div className="flex flex-col gap-600">
      <Controller
        name="categoryId"
        control={control}
        render={({ field }) => (
          <Select
            label="Categoría"
            placeholder="Selecciona una categoría"
            error={errors.categoryId?.message}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
          />
        )}
      />

      <Input
        label="Nombre"
        placeholder="Ingresa el nombre del servicio"
        error={errors.name?.message}
        autoComplete="off"
        {...register('name')}
      />

      <Textarea
        label="Descripción"
        placeholder="Escribe una breve descripción del servicio"
        error={errors.description?.message}
        rows={3}
        {...register('description')}
      />

      <div className="flex flex-col gap-300">
        <span className="font-sans text-body-sm font-medium text-body-emphasis">Tipo de Precio</span>
        <Controller
          name="priceType"
          control={control}
          render={({ field }) => (
            <PriceTypeToggle value={field.value} onChange={field.onChange} />
          )}
        />
        <p className="font-sans text-caption text-muted">
          {priceType === 'fijo' ? 'Un solo precio siempre.' : 'Rango de precios. Para servicios con precio dinámico.'}
        </p>
      </div>

      {priceType === 'fijo' ? (
        <div className="flex flex-col gap-400 md:flex-row">
          <Input
            label="Precio"
            type="number"
            min={0}
            step="0.01"
            placeholder="0.00"
            leftAddon={<span className="text-muted">$</span>}
            error={errors.price?.message}
            containerClassName="md:flex-1"
            {...register('price', { valueAsNumber: true })}
          />
          <Controller
            name="durationMinutes"
            control={control}
            render={({ field }) => (
              <Select
                label="Duración"
                error={errors.durationMinutes?.message}
                options={DURATION_OPTIONS.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                value={String(field.value)}
                onChange={(event) => field.onChange(Number(event.target.value))}
                onBlur={field.onBlur}
                name={field.name}
                containerClassName="md:flex-1"
              />
            )}
          />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-200">
            <span className="font-sans text-body-sm font-medium text-body-emphasis">Precio</span>
            <div className="flex items-center gap-300">
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                leftAddon={<span className="text-muted">$</span>}
                error={errors.price?.message}
                aria-label="Precio mínimo"
                {...register('price', { valueAsNumber: true })}
              />
              <span aria-hidden className="font-sans text-body text-muted">–</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                leftAddon={<span className="text-muted">$</span>}
                error={errors.priceMax?.message}
                aria-label="Precio máximo"
                {...register('priceMax', { valueAsNumber: true })}
              />
            </div>
          </div>
          <Controller
            name="durationMinutes"
            control={control}
            render={({ field }) => (
              <Select
                label="Duración"
                error={errors.durationMinutes?.message}
                options={DURATION_OPTIONS.map((o) => ({
                  value: String(o.value),
                  label: o.label,
                }))}
                value={String(field.value)}
                onChange={(event) => field.onChange(Number(event.target.value))}
                onBlur={field.onBlur}
                name={field.name}
              />
            )}
          />
        </>
      )}

      <div className="flex flex-col gap-200">
        <Controller
          name="requireAdvance"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Pedir Anticipo"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              name={field.name}
            />
          )}
        />
        {requireAdvance && (
          <>
            <p className="font-sans text-caption text-muted">
              A tus clientes se les pedirá que suban un comprobante de su pago.
            </p>
            <Input
              label="Cantidad de Anticipo"
              type="number"
              min={0}
              step="0.01"
              placeholder="0.00"
              leftAddon={<span className="text-muted">$</span>}
              error={errors.advanceAmount?.message}
              containerClassName="mt-200"
              {...register('advanceAmount', { valueAsNumber: true })}
            />
          </>
        )}
      </div>
    </div>
  );
}
