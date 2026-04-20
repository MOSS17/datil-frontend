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

**Routing** (`src/routes/router.tsx`): Uses `createBrowserRouter`. All page components are lazy-loaded with `React.lazy` + `Suspense`. Pages are placeholder `<div>`s — real UI is implemented from Figma designs.

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
