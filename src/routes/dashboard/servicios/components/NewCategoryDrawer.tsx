import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import type { Category } from '@/api/types/categories';
import { categorySchema, type CategoryFormValues } from '../schema';
import { AllowMultipleToggle } from './AllowMultipleToggle';
import { AllowMultipleInfo } from './AllowMultipleInfo';

interface NewCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  isSubmitting?: boolean;
  submitError?: string | null;
  isExtras?: boolean;
  // When set, the drawer renders in edit mode: title/submit label change and
  // the form is pre-populated with the existing category's values.
  category?: Category | null;
}

export function NewCategoryDrawer({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  submitError,
  isExtras = false,
  category,
}: NewCategoryDrawerProps) {
  const isEdit = Boolean(category);
  const title = isEdit
    ? isExtras
      ? 'Editar Grupo de Complementos'
      : 'Editar Categoría'
    : isExtras
      ? 'Nuevo Grupo de Complementos'
      : 'Nueva Categoría';
  const submitLabel = isEdit
    ? 'Guardar Cambios'
    : isExtras
      ? 'Crear Grupo'
      : 'Crear Categoría';

  const defaultValues = useMemo<CategoryFormValues>(
    () => ({
      name: category?.name ?? '',
      allowMultiple: category?.allow_multiple ?? false,
    }),
    [category],
  );

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  useEffect(() => {
    reset(open ? defaultValues : { name: '', allowMultiple: false });
  }, [open, defaultValues, reset]);

  const submit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const formId = 'new-category-form';
  const allowMultiple = watch('allowMultiple');

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      ariaLabel={title}
      widthClassName="md:w-[535px]"
      footer={
        <Button type="submit" form={formId} fullWidth isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      }
    >
      <form id={formId} onSubmit={submit} className="flex flex-col gap-600">
        <Input
          label="Nombre"
          placeholder="Ingresa el nombre"
          error={errors.name?.message}
          autoComplete="off"
          {...register('name')}
        />
        <div className="flex flex-col gap-400">
          <p className="font-sans text-body font-medium text-body">
            ¿Cuántos servicios de esta categoría pueden elegir tus clientes por cita?
          </p>
          <Controller
            name="allowMultiple"
            control={control}
            render={({ field }) => (
              <AllowMultipleToggle value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
        <AllowMultipleInfo allowMultiple={allowMultiple} />
        {submitError && (
          <p role="alert" className="font-sans text-body-sm text-error">
            {submitError}
          </p>
        )}
      </form>
    </Drawer>
  );
}
