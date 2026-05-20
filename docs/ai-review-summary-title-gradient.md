# AI Review Summary — Title & icon gradient loop

Engineering handoff for the brand gradient animation on the **“Review summary”** heading and **AI sparkle icon**.

| | |
|---|---|
| **Elements** | `.ai-summary-title-animated`, `.ai-summary-icon-animated` |
| **Source** | `src/components/ai-review/ReviewsFigmaReplica.tsx` |
| **Styles** | `src/components/ai-review/ai-review-animations.css` |

## Purpose

Icon and title share one **looping linear gradient** that **shifts horizontally** on a fixed cadence. The loop must be **seamless** (no hitch at the cycle boundary) and **phase-locked** between icon and title.

---

## DOM structure

```
div.flex.items-center.gap-2          ← header row
  ├── span.ai-summary-icon-animated  ← masked sparkle; aria-hidden
  └── p.ai-summary-title-animated    ← “Review summary”
```

| Element | Class | Role |
|---------|-------|------|
| Row | `flex w-full min-w-0 items-center gap-2` | 8px gap between icon and title |
| Icon | `ai-summary-icon-animated shrink-0` | CSS mask + animated gradient fill |
| Title | `ai-summary-title-animated min-w-0 flex-1 text-base font-bold leading-normal` | Gradient clipped to glyph shapes |

**Markup (reference):**

{% raw %}
```tsx
<div className="flex w-full min-w-0 items-center gap-2">
  <span
    className="ai-summary-icon-animated shrink-0"
    style={{
      WebkitMaskImage: `url('${figma.aiSparkle}')`,
      maskImage: `url('${figma.aiSparkle}')`,
    }}
    aria-hidden
  />
  <p className="ai-summary-title-animated min-w-0 flex-1 text-base font-bold leading-normal">
    Review summary
  </p>
</div>
```
{% endraw %}

Import `ai-review-animations.css` in the module that renders these classes.

---

## Brand palette

CSS custom properties on `:root`:

| Token | Hex | Role in gradient |
|-------|-----|------------------|
| `--ai-grad-1` | `#f5cd72` | Gold (start + end for seamless loop) |
| `--ai-grad-2` | `#fc5649` | Coral |
| `--ai-grad-3` | `#f34474` | Magenta |
| `--ai-grad-4` | `#af65e2` | Purple (mid anchor) |
| `--ai-grad-5` | `#4587fc` | Blue |
| `--ai-grad-6` | `#9acef3` | Sky |

---

## Gradient definition (title + icon)

Both elements use the **same** `linear-gradient` and **same** animation. Do not diverge stops or timing between them.

| Property | Value |
|----------|--------|
| Angle | **100deg** |
| Type | `linear-gradient` |
| `background-size` | **200% 100%** (gradient is 2× wider than the element — enables pan without empty bands) |
| Stop layout | See table below |

| Stop % | Color |
|--------|--------|
| 0% | `var(--ai-grad-1)` |
| 20% | `var(--ai-grad-2)` |
| 40% | `var(--ai-grad-3)` |
| 50% | `var(--ai-grad-4)` |
| 65% | `var(--ai-grad-5)` |
| 80% | `var(--ai-grad-6)` |
| 100% | `var(--ai-grad-1)` |

**Loop seam:** First and last stop are both gold (`--ai-grad-1`), so when `background-position` returns to the start, color continuity is preserved.

```css
background-image: linear-gradient(
  100deg,
  var(--ai-grad-1) 0%,
  var(--ai-grad-2) 20%,
  var(--ai-grad-3) 40%,
  var(--ai-grad-4) 50%,
  var(--ai-grad-5) 65%,
  var(--ai-grad-6) 80%,
  var(--ai-grad-1) 100%
);
background-size: 200% 100%;
```

---

## Animation — horizontal shift loop

### Keyframes

```css
@keyframes ai-title-gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
```

### Timing

| Property | Value | Notes |
|----------|--------|--------|
| `animation-name` | `ai-title-gradient-shift` | Shared by title and icon |
| `animation-duration` | **3.5s** | One full out-and-back cycle |
| `animation-timing-function` | **ease-in-out** | Slow at endpoints, faster mid-cycle |
| `animation-iteration-count` | **infinite** | Runs while the header is mounted |
| `animation-direction` | normal | 0% → 50% → 100%, then repeats |

### Motion model

```
background-position X:
  0% ──────────────► 100% ──────────────► 0%
  (0s)              (1.75s)              (3.5s)
        ease-in-out          ease-in-out
```

- Only **horizontal** position animates; vertical stays at **50%**.
- Panning a **200%-wide** gradient by **100%** of `background-position` exposes the second half of the strip, then returns — reads as a smooth colour wash across glyphs/mask.

### Sync requirement

Title and icon **must** use the **identical** `animation` shorthand (same name, duration, easing, iteration). They are separate elements but should look like one painted surface. Avoid staggered delays or different durations.

---

## Title implementation (text)

| Technique | Value |
|-----------|--------|
| Fill | Gradient via `background-image` |
| Clip | `background-clip: text` + `-webkit-background-clip: text` |
| Text color | `-webkit-text-fill-color: transparent` (WebKit/Blink); gradient shows through glyphs |
| Typography | `text-base` (16px), `font-bold`, `leading-normal` |

Safari/WebKit: `-webkit-` prefixes on clip and text-fill are required for reliable gradient text.

---

## Icon implementation (masked gradient)

The sparkle is a **masked element** filled with the same gradient as the title (not an inline SVG with animated stops).

| Property | Value |
|----------|--------|
| Asset | `figma.aiSparkle` URL as `mask-image` / `-webkit-mask-image` (inline style) |
| Fill | Same `linear-gradient` + `background-size` + `animation` as title |
| Mask | `mask-size: contain`, `mask-repeat: no-repeat`, `mask-position: center` |
| Size | **16×16px** default; **21×21px** at `min-width: 640px` |
| Display | `display: block`, `flex-shrink: 0` |
| A11y | `aria-hidden` on icon; title text provides the accessible name |

---

## `prefers-reduced-motion: reduce`

| Element | Behavior |
|---------|----------|
| Title | `animation: none`; solid `-webkit-text-fill-color: #5b4a8c`; `background-image: none` |
| Icon | `animation: none`; flat `background: #5b4a8c` (mask can remain) |

No JS gate required — CSS media query only.

---

## Acceptance criteria

- [ ] Title and icon use the **same** six-stop + gold loop gradient at **100deg**.
- [ ] `background-size: 200% 100%` on both; animation **`ai-title-gradient-shift` 3.5s ease-in-out infinite**.
- [ ] Icon and title stay **in phase** (no offset/delay between elements).
- [ ] Loop has **no visible pop** at 0%/100% keyframe boundary (gold at both ends).
- [ ] Icon sizes: **16px** mobile, **21px** at `sm` (640px+).
- [ ] Title: bold 16px; gradient only via background-clip, not opacity hacks.
- [ ] Reduced motion: static **#5b4a8c** on both; animations disabled.

---

## Visual QA checklist

1. Watch **5+ cycles** — no flash or jump at loop restart.
2. At mid-cycle, icon and title hues should align at corresponding positions.
3. **Reduce motion** on — both freeze to purple, no shimmer.
4. Resize across **640px** — icon scales; animation does not reset or desync.

---

## Reference CSS (canonical)

From `src/components/ai-review/ai-review-animations.css`:

```css
:root {
  --ai-grad-1: #f5cd72;
  --ai-grad-2: #fc5649;
  --ai-grad-3: #f34474;
  --ai-grad-4: #af65e2;
  --ai-grad-5: #4587fc;
  --ai-grad-6: #9acef3;
}

@keyframes ai-title-gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.ai-summary-title-animated {
  background-image: linear-gradient(
    100deg,
    var(--ai-grad-1) 0%,
    var(--ai-grad-2) 20%,
    var(--ai-grad-3) 40%,
    var(--ai-grad-4) 50%,
    var(--ai-grad-5) 65%,
    var(--ai-grad-6) 80%,
    var(--ai-grad-1) 100%
  );
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ai-title-gradient-shift 3.5s ease-in-out infinite;
}

.ai-summary-icon-animated {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  background-image: linear-gradient(
    100deg,
    var(--ai-grad-1) 0%,
    var(--ai-grad-2) 20%,
    var(--ai-grad-3) 40%,
    var(--ai-grad-4) 50%,
    var(--ai-grad-5) 65%,
    var(--ai-grad-6) 80%,
    var(--ai-grad-1) 100%
  );
  background-size: 200% 100%;
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  animation: ai-title-gradient-shift 3.5s ease-in-out infinite;
}

@media (min-width: 640px) {
  .ai-summary-icon-animated {
    width: 21px;
    height: 21px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ai-summary-title-animated {
    animation: none !important;
    -webkit-text-fill-color: #5b4a8c;
    background-image: none;
  }
  .ai-summary-icon-animated {
    animation: none !important;
    background: #5b4a8c;
  }
}
```

**When changing behaviour**, update this doc and `ai-review-animations.css` together.
