# KILIMANJARO — Viator B2C Web DS (Design System Specification)

**Figma:** [KILIMANJARO — Viator B2C Web DS](https://www.figma.com/design/kfEgE1oVxKplDJxEBW9nIT/KILIMANJARO---Viator-B2C-Web-DS?node-id=136-0)  
**Note:** Node `136:0` is the **Cover** canvas (brand shell: Aeonik display type, emerald pill, Viator mark). Core components **Button**, **Modal**, **Product Card**, **Text Field**, etc. live in the same file and linked libraries; this spec is built from Figma **search_design_system** metadata, linked **FUJI / Atlas** semantic variable names, and Atlas **Legacy Web** component descriptions.

**Code install (this repo):**

| Layer | File |
|--------|------|
| Primitives (scale + viator imports) | `src/primitives.css` |
| Semantic (Button / Input / Card / Modal intent) | `src/semantic.css` |
| App theme (aliases + product colors) | `src/variables.css` |
| Component API types (no UI yet) | `src/components/ds/kilimanjaro-component-api.ts` |

---

## 1. Button (`Button` — component set, KILIMANJARO)

### Component anatomy

- **Horizontal auto-layout:** optional **leading icon** (e.g. 20px on borderless patterns in Atlas notes) + **label** (text) + optional **trailing icon**.
- **Padding / height** scale with **Size** variant (sm / md / lg — align to `primitive-space-*` and type `primitive-text-*`).
- **Shape:** pill / full-rounded for primary actions (`--primitive-radius-control` ↔ Legacy `radius/radius-full-rounded` for interactive controls).
- **Secondary outline:** stroke **1.5px** inside (Atlas v1.2+); mapped in code as `--semantic-button-border-width`.

### Design tokens (semantic → local)

| Figma / FUJI name | Local semantic token |
|-------------------|-------------------------|
| `buttons/buttonPrimary-background*` / pressed / disabled | `--semantic-button-primary-bg`, `-hover`, `-bg-disabled` |
| `text/buttonPrimary-text-default` / pressed | Primary label on filled button |
| `buttons/buttonSecondary-*`, `text/buttonSecondary-text-*` | `--semantic-button-secondary-*` |
| `buttons/buttonTertiary-*`, `text/buttonTertiary-text-*` | `--semantic-button-tertiary-*` |
| `ghost/*` (Atlas system color) | Outline / ghost borders — extend when syncing colors |

Hardcoded values in legacy Figma specs (e.g. **2px → 1.5px** outline) → **`--semantic-button-border-width: 1.5px`**.

### Variants & props (API)

| Axis | Values |
|------|--------|
| **Intent** | `primary` \| `secondary` \| `tertiary` \| `danger` (danger when product adds destructive token) |
| **Size** | `sm` \| `md` \| `lg` |
| **Icon** | none \| leading \| trailing \| both |
| **State** | default, hover, pressed, disabled, loading |

### Interactive states

| State | Visual |
|-------|--------|
| Default | Filled primary uses `--semantic-button-primary-bg`; secondary uses border `--semantic-button-secondary-border` + transparent bg |
| Hover | Primary → `--semantic-button-primary-bg-hover`; secondary → mint wash `--semantic-button-secondary-bg-hover` |
| Pressed | FUJI `*-pressed` tokens (darken / saturate — replace with synced hex via `tokens:sync`) |
| Disabled | Reduced contrast; Atlas uses dedicated `buttonTextDisabled` — align to `--semantic-button-primary-bg-disabled` until synced |
| Focus | Visible ring `--semantic-button-focus-ring` (WCAG 2.4.7 / 2.4.11) |

### Accessibility

- Native `<button>` or `role="button"`; **`disabled`** and **`aria-busy`** when loading.
- **Focus:** `:focus-visible` ring 2px + offset; contrast ≥ 3:1 against adjacent colors for focus indicator.
- **Icon-only:** `aria-label` required.

---

## 2. Input (`Text Field` / `Input Field` — linked libraries)

### Component anatomy

- **Label** (optional) + **field** (border, background) + **helper** or **error** line below.
- Optional **leading / trailing adornments** (icons, affixes).
- **Textarea** variant shares stroke tokens with single-line field.

### Design tokens

| Figma / FUJI name | Local semantic token |
|-------------------|-------------------------|
| `Input Fields/Inputfield-stroke-enabled` | `--semantic-input-border` |
| `Input Fields/Inputfield-stroke-selected` | `--semantic-input-border-focus` |
| `Input Fields/Inputfield-stroke-disabled` | `--semantic-input-border-disabled` |
| Fill / text | `--semantic-input-bg`, `-fg`, `-placeholder` |

Radius: **`--primitive-radius-field`** (`--viator-radius-m`).

### Variants & props

| Axis | Values |
|------|--------|
| **Size** | `sm` \| `md` \| `lg` |
| **State** | `default` \| `error` \| `success` (add `--semantic-input-border-error` when syncing) |
| **Label / helper / error** | strings |

### Interactive states

| State | Visual |
|-------|--------|
| Default | Border `--semantic-input-border` |
| Hover | Optional darken `--semantic-input-border-hover` |
| Focus | Border `--semantic-input-border-focus` (selected stroke in Figma) |
| Disabled | Border `--semantic-input-border-disabled`, muted text |

### Accessibility

- **Label:** `htmlFor` / `id` pairing; error text in `aria-describedby` or `aria-invalid="true"`.
- **Focus:** same focus ring pattern as buttons for consistency.

---

## 3. Card (domain cards: Product Card, List Card, etc.)

### Component anatomy

- **Surface** container: image / media region + **content** (title, meta, actions).
- **Product / list** variants add rating, price, CTAs — shared **padding** via `--primitive-space-*`, **radius** `--semantic-card-radius`.

### Design tokens

- Background `--semantic-card-bg`, border `--semantic-card-border`, shadow `--semantic-card-shadow`.
- Legacy **radius-medium** for horizontal cards (`--primitive-radius-surface`).

### Variants

- **Elevation:** `none` \| `sm` \| `md` (shadow steps).
- **Interactive:** optional hover lift (shadow + border `--color-border` → primary tint).

### Accessibility

- If **clickable whole card**: render as **`<a>`** or **`role="button"`** with keyboard support; **image** `alt` text.

---

## 4. Modal (`Modal` — component set, KILIMANJARO)

### Component anatomy

- **Backdrop** (scrim) + **dialog panel** (title, body, footer actions).
- Footer typically uses **Button** primitives.

### Design tokens

| Figma / FUJI name | Local semantic token |
|-------------------|-------------------------|
| `Support/modalOverlay-fill` | `--semantic-modal-backdrop` |
| Panel surface | `--semantic-modal-surface` |
| Radius | `--semantic-modal-radius` |
| Shadow | `--semantic-modal-shadow` |

### Variants & props

| Axis | Values |
|------|--------|
| **Size** | `sm` \| `md` \| `lg` \| `full` |
| **Sections** | title, description, body, footer |

### Interactive states

- Backdrop click → `onClose` (optional; warn if destructive).
- **Focus trap** inside dialog; **Escape** closes.

### Accessibility

- **`role="dialog"`** + **`aria-modal="true"`** + **`aria-labelledby`** (title id).
- Initial focus on first focusable control or dialog container per pattern.
- Restore focus to trigger on close.

---

## 5. Token file map (requested names)

| Your name | This repo |
|-----------|-----------|
| `@primitives.css` | **`src/primitives.css`** (imports `viator-figma-tokens*.css` + `--primitive-*`) |
| `@semantic.css` | **`src/semantic.css`** (`--semantic-*`) |

App-level aliases remain in **`src/variables.css`** (`--color-*`, `--font-*`).

---

## 6. Next steps for pixel parity

1. Run **`npm run tokens:sync`** with `FIGMA_TOKEN` to fill **`viator-figma-tokens.colors.css`** from the file’s **variables/local** API.
2. Map **FUJI** `buttons/*` and `Input Fields/*` hex to **`--semantic-*`** where they should diverge from current fallbacks.
3. Implement **Kilimanjaro*** components using **`kilimanjaro-component-api.ts`** and `semantic.css` only (no raw hex in components).
