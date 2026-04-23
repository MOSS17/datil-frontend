# UI Component Registry

This file tracks all shared components in `src/components/ui/`.
**Read this file at the start of every screen implementation** to know what exists.

When this file says a component exists, use it — don't recreate it.
When you create or update a component, update this file to reflect the changes.

## How to Use This Registry

1. Before implementing any screen, scan this file for components you'll need
2. If a component exists and fits your needs → import and use it
3. If a component exists but needs a new variant → ADD the variant, don't duplicate
4. If no matching component exists → create it following the patterns below, then add it here

---

## Component Catalog

### Button (`src/components/ui/Button.tsx`)
**Status:** Created

Props (`ButtonProps`, named export, `forwardRef<HTMLButtonElement>`):
- `variant`: `primary` | `secondary` | `ghost` | `danger` | `accent` (default `primary`)
- `size`: `sm` | `md` | `lg` (default `md`)
- `isLoading`: boolean — shows a spinner and disables the button
- `leftIcon`, `rightIcon`: ReactNode
- `fullWidth`: boolean
- Extends all native `button` props. `type` defaults to `"button"` (not `"submit"`).

Token mapping:
| Variant | Background | Text | Border | Hover bg |
|---|---|---|---|---|
| primary | `bg-surface-primary` | `text-on-color` | none | `bg-surface-primary-hover` |
| secondary | `bg-surface` | `text-primary` | `border-control` | `bg-surface-secondary-subtle` |
| ghost | transparent | `text-primary` | none | `bg-surface-secondary-subtle` |
| danger | `bg-surface-error` | `text-on-color` | none | `bg-error-600` |
| accent | `bg-surface-accent` | `text-on-color` | none | `bg-accent-700` |

Note: secondary uses `border-control` (`#E8E5E0`) — NOT `border-default` (`#E2DBCF`). Cards use the warmer `border-default`; buttons/sidebar/nav chrome use the cooler `border-control`. The visual difference is intentional.

Size (content-based heights via vertical padding):
- `sm` — `px-400 py-200 text-body-sm` → 36px height
- `md` — `px-600 py-300 text-body-sm` → 44px height (matches Figma default)
- `lg` — `px-800 py-400 text-body` → 52px height

### Input (`src/components/ui/Input.tsx`)
**Status:** Created

Props (`InputProps`, named export, `forwardRef<HTMLInputElement>`):
- `label`, `error`, `hint`: string
- `leftAddon`, `rightAddon`: ReactNode (e.g. `datil.app/` prefix)
- `addonStyle`: `'inline' | 'divided'` (default `'inline'`). `inline` renders the addon as a seamless prefix (matches Figma URL-field style); `divided` renders it inside a separated pill with a border and subtle background.
- `fullWidth`: boolean (default `true`)
- `containerClassName`: wrapper class override
- Native input props passthrough; `id` auto-generated via `useId` when not provided.

Sizing: content-based 44px via `py-300` + `text-body-sm` (line-height 20px). Padding `px-300` on the field, `px-300`/`pl-300`/`pr-300` on inline addons, `border-r`/`border-l border-default bg-surface-secondary-subtle` on divided addons.

Label: `font-sans text-body-sm font-medium text-body-emphasis` (500 weight — matches Figma labels).

Value text: `text-body-emphasis` for typed content; `text-placeholder` for placeholder via `placeholder:`.

States (border): default `border-default` · focus `border-primary` · error `border-error` · disabled `border-disabled` + `bg-surface-disabled`.

Error message rendering: when `error` is set, the message renders with a 16px `CircleSlash` icon prefix (lucide-react) + `text-body-sm font-medium text-error` (matches the Figma error pattern). Hints remain `text-caption text-muted`.

### Textarea (`src/components/ui/Textarea.tsx`)
**Status:** Created

Same shape as Input but for `<textarea>`. Props: `label`, `error`, `hint`, `fullWidth`, `containerClassName`, `rows` (default 4). `forwardRef<HTMLTextAreaElement>`, `resize-none`, same border states.

Sizing: `p-300` all-around + `text-body-sm` (matches Figma textarea `p-[12px]`). Label styled identically to Input (`font-medium`). Value text `text-body-emphasis`.

Error message rendering matches `Input`: 16px `CircleSlash` + `text-body-sm font-medium text-error`.

### Select (`src/components/ui/Select.tsx`)
**Status:** Created

Props (`SelectProps`, named export, `forwardRef<HTMLSelectElement>`):
- `label`, `error`, `hint`: string
- `leftIcon`: ReactNode (rendered inside the field, e.g. clock icon for duration)
- `options`: `{ value, label }[]` — or pass `<option>` children instead
- `placeholder`: string (rendered as a disabled first option)
- `fullWidth` (default `true`), `containerClassName`
- Native `<select>` props passthrough; `id` auto-generated via `useId`.

Chevron is rendered absolutely on the right. Field is sized identically to Input (`py-300 text-body-sm` → 44px). Uses the same border states (default / focus `border-primary` / error / disabled).

### Card (`src/components/ui/Card.tsx`)
**Status:** Created

Props (`CardProps`, named export):
- `padding`: `none` | `400` | `500` | `600` | `800` (default `600`)
- `noBorder`: boolean
- `className`: override
- Extends `HTMLAttributes<HTMLDivElement>`.

Base: `rounded-lg bg-surface border border-default` (border removed when `noBorder`).

### Badge (`src/components/ui/Badge.tsx`)
**Status:** Not yet created

Expected variants:
- `variant`: `default` | `success` | `warning` | `error` | `info` | `accent`
- `size`: `sm` | `md`

### Modal (`src/components/ui/Modal.tsx`)
**Status:** Not yet created

### Drawer (`src/components/ui/Drawer.tsx`)
**Status:** Created

Side drawer on desktop (slides in from the right), full-screen sheet on mobile.

Props (`DrawerProps`, named export):
- `open`: boolean
- `onClose`: () => void (also triggered by Escape key + overlay click)
- `title`: ReactNode — rendered in a Spectral `text-h5` heading
- `children`: ReactNode — the scrollable body
- `footer`: ReactNode — optional pinned footer with a top border
- `ariaLabel`: string — sets `aria-label` on the dialog element
- `widthClassName`: string — override desktop width (default `md:w-[400px]`)

Layout: `fixed inset-0` on mobile (full-screen), `md:inset-y-0 md:left-auto md:right-0 md:w-[400px]` on desktop. Close button (X icon) lives in the header. Backdrop is `bg-surface-primary/25`.

### Switch (`src/components/ui/Switch.tsx`)
**Status:** Created

Props (`SwitchProps`, named export):
- `checked`: boolean
- `onChange`: (next: boolean) => void
- `label?`: string — rendered beside the switch
- `ariaLabel?`: string — overrides label for screen readers
- `disabled?`, `className?`

Visual: `h-[24px] w-[44px]` track, 20px thumb, `bg-surface-primary` when on / `bg-surface-control` when off. Matches the existing `DayToggle` geometry in `schedule/components/`.

### Checkbox (`src/components/ui/Checkbox.tsx`)
**Status:** Created

Props (`CheckboxProps`, named export, `forwardRef<HTMLInputElement>`):
- `label?`: ReactNode — rendered beside the box
- `containerClassName?`: wrapper override
- All native `input` props passthrough (`checked`, `onChange`, `disabled`, `name`, `id`, …)

Visual: 20px rounded square; `bg-surface-primary` + white check (`text-on-color`) when checked, `bg-surface` + `border-default` when unchecked.

### Toggle (`src/components/ui/Toggle.tsx`)
**Status:** Not yet created (use Switch instead for on/off controls)

### Skeleton (`src/components/ui/Skeleton.tsx`)
**Status:** Created

Props (`SkeletonProps`, named export):
- `rounded`: `sm` | `md` | `lg` | `full` (default `md`)
- `className`: set width/height via Tailwind utilities (e.g. `h-1000 w-full`).
- Base: `bg-neutral-50 animate-pulse`, `aria-hidden`.

### EmptyState (`src/components/ui/EmptyState.tsx`)
**Status:** Not yet created

### ErrorState (`src/components/ui/ErrorState.tsx`)
**Status:** Not yet created

### StatusBadge (`src/components/ui/StatusBadge.tsx`)
**Status:** Not yet created

### ConfirmDialog (`src/components/ui/ConfirmDialog.tsx`)
**Status:** Not yet created

### PageHeader (`src/components/ui/PageHeader.tsx`)
**Status:** Not yet created
(Currently inlined in `ConfiguracionPage` — extract when a second page needs the same pattern.)

### AuthLayout (`src/routes/auth/components/AuthLayout.tsx`)
**Status:** Created (route-local, shared by auth routes)

Wraps every auth screen. Renders the Datil brand mark (dark "D" tile + "Datil" wordmark) absolute top-left and centers `children` in the viewport on `bg-surface-page`. Props: `{ children: ReactNode, notice?: ReactNode }`. The `notice` slot renders top-right in a `max-w-[403px]` container — used for the post-password-reset success banner on `/login?reset=success`.

### AuthBackLink (`src/routes/auth/components/AuthBackLink.tsx`)
**Status:** Created (route-local)

Back arrow + label above the heading on forgot/reset flows. Props: `{ to: string, label?: string }` (default "Volver al inicio de Sesión"). Uses `ArrowLeft` from lucide-react, `text-body-sm font-medium text-primary`.

### OtpInput (`src/routes/auth/registro/components/OtpInput.tsx`)
**Status:** Created (page-local — promote to `components/ui/` if a second screen needs OTP entry)

6-cell numeric input for email verification. Handles autofocus, paste (distributes digits across cells), arrow / backspace navigation, and auto-submits when filled. Props: `{ length?, value, onChange, onComplete?, autoFocus?, disabled?, error?, ariaLabel? }`. Cells are 48×56 with `border-default` / focus `border-primary` / error `border-error`.

### Booking flow (`src/routes/booking/`)
**Status:** Created (route-local — customer-facing public booking flow)

Structure: `BookingLayout` wraps all `/:slug/*` routes with shared header (`components/BookingHeader`), footer (`components/BookingFooter`), and the `BookingProvider` (selection state backed by sessionStorage, keyed per-slug).

Selection state lives in `bookingContextValue.ts` (context + types only), `BookingContext.tsx` (provider + storage sync), and `useBookingSelection.ts` (hook). Shape: `BookingSelection = { id, serviceId, extraIds[] }`.

Pages:
- `business/BusinessPage.tsx` (`/:slug`) — hero, category tabs, category accordions, service cards that open the extras sheet, floating "N Servicios | Continuar" CTA when selections exist.
- `reservation/ReservationPage.tsx` (`/:slug/resumen`) — "Tu Reservación" summary with per-selection edit/remove, extras shown as inset rows with a left-accent border, and a primary "Reservar {price} | {duration}" CTA.

Reusable within booking but not shared across features (not promoted to `components/ui/`):
- `business/components/ExtrasSheet.tsx` — right drawer on desktop (`md:w-[400px]`), bottom sheet on mobile. Supports `mode: 'add' | 'edit'`, `initialExtraIds`. Doesn't use the generic `Drawer` because the header is a two-line service title in `text-h5` (mobile) / `text-h4` (desktop) centered vs left-aligned.
- `business/components/CategoryTabs.tsx` — horizontal tabs with bottom-border active indicator; first tab is always "Todos".
- `business/components/CategoryAccordion.tsx` — section with expand/collapse chevron; renders 1–3-col service grid.
- `business/components/ServiceCard.tsx` — card in the catalog; shows `Check` when selected (stays selected if the category allows multiple).
- `business/components/ExtraItem.tsx` — row inside `ExtrasSheet`.
- `business/components/FloatingContinueCTA.tsx` — pill CTA centered at bottom of viewport.
- `reservation/components/SelectionItem.tsx` — row on `Tu Reservación`; extras rendered with `border-l-[3px] border-accent bg-surface-secondary-subtle`.

Helpers: `business/selection.ts` — pure functions for grouping services/extras by category and computing per-selection price/duration totals. `groupExtrasByCategory` treats every `is_extra && is_active` service as an available extra (grouped by its category) until per-service extra linking ships on the backend.

---

## Utilities

### cn (`src/lib/cn.ts`)
`cn(...inputs: ClassValue[])` — wraps `clsx` + `tailwind-merge`. Use in every shared UI component that accepts a `className` prop so consumer overrides win without duplicating classes.

---

## Icon library

Use `lucide-react` for all icons. Installed at the project level. Prefer `size={16}` for inputs/buttons, `size={18–20}` for nav, `size={28}` for hero illustrations. Pass `aria-hidden` when decorative.

---

## Rules for Updating This Registry

When you **create** a new component:
1. Build it in `src/components/ui/{Name}.tsx`
2. Update this file: change "Not yet created" to "Created", list the actual props interface, and note any deviations from the expected API above

When you **add a variant** to an existing component:
1. Add the variant to the component file
2. Update this file: add the new variant to the variant list and token mapping table

When you **modify props** of an existing component:
1. Update the component file
2. Update this file: reflect the new or changed props

When a **screen needs a component that isn't listed here**:
1. Check if it's truly reusable (will 2+ screens need it?)
2. If yes → create in `src/components/ui/`, add to this registry
3. If no → keep it as a page-local component in the route folder

**IMPORTANT**: This file must always reflect the actual state of `src/components/ui/`.
If you're unsure whether a component exists, check the filesystem — this file may be
out of date. If it is, update it as part of your current task.
