# trisplit

A triathlon finishing-time predictor. Enter your steady-state pace for swim, bike, and run — get projected splits and totals across Sprint, Olympic, 70.3, and full Ironman distances.

Live: [alxandrb.github.io/trisplit](https://alxandrb.github.io/trisplit)

---

## Why

Most triathlon calculators are spreadsheets or ad-cluttered sites. `trisplit` is a static page: type your paces, read your race. No accounts, no tracking, no build step.

## Features

- Bilingual FR / EN with persistent preference and browser-language detection
- Dark / Light themes (auto-detects `prefers-color-scheme`)
- Swim pace input in `/100m` or `/100y`
- Bike speed input in `km/h` or `mph`
- Run pace input in `/km` or `/mi`
- Optional T1 / T2 transition times
- Live recalculation across all four standard distances
- State persistence via `localStorage`

## Distances

| Race    | Swim    | Bike   | Run        |
|---------|---------|--------|------------|
| Sprint  | 750 m   | 20 km  | 5 km       |
| Olympic | 1500 m  | 40 km  | 10 km      |
| 70.3    | 1900 m  | 90 km  | 21.0975 km |
| Ironman | 3800 m  | 180 km | 42.195 km  |

## Method

Times are projected linearly from steady-state paces, applied flat across each official distance. The model assumes constant effort and ignores fatigue, terrain, wind, and nutrition. It's most accurate for shorter distances and degrades with race length.

Internal units:

- Swim → seconds per meter (yards converted via 0.9144)
- Bike → seconds per kilometer (mph converted via 1.609344)
- Run  → seconds per kilometer

## Architecture

Vanilla HTML, CSS, and ES modules. No framework, no bundler, no dependencies. The single-file prototype was refactored into a layered structure to keep concerns isolated and the hot path tight.

```
trisplit/
├── index.html              Semantic markup, no inline JS or CSS
├── assets/styles/
│   ├── tokens.css          Design tokens (theme variables, type, spacing)
│   ├── base.css            Reset, body, reduced-motion handling
│   ├── layout.css          Container, header, grid
│   └── components.css      Toggles, inputs, race cards, splits, note
└── src/
    ├── main.js             Composition root — wires modules together
    ├── core/
    │   ├── constants.js    Frozen domain data (RACES, conversions, defaults)
    │   ├── state.js        Pub/sub store with debounced persistence
    │   └── compute.js      Pure projection functions
    ├── i18n/
    │   ├── strings.js      Flat FR / EN dictionaries
    │   └── i18n.js         Translation lookup + DOM application
    └── ui/
        ├── format.js       Time and distance formatters
        ├── render.js       Race-card renderer (rAF-batched, memoized)
        ├── inputs.js       Delegated input bindings
        ├── toggles.js      Generic toggle group handler
        └── theme.js        Theme application
```

### Design principles

- **Pure core, dirty edges.** All compute and formatting are pure functions. Side effects (DOM writes, storage, listeners) are confined to `ui/` and `main.js`.
- **Immutable state updates.** The store always produces a new top-level state object so consumers can rely on referential equality.
- **Event delegation.** One `click` listener handles all toggles; one `input` listener handles all numeric fields. Constant memory regardless of UI size.
- **Frame-coalesced rendering.** Multiple state mutations within a frame produce a single DOM write, scheduled via `requestAnimationFrame`.
- **Memoized output.** A stable cache key on the inputs that affect render output skips redundant DOM updates.
- **Tabular numerics.** All time displays use `font-variant-numeric: tabular-nums` so columns stay aligned regardless of digit content.
- **Accessibility hooks.** `aria-pressed` on toggles, `aria-live` on results, `aria-label` on numeric pace inputs, and `prefers-reduced-motion` honored.
- **Frozen constants.** Domain data is `Object.freeze`d to prevent accidental mutation and let v8 specialize lookups.

### Performance notes

- No framework runtime, no bundler — first paint is one HTML parse + four small CSS files + one ES module graph.
- The render path builds template strings into a pre-allocated array and writes a single `innerHTML` per update. For ~60 leaf nodes refreshed at sub-10Hz user-input rates, this beats per-node diffing in both wall time and code size.
- Persistence is debounced (60 ms) so rapid keystrokes coalesce into a single `localStorage.setItem` call.

## Run locally

The app uses ES modules, which require a server origin (no `file://`).

```bash
git clone https://github.com/alxandrb/trisplit.git
cd trisplit
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

GitHub Pages, `main` branch, root. Nothing to configure.

## License

MIT

## Author

[Alexandre Bordereau](https://github.com/alxandrb) — Montréal
