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

### Textarea (`src/components/ui/Textarea.tsx`)
**Status:** Created

Same shape as Input but for `<textarea>`. Props: `label`, `error`, `hint`, `fullWidth`, `containerClassName`, `rows` (default 4). `forwardRef<HTMLTextAreaElement>`, `resize-none`, same border states.

Sizing: `p-300` all-around + `text-body-sm` (matches Figma textarea `p-[12px]`). Label styled identically to Input (`font-medium`). Value text `text-body-emphasis`.

### Select (`src/components/ui/Select.tsx`)
**Status:** Not yet created

Same pattern as Input but for `<select>`. forwardRef, same states.

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

### Toggle (`src/components/ui/Toggle.tsx`)
**Status:** Not yet created

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
