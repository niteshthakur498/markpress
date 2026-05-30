# Markpress — API Reference

Base URL: `https://your-app.vercel.app`  
Auth: **None required**  
CORS: `Access-Control-Allow-Origin: *`  
Max input size: **1 MB** per request

---

## Endpoints

### `POST /api/convert`

Convert a Markdown string to HTML.

**Request**

```http
POST /api/convert
Content-Type: application/json
```

```json
{
  "markdown": "# Hello World\nThis is **bold** text."
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `markdown` | string | Yes | Non-empty, ≤ 1 MB UTF-8 |

**Success Response — 200**

```json
{
  "html": "<h1>Hello World</h1>\n<p>This is <strong>bold</strong> text.</p>\n",
  "success": true
}
```

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `400` | `markdown` field missing or empty | `{"error":"markdown field is required","success":false}` |
| `400` | Body exceeds 1 MB | `{"error":"Input exceeds 1MB limit","success":false}` |
| `405` | Non-POST request | `{"error":"Method not allowed"}` |

**marked.js options applied**

```js
{ gfm: true, breaks: true }
```

GFM enables: tables, strikethrough, task lists, autolinks, fenced code blocks.

---

**Examples**

cURL:
```bash
curl -X POST https://your-app.vercel.app/api/convert \
  -H "Content-Type: application/json" \
  -d '{"markdown": "# Hello World\nThis is **bold** text."}'
```

JavaScript / TypeScript:
```ts
const res = await fetch("https://your-app.vercel.app/api/convert", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ markdown: "# Hello World" }),
});
const { html } = await res.json();
```

Python:
```python
import requests

r = requests.post(
    "https://your-app.vercel.app/api/convert",
    json={"markdown": "# Hello World\nThis is **bold** text."},
)
print(r.json()["html"])
```

---

### `POST /api/convert-file`

Upload a `.md`, `.markdown`, or `.txt` file for conversion.

**Request**

```http
POST /api/convert-file
Content-Type: multipart/form-data
```

| Form field | Type | Required | Constraints |
|------------|------|----------|-------------|
| `file` | binary file | Yes | `.md`, `.markdown`, or `.txt`; ≤ 1 MB |

> Body parser is disabled for this route. Parsed via `formidable`.

**Success Response — 200**

```json
{
  "html": "<h1>...</h1>\n<p>...</p>\n",
  "success": true,
  "filename": "README.html"
}
```

`filename` is the original filename with the extension replaced by `.html`.

**Error Responses**

| Status | Condition | Body |
|--------|-----------|------|
| `400` | No `file` field or unsupported extension | `{"error":"No file uploaded or invalid file type","success":false}` |
| `400` | File exceeds 1 MB | `{"error":"No file uploaded or invalid file type","success":false}` |
| `400` | Multipart parse failure | `{"error":"Failed to parse file upload","success":false}` |
| `405` | Non-POST request | `{"error":"Method not allowed"}` |

**Examples**

cURL:
```bash
curl -X POST https://your-app.vercel.app/api/convert-file \
  -F "file=@README.md"
```

JavaScript (browser):
```ts
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const res = await fetch("https://your-app.vercel.app/api/convert-file", {
  method: "POST",
  body: formData,
});
const { html, filename } = await res.json();
```

Python:
```python
import requests

with open("README.md", "rb") as f:
    r = requests.post(
        "https://your-app.vercel.app/api/convert-file",
        files={"file": ("README.md", f, "text/markdown")},
    )
print(r.json()["html"])
```

---

## Error Format

All error responses share this shape:

```json
{
  "error": "<human-readable message>",
  "success": false
}
```

The exception is `405 Method Not Allowed`, which omits `success`:

```json
{
  "error": "Method not allowed"
}
```

---

## CORS

Both endpoints return:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Preflight `OPTIONS` requests return `204 No Content`.
