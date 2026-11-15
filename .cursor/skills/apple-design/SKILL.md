---
name: apple-design
description: >-
  Design and build frontends that match Apple's visual style (apple.com and iOS/HIG) — SF Pro typography,
  the near-black/#f5f5f7 palette, frosted-glass navigation, pill buttons and chevron links, rounded bento
  tiles, generous whitespace, and restrained scroll animations. Use this whenever the user asks for an
  "Apple," "apple.com," "Apple-style," "iOS," or "Cupertino" look, or wants a UI that feels premium, clean,
  and minimal in Apple's specific idiom. Covers marketing/landing pages, product pages, and native-feeling
  iOS app UI in HTML/CSS/JS (and React/Tailwind on request).
---

# Apple Design

Produce frontends indistinguishable from Apple's own — the apple.com marketing site and iOS/iPadOS app UI. Apple's look is not "clean and minimal" in the generic sense; it is a *specific, measurable system*. Match the system, not the vibe.

## The 10 rules (never break these)

1. **Type is the design.** San Francisco (SF Pro), huge tightly-tracked headlines, calm gray subheads. Let type + whitespace carry the page — not borders, boxes, or color. Use the font stack in `assets/apple-tokens.css` (`-apple-system` first — it renders *real* SF on Apple devices).
2. **Two grays, one ink, one blue.** Backgrounds are `#fff` and `#f5f5f7` (and `#000` for dark drama). Text is `#1d1d1f` (ink) and `#86868b` (secondary gray). The only accent is Apple blue — `#0066cc` links, `#0071e3` button fill, `#2997ff` on dark. Resist every other color.
3. **Headlines are big and tight.** Weight 600 (semibold), negative letter-spacing, line-height ~1.05–1.1. Never bold-800 loud. Scale with `clamp()`.
4. **Subheads are gray and quiet.** The signature "Now supercharged by M-series" line: `#86868b`, weight 400, large but calm.
5. **Frosted glass, not solid bars.** Sticky nav = translucent dark `rgba(22,22,23,0.8)` + `backdrop-filter: saturate(180%) blur(20px)`. This blur is Apple's signature — use it for nav, overlays, sticky buy-bars.
6. **Pills and chevrons, never sharp CTAs.** Primary action = blue pill (`border-radius: 980px`). Secondary = text link in blue with a `›` chevron ("Learn more ›"). Buttons never have hard corners.
7. **Rounded everything, at the right radius.** Cards/tiles: 18–28px. Continuity of curvature is the tell. Nothing on an Apple page has a 4px corner.
8. **Whitespace is generous and rhythmic.** Big vertical section padding, centered content column (~980px for text, wider for bento grids), lots of air. Cramped = not Apple.
9. **Motion is restrained and slow.** Fade-up reveals on scroll (opacity + gentle translateY, ~0.8–1s, decelerating ease). Press = `scale(0.96)`. No bounce, no spin, no fast. Always honor `prefers-reduced-motion`.
10. **Bento & full-bleed.** Feature sections are either edge-to-edge hero imagery or a grid of large rounded "bento" tiles alternating `#fff` / `#f5f5f7` / `#000`.

## How to work

1. **Pick the mode** from the request:
   - **Web / marketing / landing / product page** → the apple.com idiom. Read `references/web-components.md`.
   - **iOS / native app UI** → the HIG idiom (large titles, grouped lists, tab bars, SF Symbols, materials). Read `references/ios-hig.md`.
2. **Always start from the tokens.** Copy `assets/apple-tokens.css` into the project (or inline it) and build with those CSS variables. Never hardcode ad-hoc hex/spacing when a token exists. Full reference: `references/design-tokens.md`.
3. **Compose from the recipes**, don't reinvent. The component files give production-ready nav / hero / bento / footer / button / card markup. Adapt copy and imagery; keep the structure and values.
4. **Add motion last** with `assets/apple-reveal.js` (IntersectionObserver fade-ups) and the easing tokens. See `references/motion.md`.
5. **Self-check against the checklist** below before calling it done.

## Files in this skill

| File | Load when |
|------|-----------|
| `references/design-tokens.md` | Always — the exact colors, type scale, spacing, radii, easing, shadows. |
| `references/web-components.md` | Building any apple.com-style page (nav, hero, bento, footer, buttons, links, cards). |
| `references/ios-hig.md` | Building iOS/native-app-style UI (large titles, lists, tab bars, sheets, materials). |
| `references/motion.md` | Adding animation, scroll reveals, parallax, hover/press states. |
| `assets/apple-tokens.css` | Drop into any project — CSS custom properties + base reset + type classes. |
| `assets/apple-reveal.js` | Scroll-reveal + parallax, honors `prefers-reduced-motion`. |
| `assets/starter.html` | A complete, working apple.com-style page. Copy it as a starting point or reference. |

## Fonts — be honest about SF

- **On Apple devices**, `-apple-system, BlinkMacSystemFont` renders the *real* San Francisco. This is free, exact, and covers Apple's own audience — always list it first.
- **Everywhere else**, fall back to **Inter** (the closest free match) then `"Helvetica Neue", Arial`. The token CSS loads Inter from Google Fonts for you.
- **Do not** ship licensed "SF Pro" webfont files to a public production site — Apple's SF license restricts that. The `-apple-system` + Inter stack is the correct, legal, near-identical approach. Only self-host SF Pro for internal mockups/prototypes, and tell the user about the license.

## Definition-of-done checklist

- [ ] Font stack starts with `-apple-system`; Inter loaded as fallback; headlines weight 600 with negative letter-spacing.
- [ ] Only the sanctioned palette used: `#fff`/`#f5f5f7`/`#000` surfaces, `#1d1d1f`/`#86868b` text, Apple blue accents. No stray colors, no pure-black `#000` *text*.
- [ ] Sticky nav uses translucent bg + `backdrop-filter: saturate(180%) blur(20px)`.
- [ ] Primary CTA is a blue pill (radius 980px); secondary is a blue "… ›" chevron link.
- [ ] Cards/tiles use 18–28px radius; no sharp corners anywhere.
- [ ] Generous section padding; content centered in a ~980px column (wider for grids); real whitespace.
- [ ] Scroll reveals are slow fade-ups; press states `scale(0.96)`; `prefers-reduced-motion` respected.
- [ ] Layout is responsive using the `clamp()` type scale and Apple's breakpoints; images crisp on retina.
- [ ] Squint test: it reads as Apple from across the room — type + air + one blue, nothing else shouting.
