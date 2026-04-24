import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBookingPage, useBookingServices } from '@/api/hooks/useBooking';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/routes/dashboard/components/ErrorState';
import type { Service } from '@/api/types/services';
import { useBookingSelection } from '../useBookingSelection';
import { BusinessHero } from './components/BusinessHero';
import { CategoryTabs, ALL_TAB } from './components/CategoryTabs';
import { CategoryAccordion } from './components/CategoryAccordion';
import { ExtrasSheet } from './components/ExtrasSheet';
import { FloatingContinueCTA } from './components/FloatingContinueCTA';
import { BusinessPageSkeleton } from './BusinessPageSkeleton';
import {
  groupExtrasByCategory,
  groupServicesByMainCategory,
} from './selection';

export default function BusinessPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { selections, addSelection, countForService } = useBookingSelection();

  const pageQuery = useBookingPage(slug);
  const servicesQuery = useBookingServices(slug);
  const business = pageQuery.data?.business;
  const categories = pageQuery.data?.categories;

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sheetService, setSheetService] = useState<Service | null>(null);

  const serviceGroups = useMemo(
    () => groupServicesByMainCategory(servicesQuery.data ?? [], categories ?? []),
    [servicesQuery.data, categories],
  );

  const extraGroups = useMemo(
    () => groupExtrasByCategory(servicesQuery.data ?? [], categories ?? []),
    [servicesQuery.data, categories],
  );

  const mainCategories = useMemo(
    () => serviceGroups.map((g) => g.category),
    [serviceGroups],
  );

  const visibleGroups = useMemo(
    () =>
      activeTab === ALL_TAB
        ? serviceGroups
        : serviceGroups.filter((g) => g.category.id === activeTab),
    [serviceGroups, activeTab],
  );

  const isExpanded = (id: string) => expanded[id] ?? true;

  const toggleCategory = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !isExpanded(id) }));
  };

  const handleServiceClick = (service: Service) => {
    setSheetService(service);
  };

  const handleConfirmExtras = (extraIds: string[]) => {
    if (!sheetService) return;
    addSelection(sheetService.id, extraIds);
    setSheetService(null);
  };

  const handleContinue = () => {
    navigate(`/${slug}/resumen`);
  };

  const isLoading = pageQuery.isLoading || servicesQuery.isLoading;
  const queryError = pageQuery.error ?? servicesQuery.error;

  if (isLoading) {
    return <BusinessPageSkeleton />;
  }

  if (queryError) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-600 py-1200">
        <Card>
          <ErrorState
            message="No se pudo cargar este negocio. Intenta de nuevo."
            onRetry={() => {
              pageQuery.refetch();
              servicesQuery.refetch();
            }}
          />
        </Card>
      </div>
    );
  }

  if (!business) return null;

  const selectionCount = selections.length;
  const hasServices = serviceGroups.length > 0;

  return (
    <div className="flex flex-col">
      <BusinessHero
        name={business.name}
        description={business.description}
        location={business.location}
        logoUrl={business.logo_url || undefined}
      />
      {hasServices ? (
        <>
          <CategoryTabs
            categories={mainCategories}
            value={activeTab}
            onChange={setActiveTab}
          />
          <div
            className={`mx-auto flex w-full max-w-[1440px] flex-col gap-1100 px-600 py-800 md:px-[224px] ${
              selectionCount > 0 ? 'pb-[120px]' : ''
            }`}
          >
            {visibleGroups.map((group) => (
              <CategoryAccordion
                key={group.category.id}
                category={group.category}
                services={group.services}
                expanded={isExpanded(group.category.id)}
                onToggle={() => toggleCategory(group.category.id)}
                countForService={countForService}
                onServiceClick={handleServiceClick}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-[720px] px-600 py-1200 text-center">
          <p className="font-sans text-body text-muted">
            Aún no hay servicios disponibles para reservar.
          </p>
        </div>
      )}
      <ExtrasSheet
        open={sheetService !== null}
        service={sheetService}
        extraGroups={extraGroups}
        mode="add"
        onClose={() => setSheetService(null)}
        onConfirm={handleConfirmExtras}
      />
      {selectionCount > 0 ? (
        <FloatingContinueCTA
          count={selectionCount}
          to={`/${slug}/resumen`}
          onClick={handleContinue}
        />
      ) : null}
    </div>
  );
}
