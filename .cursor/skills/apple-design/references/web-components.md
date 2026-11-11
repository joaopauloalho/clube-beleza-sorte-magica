# Apple Web Components (apple.com idiom)

Production-ready recipes. They assume `apple-tokens.css` is loaded (uses its variables/classes). Keep the structure and values; swap copy and imagery. Every recipe is responsive and accessible.

---

## 1. Global nav (frosted, sticky)

Apple's global nav: 44px tall, translucent dark, frosted, evenly-spaced 12px links, logo left, search + bag right. It sits over content so the blur shows.

```html
<header class="nav" role="banner">
  <nav class="nav__inner" aria-label="Global">
    <a class="nav__logo" href="/" aria-label="Apple">
      <svg viewBox="0 0 14 44" width="14" height="44" aria-hidden="true"><path fill="currentColor" d="M13.06 22.16c-.02-2.4 1.96-3.56 2.05-3.62-1.12-1.64-2.86-1.86-3.48-1.89-1.48-.15-2.89.87-3.64.87-.75 0-1.91-.85-3.14-.83-1.61.02-3.1.94-3.93 2.38-1.68 2.9-.43 7.2 1.2 9.56.8 1.16 1.75 2.46 3 2.41 1.2-.05 1.66-.78 3.11-.78 1.45 0 1.86.78 3.13.75 1.29-.02 2.11-1.18 2.9-2.34.91-1.34 1.29-2.64 1.31-2.71-.03-.01-2.51-.96-2.53-3.82zM10.6 14.6c.66-.8 1.11-1.92.99-3.03-.95.04-2.11.63-2.8 1.43-.61.71-1.15 1.84-1 2.93 1.06.08 2.15-.54 2.81-1.33z"/></svg>
    </a>
    <ul class="nav__links">
      <li><a href="#">Store</a></li>
      <li><a href="#">Mac</a></li>
      <li><a href="#">iPad</a></li>
      <li><a href="#">iPhone</a></li>
      <li><a href="#">Watch</a></li>
      <li><a href="#">Vision</a></li>
      <li><a href="#">AirPods</a></li>
      <li><a href="#">TV &amp; Home</a></li>
      <li><a href="#">Entertainment</a></li>
      <li><a href="#">Accessories</a></li>
      <li><a href="#">Support</a></li>
    </ul>
    <div class="nav__actions">
      <button class="nav__icon" aria-label="Search"><svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5 13 13" stroke-linecap="round"/></svg></button>
      <button class="nav__icon" aria-label="Shopping Bag"><svg width="14" height="15" viewBox="0 0 14 15" fill="none" stroke="currentColor" stroke-width="1.1"><path d="M3.5 4V3a3.5 3.5 0 0 1 7 0v1M1.5 4h11l-.7 9.2a1 1 0 0 1-1 .9H3.2a1 1 0 0 1-1-.9L1.5 4Z" stroke-linejoin="round"/></svg></button>
    </div>
  </nav>
</header>
```
```css
.nav {
  position: sticky; top: 0; z-index: 9999;
  height: var(--nav-h);
  background: var(--glass-dark);
  -webkit-backdrop-filter: var(--glass-blur);
  backdrop-filter: var(--glass-blur);
}
.nav__inner {
  height: 100%; max-width: 1024px; margin-inline: auto;
  padding-inline: 22px;
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.nav__logo { color: #f5f5f7; display: flex; align-items: center; }
.nav__links { list-style: none; display: flex; gap: clamp(12px, 2.4vw, 34px); flex: 1; justify-content: center; }
.nav__links a, .nav__icon {
  color: #f5f5f7; opacity: 0.8; font-size: 12px; line-height: 44px;
  background: none; border: none; transition: opacity var(--dur-fast) ease;
}
.nav__links a:hover, .nav__icon:hover { opacity: 1; text-decoration: none; }
.nav__actions { display: flex; align-items: center; gap: 18px; }
.nav__icon { display: flex; align-items: center; height: 44px; }
/* Collapse the link row on small screens (swap for a hamburger in production) */
@media (max-width: 833px) { .nav__links { display: none; } }
```

---

## 2. Hero / marquee

Two flavors. Centered text-over-image is the classic. Headline is huge+tight, subhead gray, then two chevron links ("Learn more ›" + "Buy ›").

```html
<section class="hero section--gray center">
  <div class="container reveal">
    <p class="t-eyebrow" style="color:var(--c-link)">New</p>
    <h1 class="t-hero">iPhone 16 Pro</h1>
    <p class="t-sub" style="margin-top:6px">So durable. So capable. So pro.</p>
    <p class="hero__price t-caption" style="margin-top:12px">From $999 or $41.62/mo. for 24 mo.</p>
    <div class="hero__cta">
      <a class="link-chevron" href="#">Learn more</a>
      <a class="link-chevron" href="#">Buy</a>
    </div>
  </div>
  <picture class="hero__media reveal">
    <img src="hero.jpg" alt="iPhone 16 Pro" width="1440" height="860">
  </picture>
</section>
```
```css
.hero { padding-block: clamp(48px, 8vw, 90px) 0; }
.hero__cta { display: flex; gap: 28px; justify-content: center; margin-top: 20px; }
.hero__media { margin-top: 40px; }
.hero__media img { margin-inline: auto; width: min(100%, 1200px); }
```
> Variant — **text over full-bleed image**: put an `<img>` as the section background (`object-fit: cover`) and absolutely-position the `.container`; add a subtle top-to-bottom scrim only if text legibility needs it. Choose black or white headline text based on the image, not a scrim, when possible.

---

## 3. Bento grid (feature tiles)

Large rounded tiles, alternating white / `#f5f5f7` / black, asymmetric spans. This is Apple's dominant modern feature layout.

```html
<section class="section section--gray">
  <div class="container container--wide">
    <div class="bento">
      <article class="tile tile--white bento__a reveal">
        <p class="t-eyebrow" style="color:var(--c-gray)">Chip</p>
        <h3 class="t-headline">M5. <span class="t-gray">A monster leap.</span></h3>
      </article>
      <article class="tile tile--dark bento__b reveal">
        <h3 class="t-headline">Battery</h3>
        <p class="t-sub">Up to 22 hours of video playback.</p>
      </article>
      <article class="tile bento__c reveal">
        <h3 class="t-headline">Camera</h3>
        <p class="t-sub">48MP Fusion. Shoot in the dark.</p>
      </article>
      <article class="tile tile--white bento__d reveal">
        <h3 class="t-headline">Titanium</h3>
        <p class="t-sub">Strong. Light. Pro.</p>
      </article>
    </div>
  </div>
</section>
```
```css
.bento { display: grid; gap: 20px; grid-template-columns: repeat(4, 1fr); }
.bento .tile { min-height: 340px; display: flex; flex-direction: column; justify-content: flex-end; }
.bento__a { grid-column: span 2; }
.bento__b { grid-column: span 2; }
.bento__c { grid-column: span 2; }
.bento__d { grid-column: span 2; }
@media (max-width: 833px) { .bento { grid-template-columns: 1fr; } .bento > * { grid-column: 1 / -1; } }
```

---

## 4. Buttons & links

```html
<a class="btn btn--primary" href="#">Buy</a>
<a class="btn btn--secondary" href="#">Learn more</a>
<a class="link-chevron" href="#">Watch the film</a>
```
- **Primary** = solid blue pill (`--c-blue`), white text, hover `--c-blue-hover`, press `scale(0.96)`.
- **Secondary** = blue outline pill that fills blue on hover.
- **Chevron link** = the everyday CTA; chevron nudges right on hover. Use pairs like "Learn more ›" / "Buy ›".
- Never use hard-cornered buttons, drop shadows on buttons, or non-blue accent buttons.

---

## 5. Section header (centered intro block)

```html
<section class="section center">
  <div class="container">
    <h2 class="t-section-head reveal">Designed to make a difference.</h2>
    <p class="t-sub reveal" style="max-width:640px;margin:16px auto 0">
      A closer look at the materials, the chip, and the ideas inside.
    </p>
    <div class="reveal" style="margin-top:24px">
      <a class="link-chevron" href="#">Explore the lineup</a>
    </div>
  </div>
</section>
```

---

## 6. Footer

Light-gray, fine print, multi-column link groups, hairline dividers, country selector + copyright. Text is small (12px) and gray.

```html
<footer class="footer">
  <div class="container container--wide footer__inner">
    <p class="footer__legal">
      1. Trade-in values vary. 2. Available for qualifying applicants. Terms apply.
    </p>
    <hr class="footer__rule">
    <div class="footer__cols">
      <div class="footer__col">
        <h4>Shop and Learn</h4>
        <ul><li><a href="#">Store</a></li><li><a href="#">Mac</a></li><li><a href="#">iPad</a></li><li><a href="#">iPhone</a></li><li><a href="#">Watch</a></li></ul>
      </div>
      <div class="footer__col">
        <h4>Services</h4>
        <ul><li><a href="#">Apple Music</a></li><li><a href="#">Apple TV+</a></li><li><a href="#">iCloud+</a></li><li><a href="#">Apple Pay</a></li></ul>
      </div>
      <div class="footer__col">
        <h4>Apple Store</h4>
        <ul><li><a href="#">Find a Store</a></li><li><a href="#">Genius Bar</a></li><li><a href="#">Today at Apple</a></li><li><a href="#">Trade In</a></li></ul>
      </div>
      <div class="footer__col">
        <h4>About Apple</h4>
        <ul><li><a href="#">Newsroom</a></li><li><a href="#">Leadership</a></li><li><a href="#">Careers</a></li><li><a href="#">Investors</a></li></ul>
      </div>
    </div>
    <hr class="footer__rule">
    <div class="footer__base">
      <p>Copyright © 2026 Apple Inc. All rights reserved.</p>
      <ul class="footer__legal-links">
        <li><a href="#">Privacy Policy</a></li><li><a href="#">Terms of Use</a></li>
        <li><a href="#">Sales and Refunds</a></li><li><a href="#">Legal</a></li><li><a href="#">Site Map</a></li>
      </ul>
      <p class="footer__country">United States</p>
    </div>
  </div>
</footer>
```
```css
.footer { background: var(--c-gray-bg); color: var(--c-gray-footer); font-size: 12px; line-height: 1.33; padding-block: 40px; }
.footer a { color: var(--c-gray-footer); }
.footer a:hover { color: var(--c-ink); text-decoration: underline; }
.footer__legal { color: var(--c-gray); }
.footer__rule { border: none; border-top: 1px solid var(--c-hairline); margin: 20px 0; }
.footer__cols { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; }
.footer__col h4 { color: var(--c-ink); font-size: 12px; font-weight: 600; margin-bottom: 10px; }
.footer__col ul { list-style: none; }
.footer__col li { margin-bottom: 8px; }
.footer__base { display: flex; flex-wrap: wrap; gap: 8px 20px; align-items: center; }
.footer__legal-links { list-style: none; display: flex; flex-wrap: wrap; gap: 12px; }
.footer__legal-links li:not(:last-child)::after { content: "|"; color: var(--c-hairline); margin-left: 12px; }
.footer__country { margin-left: auto; color: var(--c-ink); }
@media (max-width: 833px) { .footer__cols { grid-template-columns: repeat(2, 1fr); } }
```

---

## 7. Sticky sub-nav / buy bar (frosted)

Appears under the global nav on product pages: product name left, quick links + a "Buy" pill right.

```html
<div class="subnav glass-light">
  <div class="container subnav__inner">
    <span class="subnav__title">iPhone 16 Pro</span>
    <nav class="subnav__links">
      <a href="#">Overview</a><a href="#">Tech Specs</a>
      <a class="btn btn--primary btn--sm" href="#">Buy</a>
    </nav>
  </div>
</div>
```
```css
.subnav { position: sticky; top: var(--nav-h); z-index: 9000; border-bottom: 1px solid var(--c-hairline-2); }
.subnav__inner { height: 52px; display: flex; align-items: center; justify-content: space-between; }
.subnav__title { font-size: 21px; font-weight: 600; letter-spacing: -0.01em; }
.subnav__links { display: flex; align-items: center; gap: 24px; font-size: 12px; }
.subnav__links a { color: var(--c-ink); }
```

---

## Common mistakes to avoid
- Pure `#000` for body text (use `#1d1d1f`), or `#fff` bg with harsh `#000` — Apple is soft-contrast.
- Heavy bold (700–800) headlines — Apple maxes at 600 for marketing.
- Any second accent color, gradients-as-decoration, or colored shadows.
- Sharp corners, hard borders, or drop shadows on chrome/buttons.
- Solid opaque nav — it must be frosted glass over content.
- Cramped spacing — Apple's whitespace is deliberate and large.
- Fast/bouncy animation — keep it slow and decelerating.
