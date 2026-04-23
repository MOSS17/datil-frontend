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
import { applyApiErrors } from '@/api/formErrors';
import { ErrorState } from '../components/ErrorState';
import { AgregarComplementos } from './components/AgregarComplementos';
import { ExtraInfoAside } from './components/ExtraInfoAside';
import { ServiceForm } from './components/ServiceForm';
import { serviceFormSchema, type ServiceFormValues } from './schema';
import {
  emptyFormValues,
  formToCreateRequest,
  serviceToFormValues,
} from './serviceFormMapping';

type Mode = 'create' | 'edit';
type Kind = 'service' | 'extra';

interface ServiceFormPageProps {
  mode: Mode;
  kind?: Kind;
}

const COPY: Record<Kind, {
  backPath: string;
  createTitle: string;
  editTitle: string;
  createCta: string;
  confirmDelete: string;
}> = {
  service: {
    backPath: '/dashboard/servicios',
    createTitle: 'Nuevo Servicio',
    editTitle: 'Editar Servicio',
    createCta: 'Crear Servicio',
    confirmDelete: '¿Seguro que quieres eliminar este servicio?',
  },
  extra: {
    backPath: '/dashboard/servicios?tab=complementos',
    createTitle: 'Nuevo Complemento',
    editTitle: 'Editar Complemento',
    createCta: 'Crear Complemento',
    confirmDelete: '¿Seguro que quieres eliminar este complemento?',
  },
};

export default function ServiceFormPage({ mode, kind = 'service' }: ServiceFormPageProps) {
  const copy = COPY[kind];
  const isExtra = kind === 'extra';

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
    defaultValues: emptyFormValues(initialCategory, kind),
  });

  useEffect(() => {
    if (mode === 'edit' && serviceQuery.data) {
      methods.reset(serviceToFormValues(serviceQuery.data));
    }
  }, [mode, serviceQuery.data, methods]);

  const isActive = methods.watch('isActive');

  const onSubmit = methods.handleSubmit(async (values) => {
    try {
      if (mode === 'create') {
        await createService.mutateAsync(formToCreateRequest(values, isExtra));
      } else {
        await updateService.mutateAsync({
          id: serviceId,
          data: formToCreateRequest(values, serviceQuery.data?.is_extra ?? isExtra),
        });
      }
      // Linking extras currently goes through a separate flow — the backend API
      // attaches individual extra services (POST /services/:id/extras with {extra_id}),
      // not the "extras groups" (category IDs) this form collects. Hooks exist in
      // useServices.ts (useAddServiceExtra/useRemoveServiceExtra) for a future UI.
      navigate(copy.backPath);
    } catch (err) {
      applyApiErrors(err, methods.setError, { duration: 'durationMinutes' });
    }
  });

  const onDelete = async () => {
    if (mode !== 'edit') return;
    const confirmed = window.confirm(copy.confirmDelete);
    if (!confirmed) return;
    await deleteService.mutateAsync(serviceId);
    navigate(copy.backPath);
  };

  const isLoading =
    categoriesQuery.isLoading || (mode === 'edit' && serviceQuery.isLoading);
  const loadError = categoriesQuery.error ?? (mode === 'edit' ? serviceQuery.error : null);

  if (loadError) {
    return (
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
        <Card>
          <ErrorState
            message={
              isExtra
                ? 'No se pudo cargar la información del complemento.'
                : 'No se pudo cargar la información del servicio.'
            }
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
              onClick={() => navigate(copy.backPath)}
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
              {mode === 'create' ? copy.createTitle : copy.editTitle}
            </h1>
            <div className="hidden md:flex md:flex-wrap md:items-center md:gap-400">
              {mode === 'create' ? (
                <Button
                  type="submit"
                  isLoading={submitBusy}
                  leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
                >
                  {copy.createCta}
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
              <ServiceForm categories={categories} kind={kind} />
              <div className={isExtra ? '' : 'border-t border-subtle pt-600 md:border-0 md:pt-0'}>
                {isExtra ? <ExtraInfoAside /> : <AgregarComplementos extrasGroups={categories} />}
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
                  {copy.createCta}
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
