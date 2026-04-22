import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCategories, useCreateCategory } from '@/api/hooks/useCategories';
import { useServices } from '@/api/hooks/useServices';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { CategoryCard } from './components/CategoryCard';
import { CategoryFilter } from './components/CategoryFilter';
import { EmptyServicios } from './components/EmptyServicios';
import { NewCategoryDrawer } from './components/NewCategoryDrawer';
import { ServiciosSkeleton } from './components/ServiciosSkeleton';
import { ServiciosTabs } from './components/ServiciosTabs';
import { groupServicesByCategory, type ServicesTab } from './types';
import type { CategoryFormValues } from './schema';

const TAB_COPY: Record<ServicesTab, { subtitle: string; createLabel: string }> = {
  principales: {
    subtitle: 'Estos servicios son los que aparecen en tu catálogo principal.',
    createLabel: 'Nueva Categoría',
  },
  complementos: {
    subtitle: 'Los grupos de complementos son extras opcionales que puedes ofrecer en servicios específicos.',
    createLabel: 'Nuevo Grupo de Complementos',
  },
};

export default function ServicesPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<ServicesTab>('principales');
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categoriesQuery = useCategories();
  const servicesQuery = useServices();
  const createCategory = useCreateCategory();

  const isExtras = tab === 'complementos';

  const filteredGroups = useMemo(() => {
    const categories = categoriesQuery.data ?? [];
    const services = servicesQuery.data ?? [];
    const scoped = filterCategoryId
      ? categories.filter((c) => c.id === filterCategoryId)
      : categories;
    return groupServicesByCategory(scoped, services, isExtras);
  }, [categoriesQuery.data, servicesQuery.data, filterCategoryId, isExtras]);

  const handleCreate = async (values: CategoryFormValues) => {
    setSubmitError(null);
    try {
      const nextOrder = (categoriesQuery.data?.length ?? 0) + 1;
      await createCategory.mutateAsync({
        name: values.name,
        description: '',
        allow_multiple: values.allowMultiple,
        display_order: nextOrder,
      });
      setDrawerOpen(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo crear la categoría.',
      );
    }
  };

  const openCreate = () => {
    setSubmitError(null);
    setDrawerOpen(true);
  };

  const isLoading = categoriesQuery.isLoading || servicesQuery.isLoading;
  const queryError = categoriesQuery.error ?? servicesQuery.error;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-700 px-600 py-600 md:px-1000 md:py-800">
      <PageHeader
        title="Servicios"
        subtitle="Gestiona tus servicios y complementos opcionales para tus clientes."
      />

      <div className="flex flex-col gap-600">
        <ServiciosTabs value={tab} onChange={setTab} />
        <p className="font-sans text-body-sm text-body">{TAB_COPY[tab].subtitle}</p>

        {isLoading ? (
          <ServiciosSkeleton />
        ) : queryError ? (
          <Card>
            <ErrorState
              message="No se pudieron cargar los servicios."
              onRetry={() => {
                categoriesQuery.refetch();
                servicesQuery.refetch();
              }}
            />
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-400 md:flex-row md:items-center md:justify-between">
              <CategoryFilter
                categories={categoriesQuery.data ?? []}
                value={filterCategoryId}
                onChange={setFilterCategoryId}
              />
              <Button
                onClick={openCreate}
                leftIcon={<Plus size={16} strokeWidth={1.75} aria-hidden />}
                fullWidth
                className="md:w-auto"
              >
                {TAB_COPY[tab].createLabel}
              </Button>
            </div>

            {filteredGroups.length === 0 ? (
              <EmptyServicios isExtras={isExtras} onCreate={openCreate} />
            ) : (
              <div className="flex flex-col gap-600">
                {filteredGroups.map((group) => (
                  <CategoryCard
                    key={group.category.id}
                    group={group}
                    isExtras={isExtras}
                    onAddService={(categoryId) =>
                      navigate(`/dashboard/servicios/nuevo?category=${categoryId}`)
                    }
                    onEditService={(serviceId) =>
                      navigate(`/dashboard/servicios/${serviceId}/editar`)
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <NewCategoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createCategory.isPending}
        submitError={submitError}
        isExtras={isExtras}
      />
    </div>
  );
}
