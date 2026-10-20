#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { convertMarkdown } from "../lib/markdown.mjs";
import { titleFromMarkdown, wrapHtmlDocument } from "../lib/html-document.mjs";

const MARKDOWN_EXTENSIONS = [".md", ".markdown", ".txt"];

const USAGE = `markpress — convert Markdown files to styled HTML documents

Usage:
  markpress <file...> [options]
  cat file.md | markpress [options]

Options:
  -o, --out <file>      Write to <file> (single input only)
  -d, --out-dir <dir>   Write outputs into <dir> (created if missing)
      --stdout          Write to stdout instead of a file
      --fragment        Emit a bare HTML fragment, no document wrapper
      --title <title>   Document title (default: first H1, else the filename)
  -f, --force           Overwrite existing output files
  -h, --help            Show this help

With no options, each input is written next to itself with a .html extension.
`;

/**
 * @typedef {object} Options
 * @property {string[]} inputs
 * @property {string | null} out
 * @property {string | null} outDir
 * @property {boolean} stdout
 * @property {boolean} fragment
 * @property {string | null} title
 * @property {boolean} force
 * @property {boolean} help
 */

/**
 * @param {string[]} argv
 * @returns {Options}
 */
function parseArgs(argv) {
  /** @type {Options} */
  const options = {
    inputs: [],
    out: null,
    outDir: null,
    stdout: false,
    fragment: false,
    title: null,
    force: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-o":
      case "--out":
        options.out = requireValue(argv, ++i, arg);
        break;
      case "-d":
      case "--out-dir":
        options.outDir = requireValue(argv, ++i, arg);
        break;
      case "--title":
        options.title = requireValue(argv, ++i, arg);
        break;
      case "--stdout":
        options.stdout = true;
        break;
      case "--fragment":
        options.fragment = true;
        break;
      case "-f":
      case "--force":
        options.force = true;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        if (arg.startsWith("-") && arg !== "-") {
          throw new Error(`Unknown option: ${arg}`);
        }
        options.inputs.push(arg);
    }
  }

  return options;
}

/**
 * @param {string[]} argv
 * @param {number} index
 * @param {string} flag
 * @returns {string}
 */
function requireValue(argv, index, flag) {
  const value = argv[index];
  if (value === undefined || value.startsWith("-")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}

/**
 * Render one Markdown string to its final output form.
 *
 * @param {string} markdown
 * @param {Options} options
 * @param {string | null} fallbackTitle
 * @returns {Promise<string>}
 */
async function render(markdown, options, fallbackTitle) {
  const html = await convertMarkdown(markdown);
  if (options.fragment) return html;
  const title =
    options.title ?? titleFromMarkdown(markdown) ?? fallbackTitle ?? undefined;
  return wrapHtmlDocument(html, title);
}

/**
 * @param {string} inputPath
 * @param {Options} options
 * @returns {string}
 */
function outputPathFor(inputPath, options) {
  if (options.out) return options.out;
  const base = path.basename(inputPath, path.extname(inputPath)) + ".html";
  return path.join(options.outDir ?? path.dirname(inputPath), base);
}

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/** @returns {Promise<string>} */
async function readStdin() {
  /** @type {Buffer[]} */
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    process.stdout.write(USAGE);
    return;
  }

  if (options.out && options.inputs.length > 1) {
    throw new Error("--out takes a single input file; use --out-dir instead");
  }
  if (options.out && options.outDir) {
    throw new Error("--out and --out-dir cannot be combined");
  }

  // No files named: read Markdown from stdin and write to stdout.
  if (options.inputs.length === 0) {
    if (process.stdin.isTTY) {
      process.stderr.write(USAGE);
      process.exitCode = 1;
      return;
    }
    const markdown = await readStdin();
    const output = await render(markdown, options, null);
    if (options.out) {
      await writeOutput(options.out, output, options);
    } else {
      process.stdout.write(output);
    }
    return;
  }

  for (const input of options.inputs) {
    const ext = path.extname(input).toLowerCase();
    if (!MARKDOWN_EXTENSIONS.includes(ext)) {
      throw new Error(
        `${input}: expected one of ${MARKDOWN_EXTENSIONS.join(", ")}`
      );
    }

    const markdown = await fs.readFile(input, "utf8");
    const fallbackTitle = path.basename(input, ext);
    const output = await render(markdown, options, fallbackTitle);

    if (options.stdout) {
      process.stdout.write(output);
      continue;
    }

    const target = outputPathFor(input, options);
    await writeOutput(target, output, options);
    process.stderr.write(`${input} → ${target}\n`);
  }
}

/**
 * @param {string} target
 * @param {string} contents
 * @param {Options} options
 */
async function writeOutput(target, contents, options) {
  if (!options.force && (await exists(target))) {
    throw new Error(`${target} already exists (use --force to overwrite)`);
  }
  await fs.mkdir(path.dirname(path.resolve(target)), { recursive: true });
  await fs.writeFile(target, contents, "utf8");
}

main().catch((error) => {
  process.stderr.write(`markpress: ${error.message}\n`);
  process.exitCode = 1;
});
