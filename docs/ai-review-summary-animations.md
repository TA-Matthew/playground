# AI Review Summary — Border, glow & intro animations

Implementation spec for **`AiSummaryBorderAnimatedFrame`**, the animated border and outer glow on the Review summary card.

| | |
|---|---|
| **Component** | `AiSummaryBorderAnimatedFrame` |
| **Region** | `role="region"` · `aria-label="Review summary"` |
| **Source** | `src/components/ai-review/ReviewsFigmaReplica.tsx` |
| **Styles** | `src/components/ai-review/ai-review-animations.css` |

## Purpose

On first scroll into view, the card shows a **rotating brand conic border** plus a **soft outer glow**. After **4.5s**, both **fade out together** over **650ms** and the card settles on a **static neutral 1px border**. The intro runs **once per page load** (not on re-scroll).

---

## DOM structure

```
.ai-border-frame                    ← outer shell: 1px ring + glow target
  ├── .ai-border-rotor-google       ← conic gradient layer (200% × 200%, centered)
  └── .relative.z-10 (white inner)  ← content; rounded inset
```

| Layer | Classes / notes |
|-------|-----------------|
| Outer frame | `ai-border-frame relative overflow-hidden rounded-3xl p-px` |
| Rotor | `ai-border-rotor-google pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%]` |
| Inner panel | `relative z-10 rounded-[22px] bg-white` + caller `innerClassName` |

- **Padding never toggles** on the frame (`p-px` fixed) — avoids layout jump between phases.
- Inner card may use Tailwind `shadow-sm` via `innerClassName` — that is **separate** from the intro glow on the frame.
- **Idle border fill** (inline `background` on frame):

  ```css
  linear-gradient(145deg, #d9d9d9 0%, #c9c9c9 40%, #dedede 70%, #d4d4d4 100%)
  ```

---

## State machine & timeline

Phases: `wait` → `play` → `fade` → `done`

| Phase | When | Rotor visible | Glow class | Notes |
|-------|------|---------------|------------|-------|
| `wait` | Before in view | No | No | Neutral border only |
| `play` | Intersection triggers | Yes, spinning | **Yes** | Intro active |
| `fade` | After 4500ms in `play` | Yes, exiting | No | Glow + conic exit together |
| `done` | After 700ms in `fade` | No | No | Resting state (no replay) |

### Scroll trigger (IntersectionObserver)

| Option | Value |
|--------|--------|
| `threshold` | `0.2` (20% of element visible) |
| `rootMargin` | `0px 0px -8% 0px` (bottom inset — fires slightly before fully bottom-aligned) |
| Behavior | Fire once, then `unobserve` |

### Timers

| Constant | Value | Role |
|----------|-------|------|
| `AI_BORDER_INTRO_MS` | **4500ms** | Duration of `play` phase |
| Fade phase timeout | **700ms** | JS buffer before unmounting rotor (CSS exit is **650ms**) |

### Visual sequence

```
[Off-screen]  neutral 1px gray border, no glow
      ↓ scroll (20% visible)
[0–4.5s]      conic spin + triple box-shadow glow
      ↓
[4.5–5.15s]   glow fades out (650ms transition)
              conic fades out (650ms keyframe)
      ↓
[Rest]        neutral border only, no animation
```

---

## Initial glow & drop shadow

**Class:** `.ai-border-card-glow--active` on `.ai-border-frame`  
**Active only during:** `borderPhase === 'play'` (`showGlow = isPlaying`)

### Box shadow (layered)

```css
box-shadow:
  0 0 0 1px rgba(255, 255, 255, 0.5) inset,   /* inner rim highlight */
  0 0 28px rgba(69, 135, 252, 0.2),           /* blue outer bloom (#4587fc) */
  0 0 48px rgba(175, 101, 226, 0.12);         /* purple outer bloom (#af65e2) */
```

| Layer | Purpose |
|-------|---------|
| Inset 1px white @ 50% | Inner rim highlight |
| 28px blue @ 20% | Primary outer bloom |
| 48px purple @ 12% | Secondary outer bloom |

**Resting state:** `box-shadow: none` on `.ai-border-frame`

### Glow exit

When phase becomes `fade`, remove `ai-border-card-glow--active` immediately. The frame transitions shadow via CSS (not keyframes):

| Property | Value |
|----------|--------|
| Duration | `0.65s` (`--ai-exit-ms`) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` (`--ai-exit-ease`) |

Glow should read as a **soft halo** around the card, not a hard drop shadow. Use **`box-shadow` only** — no `filter: drop-shadow()` on the frame.

---

## Rotating border (conic intro)

**Class:** `.ai-border-rotor-google`  
**Visible during:** `play` and `fade` (`showRotor = isPlaying || isFading`)

### Layout

- `absolute left-1/2 top-1/2`
- `width` / `height`: **200%** of frame
- Spin keyframes use `translate3d(-50%, -50%, 0)` so rotation axis = card center

### Spin animation

| Property | Value |
|----------|--------|
| Keyframes | `ai-border-spin-rotate` |
| Duration | **12s** |
| Timing | **linear** |
| Iteration | **infinite** (during `play` only) |
| Direction | Clockwise (`0turn` → `1turn`) |
| Opacity | `0.97` |
| Filter | `blur(0.35px) saturate(1.1)` |
| `will-change` | `transform` (while spinning) |

### Conic gradient stops

Brand tokens (`:root`):

```css
--ai-grad-1: #f5cd72;
--ai-grad-2: #fc5649;
--ai-grad-3: #f34474;
--ai-grad-4: #af65e2;
--ai-grad-5: #4587fc;
--ai-grad-6: #9acef3;
```

| Stop | Color | Angle |
|------|--------|--------|
| 1 | `var(--ai-grad-1)` | 0° |
| 2 | `var(--ai-grad-2)` | 60° |
| 3 | `var(--ai-grad-3)` | 120° |
| 4 | `var(--ai-grad-4)` | 180° |
| 5 | `var(--ai-grad-5)` | 240° |
| White wedge | `#ffffff` | 270°–300° (~30° highlight) |
| 6 | `var(--ai-grad-6)` | 330° |
| Loop | `var(--ai-grad-1)` | 360° |

The **1px visible ring** is the frame’s `p-px` clipping the oversized rotor behind the white inner panel.

### Conic exit (synced with glow)

When phase → `fade`, add `.ai-border-rotor--exiting` on the rotor.

| Property | Value |
|----------|--------|
| Animation | `ai-rotor-fade-exit` |
| Duration | **650ms** (same as glow exit) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Opacity | `0.97` → `0` |
| Fill mode | `forwards` (replaces spin) |
| `will-change` | `opacity, transform` |

**End state (`done`):** Unmount rotor; frame keeps neutral linear-gradient background; no glow, no spin.

---

## `prefers-reduced-motion: reduce`

| Behavior | Detail |
|----------|--------|
| Initial state | `done` (skip intro) |
| JS | Observer and timers short-circuit to `done` |
| CSS | Disable spin, exit, and glow; `box-shadow: none !important` on glow class |

---

## Acceptance criteria

- [ ] Glow appears **only** during the 4.5s `play` window, not during `fade` or `done`.
- [ ] Glow uses the **exact** three-layer `box-shadow` values above.
- [ ] Glow exit uses **650ms** + `cubic-bezier(0.4, 0, 0.2, 1)`, synced with conic fade.
- [ ] No layout shift: `p-px` and border radius unchanged across phases.
- [ ] Intro triggers once on scroll-in; does **not** replay when scrolling away and back.
- [ ] Reduced motion: static neutral border, no glow, no spin.

---

## Related animations (same card)

These run independently of the border intro; see `ai-review-animations.css` for full rules.

| Element | Class | Behavior |
|---------|-------|----------|
| “Review summary” title | `.ai-summary-title-animated` | 3.5s gradient shift, `ease-in-out`, infinite |
| Sparkle icon | `.ai-summary-icon-animated` | Same gradient + timing as title (masked asset) |
| Theme-selected body | `.ai-summary-body-fade-in` | 200ms fade + 5px `translateY`, ease `[0.4, 0, 0.2, 1]` |
| Theme mention sheen | `.theme-mention-text-sheen-overlay` | 3s linear opacity envelope + shared gradient shift |

---

## Reference code

Copy-paste reference from the repo. **Canonical sources** (update these when behavior changes):

- `src/components/ai-review/ai-review-animations.css` (border / glow rules: lines 1–82, 136–145)
- `src/components/ai-review/ReviewsFigmaReplica.tsx` (`AiSummaryBorderAnimatedFrame`, ~1141–1258)

### Setup

Import the stylesheet once in the module that renders the frame (or in your app entry):

```ts
import './ai-review-animations.css'
```

React imports used by the component:

```ts
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
```

### CSS — border, glow, conic (`ai-review-animations.css`)

```css
/* Brand palette — conic border (+ title/icon elsewhere in same file) */
:root {
  --ai-grad-1: #f5cd72;
  --ai-grad-2: #fc5649;
  --ai-grad-3: #f34474;
  --ai-grad-4: #af65e2;
  --ai-grad-5: #4587fc;
  --ai-grad-6: #9acef3;
}

@keyframes ai-border-spin-rotate {
  from {
    transform: translate3d(-50%, -50%, 0) rotate(0turn);
  }
  to {
    transform: translate3d(-50%, -50%, 0) rotate(1turn);
  }
}

@keyframes ai-rotor-fade-exit {
  from {
    opacity: 0.97;
  }
  to {
    opacity: 0;
  }
}

.ai-border-frame {
  --ai-exit-ms: 0.65s;
  --ai-exit-ease: cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: none;
  transition: box-shadow var(--ai-exit-ms) var(--ai-exit-ease);
}

.ai-border-card-glow--active {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.5) inset,
    0 0 28px rgba(69, 135, 252, 0.2),
    0 0 48px rgba(175, 101, 226, 0.12);
}

.ai-border-rotor-google {
  animation: ai-border-spin-rotate 12s linear infinite;
  background: conic-gradient(
    from 0deg,
    var(--ai-grad-1) 0deg,
    var(--ai-grad-2) 60deg,
    var(--ai-grad-3) 120deg,
    var(--ai-grad-4) 180deg,
    var(--ai-grad-5) 240deg,
    #ffffff 270deg,
    #ffffff 300deg,
    var(--ai-grad-6) 330deg,
    var(--ai-grad-1) 360deg
  );
  filter: blur(0.35px) saturate(1.1);
  opacity: 0.97;
  will-change: transform;
}

.ai-border-rotor-google.ai-border-rotor--exiting {
  will-change: opacity, transform;
  animation: ai-rotor-fade-exit var(--ai-exit-ms) var(--ai-exit-ease) forwards;
}

@media (prefers-reduced-motion: reduce) {
  .ai-border-rotor-google,
  .ai-border-rotor--exiting,
  .ai-border-card-glow--active {
    animation: none !important;
    box-shadow: none !important;
    filter: none !important;
  }
}
```

### React — `AiSummaryBorderAnimatedFrame`

{% raw %}
```tsx
/** Neutral 1px ring when idle / under conic during intro */
const AI_CARD_BORDER_DEFAULT =
  'linear-gradient(145deg, #d9d9d9 0%, #c9c9c9 40%, #dedede 70%, #d4d4d4 100%)' as const

/** How long the iridescent border runs after scroll-in (ms) */
const AI_BORDER_INTRO_MS = 4_500

type AiBorderPhase = 'wait' | 'play' | 'fade' | 'done'

function AiSummaryBorderAnimatedFrame({
  children,
  innerClassName,
}: {
  children: ReactNode
  innerClassName: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [borderPhase, setBorderPhase] = useState<AiBorderPhase>(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'done'
      : 'wait',
  )

  useLayoutEffect(() => {
    if (borderPhase !== 'wait') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setBorderPhase('play')
            io.unobserve(e.target)
          }
        }
      },
      { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.2 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [borderPhase])

  useEffect(() => {
    if (borderPhase !== 'play') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const t = window.setTimeout(() => {
      setBorderPhase('fade')
    }, AI_BORDER_INTRO_MS)
    return () => {
      clearTimeout(t)
    }
  }, [borderPhase])

  useEffect(() => {
    if (borderPhase !== 'fade') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setBorderPhase('done')
      return
    }
    const t = window.setTimeout(() => {
      setBorderPhase('done')
    }, 700)
    return () => {
      clearTimeout(t)
    }
  }, [borderPhase])

  const isPlaying = borderPhase === 'play'
  const isFading = borderPhase === 'fade'
  const showRotor = isPlaying || isFading
  const showGlow = isPlaying

  return (
    <div
      ref={wrapRef}
      role="region"
      aria-label="Review summary"
      className={[
        'ai-border-frame relative overflow-hidden rounded-3xl p-px',
        showGlow ? 'ai-border-card-glow--active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ background: AI_CARD_BORDER_DEFAULT }}
    >
      {showRotor && (
        <div
          className={[
            'ai-border-rotor-google pointer-events-none absolute left-1/2 top-1/2 h-[200%] w-[200%]',
            isFading ? 'ai-border-rotor--exiting' : null,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-hidden
        />
      )}
      <div
        className={['relative z-10 rounded-[22px] bg-white', innerClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  )
}
```
{% endraw %}

### Usage

```tsx
<AiSummaryBorderAnimatedFrame innerClassName="p-4 sm:rounded-[23px]">
  {/* Review summary content */}
</AiSummaryBorderAnimatedFrame>
```

Variant B (matrix layout) — inner panel includes `shadow-sm`:

```tsx
<AiSummaryBorderAnimatedFrame innerClassName="flex w-full flex-col gap-4 p-4 shadow-sm sm:gap-6 sm:rounded-[23px]">
  {/* … */}
</AiSummaryBorderAnimatedFrame>
```
