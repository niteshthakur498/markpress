# Markpress

**Markdown → HTML, instantly.**

A full-stack web tool for converting Markdown to HTML — with a beautiful two-panel editor UI, a drag-and-drop file loader, syntax-highlighted preview, and a developer-ready REST API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/markpress)

---

## Features

- **Live two-panel editor** — type Markdown, see HTML preview instantly after conversion
- **Drag & drop** `.md` / `.markdown` / `.txt` files directly onto the editor
- **Preview & Raw HTML** tabs with syntax highlighting (highlight.js)
- **Copy HTML** to clipboard & **Download** a full standalone `.html` file
- **Light / Dark mode** toggle
- **CLI** — convert `.md` files on disk to standalone `.html` documents, no server needed
- **REST API** — two endpoints, no auth required, CORS enabled for all origins
- **Stateless** — no database, no sessions

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 15 + TypeScript (Pages Router) |
| Styling   | Tailwind CSS v3                   |
| Markdown  | marked.js                         |
| Code HL   | highlight.js                      |
| File parse| formidable                        |
| Hosting   | Vercel                            |

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/markpress.git
cd markpress

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the editor.
Open [http://localhost:3000/docs](http://localhost:3000/docs) to see the API docs.

---

## Deploy to Vercel

Click the button at the top, or:

```bash
npm install -g vercel
vercel
```

---

## CLI

Convert Markdown files on disk without starting the server. Output is the same
standalone, styled document the editor's **Download .html** button produces.

Invoke it as `npm run convert -- <args>` or, inside the project, `npx markpress <args>`.

```bash
# Write README.html next to README.md
npm run convert -- README.md

# Several files into one directory
npm run convert -- docs/*.md --out-dir build/

# A specific output path and title
npm run convert -- notes.md -o public/notes.html --title "Release Notes"

# Pipe through stdout
cat notes.md | npm run convert --silent > notes.html

# Bare HTML fragment, no document wrapper
npm run convert -- notes.md --fragment --stdout
```

| Option | Description |
|--------|-------------|
| `-o, --out <file>` | Write to `<file>` (single input only) |
| `-d, --out-dir <dir>` | Write outputs into `<dir>`, created if missing |
| `--stdout` | Write to stdout instead of a file |
| `--fragment` | Emit a bare HTML fragment, no document wrapper |
| `--title <title>` | Document title (default: first `#` heading, else the filename) |
| `-f, --force` | Overwrite existing output files |
| `-h, --help` | Show help |

Accepts `.md`, `.markdown` and `.txt`. With no files named, Markdown is read from
stdin. Existing files are never overwritten without `--force`.

---

## API Reference

### `POST /api/convert`

Convert a Markdown string to HTML.

**Request**

```http
POST /api/convert
Content-Type: application/json

{
  "markdown": "# Hello World\nThis is **bold** text."
}
```

**Response**

```json
{
  "html": "<h1>Hello World</h1>\n<p>This is <strong>bold</strong> text.</p>",
  "success": true
}
```

**cURL Example**

```bash
curl -X POST https://your-app.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World"}'
```

**JavaScript Example**

```js
const response = await fetch('https://your-app.vercel.app/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Hello World' })
});
const { html } = await response.json();
```

---

### `POST /api/convert-file`

Upload a `.md` / `.markdown` / `.txt` file for conversion.

**Request**

```http
POST /api/convert-file
Content-Type: multipart/form-data

file: <binary .md file>
```

**Response**

```json
{
  "html": "<h1>...</h1>",
  "success": true,
  "filename": "README.html"
}
```

**cURL Example**

```bash
curl -X POST https://your-app.vercel.app/api/convert-file \
  -F "file=@README.md"
```

---

## Error Codes

| Status | Meaning                          |
|--------|----------------------------------|
| 400    | Missing or invalid input         |
| 405    | Wrong HTTP method (use POST)     |
| 200    | Success                          |

---

## License

MIT
