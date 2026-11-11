# iOS / Native App UI (Human Interface Guidelines idiom)

Use this when the request is an **app interface** (not a marketing page): settings screens, lists, tab bars, sheets, forms. The vocabulary overlaps apple.com (SF font, systemBlue, rounded corners, materials) but the layout rules differ. These recipes reproduce the iOS look in HTML/CSS; the same structure maps directly to SwiftUI.

## Core iOS principles
- **Clarity, deference, depth.** Content is primary; chrome defers via translucency; layering + motion convey hierarchy.
- **Large Titles.** Screens open with a 34pt bold left-aligned title that collapses into the nav bar on scroll.
- **Grouped content.** Settings-style **inset grouped lists**: rounded white cards on a `#f2f2f7` canvas, hairline separators inset from the leading edge.
- **44pt minimum tap targets.** Everything tappable is ≥ 44×44pt.
- **Safe areas.** Respect notch/home-indicator via `env(safe-area-inset-*)`.
- **Materials over solid fills.** Bars use translucent blur ("materials"), not opaque color.
- **systemBlue is the tint.** Interactive text/icons are `#0071e3` (light). Destructive is systemRed `#ff3b30`.

## iOS-specific tokens (light mode)
```
--ios-bg-grouped:   #f2f2f7;   /* grouped table background canvas   */
--ios-bg-elevated:  #ffffff;   /* cells, cards                      */
--ios-separator:    rgba(60,60,67,0.29);  /* hairline separators    */
--ios-label:        #000000;   /* primary label (near-black)        */
--ios-label-2:      rgba(60,60,67,0.6);    /* secondary label        */
--ios-label-3:      rgba(60,60,67,0.3);    /* tertiary / placeholder */
--ios-tint:         #0071e3;   /* systemBlue                        */
--ios-red:          #ff3b30;   /* destructive                       */
--ios-green:        #34c759;   /* success / toggles on              */
--ios-radius:       10px;      /* cards, buttons, sheets corner     */
```
Dark mode: canvas `#000`, elevated `#1c1c1e`, label `#fff`, separators `rgba(84,84,88,0.6)`.

## Recipe: navigation bar with Large Title + grouped list

```html
<div class="ios-screen">
  <header class="ios-navbar glass-light">
    <button class="ios-back">‹ Back</button>
    <span class="ios-navbar__compact">Settings</span>
    <button class="ios-tint">Edit</button>
  </header>

  <main class="ios-content">
    <h1 class="ios-large-title">Settings</h1>

    <section class="ios-group">
      <div class="ios-cell">
        <span class="ios-cell__label">Airplane Mode</span>
        <label class="ios-switch"><input type="checkbox"><span></span></label>
      </div>
      <div class="ios-cell">
        <span class="ios-cell__label">Wi-Fi</span>
        <span class="ios-cell__value">Home</span>
        <span class="ios-chevron">›</span>
      </div>
      <div class="ios-cell">
        <span class="ios-cell__label">Bluetooth</span>
        <span class="ios-cell__value">On</span>
        <span class="ios-chevron">›</span>
      </div>
    </section>

    <p class="ios-group__footer">Wi-Fi and Bluetooth stay on when Airplane Mode is enabled.</p>

    <section class="ios-group">
      <button class="ios-cell ios-cell--button"><span class="ios-tint">Sign In</span></button>
      <button class="ios-cell ios-cell--button"><span class="ios-red">Remove Account</span></button>
    </section>
  </main>

  <nav class="ios-tabbar glass-light">
    <a class="ios-tab is-active"><span class="ios-tab__icon">◉</span>Today</a>
    <a class="ios-tab"><span class="ios-tab__icon">▤</span>Apps</a>
    <a class="ios-tab"><span class="ios-tab__icon">⌕</span>Search</a>
  </nav>
</div>
```
```css
.ios-screen {
  max-width: 420px; margin-inline: auto; min-height: 100dvh;
  background: var(--ios-bg-grouped, #f2f2f7);
  color: var(--ios-label, #000);
  font-family: var(--font);
  display: flex; flex-direction: column;
  --ios-tint: #0071e3; --ios-red: #ff3b30;
}
.ios-navbar {
  position: sticky; top: 0; z-index: 10;
  height: 44px; padding: 0 16px;
  display: flex; align-items: center; justify-content: space-between;
  font-size: 17px; border-bottom: 0.5px solid rgba(0,0,0,0.12);
  padding-top: env(safe-area-inset-top);
}
.ios-navbar__compact { font-weight: 600; opacity: 0; }   /* fades in as large title collapses */
.ios-back, .ios-tint { background: none; border: none; color: var(--ios-tint); font-size: 17px; }
.ios-red { color: var(--ios-red); }
.ios-content { flex: 1; padding: 8px 16px 24px; }
.ios-large-title { font-size: 34px; font-weight: 700; letter-spacing: 0.011em; margin: 8px 0 18px; }

.ios-group {
  background: var(--ios-bg-elevated, #fff);
  border-radius: var(--ios-radius, 10px);
  overflow: hidden; margin-bottom: 8px;
}
.ios-cell {
  display: flex; align-items: center; gap: 8px;
  min-height: 44px; padding: 11px 16px; width: 100%;
  background: none; border: none; text-align: left; font-size: 17px;
  position: relative;
}
.ios-cell:not(:last-child)::after {
  content: ""; position: absolute; left: 16px; right: 0; bottom: 0;
  height: 0.5px; background: rgba(60,60,67,0.29);
}
.ios-cell__label { flex: 1; }
.ios-cell__value { color: rgba(60,60,67,0.6); }
.ios-chevron { color: rgba(60,60,67,0.3); font-size: 20px; }
.ios-cell--button:active { background: rgba(0,0,0,0.05); }
.ios-group__footer { font-size: 13px; color: rgba(60,60,67,0.6); padding: 6px 16px 18px; }

/* iOS switch */
.ios-switch { position: relative; width: 51px; height: 31px; display: inline-block; }
.ios-switch input { opacity: 0; width: 0; height: 0; }
.ios-switch span { position: absolute; inset: 0; background: #e9e9ea; border-radius: 999px; transition: background var(--dur-fast) var(--ease-in-out); }
.ios-switch span::before { content: ""; position: absolute; top: 2px; left: 2px; width: 27px; height: 27px; background: #fff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.25); transition: transform var(--dur-fast) var(--ease-in-out); }
.ios-switch input:checked + span { background: var(--ios-green, #34c759); }
.ios-switch input:checked + span::before { transform: translateX(20px); }

/* Tab bar */
.ios-tabbar {
  position: sticky; bottom: 0;
  display: flex; justify-content: space-around;
  border-top: 0.5px solid rgba(0,0,0,0.12);
  padding-bottom: env(safe-area-inset-bottom);
}
.ios-tab { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 8px 0 6px; font-size: 10px; color: rgba(60,60,67,0.6); flex: 1; }
.ios-tab__icon { font-size: 22px; }
.ios-tab.is-active { color: var(--ios-tint); }
```

## Other iOS patterns
- **Sheet / modal:** slides up from bottom, top corners `border-radius: 10px`, a 36×5px gray grabber handle centered at top, dimmed backdrop behind. Detents (medium/large) like Apple Maps.
- **Segmented control:** pill container `#767680` at 12% alpha, selected segment a white rounded chip with subtle shadow that slides.
- **Search field:** `#767680`/12% fill, `border-radius: 10px`, leading magnifier glyph, 36px tall.
- **Context menu:** rounded blurred material card that scales up from the tapped element with `--ease-spring`.
- **Buttons (iOS 15+ filled):** tinted `#0071e3` fill, white text, `border-radius: 12px`, min-height 50px for prominent CTAs; or plain blue text for borderless.
- **SF Symbols:** use consistent-weight line icons that match text weight. On the web, substitute a coherent line-icon set (or inline SVG) — never mix icon styles.

## Mapping to SwiftUI (if the user wants native code)
- Large title → `.navigationTitle("…")` with `.navigationBarTitleDisplayMode(.large)`
- Grouped list → `List { Section(footer: Text("…")) { … } }.listStyle(.insetGrouped)`
- Tint → `.tint(.blue)` / `Color(red:0, green:0.45, blue:0.89)`
- Material bars → `.background(.ultraThinMaterial)`
- Sheet → `.sheet(isPresented:)` with `.presentationDetents([.medium, .large])`
