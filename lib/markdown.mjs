import { marked } from "marked";

/** Maximum accepted input size, in bytes. */
export const MAX_SIZE = 1 * 1024 * 1024; // 1MB

/** Marked options shared by the editor, the API routes and the CLI. */
export const MARKED_OPTIONS = { gfm: true, breaks: true };

/**
 * Convert Markdown to an HTML fragment.
 *
 * @param {string} markdown
 * @returns {Promise<string>} HTML fragment, without a document wrapper.
 */
export async function convertMarkdown(markdown) {
  marked.setOptions(MARKED_OPTIONS);
  return marked.parse(markdown);
}
