# MD2HTML

**Markdown → HTML, instantly.**

A full-stack web tool for converting Markdown to HTML — with a beautiful two-panel editor UI, a drag-and-drop file loader, syntax-highlighted preview, and a developer-ready REST API.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/md2html)

---

## Features

- **Live two-panel editor** — type Markdown, see HTML preview instantly after conversion
- **Drag & drop** `.md` / `.markdown` / `.txt` files directly onto the editor
- **Preview & Raw HTML** tabs with syntax highlighting (highlight.js)
- **Copy HTML** to clipboard & **Download** a full standalone `.html` file
- **Light / Dark mode** toggle
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
git clone https://github.com/YOUR_USERNAME/md2html.git
cd md2html

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
