---
name: datil-figma-to-code
description: Implement UI screens and components for the Dátil appointment booking app from Figma screenshots. Use this skill whenever the user shares a screenshot, image, or visual reference from Figma and wants it turned into React/TypeScript code with Tailwind CSS. Also trigger when the user says "implement this screen", "build this component", "code this design", references a specific Dátil page or route, or asks to create any UI element that should match the design system. This skill covers the full flow: analyzing the screenshot, mapping to the existing codebase structure, generating components, wiring up API hooks, handling loading/error/empty states, and responsive behavior. Use it even for small UI pieces like a card, modal, or form field if the user provides a visual reference.
---

# Dátil — Figma Screenshot to Code

You are implementing the frontend for **Dátil**, an appointment booking platform for small service businesses in Mexico. The user will provide Figma screenshots and you will produce production-quality React + TypeScript + Tailwind code that matches the design precisely.

## Reference files (read before writing code)

Read in this order:

1. **`references/common-pitfalls.md`** — 13 silent failure modes we've hit. Scan this first. Most design mismatches trace back here.
2. **`references/figma-tokens.md`** — canonical Figma variable → Tailwind class lookup. Every `var(--…)` and loose hex in MCP output resolves through this file.
3. **`references/component-registry.md`** — catalog of shared UI components before creating new ones.
4. **`references/api-patterns.md`** — TanStack Query hooks + API contracts when wiring data.

If any translation is missing from `figma-tokens.md`, **add it there and to `tailwind.config.js` before using it in JSX.** Never ship `bg-[#...]` or `text-[#...]` with raw hex.

## Step 0: Pre-flight check

Every time the skill runs (even for small tweaks), confirm the project's foundations are sound. Three quick checks:

```bash
# 1. Are Spectral + DM Sans loaded in index.html? (no match → pitfall #1)
grep -l googleapis /Users/mossandoval/Developer/saas/datil/frontend/index.html

# 2. Any raw hex leaking into JSX? (must be empty → pitfall #5)
grep -rn '\[#' /Users/mossandoval/Developer/saas/datil/frontend/src/

# 3. Tailwind config free of the `text: { ... }` color family trap? (must be empty → pitfall #2)
grep -nE '^\s+text:\s*\{' /Users/mossandoval/Developer/saas/datil/frontend/tailwind.config.js
```

If any of these fail, **fix before starting the screen.** Don't layer new work on top of a broken foundation — the new work will look wrong and you'll spend the session chasing shadows.

## Step 1: Analyze the Screenshot

Study the screenshot carefully and identify:

1. **Layout structure** — grid vs flex, number of columns, sidebar vs full-width, scroll behavior.
2. **Component inventory** — list every distinct UI element (buttons, inputs, cards, tables, modals, toggles, badges, etc.).
3. **Typography** — which text is serif (Spectral = headings) vs sans (DM Sans = body/UI). Map each text element to a size class: `text-h1`–`text-h6`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`. **Remember:** these are size-only. Pair with a color class (`text-heading`, `text-body-emphasis`, `text-muted`, …). See pitfall #4.
4. **Colors** — resolve every Figma variable via `references/figma-tokens.md`. If a color isn't there, add it before writing classes.
5. **Spacing** — use the design scale: `100`=4, `200`=8, `300`=12, `400`=16, `500`=20, `600`=24, `700`=28, `800`=32, `900`=36, `1000`=40, `1100`=48, `1200`=56, `1300`=64, `1400`=72. **44px is intentionally not a token** — use `py-300 text-body-sm` content-based (see pitfall #6).
6. **Interactive states** — infer hover, focus, disabled, error states from context.
7. **Responsive behavior** — designs are either desktop (1440) or mobile (440). Note how the other breakpoint should adapt.

**Present the analysis as a brief checklist before writing code** — catches misinterpretations early.

**If the user hasn't specified the target screen/route, you MUST confirm.** Try to infer from visual cues, then ask:

> This looks like the appointments list page. I'd place it at `/dashboard/citas` → `src/routes/dashboard/Citas.tsx`. Is that correct?

Only proceed to code after the user confirms both the analysis and the route.

## Step 2: Parse the Figma MCP output

When you call `get_design_context`, the MCP returns React+Tailwind with Figma variables embedded. **Translate — don't copy verbatim.** Use this table:

| MCP output | Write as |
|---|---|
| `bg-[var(--surface/page,#fcfcfa)]` | `bg-surface-page` |
| `bg-[var(--surface/accent/default-subtle,#e5eef3)]` | `bg-surface-accent-subtle` (drop `/default`) |
| `text-[color:var(--text/default/body-emphasis,#372e2d)]` | `text-body-emphasis` (color only — pair with size) |
| `text-[color:var(--text/default/caption,#878281)]` | `text-muted` (NOT `text-caption` — that's size) |
| `text-[length:var(--font/copy/body-sm/text-size,14px)]` + matching line-height | `text-body-sm` |
| `text-[length:var(--font/headings/h4/text-size,32px)]` | `text-h4` |
| `font-['Spectral:Regular',sans-serif]` + any weight var | `font-serif` (base CSS already forces weight 400 on h1–h6) |
| `font-['DM_Sans:Medium',sans-serif] font-medium` | `font-sans font-medium` |
| `rounded-[var(--border-radius/lg,12px)]` | `rounded-lg` |
| `px-[24px] py-[12px]` on a button | Button `size="md"` (it's `px-600 py-300`) — don't hand-roll |
| `h-[44px] px-[12px]` on an input | Input component (content-based 44px via `py-300`) |
| `lucide/heart-handshake` | `HeartHandshake` from `lucide-react` (kebab-case → PascalCase) |
| Raw `bg-[#fbf2eb]` with NO var reference | **add to `tailwind.config.js` + `figma-tokens.md`**, then use the class |

**Icon rename gotchas (lucide):** `lucide/house` → `Home`. `lucide/link-2` → import as `Link as LinkIcon` to avoid clashing with `react-router-dom`'s Link.

## Step 3: Map to the codebase

### Which route/page is this?

**Dashboard (protected, `/dashboard/*`):** home, `servicios`, `categorias`, `citas`, `horario`, `tiempo-personal`, `configuracion` (unified settings), `banco`.

**Booking (public, `/:slug/*`):** business landing, `servicios`, `horario`, `confirmar`.

**Auth:** `/login`, `/registro`.

Dashboard pages render inside `DashboardLayout` — **don't re-implement the sidebar.** The page body is just the main content area.

### Which API hooks are needed?

Read `references/api-patterns.md`. Match data needs to existing hooks. If a hook or endpoint doesn't exist, flag it — don't invent contracts.

### Component inventory — reuse, extend, or create

Read `references/component-registry.md` before creating anything.

1. Matching component exists → import and use it.
2. Exists but needs a new variant → **extend** (add the variant, don't fork). Update the registry.
3. Doesn't exist, appears on 2+ screens → create in `src/components/ui/{Name}.tsx`, add to registry.
4. Doesn't exist, page-specific → keep as a page-local component.

**Always list component actions in the response** before showing code:

- "Creating new shared: `Badge` in `src/components/ui/Badge.tsx`"
- "Extending `Button`: adding `danger` variant"
- "Reusing existing: `Card`, `Input`, `Skeleton`"

## Step 4: Generate code

### File placement

| What | Where |
|---|---|
| Page component | `src/routes/{section}/{PageName}.tsx` (default export) |
| Page-specific subcomponents | Same file, or `src/routes/{section}/components/{Name}.tsx` if >80 lines |
| Shared UI primitives | `src/components/ui/{Name}.tsx` (named export) |
| API hooks | `src/api/hooks/{domain}.ts` |
| Types | `src/api/types/{domain}.ts` |
| Form schemas (shared) | `src/lib/validators.ts` |
| Formatters | `src/lib/formatters.ts` |

### Conventions

**TypeScript:** strict mode, no `any`, no non-null `!` without explicit comment. Props types named `{ComponentName}Props`.

**React:** functional components (no `React.FC`), `forwardRef` for form primitives, components under 200 lines.

**Tailwind:** **only tokens.** No `p-[17px]`, no `text-[#372E2D]`. If spacing doesn't fit the scale, round to the nearest token and comment: `{/* Figma 18px, using p-500 (20px) */}`.

**Colors — use the patterns from figma-tokens.md:**
- Size first, color second: `text-body text-body-emphasis`, `text-caption text-muted`.
- Card borders: `border-default`. Button/sidebar/nav chrome borders: `border-control`. Dividers: `border-subtle`.
- Logo empty state bg: `bg-surface-brand-subtle`, not `bg-surface-secondary-subtle`.
- Sidebar brand "D" tile: `bg-surface-primary text-on-color` (dark + white), not cream.

**Forms:** React Hook Form + Zod, `zodResolver`, field-level errors under each input, disable submit while `isSubmitting`. All Spanish strings, `tú` form.

**Data:** TanStack Query hooks only. Handle loading (skeleton), error (retry CTA), empty (friendly message + creation CTA).

**Dates:** backend sends ISO 8601 UTC → convert to `America/Mexico_City` at display. Use `src/lib/formatters.ts`.

**Accessibility:** semantic HTML (`<button>` not `<div onClick>`), `htmlFor` on labels, `alt` on images (empty for decorative), status never color-only.

### Component structure template

```tsx
// src/routes/dashboard/MiPagina.tsx
import { useMiDato } from '@/api/hooks/useMiDato';

export default function MiPagina() {
  const { data, isLoading, error, refetch } = useMiDato();

  if (isLoading) return <MiPaginaSkeleton />;
  if (error) return <EstadoError onReintentar={() => refetch()} />;
  if (!data || data.length === 0) return <EstadoVacio />;

  return (
    <main className="p-600">
      {/* ... */}
    </main>
  );
}
```

## Step 5: States NOT in the screenshot

Every screen gets these even if the user only sent the happy path:

1. **Loading** — skeleton matching the layout shape (`animate-pulse` + `bg-neutral-100`).
2. **Error** — centered message + icon + "Reintentar" button.
3. **Empty** — friendly Spanish message + creation CTA. Ex: "Aún no tienes servicios. Crea tu primer servicio para empezar."
4. **Responsive** — note how desktop adapts to mobile (or vice versa).

Say so when you add them:

> I've added loading, error, and empty states based on the layout. Send me Figma screenshots if you have specific designs for them.

## Step 6: Verify — before reporting done

Run every check. They're cheap and catch the silent failures that burn hours of back-and-forth.

```bash
# 1. Types
bunx tsc --noEmit

# 2. Production build — catches invalid class names, missing exports
bun run build

# 3. No raw hex in source
grep -rn '\[#' /Users/mossandoval/Developer/saas/datil/frontend/src/ && echo "VIOLATIONS" || echo "clean"

# 4. Spot-check that the color classes you USED actually emitted CSS
#    (replace the pattern with classes you wrote)
ls /Users/mossandoval/Developer/saas/datil/frontend/dist/assets/*.css | head -1 | \
  xargs grep -oE '\.(text-heading|text-muted|border-default|border-control|bg-surface-brand-subtle)\{[^}]*\}' \
  | sort -u
#    Every class you used should appear. If missing → common-pitfalls.md #2 or #3.
```

## Step 7: Review checklist

- [ ] Pre-flight (Step 0) passed
- [ ] Figma variables mapped via `figma-tokens.md`, no raw hex in JSX
- [ ] Size and color classes paired correctly (`text-body text-body-emphasis`, not bare `text-body`)
- [ ] Card borders use `border-default`, button/sidebar use `border-control`
- [ ] Input/Textarea labels have `font-medium`
- [ ] Controls that look 44px use content-based `py-300 text-body-sm` (not `h-1000`/`h-1100`)
- [ ] Loading, error, empty states included
- [ ] Responsive noted / implemented
- [ ] All user-facing text in Spanish (tú form), currency MXN, dates in `America/Mexico_City`
- [ ] React Hook Form + Zod for any form; TanStack Query for any data
- [ ] Shared components reused, new ones reflected in `component-registry.md`
- [ ] `bunx tsc --noEmit` and `bun run build` both clean
- [ ] Grep for `\[#` returns empty
- [ ] Every color class used appears in the compiled CSS

## What NOT to do

- **Don't invent design.** If ambiguous, ask. No decorative elements that aren't in the frame.
- **Don't copy Figma MCP output verbatim.** Translate through `figma-tokens.md`. Raw hex in JSX is always a bug.
- **Don't guess API contracts.** If a hook or field doesn't exist, flag it.
- **Don't skip states.** Loading, error, empty are non-optional.
- **Don't re-implement the sidebar on dashboard pages.** `DashboardLayout` owns it.
- **Don't add 44px (or other non-scale values) to the spacing config.** Use content-based sizing.
- **Don't use `border-default` on buttons or the sidebar** — that's `border-control`. The visual difference is intentional.
- **Don't leave a class in JSX you haven't confirmed emits CSS** (Step 6, check 4). Tailwind fails silently.
