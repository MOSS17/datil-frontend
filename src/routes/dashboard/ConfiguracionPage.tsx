import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyBusiness, useUpdateBusiness } from '@/api/hooks/useBusiness';
import { LogoIdentityCard } from './components/LogoIdentityCard';
import { MensajeBienvenidaCard } from './components/MensajeBienvenidaCard';
import { CalendarIntegrationCard } from './components/CalendarIntegrationCard';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(80, 'Máximo 80 caracteres'),
  slug: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(40, 'Máximo 40 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string().max(280, 'Máximo 280 caracteres').optional().or(z.literal('')),
});

export type ConfiguracionFormValues = z.infer<typeof schema>;

function PageHeader() {
  return (
    <header className="flex flex-col gap-100">
      <h1 className="font-serif text-h4 text-heading">Configuración</h1>
      <p className="font-sans text-body-sm text-muted">
        Personaliza la apariencia de tu página y detalles del negocio.
      </p>
    </header>
  );
}

function ConfiguracionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-600 lg:grid-cols-2 items-start">
      <div className="flex flex-col gap-600">
        <Card>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[40%]" />
            <Skeleton className="h-1400 w-full" />
            <Skeleton className="h-1000 w-full" />
            <Skeleton className="h-1000 w-full" />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col gap-600">
            <Skeleton className="h-700 w-[50%]" />
            <Skeleton className="h-1500 w-full" />
          </div>
        </Card>
      </div>
      <Card>
        <div className="flex flex-col gap-600">
          <Skeleton className="h-700 w-[60%]" />
          <Skeleton className="h-1100 w-full" />
          <Skeleton className="h-1100 w-full" />
        </div>
      </Card>
    </div>
  );
}

export default function ConfiguracionPage() {
  const { data: business, isLoading, error, refetch } = useMyBusiness();
  const updateBusiness = useUpdateBusiness();

  const methods = useForm<ConfiguracionFormValues>({
    resolver: zodResolver(schema),
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

  // TODO(autosave): no visible "Guardar Cambios" button in the reference design.
  // Wire up auto-save on blur / debounced save when product behavior is decided.
  const onSubmit = methods.handleSubmit(async (values) => {
    if (!business) return;
    await updateBusiness.mutateAsync({
      id: business.id,
      data: {
        name: values.name,
        slug: values.slug,
        description: values.description ?? '',
      },
    });
  });

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
      <PageHeader />

      {isLoading ? (
        <ConfiguracionSkeleton />
      ) : error ? (
        <Card>
          <div className="flex flex-col items-start gap-400">
            <p className="font-sans text-body text-error">
              No se pudo cargar la información del negocio.
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Reintentar
            </Button>
          </div>
        </Card>
      ) : !business ? (
        <Card>
          <p className="font-sans text-body text-body">
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
          <CalendarIntegrationCard />
        </div>
      )}
    </div>
  );
}
