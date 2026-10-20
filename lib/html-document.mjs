/**
 * Standalone HTML document template.
 *
 * Kept free of dependencies so the editor page can import it without pulling
 * `marked` into the client bundle.
 */

/** Title used when no better one can be derived from the source. */
export const DEFAULT_TITLE = "Converted Document";

/**
 * Wrap an HTML fragment in a standalone, styled HTML document.
 *
 * This is the template the editor's "Download .html" button produces, so the
 * UI and the CLI emit identical documents.
 *
 * @param {string} html HTML fragment, as returned by convertMarkdown.
 * @param {string} [title] Document title.
 * @returns {string} A complete HTML document.
 */
export function wrapHtmlDocument(html, title = DEFAULT_TITLE) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #333; }
    h1,h2,h3,h4 { font-weight: 600; margin-top: 1.5em; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; }
    pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
    blockquote { border-left: 3px solid #6c63ff; padding-left: 16px; color: #666; margin: 16px 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f9f9f9; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}

/**
 * Pull a document title out of the first level-one ATX heading.
 *
 * @param {string} markdown
 * @returns {string | null} The heading text, or null if there is no H1.
 */
export function titleFromMarkdown(markdown) {
  const match = markdown.match(/^#\s+(.+?)\s*#*\s*$/m);
  if (!match) return null;
  const text = match[1].replace(/[*_`~]/g, "").trim();
  return text === "" ? null : text;
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
