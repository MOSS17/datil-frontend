import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { useCategories } from '@/api/hooks/useCategories';
import {
  useCreateService,
  useDeleteService,
  useService,
  useUpdateService,
} from '@/api/hooks/useServices';
import { ErrorState } from '../components/ErrorState';
import { AgregarComplementos } from './components/AgregarComplementos';
import { ServiceForm } from './components/ServiceForm';
import { serviceFormSchema, type ServiceFormValues } from './schema';
import {
  emptyFormValues,
  formToCreateRequest,
  serviceToFormValues,
} from './serviceFormMapping';

type Mode = 'create' | 'edit';

interface ServiceFormPageProps {
  mode: Mode;
}

export default function ServiceFormPage({ mode }: ServiceFormPageProps) {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const [search] = useSearchParams();
  const initialCategory = search.get('category') ?? '';
  const serviceId = params.id ?? '';

  const categoriesQuery = useCategories();
  const serviceQuery = useService(serviceId);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const categories = categoriesQuery.data ?? [];

  const methods = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: emptyFormValues(initialCategory),
  });

  useEffect(() => {
    if (mode === 'edit' && serviceQuery.data) {
      methods.reset(serviceToFormValues(serviceQuery.data));
    }
  }, [mode, serviceQuery.data, methods]);

  const isActive = methods.watch('isActive');

  const onSubmit = methods.handleSubmit(async (values) => {
    if (mode === 'create') {
      await createService.mutateAsync(formToCreateRequest(values, false));
      // TODO: persist values.extrasGroupIds once the service-extras hooks land.
      navigate('/dashboard/servicios');
    } else {
      await updateService.mutateAsync({
        id: serviceId,
        data: formToCreateRequest(values, serviceQuery.data?.is_extra ?? false),
      });
      navigate('/dashboard/servicios');
    }
  });

  const onDelete = async () => {
    if (mode !== 'edit') return;
    const confirmed = window.confirm('¿Seguro que quieres eliminar este servicio?');
    if (!confirmed) return;
    await deleteService.mutateAsync(serviceId);
    navigate('/dashboard/servicios');
  };

  const isLoading =
    categoriesQuery.isLoading || (mode === 'edit' && serviceQuery.isLoading);
  const loadError = categoriesQuery.error ?? (mode === 'edit' ? serviceQuery.error : null);

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
        <Card>
          <ErrorState
            message="No se pudo cargar la información del servicio."
            onRetry={() => {
              categoriesQuery.refetch();
              if (mode === 'edit') serviceQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  const submitBusy = createService.isPending || updateService.isPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={onSubmit}
        className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800"
      >
        <div className="flex flex-col gap-300">
          <div className="flex items-center justify-between gap-400">
            <button
              type="button"
              onClick={() => navigate('/dashboard/servicios')}
              className="inline-flex items-center gap-200 font-sans text-body-sm text-body hover:text-body-emphasis"
            >
              <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
              <span>Atrás</span>
            </button>
            {mode === 'edit' && (
              <Switch
                className="md:hidden"
                checked={isActive}
                onChange={(next) => methods.setValue('isActive', next, { shouldDirty: true })}
                label={isActive ? 'Disponible' : 'No Disponible'}
              />
            )}
          </div>
          <div className="flex flex-col gap-400 md:flex-row md:items-center md:justify-between">
            <h1 className="font-serif text-h4-mobile text-heading md:text-h4">
              {mode === 'create' ? 'Nuevo Servicio' : 'Editar Servicio'}
            </h1>
            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-400">
              {mode === 'create' ? (
                <Button
                  type="submit"
                  isLoading={submitBusy}
                  leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
                >
                  Crear Servicio
                </Button>
              ) : (
                <>
                  <Switch
                    checked={isActive}
                    onChange={(next) => methods.setValue('isActive', next, { shouldDirty: true })}
                    label={isActive ? 'Disponible' : 'No Disponible'}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onDelete}
                    isLoading={deleteService.isPending}
                    leftIcon={<Trash2 size={16} strokeWidth={1.75} aria-hidden />}
                  >
                    Eliminar
                  </Button>
                  <Button
                    type="submit"
                    isLoading={submitBusy}
                    leftIcon={<Save size={16} strokeWidth={1.75} aria-hidden />}
                  >
                    Guardar Cambios
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <p className="font-sans text-body-sm text-muted">Cargando…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-700 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-800">
              <ServiceForm categories={categories} />
              <div className="border-t border-subtle pt-600 md:border-0 md:pt-0">
                <AgregarComplementos extrasGroups={categories} />
              </div>
            </div>
            <div className="flex flex-col gap-300 md:hidden">
              {mode === 'create' ? (
                <Button
                  type="submit"
                  fullWidth
                  isLoading={submitBusy}
                  leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
                >
                  Crear Servicio
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    fullWidth
                    isLoading={submitBusy}
                    leftIcon={<Save size={16} strokeWidth={1.75} aria-hidden />}
                  >
                    Guardar Cambios
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={onDelete}
                    isLoading={deleteService.isPending}
                    leftIcon={<Trash2 size={16} strokeWidth={1.75} aria-hidden />}
                  >
                    Eliminar
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </form>
    </FormProvider>
  );
}
