# trisplit

A triathlon finishing-time predictor. Enter your steady-state pace for swim, bike, and run — get projected splits and totals across Sprint, Olympic, 70.3, and full Ironman distances.

Live: [alxandrb.github.io/trisplit](https://alxandrb.github.io/trisplit)

---

## Why

Most triathlon calculators are either spreadsheets or cluttered with ads. `trisplit` is a single static page: type your paces, read your race. No accounts, no tracking, no build step.

## Features

- Swim pace input in `/100m` or `/100y`
- Bike speed input in `km/h` or `mph`
- Run pace input in `/km` or `/mi`
- Optional T1 / T2 transition times
- Live recalculation across all four standard distances
- Per-leg splits with totals in `h:mm:ss`

## Distances

| Race     | Swim    | Bike   | Run       |
|----------|---------|--------|-----------|
| Sprint   | 750 m   | 20 km  | 5 km      |
| Olympic  | 1500 m  | 40 km  | 10 km     |
| 70.3     | 1900 m  | 90 km  | 21.0975 km|
| Ironman  | 3800 m  | 180 km | 42.195 km |

## Method

Times are projected linearly from steady-state paces, applied flat across each official distance. The model assumes constant effort and ignores fatigue, terrain, wind, and nutrition. Treat the output as a navigation chart, not a prophecy — it's most accurate for shorter distances and degrades with race length.

Internal units:

- Swim → seconds per meter (yards converted via 0.9144)
- Bike → seconds per kilometer (mph converted via 1.609344)
- Run  → seconds per kilometer

## Stack

Vanilla HTML, CSS, and JavaScript. No framework, no dependencies, no build.

- Typography: Cormorant Garamond + JetBrains Mono (Google Fonts)
- Single file: `index.html`

## Run locally

```bash
git clone https://github.com/alxandrb/trisplit.git
cd trisplit
open index.html
```

Or serve it:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy

GitHub Pages, `main` branch, root. Nothing to configure.

## License

MIT

## Author

[Alexandre Boudreau](https://github.com/alxandrb) — Montréal
