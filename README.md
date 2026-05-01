<div align="center">

```
 ___           _____           _ _    _ _   
|   \ _____ __/__   \___  ___ | | | _(_) |_ 
|  |) / -_) V / / /\/ _ \/ _ \| | |/ / |  _|
|___/\___|\_/ /_/  \___/\___/_|_|\___|_|\__|
```

**Developer utilities — in your pocket.**

`Telegram Mini App` · `PWA` · `Offline-ready` · `15 tools`

---

</div>

## What is this

DevToolkit is a lightweight web app designed to run inside Telegram as a [Mini App](https://core.telegram.org/bots/webapps). It packs **15 developer tools** into a single page — no backend, no accounts, no bloat. Everything runs client-side.

Built with **Vite + Vanilla JS**. No frameworks. The entire bundle is **18 KB gzipped**.

---

## Tools

### Dev Tools

| Tool | What it does |
|:-----|:-------------|
| **Color Picker** | HEX / RGB / HSL conversion, shade generation, color harmonies (analogous, complementary, triadic), recent colors history |
| **CSS Generator** | Live preview + copy-ready CSS for glassmorphism, box-shadow, and border-radius. Sliders for every parameter |
| **URL Shortener** | Paste a link → get a short URL via TinyURL API. History is saved locally |
| **JSON Formatter** | Pretty-print or minify JSON with syntax highlighting and validation |
| **Image Compressor** | Drag-drop an image, pick quality, get a compressed WebP. All client-side via Canvas API |
| **Pomodoro Timer** | SVG ring countdown, configurable work/break intervals, session tracking, browser notifications |
| **Code Snippets** | Save, search, copy, and delete code blocks. Stored in localStorage |

### Python Tools

| Tool | What it does |
|:-----|:-------------|
| **Dict ↔ JSON** | Convert Python dicts (`True`, `None`, single quotes, trailing commas) to valid JSON and back |
| **Model Generator** | Paste JSON → get a Python `@dataclass`, `Pydantic BaseModel`, or `SQLAlchemy` model with auto-inferred types |
| **Pip Extract** | Paste Python source code → get `requirements.txt` and a `pip install` command. Filters stdlib, maps 50+ packages (`cv2` → `opencv-python`, `PIL` → `Pillow`, etc.) |
| **Docstring Generator** | Paste a function signature → get a Google, NumPy, or Sphinx-style docstring |
| **Templates** | Ready-to-copy boilerplate: aiogram 3 handlers/bot/keyboards, FastAPI CRUD endpoints, decorator collection (retry, cache, timer, rate_limit) |
| **List Comp Builder** | Visual constructor for list/dict/set/generator comprehensions with live preview |
| **f-string Builder** | Build complex f-strings with variables and format specs. Includes a cheatsheet |
| **Python Reference** | Three-tab reference: venv commands, type hints, and the exception hierarchy tree |

---

## Stack

```
Vite ─── build + dev server
Vanilla JS ─── zero runtime dependencies
CSS ─── custom design system, no frameworks
Telegram WebApp SDK ─── haptic feedback, back button, theming
Service Worker ─── offline caching (PWA)
```

## Design principles

- **Black & white only** — no gradients, no color noise
- **System font stack** — `-apple-system, SF Pro` for native feel
- **iOS spring animations** — `cubic-bezier(0.34, 1.56, 0.64, 1)` on every interaction
- **Safe area insets** — full-screen on iPhone with no overlap
- **SVG icons** — inline, no network requests, no icon fonts
- **< 20 KB gzipped** — loads instantly on any connection

---

## Run locally

```bash
git clone https://github.com/nazarn1xyy/DevToolKit.git
cd DevToolKit
npm install
npm run dev
```

Open `http://localhost:5173`

## Build

```bash
npm run build    # outputs to dist/
```

## Deploy to Vercel

```bash
npx vercel --prod
```

The `vercel.json` is already configured with SPA routing and asset caching.

## Connect to Telegram

1. Open [@BotFather](https://t.me/BotFather) → `/mybots`
2. Select your bot → **Bot Settings** → **Menu Button**
3. Set the URL to your Vercel deployment

---

## Project structure

```
├── index.html              # entry point + Telegram SDK
├── vite.config.js
├── vercel.json              # SPA routing + caching headers
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── sw.js                # service worker
│   └── icon.svg
└── src/
    ├── main.js              # router, TG init, PWA register
    ├── style.css            # design system
    ├── icons.js             # inline SVG icon library
    └── tools/
        ├── home.js          # tool grid (main screen)
        ├── color-picker.js
        ├── css-generator.js
        ├── url-shortener.js
        ├── json-formatter.js
        ├── image-compressor.js
        ├── pomodoro.js
        ├── snippets.js
        ├── py-dict-json.js
        ├── py-model-gen.js
        ├── py-imports.js
        ├── py-docstring.js
        ├── py-templates.js
        ├── py-comprehension.js
        ├── py-fstring.js
        └── py-reference.js
```

---

<div align="center">
<sub>Built with Vite · No frameworks · No tracking · No backend</sub>
</div>
