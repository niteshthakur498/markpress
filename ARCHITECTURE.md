# Markpress — Architecture

## Overview

Markpress is a **monorepo single-app** built on Next.js Pages Router. There is no separate backend process — the API lives inside Next.js API routes, which Vercel deploys as independent serverless functions. The frontend and API share the same origin and port.

```
┌─ Browser ──────────────────────────────────────┐
│  pages/index.tsx     → Editor UI (React)        │
│  pages/docs.tsx      → API Docs UI (React)      │
│  pages/tech-docs.tsx → Internal Docs (hidden)   │
├─ Next.js API Routes (Node.js, serverless) ──────┤
│  POST /api/convert       → marked.js parse      │
│  POST /api/convert-file  → formidable + marked  │
└─────────────────────────────────────────────────┘
```

## Project Structure

```
markpress/
├── pages/
│   ├── index.tsx           # Main editor UI (two-panel layout)
│   ├── docs.tsx            # Public API documentation page
│   ├── tech-docs.tsx       # Internal technical docs (no nav link)
│   ├── _app.tsx            # Global CSS import
│   ├── _document.tsx       # CDN links: fonts, highlight.js
│   └── api/
│       ├── convert.ts      # POST /api/convert — JSON input
│       └── convert-file.ts # POST /api/convert-file — multipart
├── styles/
│   └── globals.css         # Tailwind directives + custom utilities
├── public/
│   └── favicon.ico
├── tailwind.config.ts      # Design token system ("Precision MD")
├── next.config.ts
├── vercel.json
├── ARCHITECTURE.md         # This file
└── API.md                  # API reference
```

## Key Design Principles

| Principle | Detail |
|-----------|--------|
| **Stateless** | No database, no sessions, no auth. Every request is self-contained. |
| **Single origin** | Frontend and API on the same host — no CORS complexity for the UI. |
| **Public CORS** | `Access-Control-Allow-Origin: *` so third-party clients can call the API directly. |
| **1 MB cap** | Enforced at both the Next.js body-parser level and inside each handler. |

## Design System

The UI follows the **"Precision MD"** design token system defined in `tailwind.config.ts`:

- **Colors** — Deep navy-black dark mode palette; paper-like light mode
- **Typography** — Inter (UI) + JetBrains Mono (code/labels)
- **Accent** — Purple-to-indigo gradient (`#c4c0ff` → `#8781ff`)
- **Spacing** — 4px base unit; 16px gutters; 1px panel divider

## Data Flow

### Text Conversion

```
User types Markdown in textarea
  → onClick fires handleConvert()
  → fetch POST /api/convert { markdown }
  → API validates + calls marked.parse()
  → { html, success: true }
  → React state update → Preview or Raw HTML tab renders
```

### File Upload (client-side read)

```
User drags .md file onto left panel (or clicks Upload)
  → FileReader.text() reads content into textarea state
  → User clicks Convert to HTML →
  → Same flow as text conversion above
```

### File Upload (direct API — for external consumers)

```
Client sends multipart/form-data with 'file' field
  → POST /api/convert-file
  → formidable parses stream → writes temp file
  → fs.readFile() → marked.parse()
  → { html, success: true, filename: "output.html" }
```

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (Pages Router) | ^16 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^3 |
| Markdown | marked.js | ^12 |
| Syntax HL | highlight.js | 11 (CDN) |
| File parse | formidable | ^3 |
| Fonts/Icons | Google Fonts + Material Symbols | CDN |
| Hosting | Vercel | — |

## Deployment

The app deploys to Vercel with zero configuration beyond `vercel.json`.  
Each `pages/api/*.ts` file becomes a separate **serverless function**.  
`/api/convert-file` has `maxDuration: 10s` set for large file handling.

See [API.md](./API.md) for full endpoint reference.
