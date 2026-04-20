# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `bun run dev` — Start Vite dev server (localhost:5173)
- `bun run build` — TypeScript check + Vite production build
- `bun run lint` — ESLint
- `bun run preview` — Preview production build

## Architecture

Datil is an appointment booking platform for small service businesses in Mexico. The frontend has two sides served from one React app:

- **Business dashboard** (`/dashboard/*`) — protected routes for business owners to manage services, appointments, schedule, and profile
- **Public booking flow** (`/:slug/*`) — customer-facing pages to browse a business and book appointments

All UI text is in Spanish. No i18n library — strings are hardcoded.

### Key Patterns

**API layer** (`src/api/`): `apiClient<T>()` in `client.ts` is a generic fetch wrapper that auto-attaches Bearer tokens, handles 401 by clearing auth and redirecting to `/login`, and supports both JSON and FormData bodies. Endpoint paths live in `endpoints.ts`. All API response/request types are in `api/types/` organized by domain.

**TanStack Query hooks** (`src/api/hooks/`): Each domain file exports a query key factory, read hooks (`useQuery`), and mutation hooks (`useMutation`) that invalidate the relevant keys on success. The QueryClient is configured with 5-min staleTime and 1 retry.

**Auth** (`src/auth/`): JWT stored in localStorage under `datil_token`. `AuthProvider` validates the token on mount and fetches the user from `/auth/me`. `ProtectedRoute` wraps dashboard routes and redirects unauthenticated users to `/login?redirect=`.

**Routing** (`src/routes/router.tsx`): Uses `createBrowserRouter`. All page components are lazy-loaded with `React.lazy` + `Suspense`. Unimplemented pages remain placeholder `<div>`s until their UI is built from Figma designs.

**Dashboard page structure**: Simple pages live as a single file at `routes/dashboard/PageName.tsx`. Once a page grows multiple concerns (sub-components, a form schema, non-trivial state), promote it to a module folder:

```
routes/dashboard/<page-name>/
  PageName.tsx         — orchestration only (data fetching + layout)
  schema.ts            — Zod schema + inferred form type (for pages with forms)
  types.ts             — module-local types
  constants.ts         — module-local constants
  useXxx.ts            — hooks that own state + handlers
  draft.ts / utils.ts  — pure helpers
  components/
    <SubComponent>.tsx — page-specific sub-components
    <Page>Skeleton.tsx — loading skeleton, colocated with the page
```

Rules for this layout:

- **Never import from a parent page.** Sub-components pull form types from `schema.ts`, not from the page file — this prevents upward dependencies.
- **Extract non-trivial state into a hook.** If the page has more than a couple of `useState` hooks + handlers, move them into `useXxx.ts` so the page body stays focused on rendering.
- **Colocate page-specific pieces; share only what's reused.** Components used by one page belong under that page's `components/`. Only truly shared pieces go in `routes/dashboard/components/`.
- **Update `router.tsx`** to point at the new `<page-name>/PageName.tsx` path when promoting a page to a module.

**Shared dashboard primitives** (`routes/dashboard/components/`):

- `PageHeader` — `{ title, subtitle?, actions?, className? }`. Use on every dashboard page for consistent header styling.
- `ErrorState` — `{ message, onRetry, retryLabel?, className? }`. Wrap in a `<Card>` for in-card errors, or in a centered container for full-page errors.

Reference implementations: `routes/dashboard/configuracion/` and `routes/dashboard/schedule/`.

### Path Alias

`@/` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).

### Provider Order

`QueryClientProvider` → `AuthProvider` → `RouterProvider` (in `App.tsx`).

## Conventions

- All currency formatting uses MXN (`lib/formatters.ts`)
- Phone validation expects Mexican 10-digit numbers, CLABE is 18-digit (`lib/validators.ts`)
- Zod schemas for form validation, resolved via `@hookform/resolvers`
- Tailwind CSS v4 via Vite plugin — styles go in component files, not separate CSS
- Backend API expected at `VITE_API_BASE_URL` (default `http://localhost:8080/api/v1`)
