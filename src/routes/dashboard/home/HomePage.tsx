import { Fragment, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Pin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { useDashboard } from '@/api/hooks/useDashboard';
import { useMyBusiness } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { useCategories } from '@/api/hooks/useCategories';
import { useAuth } from '@/auth/AuthContext';
import { enrichAppointments } from '@/lib/appointmentEnrich';
import { useMarkAppointmentSeen } from '@/api/hooks/useAppointments';
import type { Appointment } from '@/api/types/appointments';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { MetricCard } from './components/MetricCard';
import { UpcomingAppointmentRow } from './components/UpcomingAppointmentRow';
import { RecentBookingRow } from './components/RecentBookingRow';
import { HomePageSkeleton } from './components/HomePageSkeleton';
import { BookingDetailDrawer } from './components/BookingDetailDrawer';
import {
  findNextUpId,
  formatMetricRevenue,
  formatMonthYear,
  formatShortDate,
  formatWeekRange,
  getFirstName,
} from './utils';

export default function HomePage() {
  const { user } = useAuth();
  const { data: business } = useMyBusiness();
  const { data: dashboard, isLoading, error, refetch } = useDashboard({
    upcomingLimit: 10,
  });
  const { data: services } = useServices();
  const { data: categories } = useCategories();
  const navigate = useNavigate();

  const now = useMemo(() => new Date(), []);
  const firstName = getFirstName(user?.name ?? '');
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(
    null,
  );
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    null,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const markSeen = useMarkAppointmentSeen();

  const handleSelectAppointment = (appointment: Appointment) => {
    // Fire unconditionally — MarkSeen is idempotent server-side
    // (`SET seen_at = COALESCE(seen_at, NOW())`). The previous guard
    // skipped the POST when the cached row already had seen_at populated
    // from an optimistic patch, even when the server still saw the row
    // as unseen.
    markSeen.mutate(appointment.id);
    setSelectedAppointment(appointment);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false);

  const upcoming = useMemo(
    () => enrichAppointments(dashboard?.upcoming ?? [], services),
    [dashboard?.upcoming, services],
  );
  const latest = useMemo(
    () =>
      enrichAppointments(dashboard?.latest ?? [], services)
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
    [dashboard?.latest, services],
  );
  const unseenLatestCount = useMemo(
    () => latest.filter((a) => !a.seen_at).length,
    [latest],
  );
  const selectedEnriched = useMemo(() => {
    if (!selectedAppointment) return null;
    const fromUpcoming = upcoming.find((a) => a.id === selectedAppointment.id);
    const fromLatest = latest.find((a) => a.id === selectedAppointment.id);
    return fromUpcoming ?? fromLatest ?? selectedAppointment;
  }, [selectedAppointment, upcoming, latest]);
  const nextUpId = useMemo(() => findNextUpId(upcoming, now), [upcoming, now]);
  const isEmpty =
    (dashboard?.today_count ?? 0) === 0 &&
    (dashboard?.week_count ?? 0) === 0 &&
    upcoming.length === 0 &&
    latest.length === 0;

  const handleShare = async () => {
    if (!business) return;
    const url = `${window.location.origin}/${business.slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast({ message: 'Enlace copiado al portapapeles', variant: 'success' });
    } catch {
      setToast({ message: 'No pudimos copiar el enlace', variant: 'error' });
    }
  };

  const desktopActions = (
    <div className="hidden items-start gap-300 md:flex">
      <Button
        variant="secondary"
        onClick={handleShare}
        disabled={!business}
        leftIcon={<Link2 aria-hidden size={16} strokeWidth={1.75} />}
      >
        Compartir Página de Reservas
      </Button>
      <Button
        onClick={() => navigate('/dashboard/citas', { state: { openDrawer: true } })}
        leftIcon={<Plus aria-hidden size={16} strokeWidth={1.75} />}
      >
        Nueva Cita
      </Button>
    </div>
  );

  const header = (
    <PageHeader
      title={firstName ? `Hola, ${firstName}` : 'Hola'}
      subtitle="Bienvenida de nuevo. Aquí está tu resumen del día."
      actions={desktopActions}
    />
  );

  const wrapper =
    'flex flex-col gap-600 px-400 pb-800 md:gap-700 md:px-1000 md:pt-800';

  const toastEl = (
    <Toast
      open={Boolean(toast)}
      message={toast?.message ?? ''}
      variant={toast?.variant ?? 'success'}
      onClose={() => setToast(null)}
    />
  );

  const drawerEl = (
    <BookingDetailDrawer
      appointment={selectedEnriched}
      open={drawerOpen}
      onClose={closeDrawer}
      services={services ?? []}
      categories={categories ?? []}
      business={business}
      onSaved={() => {
        setToast({ message: 'Cita actualizada', variant: 'success' });
      }}
      onDeleted={() => {
        setDrawerOpen(false);
        setToast({ message: 'Cita eliminada', variant: 'success' });
      }}
      onError={(message) => setToast({ message, variant: 'error' })}
    />
  );

  if (isLoading) {
    return (
      <>
        <div className={wrapper}>
          {header}
          <HomePageSkeleton />
        </div>
        {toastEl}
        {drawerEl}
      </>
    );
  }

  if (error || !dashboard) {
    return (
      <>
        <div className={wrapper}>
          {header}
          <Card>
            <ErrorState
              message="No se pudieron cargar tus citas."
              onRetry={() => refetch()}
            />
          </Card>
        </div>
        {toastEl}
        {drawerEl}
      </>
    );
  }

  const currentYear = now.getFullYear();

  const mobileActions = (
    <div className="flex flex-col gap-300 md:hidden">
      <Button
        variant="secondary"
        fullWidth
        onClick={handleShare}
        disabled={!business}
        leftIcon={<Link2 aria-hidden size={16} strokeWidth={1.75} />}
      >
        Copiar Link de Citas
      </Button>
      <Button
        fullWidth
        onClick={() => navigate('/dashboard/citas', { state: { openDrawer: true } })}
        leftIcon={<Plus aria-hidden size={16} strokeWidth={1.75} />}
      >
        Nueva Cita
      </Button>
    </div>
  );

  const footer = (
    <div className="md:hidden">
      <hr className="-mx-400 border-t border-subtle" aria-hidden />
      <p className="mt-600 text-center font-sans text-caption text-muted">
        © {currentYear} Datil. All rights reserved.
      </p>
    </div>
  );

  return (
    <>
      <div className={wrapper}>
      {header}

      <div className="flex gap-200 md:gap-400">
        <MetricCard
          icon={<Pin size={16} strokeWidth={1.75} />}
          label="Citas de Hoy"
          meta={formatShortDate(now)}
          value={String(dashboard.today_count)}
          caption={dashboard.today_count > 0 ? undefined : 'Sin citas hoy'}
        />
        <MetricCard
          icon={<Pin size={16} strokeWidth={1.75} />}
          label="Esta Semana"
          meta={formatWeekRange(now)}
          value={String(dashboard.week_count)}
          caption={dashboard.week_count > 0 ? undefined : 'Sin citas esta semana'}
        />
        <MetricCard
          icon={<Pin size={16} strokeWidth={1.75} />}
          label="Ingresos del Mes"
          labelMobile="Ingresos Totales"
          meta={formatMonthYear(now)}
          metaMobile={`${formatMonthYear(now).slice(0, 3)} ${now.getFullYear()}`}
          value={formatMetricRevenue(dashboard.monthly_income)}
        />
      </div>

      {isEmpty ? (
        <Card>
          <div className="flex flex-col items-start gap-300">
            <p className="font-sans text-body text-body-emphasis">
              Aún no tienes citas.
            </p>
            <p className="font-sans text-body-sm text-muted">
              Comparte tu página de reservas para que tus clientes empiecen a
              agendar.
            </p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-600 md:flex-1 md:flex-row md:min-h-0 md:items-stretch">
          <Card
            padding="none"
            className="flex flex-1 min-w-0 flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-500 py-400">
              <h2 className="font-serif text-h6 text-heading">Próximas Citas</h2>
              <button
                type="button"
                onClick={() => navigate('/dashboard/citas')}
                className="font-sans text-body-sm font-medium text-accent hover:text-accent-700"
              >
                Ver Todas
              </button>
            </div>
            <div className="border-t border-subtle" />
            {upcoming.length === 0 ? (
              <p className="px-500 py-400 font-sans text-body-sm text-muted">
                No tienes citas próximas.
              </p>
            ) : (
              upcoming.map((appt) => (
                <Fragment key={appt.id}>
                  <UpcomingAppointmentRow
                    appointment={appt}
                    nextUpId={nextUpId}
                    now={now}
                    onSelect={handleSelectAppointment}
                  />
                  <div className="border-t border-subtle" />
                </Fragment>
              ))
            )}
          </Card>

          <Card
            padding="none"
            className="flex flex-1 min-w-0 flex-col overflow-hidden"
          >
            <div className="flex items-center gap-200 px-500 py-400">
              <h2 className="font-serif text-h6 text-heading">
                Últimas Citas Agendadas
              </h2>
              {unseenLatestCount > 0 && (
                <span className="inline-flex min-h-500 min-w-500 items-center justify-center rounded-full bg-surface-accent px-100 py-25 font-sans text-body-sm font-medium text-on-color">
                  {unseenLatestCount}
                </span>
              )}
            </div>
            <div className="border-t border-subtle" />
            {latest.length === 0 ? (
              <p className="px-500 py-400 font-sans text-body-sm text-muted">
                Aún no hay reservas recientes.
              </p>
            ) : (
              latest.map((appt) => (
                <Fragment key={appt.id}>
                  <RecentBookingRow
                    appointment={appt}
                    now={now}
                    onSelect={handleSelectAppointment}
                  />
                  <div className="border-t border-subtle" />
                </Fragment>
              ))
            )}
          </Card>
        </div>
      )}

      {mobileActions}
      {footer}
      </div>
      {toastEl}
      {drawerEl}
    </>
  );
}
