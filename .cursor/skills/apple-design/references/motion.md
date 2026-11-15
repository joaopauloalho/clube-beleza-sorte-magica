# Apple Motion

Apple motion is **slow, decelerating, and purposeful**. It guides attention; it never performs. If an animation is fast, bouncy, spinny, or decorative, it is not Apple. When in doubt, make it slower and subtler.

## Principles
- **Decelerate.** Elements arrive on the signature ease-out `cubic-bezier(0.28, 0.11, 0.32, 1)`. Motion starts with energy and settles gently.
- **Fade + small travel.** Reveals are `opacity 0→1` plus a **short** `translateY` (16–40px). Never large slides or scale-ins from nothing.
- **Stagger, don't swarm.** Sequence sibling reveals ~60–120ms apart so a group resolves like a wave.
- **One thing at a time.** Don't animate color + scale + position + rotation together. Pick one or two.
- **Press feedback.** Tappable elements dip to `scale(0.96)` on `:active`, springing back.
- **Respect the user.** Everything below must no-op under `prefers-reduced-motion: reduce`.

## 1. Scroll reveal (fade-up)
Add class `reveal` to anything that should animate in; the JS in `assets/apple-reveal.js` toggles `is-visible` when it enters the viewport.

```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity var(--dur-slow) var(--ease-out),
              transform var(--dur-slow) var(--ease-out);
  will-change: opacity, transform;
}
.reveal.is-visible { opacity: 1; transform: none; }

/* Stagger children: put .reveal-group on a parent, .reveal on each child */
.reveal-group.is-visible > .reveal { transition-delay: calc(var(--i, 0) * 90ms); }
```
```html
<div class="reveal-group">
  <h2 class="t-section-head reveal" style="--i:0">Titanium.</h2>
  <p class="t-sub reveal" style="--i:1">So strong. So light. So Pro.</p>
  <a class="link-chevron reveal" style="--i:2" href="#">Learn more</a>
</div>
```

## 2. Hover / press micro-interactions
```css
/* Tile lift on hover (desktop only, very subtle) */
@media (hover: hover) {
  .tile { transition: transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out); }
  .tile--interactive:hover { transform: translateY(-4px); box-shadow: var(--shadow-card); }
}
/* Press */
.btn:active, .tile--interactive:active { transform: scale(0.96); }
/* Chevron nudge (already in tokens css) */
.link-chevron:hover::after { transform: translateX(3px); }
```

## 3. Parallax (gentle)
Apple floats hero imagery slightly slower than scroll. Keep the factor small (0.1–0.25). The helper in `apple-reveal.js` reads `data-parallax`:
```html
<img class="parallax" data-parallax="0.15" src="device.png" alt="">
```
Keep parallax off for `prefers-reduced-motion` (the helper does this).

## 4. Sticky scroll / pinned scenes (advanced)
Apple's famous "scroll changes the scene" (rotating product, swapping copy) is a **pinned section** driven by scroll progress. Lightweight approach:
- Make a tall section (e.g. `height: 300vh`), pin an inner `position: sticky; top: 0; height: 100vh` stage.
- Compute progress `p = -rect.top / (rect.height - innerHeight)` (0→1) in a scroll listener (rAF-throttled).
- Drive one property from `p`: swap active copy, translate/rotate an element, or set an `<video>`'s `currentTime` for the classic frame-scrub effect.
- For heavy sequences, prefer a real library (GSAP ScrollTrigger, Lenis for smooth scroll). Mention this to the user rather than hand-rolling something janky.

## 5. Page/section transitions
- Cross-fade content swaps over `--dur-base` with `--ease-in-out`.
- New sections fade-up as above; don't slide whole pages horizontally.
- Modals/sheets: scale from `0.98`+fade for centered dialogs; slide-up for bottom sheets; back them with a frosted or dimmed layer.

## Reduced motion
`apple-tokens.css` already collapses all transitions/animations under `prefers-reduced-motion: reduce`. Additionally, `apple-reveal.js` skips observers/parallax and shows everything immediately. Always keep both paths working — reduced-motion users should see the final state with zero movement, never blank/hidden content.
