# API Patterns Reference

This file documents the existing API hooks, query keys, and endpoint contracts so that
the skill can wire up screens to real data without guessing.

**Read this file when implementing any screen that fetches or mutates data.**

## API Client

Located at `src/api/client.ts`. Wraps native `fetch` with:
- Auto-attaches `Authorization: Bearer <token>` from localStorage (`datil_token`)
- Sets `Content-Type: application/json` unless body is `FormData` (for file uploads)
- On 401, clears token and redirects to `/login`
- Throws typed errors with status code and message from the API response

## Query Key Factories

Each domain exports a `keys` object for consistent cache invalidation.
Pattern:

```ts
export const categoryKeys = {
  all: ['categories'] as const,
  list: (businessId: string) => [...categoryKeys.all, 'list', businessId] as const,
  detail: (id: string) => [...categoryKeys.all, 'detail', id] as const,
};
```

Always use these factories — never write raw query key arrays in components.

## Hooks by Domain

### useAuth (`src/api/hooks/useAuth.ts`)
- `useLogin()` — mutation, `POST /api/auth/login`, body: `{ email, password }`, returns `{ token, user }`
- `useRegister()` — mutation, `POST /api/auth/register`, body: `{ name, email, password }`
- `useCurrentUser()` — query, `GET /api/auth/me`, returns user + business info

### useBusiness (`src/api/hooks/useBusiness.ts`)
- `useBusiness(slug: string)` — query, `GET /api/businesses/:slug` (public, no auth)
- `useMyBusiness()` — query, `GET /api/businesses/me` (authenticated)
- `useUpdateBusiness()` — mutation, `PATCH /api/businesses/me`
- `useUpdateBankDetails()` — mutation, `PATCH /api/businesses/me/bank`

### useCategories (`src/api/hooks/useCategories.ts`)
- `useCategories(businessId: string)` — query, `GET /api/businesses/:id/categories`
- `useCreateCategory()` — mutation, `POST /api/categories`
- `useUpdateCategory()` — mutation, `PATCH /api/categories/:id`
- `useDeleteCategory()` — mutation, `DELETE /api/categories/:id`

Category shape:
```ts
interface Category {
  id: string;
  business_id: string;
  name: string;
  allows_multiple: boolean; // Can customer pick >1 service from this category?
  display_order: number;
  created_at: string; // ISO 8601 UTC
  updated_at: string;
}
```

### useServices (`src/api/hooks/useServices.ts`)
- `useServices(businessId: string)` — query, `GET /api/businesses/:id/services`
- `useServicesByCategory(categoryId: string)` — query, `GET /api/categories/:id/services`
- `useCreateService()` — mutation, `POST /api/services`
- `useUpdateService()` — mutation, `PATCH /api/services/:id`
- `useDeleteService()` — mutation, `DELETE /api/services/:id`
- `useServiceExtras(serviceId: string)` — query, `GET /api/services/:id/extras`
- `useAttachExtra()` — mutation, `POST /api/services/:id/extras` (body: `{ extra_id }`)
- `useDetachExtra()` — mutation, `DELETE /api/services/:id/extras/:extraId`

Service shape:
```ts
interface Service {
  id: string;
  business_id: string;
  category_id: string;
  name: string;
  description: string | null;
  min_price: number;       // in MXN cents (divide by 100 for display)
  max_price: number | null; // null means fixed price (use min_price)
  duration_minutes: number;
  advance_payment: number | null; // in MXN cents, null = no advance required
  is_extra: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}
```

### useAppointments (`src/api/hooks/useAppointments.ts`)
- `useAppointments(filters?)` — query, `GET /api/appointments` (auth, supports query params: `date`, `status`, `page`, `limit`)
- `useAppointment(id: string)` — query, `GET /api/appointments/:id`
- `useCreateAppointment()` — mutation, `POST /api/appointments` (public, for booking flow)
- `useUpdateAppointmentStatus()` — mutation, `PATCH /api/appointments/:id/status`
- `useTodayAppointments()` — query, convenience wrapper for today's date filter
- `useAvailableSlots(businessId: string, date: string, serviceIds: string[])` — query, `GET /api/businesses/:id/availability?date=YYYY-MM-DD&services=id1,id2`

Appointment shape:
```ts
interface Appointment {
  id: string;
  business_id: string;
  user_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  start_time: string;     // ISO 8601 UTC
  end_time: string;       // ISO 8601 UTC
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_proof_url: string | null;
  notes: string | null;
  services: AppointmentService[];
  created_at: string;
  updated_at: string;
}

interface AppointmentService {
  service_id: string;
  service_name: string;
  price: number;           // snapshotted at booking time, MXN cents
  duration_minutes: number; // snapshotted
  is_extra: boolean;
}
```

### useSchedule (`src/api/hooks/useSchedule.ts`)
- `useWorkdays(businessId: string)` — query, `GET /api/businesses/:id/workdays`
- `useUpdateWorkday()` — mutation, `PUT /api/workdays/:id`
- `usePersonalTime(filters?)` — query, `GET /api/personal-time`
- `useCreatePersonalTime()` — mutation, `POST /api/personal-time`
- `useDeletePersonalTime()` — mutation, `DELETE /api/personal-time/:id`

Workday shape:
```ts
interface Workday {
  id: string;
  business_id: string;
  day: number; // 0=domingo, 1=lunes, ..., 6=sábado
  is_enabled: boolean;
  hours: WorkHour[];
}

interface WorkHour {
  id: string;
  workday_id: string;
  start_time: string; // "HH:MM" in local time
  end_time: string;   // "HH:MM" in local time
}
```

PersonalTime shape:
```ts
interface PersonalTime {
  id: string;
  user_id: string;
  type: 'hours' | 'full_day' | 'date_range';
  start_date: string; // "YYYY-MM-DD"
  end_date: string | null; // only for date_range
  start_time: string | null; // "HH:MM", only for hours type
  end_time: string | null;
  reason: string | null;
  created_at: string;
}
```

### useCalendar (`src/api/hooks/useCalendar.ts`)
- `useCalendarIntegrations()` — query, `GET /api/calendar/integrations`
- `useConnectCalendar()` — mutation, initiates OAuth flow
- `useDisconnectCalendar()` — mutation, `DELETE /api/calendar/integrations/:id`

## Mutation Patterns

All mutations should:
1. Use `onSuccess` to invalidate relevant query keys
2. Show a success toast/notification
3. Handle errors by showing the API error message to the user
4. For forms: use `useMutation` + React Hook Form's `handleSubmit`

```ts
const updateBusiness = useUpdateBusiness();

const onSubmit = handleSubmit(async (data) => {
  try {
    await updateBusiness.mutateAsync(data);
    // Invalidate and show success
  } catch (error) {
    // Error is already typed, show to user
  }
});
```

## Important: Race Conditions in Booking

The availability endpoint returns slots that were free at query time. Between the customer seeing a slot and submitting the booking, another customer could take it. The backend returns **409 Conflict** with `code: "SLOT_TAKEN"` when this happens.

The booking confirmation page MUST handle this:
1. Catch the 409 error
2. Show a clear message: "Este horario ya no está disponible. Por favor selecciona otro."
3. Refetch available slots
4. Return the user to the time selection step

## Important: File Uploads

Payment proof upload uses `multipart/form-data`:

```ts
const formData = new FormData();
formData.append('payment_proof', file);
formData.append('appointment_data', JSON.stringify(appointmentData));

// apiClient detects FormData and skips Content-Type header
await apiClient.post('/api/appointments', formData);
```
