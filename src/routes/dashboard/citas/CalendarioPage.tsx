import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast, type ToastVariant } from '@/components/ui/Toast';
import { useAppointments, useCreateAppointment } from '@/api/hooks/useAppointments';
import { enrichAppointments } from '@/lib/appointmentEnrich';
import {
  useCreatePersonalTime,
  usePersonalTime,
  useWorkdays,
} from '@/api/hooks/useSchedule';
import { useMyBusiness } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { useCategories } from '@/api/hooks/useCategories';
import type { Appointment } from '@/api/types/appointments';
import { BookingDetailDrawer } from '@/routes/dashboard/home/components/BookingDetailDrawer';
import { CalendarHeader } from './components/CalendarHeader';
import { MobileCalendarTopBar } from './components/MobileCalendarTopBar';
import { WeekGrid, type RangeSelection } from './components/WeekGrid';
import { DayView } from './components/DayView';
import { NuevoBloqueDrawer } from './components/NuevoBloqueDrawer';
import { CalendarioPageSkeleton } from './components/CalendarioPageSkeleton';
import {
  addDays,
  formatIsoDate,
  isSameDay,
  rangeIsOutsideBusinessHours,
  startOfWeekMon,
  toBusinessRfc3339,
} from './utils';
import type { CitaFormValues, TiempoPersonalFormValues } from './schema';
import { ApiError } from '@/api/client';

export default function CalendarioPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMon(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);

  // If we arrived here from "Nueva Cita", animate the drawer open on mount
  // (start closed for one paint, then flip to open so the slide transition plays).
  // Consume the nav state so refresh or subsequent visits don't auto-open.
  useEffect(() => {
    if ((location.state as { openDrawer?: boolean } | null)?.openDrawer) {
      const raf = requestAnimationFrame(() => setDrawerOpen(true));
      navigate(location.pathname, { replace: true, state: null });
      return () => cancelAnimationFrame(raf);
    }
    // Mount-only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [prefill, setPrefill] = useState<{
    date: string;
    start_time: string;
    end_time: string;
  } | null>(null);
  const [citaError, setCitaError] = useState<string | null>(null);
  const [tiempoError, setTiempoError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    null,
  );
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(
    null,
  );

  const appointmentsQuery = useAppointments();
  const personalTimeQuery = usePersonalTime();
  const workdaysQuery = useWorkdays();
  const servicesQuery = useServices();
  const categoriesQuery = useCategories();
  const businessQuery = useMyBusiness();
  const createAppointment = useCreateAppointment();
  const createPersonalTime = useCreatePersonalTime();

  const isLoading =
    appointmentsQuery.isLoading ||
    personalTimeQuery.isLoading ||
    workdaysQuery.isLoading ||
    servicesQuery.isLoading;
  const hasError =
    appointmentsQuery.error ||
    personalTimeQuery.error ||
    workdaysQuery.error ||
    servicesQuery.error;

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const allAppointments = useMemo(
    () => enrichAppointments(appointmentsQuery.data ?? [], servicesQuery.data),
    [appointmentsQuery.data, servicesQuery.data],
  );
  const weekAppointments = useMemo(
    () =>
      allAppointments.filter((a) => {
        const start = new Date(a.start_time);
        return start >= weekStart && start < weekEnd;
      }),
    [allAppointments, weekStart, weekEnd],
  );
  const selectedEnriched = useMemo(() => {
    if (!selectedAppointment) return null;
    return (
      allAppointments.find((a) => a.id === selectedAppointment.id) ??
      selectedAppointment
    );
  }, [selectedAppointment, allAppointments]);

  const weekPersonalTimes = useMemo(() => {
    const all = personalTimeQuery.data ?? [];
    return all.filter((p) => {
      if (!p.date) return false;
      const y = Number(p.date.slice(0, 4));
      const m = Number(p.date.slice(5, 7)) - 1;
      const d = Number(p.date.slice(8, 10));
      const dt = new Date(y, m, d);
      return dt >= weekStart && dt < weekEnd;
    });
  }, [personalTimeQuery.data, weekStart, weekEnd]);

  const goToPrevWeek = useCallback(
    () => setWeekStart((w) => addDays(w, -7)),
    [],
  );
  const goToNextWeek = useCallback(
    () => setWeekStart((w) => addDays(w, 7)),
    [],
  );
  const goToToday = useCallback(() => {
    const now = new Date();
    setWeekStart(startOfWeekMon(now));
    setSelectedDay(now);
  }, []);
  const openDrawer = useCallback(() => {
    setPrefill(null);
    setCitaError(null);
    setTiempoError(null);
    setDrawerOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setPrefill(null);
    setCitaError(null);
    setTiempoError(null);
  }, []);
  const openDrawerForRange = useCallback((range: RangeSelection) => {
    setPrefill({
      date: formatIsoDate(range.day),
      start_time: range.startTime,
      end_time: range.endTime,
    });
    setCitaError(null);
    setTiempoError(null);
    setDrawerOpen(true);
  }, []);
  const [pendingOffHourRange, setPendingOffHourRange] =
    useState<RangeSelection | null>(null);
  const handleSelectRange = useCallback(
    (range: RangeSelection) => {
      if (
        rangeIsOutsideBusinessHours(
          range.day,
          range.startTime,
          range.endTime,
          workdaysQuery.data,
        )
      ) {
        setPendingOffHourRange(range);
        return;
      }
      openDrawerForRange(range);
    },
    [workdaysQuery.data, openDrawerForRange],
  );
  const confirmOffHourRange = useCallback(() => {
    if (!pendingOffHourRange) return;
    const range = pendingOffHourRange;
    setPendingOffHourRange(null);
    openDrawerForRange(range);
  }, [pendingOffHourRange, openDrawerForRange]);
  const handleSelectAppointment = useCallback((appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDetailDrawerOpen(true);
  }, []);
  const closeDetailDrawer = useCallback(() => {
    setDetailDrawerOpen(false);
  }, []);

  const handleCitaSubmit = async (values: CitaFormValues) => {
    setCitaError(null);
    try {
      await createAppointment.mutateAsync({
        customer_name: values.customer_name,
        customer_phone: `${values.country_code}${values.customer_phone}`,
        start_time: toBusinessRfc3339(
          values.date,
          values.start_time,
          businessQuery.data?.timezone,
        ),
        service_ids: values.service_ids,
      });
      closeDrawer();
    } catch (err) {
      setCitaError(
        err instanceof ApiError && err.message ? err.message : 'No pudimos agendar la cita. Inténtalo de nuevo.',
      );
    }
  };

  const handleTiempoSubmit = async (values: TiempoPersonalFormValues) => {
    setTiempoError(null);
    try {
      await createPersonalTime.mutateAsync({
        type: values.type,
        date: values.date,
        end_date: values.end_date,
        start_time: values.start_time,
        end_time: values.end_time,
        reason: values.reason,
      });
      closeDrawer();
    } catch (err) {
      setTiempoError(
        err instanceof ApiError && err.message ? err.message : 'No pudimos guardar el bloque. Inténtalo de nuevo.',
      );
    }
  };

  if (isLoading) return <CalendarioPageSkeleton />;

  if (hasError) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-400 p-600 text-center">
        <p className="font-sans text-body text-body-emphasis">
          No pudimos cargar tu calendario.
        </p>
        <Button
          variant="secondary"
          leftIcon={<RefreshCw size={16} strokeWidth={1.75} aria-hidden />}
          onClick={() => {
            appointmentsQuery.refetch();
            personalTimeQuery.refetch();
            workdaysQuery.refetch();
            servicesQuery.refetch();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const services = servicesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const defaultFormDate = formatIsoDate(selectedDay);

  return (
    <>
      <section className="flex flex-col gap-600 p-400 md:p-800">
        <div className="hidden md:block">
          <CalendarHeader
            weekStart={weekStart}
            onPrevWeek={goToPrevWeek}
            onNextWeek={goToNextWeek}
            onToday={goToToday}
            onNew={openDrawer}
          />
        </div>

        <MobileCalendarTopBar
          weekStart={weekStart}
          onPrevWeek={goToPrevWeek}
          onNextWeek={goToNextWeek}
          onToday={goToToday}
          onNew={openDrawer}
        />

        <div className="hidden md:block">
          <WeekGrid
            weekStart={weekStart}
            appointments={weekAppointments}
            personalTimes={weekPersonalTimes}
            workdays={workdaysQuery.data}
            today={today}
            onSelectRange={handleSelectRange}
            onSelectAppointment={handleSelectAppointment}
          />
        </div>
        <div className="md:hidden">
          <DayView
            weekStart={weekStart}
            selectedDay={selectedDay}
            onSelectDay={(d) => {
              setSelectedDay(d);
              const newMonday = startOfWeekMon(d);
              if (!isSameDay(newMonday, weekStart)) setWeekStart(newMonday);
            }}
            appointments={weekAppointments}
            personalTimes={weekPersonalTimes}
            workdays={workdaysQuery.data}
            today={today}
            onSelectRange={handleSelectRange}
            onSelectAppointment={handleSelectAppointment}
          />
        </div>
      </section>

      <NuevoBloqueDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        services={services}
        categories={categories}
        defaultDate={prefill?.date ?? defaultFormDate}
        defaultStartTime={prefill?.start_time}
        defaultEndTime={prefill?.end_time}
        formKey={
          prefill ? `${prefill.date}-${prefill.start_time}-${prefill.end_time}` : 'empty'
        }
        isSubmittingCita={createAppointment.isPending}
        isSubmittingTiempo={createPersonalTime.isPending}
        onSubmitCita={handleCitaSubmit}
        onSubmitTiempo={handleTiempoSubmit}
        citaConflictMessage={citaError}
        tiempoInfoMessage={tiempoError}
      />

      <BookingDetailDrawer
        appointment={selectedEnriched}
        open={detailDrawerOpen}
        onClose={closeDetailDrawer}
        services={services}
        categories={categories}
        business={businessQuery.data}
        onSaved={() =>
          setToast({ message: 'Cita actualizada', variant: 'success' })
        }
        onDeleted={() => {
          setDetailDrawerOpen(false);
          setToast({ message: 'Cita eliminada', variant: 'success' });
        }}
        onError={(message) => setToast({ message, variant: 'error' })}
      />

      <Toast
        open={Boolean(toast)}
        message={toast?.message ?? ''}
        variant={toast?.variant ?? 'success'}
        onClose={() => setToast(null)}
      />

      <ConfirmDialog
        open={Boolean(pendingOffHourRange)}
        onClose={() => setPendingOffHourRange(null)}
        onConfirm={confirmOffHourRange}
        title="Agendar fuera del horario"
        description="Esta hora está fuera del horario de atención configurado. ¿Quieres continuar con una cita extraordinaria?"
        confirmLabel="Sí, continuar"
        cancelLabel="Cancelar"
      />
    </>
  );
}
