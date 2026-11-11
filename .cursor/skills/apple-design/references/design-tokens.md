# Apple Design Tokens

Exact values reverse-engineered from apple.com and Apple's HIG. These are the source of truth; `assets/apple-tokens.css` is their CSS embodiment. When in doubt, use a token, never an ad-hoc value.

## Color

### Surfaces (backgrounds)
| Token | Hex | Use |
|-------|-----|-----|
| `--c-white` | `#ffffff` | Default page/section canvas |
| `--c-gray-bg` | `#f5f5f7` | **The** Apple light-gray section (alternates with white) |
| `--c-gray-bg-alt` | `#fbfbfd` | Even-lighter alternate wash |
| `--c-black` | `#000000` | Dark hero sections, video backgrounds, global nav |
| `--c-near-black` | `#161617` | Dark tiles / dark UI surfaces (softer than pure black) |

### Text / ink
| Token | Hex | Use |
|-------|-----|-----|
| `--c-ink` | `#1d1d1f` | **Primary text** — headlines & body on light. Never use pure `#000` for text. |
| `--c-gray` | `#86868b` | **Secondary text** — subheadlines, captions, footnotes. The signature Apple gray. |
| `--c-gray-footer` | `#6e6e73` | Footer link text |
| `--c-white` | `#ffffff` | Text on dark surfaces |
| `--c-gray-on-dark` | `#a1a1a6` | Secondary text on dark surfaces |

### Accent — Apple blue (the ONLY accent)
| Token | Hex | Use |
|-------|-----|-----|
| `--c-link` | `#0066cc` | Text links & chevron CTAs on light backgrounds |
| `--c-blue` | `#0071e3` | Primary **button fill**; focus ring |
| `--c-blue-hover` | `#0077ed` | Button hover fill |
| `--c-link-dark` | `#2997ff` | Links on dark backgrounds |

### Lines & system colors
| Token | Hex | Use |
|-------|-----|-----|
| `--c-hairline` | `#d2d2d7` | Dividers, 1px borders, input outlines |
| `--c-hairline-2` | `#e8e8ed` | Softer divider |
| iOS systemGreen | `#34c759` | Success (iOS) |
| iOS systemRed | `#ff3b30` | Destructive / error (iOS) |
| iOS systemOrange | `#ff9500` | Warning (iOS) |
| iOS systemGray | `#8e8e93` | Neutral controls (iOS) |

> Rule: a whole page uses white/#f5f5f7/#000 for surfaces, #1d1d1f/#86868b for text, and exactly one blue for action. If you're reaching for a fifth color, stop.

## Typography

### Font stacks
```
Display & UI:  -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
               "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif
Mono:          "SF Mono", ui-monospace, "SFMono-Regular", Menlo, monospace
```
- `-apple-system` / `BlinkMacSystemFont` = real San Francisco on Apple devices (free, exact).
- `Inter` = closest free cross-platform substitute (load from Google Fonts).
- Apple optically swaps **SF Pro Text** (<20px) and **SF Pro Display** (≥20px). `-apple-system` handles this automatically.

### Type scale (responsive, apple.com marketing)
Headlines are **weight 600**, **negative letter-spacing**, **tight line-height**. Subheads are **weight 400**, **gray**.

| Role | `font-size` (clamp) | Weight | Line-height | Letter-spacing | Color |
|------|--------------------|--------|-------------|----------------|-------|
| Hero headline | `clamp(40px, 8vw, 80px)` | 600 | 1.05 | -0.015em | ink |
| Section headline | `clamp(32px, 5vw, 56px)` | 600 | 1.0625 | -0.01em | ink |
| Headline | `clamp(28px, 4vw, 40px)` | 600 | 1.1 | -0.005em | ink |
| Eyebrow (label above headline) | 19–21px | 600 | 1.19 | 0.01em | blue or gray |
| Subheadline / intro | `clamp(21px, 3vw, 28px)` | 400 | 1.15 | 0 | gray `#86868b` |
| Body | 17px | 400 | 1.47 | -0.022em | ink |
| Body strong | 17px | 600 | 1.24 | -0.022em | ink |
| Callout | 16px | 400 | 1.4 | -0.018em | ink |
| Caption / footnote | 14px | 400 | 1.43 | -0.016em | gray |
| Fine print (footer) | 12px | 400 | 1.33 | -0.01em | footer gray |

> Headlines whisper by being *huge and tight*, never by being heavy-bold. 600 is the ceiling for marketing headlines; 700 only for rare emphasis.

### iOS Dynamic Type (native app UI), default "Large"
| Style | Size | Weight |
|-------|------|--------|
| Large Title | 34pt | Bold |
| Title 1 | 28pt | Regular |
| Title 2 | 22pt | Regular |
| Title 3 | 20pt | Semibold |
| Headline | 17pt | Semibold |
| Body | 17pt | Regular |
| Callout | 16pt | Regular |
| Subhead | 15pt | Regular |
| Footnote | 13pt | Regular |
| Caption 1 | 12pt | Regular |
| Caption 2 | 11pt | Regular |

## Spacing scale (8pt grid, 4pt subdivisions)
| Token | Value |
|-------|-------|
| `--s-1` | 4px |
| `--s-2` | 8px |
| `--s-3` | 12px |
| `--s-4` | 16px |
| `--s-5` | 20px |
| `--s-6` | 24px |
| `--s-8` | 32px |
| `--s-10` | 40px |
| `--s-12` | 48px |
| `--s-16` | 64px |
| `--s-20` | 80px |
| `--s-section` | `clamp(60px, 10vw, 130px)` — vertical padding between marketing sections |

- **Content column:** text content max-width **980px**, centered, min **22px** side gutters. Bento/full grids widen to ~**1440px** then lock.
- **Tap target (iOS):** minimum **44×44pt**.

## Radius
| Token | Value | Use |
|-------|-------|-----|
| `--r-sm` | 12px | Inputs, small chips, images |
| `--r-md` | 18px | Cards, utility tiles, modals |
| `--r-lg` | 28px | Large bento/feature tiles |
| `--r-xl` | 34px | Extra-large showcase tiles |
| `--r-pill` | 980px | Buttons & pills (Apple literally uses 980px) |
| iOS control | 10–14px | Native buttons, cells, sheets corner (10px) |

## Elevation / shadow
Apple uses shadow *sparingly* — mostly to float a product image, rarely on UI chrome.
| Token | Value | Use |
|-------|-------|-----|
| `--shadow-product` | `0 5px 30px 3px rgba(0,0,0,0.22)` | Floating product imagery |
| `--shadow-card` | `0 4px 24px rgba(0,0,0,0.08)` | Subtle card lift (use rarely) |
| `--shadow-nav` | `0 1px 0 rgba(0,0,0,0.06)` | Hairline under sticky nav |

## Frosted glass (Apple's signature material)
```css
background: rgba(22, 22, 23, 0.8);              /* dark nav */
/* or light: rgba(245, 245, 247, 0.8) */
backdrop-filter: saturate(180%) blur(20px);
-webkit-backdrop-filter: saturate(180%) blur(20px);
```
Use for: global nav, sticky sub-nav / buy bars, dropdown menus, modals/overlays, iOS-style “materials.”

## Motion tokens
| Token | Value | Use |
|-------|-------|-----|
| `--ease-out` | `cubic-bezier(0.28, 0.11, 0.32, 1)` | **Signature Apple** deceleration — reveals, expands |
| `--ease-in-out` | `cubic-bezier(0.42, 0, 0.58, 1)` | Symmetric transitions |
| `--ease-spring` | `cubic-bezier(0.5, 1.25, 0.75, 1.25)` | Gentle overshoot (use very lightly) |
| `--dur-fast` | 300ms | Hover/color/press |
| `--dur-base` | 600ms | Standard transition |
| `--dur-slow` | 1000ms | Scroll fade-up reveals |
| Press state | `transform: scale(0.96)` | Active/tap feedback on buttons & tiles |

Always wrap motion in `@media (prefers-reduced-motion: reduce)` to disable transforms/animations.

## Breakpoints (apple.com)
| Range | Label |
|-------|-------|
| ≤ 419px | small phone |
| 420–734px | phone |
| 735–833px | tablet portrait |
| 834–1023px | tablet landscape |
| 1024–1068px | small desktop |
| 1069–1440px | desktop |
| ≥ 1441px | wide (content locks at 1440px) |
