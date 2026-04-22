import { useCallback, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAppointments, useCreateBooking } from '@/api/hooks/useAppointments';
import { useCreatePersonalTime, usePersonalTime } from '@/api/hooks/useSchedule';
import { useMyBusiness } from '@/api/hooks/useBusiness';
import { useServices } from '@/api/hooks/useServices';
import { CalendarHeader } from './components/CalendarHeader';
import { MobileCalendarTopBar } from './components/MobileCalendarTopBar';
import { WeekGrid } from './components/WeekGrid';
import { DayView } from './components/DayView';
import { NuevoBloqueDrawer } from './components/NuevoBloqueDrawer';
import { CalendarioPageSkeleton } from './components/CalendarioPageSkeleton';
import { addDays, formatIsoDate, isSameDay, startOfWeekMon } from './utils';
import type { CitaFormValues, TiempoPersonalFormValues } from './schema';

export default function CalendarioPage() {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMon(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const appointmentsQuery = useAppointments();
  const personalTimeQuery = usePersonalTime();
  const servicesQuery = useServices();
  const businessQuery = useMyBusiness();
  const createBooking = useCreateBooking();
  const createPersonalTime = useCreatePersonalTime();

  const isLoading =
    appointmentsQuery.isLoading || personalTimeQuery.isLoading || servicesQuery.isLoading;
  const hasError =
    appointmentsQuery.error || personalTimeQuery.error || servicesQuery.error;

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const weekAppointments = useMemo(() => {
    const all = appointmentsQuery.data ?? [];
    return all.filter((a) => {
      const start = new Date(a.start_time);
      return start >= weekStart && start < weekEnd;
    });
  }, [appointmentsQuery.data, weekStart, weekEnd]);

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
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleCitaSubmit = async (values: CitaFormValues) => {
    const businessId = businessQuery.data?.id;
    if (!businessId) return;
    await createBooking.mutateAsync({
      business_id: businessId,
      customer_name: values.customer_name,
      customer_phone: `${values.country_code}${values.customer_phone}`,
      start_time: `${values.date}T${values.start_time}:00`,
      service_ids: values.service_ids,
    });
    closeDrawer();
  };

  const handleTiempoSubmit = async (values: TiempoPersonalFormValues) => {
    await createPersonalTime.mutateAsync({
      type: values.type,
      date: values.date,
      end_date: values.end_date,
      start_time: values.start_time,
      end_time: values.end_time,
      reason: values.reason ?? '',
    });
    closeDrawer();
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
            servicesQuery.refetch();
          }}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  const services = servicesQuery.data ?? [];
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
            today={today}
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
            today={today}
          />
        </div>
      </section>

      <NuevoBloqueDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        services={services}
        defaultDate={defaultFormDate}
        isSubmittingCita={createBooking.isPending}
        isSubmittingTiempo={createPersonalTime.isPending}
        onSubmitCita={handleCitaSubmit}
        onSubmitTiempo={handleTiempoSubmit}
      />
    </>
  );
}
