# Backend TODOs

Backend work the frontend depends on but that hasn't shipped yet. Frontend code references each item with a `TODO(backend)` or `TODO(mocks)` comment so grep + this doc stay in sync.

All endpoints are relative to `VITE_API_BASE_URL` (default `http://localhost:8080/api/v1`). JWT auth via `Authorization: Bearer <token>` unless noted public. Error responses use the shape `{ message: string, errors?: Record<string, string> }` which the frontend throws as `ApiError`.

---

## Auth

### `POST /auth/register` — extend body

- **Status:** endpoint exists; schema needs one new field.
- **Current frontend body:** `{ name, email, password, business_name }` (see `src/api/types/auth.ts::RegisterRequest`).
- **Change:** accept `business_name` in addition to `name`, `email`, `password`, and create the user's business with that name on sign-up.
- **Response:** unchanged — no token issued at this step. User is unverified until `/auth/verify-email`.

### `POST /auth/verify-email` — new

- **Used by:** `useVerifyEmail` (`src/api/hooks/useAuth.ts`).
- **Body:** `{ email: string, code: string }` (6-digit numeric).
- **Success (200):** `{ token: string, user: User }` — same `AuthResponse` shape as login. The frontend logs the user in and redirects to `/dashboard`.
- **Failure:** `400` with a user-facing Spanish `message` (e.g. "El código no es válido" or "El código ha expirado"). Frontend surfaces the message under the OTP input.
- **Auth:** public.

### `POST /auth/resend-code` — new

- **Used by:** `useResendCode` (`src/api/hooks/useAuth.ts`).
- **Body:** `{ email: string }`.
- **Success (204):** no body. Frontend shows "Te enviamos un nuevo código.".
- **Auth:** public.
- **Rate limit:** recommend 1 request per 60 s per email to prevent abuse.

### `POST /auth/forgot-password` — new

- **Used by:** `useForgotPassword` (`src/api/hooks/useAuth.ts`).
- **Body:** `{ email: string }`.
- **Success (204):** **always return 204 regardless of whether the email exists** — prevents account enumeration. If the email matches a registered user, send them a password-reset link pointing at `/login/nueva-contrasena?token=<jwt-or-opaque>`.
- **Auth:** public.
- **Rate limit:** recommend 3 requests per 15 min per email.

### `POST /auth/reset-password` — new

- **Used by:** `useResetPassword` (`src/api/hooks/useAuth.ts`).
- **Body:** `{ token: string, password: string }`.
- **Success (204):** no body. Frontend navigates to `/login?reset=success` and shows a green banner.
- **Failure (400):** `ApiError` with Spanish `message` for invalid / expired token. Surfaces under the password field.
- **Auth:** public. Token should be single-use and time-limited (e.g. 1 h).

---

## Business

### `POST /businesses/:id/logo` — new

- **Used by:** `useUploadBusinessLogo` (`src/api/hooks/useBusiness.ts`) — currently throws client-side because there's no endpoint yet.
- **Body:** `multipart/form-data` with a single `logo` field. Accept PNG / JPEG / WebP up to 2 MB.
- **Success (200):** the updated `Business` (including the new `logo_url`). Frontend invalidates `businessKeys.all`.
- **Auth:** authenticated; must own the business.

---

## Services

### Service extras linkage — new

- **Used by:** `ServiceFormPage` (`src/routes/dashboard/servicios/ServiceFormPage.tsx:92`). The form already collects `values.extrasGroupIds` but drops it on submit because there's nowhere to send it.
- **Needed endpoints:**
  - `GET /services/:id/extras` — returns the service's currently-linked extras.
  - `POST /services/:id/extras` — body `{ extra_id: string }` to attach an extra to a service.
  - `DELETE /services/:id/extras/:extraId` — detach.
- **Frontend follow-up once shipped:** add `useServiceExtras`, `useAttachExtra`, `useDetachExtra` hooks (already sketched in `.claude/skills/datil-figma-to-code/references/api-patterns.md`) and diff-apply on submit in `ServiceFormPage`.
- **Auth:** authenticated; must own the service's business.

---

## Dev-mode cleanup

These aren't backend deliverables but need to come out before production ship — grouped here so they're tracked alongside the other pending work.

- **`src/auth/AuthProvider.tsx` — `DEV_BYPASS_AUTH`.** Dev-only bypass that skips the real auth bootstrap in `import.meta.env.DEV`. Remove (or gate on `VITE_AUTH_BYPASS=true`) once the backend supports end-to-end auth.
- **`src/api/mocks/` + `src/api/client.ts` mock resolver.** `resolveMock()` short-circuits `apiClient` against in-memory fixtures. Delete `src/api/mocks/` and the `resolveMock` call in `client.ts` once every endpoint referenced in this doc ships.

---

## Keeping this doc honest

- Every item above is pinned to a `TODO(backend)` or `TODO(mocks)` comment in the source. Run `grep -rn "TODO" src/` from the frontend root to re-verify (plain `TODO:` comments count too — service-extras persistence is one).
- When an item ships: delete the comment, delete the corresponding section here. If the section drifts from the comment, the doc is wrong — trust the code.

### Known TODOs *not* tracked here

- `src/routes/dashboard/configuracion/ConfiguracionPage.tsx:32` — `TODO(autosave)`. No backend work required; the existing `PATCH /businesses/:id` endpoint is sufficient. This is a product/UX decision (auto-save on blur vs. an explicit Save button) and is tracked in the design backlog, not here.
