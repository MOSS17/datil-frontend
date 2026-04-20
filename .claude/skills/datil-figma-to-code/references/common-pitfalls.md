# Common Pitfalls

Silent failure modes we've hit before. Scan this file before writing code; when something looks wrong in the browser, start here before re-reading the design.

Each entry: **symptom → root cause → fix.**

---

## 1. Everything looks "wrong" — fonts fall back to Georgia / system-ui

**Symptom:** headings look serif-but-wrong, body has wrong letter spacing, overall shape mismatches Figma even though class names are correct.

**Root cause:** `index.html` isn't loading Spectral + DM Sans. `font-serif` falls back to Georgia, `font-sans` to system-ui. Because `font-family` silently falls back, nothing errors.

**Fix:** `index.html` must include the Google Fonts preconnect + stylesheet:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Spectral:ital,wght@0,400;0,500;0,600;1,400&display=swap" rel="stylesheet" />
```

**Check:** `grep -l googleapis index.html` — empty = broken.

---

## 2. `text-heading`, `text-body-emphasis`, `text-primary` etc. emit no CSS

**Symptom:** text color stays default everywhere. Headings, body-emphasis, placeholder look the same color.

**Root cause:** `colors: { text: { heading, body, caption, ... } }` makes Tailwind generate `.text-text-heading` (family + key). `.text-heading` is never emitted. Also collides with font-size keys.

**Fix:** semantic foreground colors must live at the **root** of `colors`, with names that don't collide with fontSize keys:

```js
colors: {
  heading: '#372E2D',
  'body-emphasis': '#372E2D',
  muted: '#878281',          // NOT `caption` — would collide with fontSize
  placeholder: '#878281',
  disabled: '#AFABAB',
  'on-color': '#FFFFFF',
  // etc.
}
```

**Check:** `grep '\.text-heading{' dist/assets/index-*.css` after a build — missing = broken.

---

## 3. `border-default` has no border-color (borders look black)

**Symptom:** card/input borders show browser-default dark lines instead of warm cream.

**Root cause:** `border: { DEFAULT: '#E2DBCF' }` emits `.border-border`, not `.border-default`. The `DEFAULT` sentinel renders as the family name repeated.

**Fix:** add an explicit `default` key **alongside** `DEFAULT`:

```js
border: {
  DEFAULT: '#E2DBCF',
  default: '#E2DBCF',
  // ...
}
```

**Related — v4 + `@config` legacy silently skips these nested border keys:**
`subtle`, `control`, `info`, `strong`, and any `-subtle` suffix (`accent-subtle`, `error-subtle`, etc.). These are hand-written in `src/index.css` `@layer utilities`. If you add a new border token to the config, also add it to the `@layer utilities` block or it won't emit.

---

## 4. `text-body` / `text-caption` are SIZE, not color

**Symptom:** `className="text-body"` didn't color the text.

**Root cause:** they're fontSize utilities (`body`: 16/20, `caption`: 12/16). They set size only.

**Fix:** pair them with a color class. Canonical patterns:

```tsx
// size + color
<p className="text-body text-body-emphasis">Bold 16px</p>
<p className="text-body-sm text-muted">Small muted caption-color copy</p>
<span className="text-caption text-muted">Tiny label</span>
<p className="text-body-sm text-error">Error message</p>
```

---

## 5. Raw hex in JSX

**Symptom:** design review catches off-palette colors; changing config doesn't update the rendered color.

**Root cause:** Figma MCP output includes raw hex like `bg-[#fbf2eb]` or `border-[#e8e5e0]` for tokens Figma hadn't turned into variables. Copying that verbatim bypasses our design system.

**Fix:**
1. Find: `grep -rn '\[#' src/` — **must return nothing**.
2. For every hit: add the color to `tailwind.config.js` as a semantic token, add it to `references/figma-tokens.md`, replace `[#xxxxxx]` with the class name.

**Examples we've added:**
- `#FBF2EB` → `bg-surface-brand-subtle` (logo cream)
- `#E8E5E0` → `border-control` (button/sidebar chrome)

---

## 6. Button / Input / Textarea height off by 4–8px

**Symptom:** control height is 40px or 48px; Figma shows 44px.

**Root cause:** 44px isn't in our spacing scale (it jumps 40 → 48). Fixed-height classes like `h-1000` can't express it.

**Fix:** use content-based sizing — `py-300` (12) + `text-body-sm` (line-height 20) = 44px. Apply to both the Button `md` size and Input/Textarea wrappers. Don't add 44px as a new token.

---

## 7. Input labels look thinner than Figma

**Root cause:** Figma uses DM Sans Medium (weight 500) on labels; default label weight is normal (400).

**Fix:** Input and Textarea label elements must include `font-medium`. Already baked into the shared components.

---

## 8. Cards vs chrome use DIFFERENT border colors — don't unify them

- **Cards**: `border-default` — `#E2DBCF` (warm cream)
- **Buttons, sidebar, nav chrome**: `border-control` — `#E8E5E0` (cooler)

The visual difference is intentional. If you "fix" this by making them the same, the UI will look dull.

---

## 9. Logo placeholder background

Empty-state logo preview uses `bg-surface-brand-subtle` (`#FBF2EB`, warm cream) — **not** `bg-surface-secondary-subtle`. This matches the Figma placeholder that appears behind a business's brand image.

---

## 10. Sidebar brand "D" tile

`bg-surface-primary` (dark, nearly black) + `text-on-color` (white) + `h-700 w-700` (28px) + `rounded-sm`. Not a light cream tile. Getting this wrong is the single most obvious visible regression vs Figma.

---

## 11. Heading weight

Base CSS forces `font-weight: 400` on all `h1–h6` because Figma uses Spectral Regular throughout. If a specific heading actually needs weight, override with `font-medium` or `font-semibold` on that element.

---

## 12. Icon names from Figma MCP

The MCP output references icons as `lucide/kebab-case`. Import them from `lucide-react` in PascalCase:

| MCP output | Import |
|---|---|
| `lucide/heart-handshake` | `HeartHandshake` |
| `lucide/calendar-clock` | `CalendarClock` |
| `lucide/house` | `Home` (lucide renamed) |
| `lucide/check` | `Check` |
| `lucide/link-2` | `Link as LinkIcon` (avoid clash with `react-router`) |
| `lucide/unlink` | `Unlink` |

---

## 13. Don't force-copy the sidebar

Dashboard pages render inside `DashboardLayout`, which already provides the sidebar. Page components should NOT include their own sidebar. The page body is just the main content area (`<main>`-level and below).

---

## Diagnostic commands

When a style doesn't match Figma, these three commands usually find it fast:

```bash
# Raw hex leaking into JSX?
grep -rn '\[#' src/

# A class you used that didn't compile? (replace the pattern)
grep -E '\.(text-heading|border-default|text-muted)\{' dist/assets/index-*.css

# Classes whose values look wrong — trace back to config
grep -oE '\.(border-[a-z-]+|text-[a-z-]+|bg-[a-z-]+)\{[^}]+\}' dist/assets/index-*.css | sort -u
```
