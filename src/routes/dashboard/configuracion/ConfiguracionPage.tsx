import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/Card';
import { useMyBusiness, useUpdateBusiness } from '@/api/hooks/useBusiness';
import { applyApiErrors } from '@/api/formErrors';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { configuracionSchema, type ConfiguracionFormValues } from './schema';
import { LogoIdentityCard } from './components/LogoIdentityCard';
import { MensajeBienvenidaCard } from './components/MensajeBienvenidaCard';
import { CalendarIntegrationCard } from './components/CalendarIntegrationCard';
import { ConfiguracionSkeleton } from './components/ConfiguracionSkeleton';

export default function ConfiguracionPage() {
  const { data: business, isLoading, error, refetch } = useMyBusiness();
  const updateBusiness = useUpdateBusiness();

  const methods = useForm<ConfiguracionFormValues>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  useEffect(() => {
    if (!business) return;
    methods.reset({
      name: business.name,
      slug: business.slug,
      description: business.description ?? '',
    });
  }, [business, methods]);

  // Slug stays in the form for visual continuity but the backend PUT body
  // has no url/slug field yet — changes to this input are intentionally dropped.
  const onSubmit = methods.handleSubmit(async (values) => {
    if (!business) return;
    try {
      await updateBusiness.mutateAsync({
        name: values.name,
        description: values.description ?? '',
      });
    } catch (err) {
      applyApiErrors(err, methods.setError);
    }
  });

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
      <PageHeader
        title="Configuración"
        subtitle="Personaliza la apariencia de tu página y detalles del negocio."
      />

      {isLoading ? (
        <ConfiguracionSkeleton />
      ) : error ? (
        <Card>
          <ErrorState
            message="No se pudo cargar la información del negocio."
            onRetry={() => refetch()}
          />
        </Card>
      ) : !business ? (
        <Card>
          <p className="font-sans text-body">
            No encontramos tu negocio. Contacta soporte si crees que es un error.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-600 lg:grid-cols-2 items-start">
          <FormProvider {...methods}>
            <form onSubmit={onSubmit} className="flex flex-col gap-600">
              <LogoIdentityCard business={business} />
              <MensajeBienvenidaCard />
            </form>
          </FormProvider>
          <div className="flex flex-col gap-600">
            <CalendarIntegrationCard />
            <Card>
              <div className="flex flex-col gap-200 p-600">
                <p className="font-sans text-body-sm text-muted">Zona horaria</p>
                <p className="font-sans text-body font-medium text-body-emphasis">
                  {business.timezone}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
