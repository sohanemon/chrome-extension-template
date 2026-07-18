# Chrome Extension Template

<p align="center">
  <img src="/public/icon.png" width="128" alt="Chrome Extension Template icon" />
</p>

A modern Chrome extension starter with Vite, React 19, TypeScript 7, Tailwind CSS v4, and the React Compiler.

## Getting Started

```bash
# Install dependencies
bun install

# Build the extension
bun run build
```

Load the `build/` directory in Chrome via `chrome://extensions` → **Load unpacked**.

## Development

```bash
bun run dev       # Vite dev server (for popup UI)
bun run build     # Production build → build/
bun run preview   # Preview the production build
```

## Icon

Place a square `icon.png` in `public/` (at least 128×128), then generate the required sizes:

```bash
bun run sync
```

This creates `public/generated/icon-{16,48,128}.png` via ImageMagick. Runs automatically before every build.

## Linting & Formatting

```bash
bun run lint     # Biome lint
bun run format   # Biome format
bun run check    # Biome check (lint + format)
```

## Structure

```
├── public/
│   ├── icon.png            # Source icon (required)
│   ├── generated/          # Auto-generated icon sizes
│   └── manifest.json       # Chrome extension manifest (MV3)
├── src/
│   ├── background.ts       # Service worker
│   ├── content.ts          # Content script (injected into pages)
│   ├── App.tsx             # Popup UI (React)
│   ├── main.tsx            # Popup entry point
│   └── styles/index.css    # Tailwind + CSS variables
├── scripts/
│   └── generate-icons.sh   # Icon resizing script
├── vite.config.ts          # Vite config (multi-entry build)
├── tsconfig.json           # TypeScript config
├── biome.json              # Linter & formatter config
└── components.json         # shadcn/ui config
```

## License

MIT
