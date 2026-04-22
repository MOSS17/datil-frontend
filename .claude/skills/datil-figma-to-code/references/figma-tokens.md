# Figma → Code Token Mapping

**Canonical lookup for translating Figma variables into Tailwind classes.**
When reviewing Figma MCP output, every `var(--some/path)` and loose hex value should resolve to a class here. If it doesn't, add it to `tailwind.config.js` *and* this table — don't inline a raw hex in JSX.

## Why this file exists

Figma exports variable references in a nested, slash-delimited shape (`--surface/accent/default-subtle`). Tailwind needs flat, dash-delimited class names (`bg-surface-accent-subtle`). Three gotchas make this non-mechanical:

1. **`text-*` color keys collide with fontSize keys.** If a color is named `body` and a fontSize is also named `body`, Tailwind v4 emits only one rule for `.text-body`. Our color names (`muted`, `heading`, `body-emphasis`, …) are chosen to avoid the collision.
2. **`colors.border.DEFAULT` generates `.border-border`, not `.border-default`.** Tailwind renders the DEFAULT sentinel as the family name repeated. Use `border-border` *or* add a named key (we use `.border-default` explicitly via `@layer utilities` in `src/index.css`).
3. **Some nested `border` keys (`subtle`, `control`, `info`, `strong`, and any `-subtle` suffix) don't emit from the legacy `@config` path in Tailwind v4.** These are hand-written as `@layer utilities` in `src/index.css`. Anything added to the border family must also be added there until we migrate off `@config`.

## Transformation rules

| Figma form | Tailwind form | Notes |
|---|---|---|
| `var(--foo/bar)` | `foo-bar` | collapse `/` to `-` |
| `var(--foo/bar/default)` | `foo-bar` | drop trailing `/default` |
| `var(--foo/default/bar)` | `foo-bar` | drop middle `/default/` |
| `var(--surface/accent/default-subtle)` | `surface-accent-subtle` | drop `/default` infix, keep `-subtle` |
| `var(--border-radius/lg)` | `rounded-lg` | `border-radius` → `rounded` |
| `var(--font/copy/body-sm/text-size)` + `.../line-height` | `text-body-sm` | single class sets both |
| `var(--font/headings/h4/text-size)` | `text-h4` | `font/headings` → `text` |
| `font-['Spectral:Regular',sans-serif]` | `font-serif` | |
| `font-['DM_Sans:Medium',sans-serif] font-medium` | `font-sans font-medium` | |
| Raw `#RRGGBB` with no `var()` | **add to `tailwind.config.js` as a named token before using** | never ship `[#hex]` in JSX |

## Colors

### Backgrounds (`bg-*`)

| Figma | Hex | Class |
|---|---|---|
| `--surface/page` | `#FCFCFA` | `bg-surface-page` |
| `--surface/default` | `#FFFFFF` | `bg-surface` |
| `--surface/secondary` | `#F0EDE6` | `bg-surface-secondary` |
| `--surface/secondary-subtle` | `#F7F6F3` | `bg-surface-secondary-subtle` |
| `--surface/primary/default` | `#2C2524` | `bg-surface-primary` |
| `--surface/primary/hover` | `#0B0909` | `bg-surface-primary-hover` |
| `--surface/accent/default` | `#62899B` | `bg-surface-accent` |
| `--surface/accent/default-subtle` | `#E5EEF3` | `bg-surface-accent-subtle` |
| `--surface/info/default-subtle` | `#E5EEF3` | `bg-surface-info-subtle` |
| `--surface/success/default` | `#636F59` | `bg-surface-success` |
| `--surface/success/default-subtle` | `#E5E8E2` | `bg-surface-success-subtle` |
| `--surface/warning/default` | `#AD8252` | `bg-surface-warning` |
| `--surface/warning/default-subtle` | `#F7EDE1` | `bg-surface-warning-subtle` |
| `--surface/error/default` | `#AD1D1D` | `bg-surface-error` |
| `--surface/error/default-subtle` | `#EFD2D2` | `bg-surface-error-subtle` |
| `--surface/disabled` | `#EBEAEA` | `bg-surface-disabled` |
| Raw `#FBF2EB` (warm cream behind logo previews) | `#FBF2EB` | `bg-surface-brand-subtle` |
| Raw `#E8E5E0` (cooler chrome bg — neutral indicator bars, chips) | `#E8E5E0` | `bg-surface-control` |

### Text colors (`text-*`)

Remember: `text-body`, `text-body-sm`, `text-body-lg`, `text-caption`, `text-h1`–`text-h6` are **font-size utilities** (they only set size + line-height). Pair them with a color utility below.

| Figma | Hex | Class |
|---|---|---|
| `--text/default/headding` (sic) | `#372E2D` | `text-heading` |
| `--text/default/body-emphasis` | `#372E2D` | `text-body-emphasis` |
| `--text/default/body-default` | `#5F5857` | *inherit from `<body>`*, or `text-primary-400` if explicit |
| `--text/default/caption` | `#878281` | `text-muted` |
| `--text/default/placeholder` | `#878281` | `text-placeholder` |
| `--text/default/disabled` | `#AFABAB` | `text-disabled` |
| `--text/primary/default` | `#2C2524` | `text-primary` |
| `--text/primary/hover` | `#0B0909` | `text-primary-hover` |
| `--text/secondary/default` | `#878281` | `text-secondary` |
| `--text/accent/default` | `#62899B` | `text-accent` |
| `--text/success/default` | `#636F59` | `text-success` |
| `--text/warning/default` | `#AD8252` | `text-warning` |
| `--text/error/default` | `#AD1D1D` | `text-error` |
| `--text/info/default` | `#62899B` | `text-info` |
| White on a colored background | `#FFFFFF` | `text-on-color` |

### Border colors (`border-*`)

If you add a new border token, you must *also* register it in `@layer utilities` in `src/index.css` (see note 3 above).

| Figma | Hex | Class |
|---|---|---|
| `--border/default` | `#E2DBCF` | `border-default` |
| `--border/default-subtle` | `#F0EDE6` | `border-subtle` |
| `--border/strong` | `#160F03` | `border-strong` |
| `--border/primary/default` | `#2C2524` | `border-primary` |
| `--border/primary/hover` | `#0B0909` | `border-primary-hover` |
| `--border/accent/default` | `#62899B` | `border-accent` |
| `--border/accent/default-subtle` | `#E5EEF3` | `border-accent-subtle` |
| `--border/info/default` | `#62899B` | `border-info` |
| `--border/info/default-subtle` | `#E5EEF3` | `border-info-subtle` |
| `--border/error/default` | `#AD1D1D` | `border-error` |
| `--border/error/default-subtle` | `#EFD2D2` | `border-error-subtle` |
| `--border/success/default` | `#636F59` | `border-success` |
| `--border/warning/default` | `#AD8252` | `border-warning` |
| `--border/disabled` | `#D7D5D5` | `border-disabled` |
| Raw `#E8E5E0` (button / sidebar / nav chrome) | `#E8E5E0` | `border-control` |

### Icon colors (`text-icon-*`)

Icons use the dedicated `icon` color family so `text-icon-*` doesn't clash with anything.

| Figma | Hex | Class |
|---|---|---|
| default icon | `#5F5857` | `text-icon` |
| primary icon | `#2C2524` | `text-icon-primary` |
| secondary icon | `#878281` | `text-icon-secondary` |
| accent icon | `#62899B` | `text-icon-accent` |
| success icon | `#636F59` | `text-icon-success` |
| error icon | `#AD1D1D` | `text-icon-error` |
| warning icon | `#AD8252` | `text-icon-warning` |
| disabled icon | `#AFABAB` | `text-icon-disabled` |
| on colored bg | `#FFFFFF` | `text-icon-on-color` |

## Spacing / sizing

Figma exports pixel values. Map to the spacing scale (`100 = 4px`):

| Figma px | Token | Figma px | Token |
|---|---|---|---|
| `0` | `0` | `32` | `800` |
| `1` | `px` / `25` | `36` | `900` |
| `2` | `50` | `40` | `1000` |
| `4` | `100` | `48` | `1100` |
| `8` | `200` | `56` | `1200` |
| `12` | `300` | `64` | `1300` |
| `16` | `400` | `72` | `1400` |
| `20` | `500` | `96` | `1500` |
| `24` | `600` | `128` | `1600` |
| `28` | `700` | `256` | `1700` |

**44px** appears in Figma for button/input height but isn't in the token scale. Use `py-300` (12) + `text-body-sm` (20px line-height) → 44px content-based, rather than adding a one-off token. For arbitrary values, leave a comment explaining why.

## Typography

| Figma variable pair | Class | px |
|---|---|---|
| `font/headings/h1` | `text-h1` | 60/72 |
| `font/headings/h2` | `text-h2` | 48/56 |
| `font/headings/h3` | `text-h3` | 40/48 |
| `font/headings/h4` | `text-h4` | 32/40 |
| `font/headings/h5` | `text-h5` | 24/28 |
| `font/headings/h6` | `text-h6` | 20/24 |
| `font/copy/body-lg` | `text-body-lg` | 20/24 |
| `font/copy/body` | `text-body` | 16/20 |
| `font/copy/body-sm` | `text-body-sm` | 14/20 |
| `font/copy/caption` | `text-caption` | 12/16 |
| Spectral family | `font-serif` | |
| DM Sans family | `font-sans` | |
| `DM_Sans:Medium` / weight 500 | `font-medium` | |
| `DM_Sans:SemiBold` / weight 600 | `font-semibold` | |

## Border radius

| Figma | px | Class |
|---|---|---|
| `border-radius/none` | 0 | `rounded-none` |
| `border-radius/xs` | 2 | `rounded-xs` |
| `border-radius/sm` | 4 | `rounded-sm` |
| `border-radius/md` | 8 | `rounded-md` / `rounded` |
| `border-radius/lg` | 12 | `rounded-lg` |
| `border-radius/xl` | 16 | `rounded-xl` |
| pill | — | `rounded-full` |

## Failure mode checklist

When a style in the browser doesn't match Figma, work top-down:

1. **Fonts not loading?** `index.html` must link Google Fonts for DM Sans + Spectral. Without them, everything falls back to Georgia + system-ui and looks completely wrong.
2. **Raw hex in JSX?** `grep -n '\[#' src/` — never ship. Add to `tailwind.config.js` and this table.
3. **Class silently not emitting?** Inspect the compiled CSS: `grep '\.your-class{' dist/assets/index-*.css`. If the selector isn't there, the class didn't emit. Causes:
   - Color name collides with a fontSize key (`body`, `caption`)
   - Nested `DEFAULT` key — use `.border-border` or add an explicit key
   - Border-family `-subtle` / `default` / `control` / `info` / `strong` — must be hand-written in `src/index.css` `@layer utilities`
4. **Wrong color showing?** Two rules with the same selector, last one wins. Common when a name appears both as a root color and inside a nested family (e.g. root `default` would hijack `border-default`). Keep root-level names distinct from nested-family keys.
5. **Font-weight differs?** Figma uses `DM_Sans:Medium` → `font-medium`. Our base `h1-h6` CSS forces `font-weight: 400` on headings; to override, use `font-medium` / `font-semibold` on the heading element.

Keep this file in sync with `tailwind.config.js` and `src/index.css`.
