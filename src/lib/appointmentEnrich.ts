import type { Appointment, AppointmentService } from '@/api/types/appointments';
import type { Service } from '@/api/types/services';

// The backend's AppointmentService only carries service_id/price/duration.
// For display, the UI needs the service's name and whether it's an extra —
// data that already lives in the services catalog the dashboard loads. This
// helper joins the two in memory so consumers can render familiar labels.

export function enrichAppointmentServices(
  services: AppointmentService[],
  catalog: Service[] | undefined,
): AppointmentService[] {
  if (!catalog || catalog.length === 0) return services;
  const byId = new Map(catalog.map((s) => [s.id, s]));
  return services.map((s) => {
    const match = byId.get(s.service_id);
    if (!match) return s;
    return { ...s, service_name: match.name, is_extra: match.is_extra };
  });
}

export function enrichAppointment(
  appointment: Appointment,
  catalog: Service[] | undefined,
): Appointment {
  return { ...appointment, services: enrichAppointmentServices(appointment.services, catalog) };
}

export function enrichAppointments(
  appointments: Appointment[],
  catalog: Service[] | undefined,
): Appointment[] {
  if (!catalog || catalog.length === 0) return appointments;
  const byId = new Map(catalog.map((s) => [s.id, s]));
  return appointments.map((appt) => ({
    ...appt,
    services: appt.services.map((s) => {
      const match = byId.get(s.service_id);
      return match
        ? { ...s, service_name: match.name, is_extra: match.is_extra }
        : s;
    }),
  }));
}

export function computeDurationMin(appointment: {
  start_time: string;
  end_time: string;
}): number {
  const start = new Date(appointment.start_time).getTime();
  const end = new Date(appointment.end_time).getTime();
  return Math.max(0, Math.round((end - start) / 60000));
}
