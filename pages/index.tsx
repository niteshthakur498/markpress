import Head from "next/head";
import Link from "next/link";
import {
  useState,
  useRef,
  useEffect,
  useCallback,
  DragEvent,
  ChangeEvent,
} from "react";
import { titleFromMarkdown, wrapHtmlDocument } from "@/lib/html-document.mjs";

const SAMPLE_MARKDOWN = `# Welcome to Markpress

Convert your **Markdown** to clean HTML instantly.

## Features
- Paste or type Markdown
- Drag & drop \`.md\` files
- Live HTML preview
- Download as \`.html\`
- REST API for programmatic use

> Built for developers, by developers.

## Code Example
\`\`\`javascript
const response = await fetch('/api/convert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ markdown: '# Hello' })
});
const { html } = await response.json();
\`\`\`

## Table
| Feature | Status |
|---------|--------|
| GFM     | ✅     |
| Tables  | ✅     |
| Code HL | ✅     |
`;

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

type Tab = "preview" | "raw";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hljs: any;
  }
}

export default function Home() {
  const [isDark, setIsDark] = useState(true);
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [html, setHtml] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("preview");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [charCount, setCharCount] = useState(SAMPLE_MARKDOWN.length);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rawCodeRef = useRef<HTMLElement>(null);
  const toastCounterRef = useRef(0);

  // Apply dark/light class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [isDark]);

  // Highlight raw HTML when it changes and tab is raw
  useEffect(() => {
    if (activeTab === "raw" && html && rawCodeRef.current && window.hljs) {
      rawCodeRef.current.removeAttribute("data-highlighted");
      window.hljs.highlightElement(rawCodeRef.current);
    }
  }, [activeTab, html]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = ++toastCounterRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const handleConvert = async () => {
    if (!markdown.trim()) {
      addToast("Please enter some Markdown first.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        addToast(data.error ?? "Conversion failed.", "error");
      } else {
        setHtml(data.html);
        setActiveTab("preview");
      }
    } catch {
      addToast("Network error. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["md", "txt", "markdown"].includes(ext ?? "")) {
      addToast("Only .md, .markdown, and .txt files are supported.", "error");
      return;
    }
    if (file.size > 1024 * 1024) {
      addToast("File exceeds 1MB limit.", "error");
      return;
    }
    const text = await file.text();
    setMarkdown(text);
    setCharCount(text.length);
    addToast(`Loaded "${file.name}" successfully.`, "success");
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = "";
  };

  const handleDragOver = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleCopyHtml = async () => {
    if (!html) {
      addToast("Nothing to copy. Convert first.", "info");
      return;
    }
    await navigator.clipboard.writeText(html);
    addToast("HTML copied to clipboard!", "success");
  };

  const handleDownload = () => {
    if (!html) {
      addToast("Nothing to download. Convert first.", "info");
      return;
    }
    const fullHtml = wrapHtmlDocument(
      html,
      titleFromMarkdown(markdown) ?? undefined
    );
    const blob = new Blob([fullHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "converted.html";
    a.click();
    URL.revokeObjectURL(url);
    addToast("Downloaded converted.html", "success");
  };

  const handleMarkdownChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCharCount(e.target.value.length);
  };

  const toastBorderColor = (type: Toast["type"]) => {
    if (type === "success") return "border-l-success";
    if (type === "error") return "border-l-error";
    return "border-l-primary";
  };

  const toastIcon = (type: Toast["type"]) => {
    if (type === "success") return "check_circle";
    if (type === "error") return "error";
    return "info";
  };

  const bgClass = isDark
    ? "bg-surface text-on-surface"
    : "bg-bg-light text-[#111319]";

  return (
    <>
      <Head>
        <title>Markpress | Markdown to HTML Converter</title>
        <meta
          name="description"
          content="Markpress — Convert Markdown to clean HTML instantly. Free, fast, and developer-friendly."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`h-screen flex flex-col overflow-hidden font-sans ${bgClass}`}>
        {/* Navbar */}
        <header
          className={`fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-[48px] border-b border-outline-variant gradient-border-top ${
            isDark ? "bg-surface" : "bg-white"
          }`}
        >
          <div className="flex items-center gap-6">
            <span className="font-display-lg text-[22px] font-bold gradient-text tracking-tight">
              Markpress
            </span>
            <nav className="hidden md:flex items-center gap-6">
              <span className="text-primary font-bold border-b-2 border-primary pb-0.5 font-ui-label text-ui-label uppercase">
                Editor
              </span>
              <Link
                href="/docs"
                className={`font-ui-label text-ui-label uppercase hover:text-primary transition-colors duration-200 ${
                  isDark ? "text-on-surface-variant" : "text-[#666]"
                }`}
              >
                API Docs
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-1.5 font-ui-label text-ui-label hover:text-primary transition-colors ${
                isDark ? "text-on-surface-variant" : "text-[#666]"
              }`}
              title="GitHub"
            >
              <span className="material-symbols-outlined text-[18px]">
                code
              </span>
              <span>GitHub</span>
            </a>

            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? "hover:bg-surface-variant text-on-surface-variant"
                  : "hover:bg-gray-100 text-[#666]"
              }`}
              title="Toggle theme"
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        </header>

        {/* Main two-panel layout */}
        <main className="flex-1 mt-[48px] flex flex-col md:flex-row relative overflow-hidden">
          {/* LEFT — Markdown Input */}
          <section
            id="input-panel"
            className={`flex-1 flex flex-col relative ${
              isDark ? "bg-surface" : "bg-white"
            } ${isDragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Panel header */}
            <header
              className={`h-10 px-gutter flex items-center justify-between border-b border-outline-variant ${
                isDark ? "bg-surface-container-low" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  edit_note
                </span>
                <span className="font-ui-label text-ui-label text-on-surface-variant uppercase tracking-widest">
                  Markdown
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-ui-label font-ui-label border border-outline-variant transition-colors ${
                    isDark
                      ? "text-on-surface-variant hover:bg-surface-variant"
                      : "text-[#666] hover:bg-gray-100"
                  }`}
                  title="Upload .md file"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    upload_file
                  </span>
                  <span className="hidden sm:inline">Upload .md</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.markdown"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
            </header>

            {/* Textarea */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <textarea
                value={markdown}
                onChange={handleMarkdownChange}
                spellCheck={false}
                className={`flex-1 w-full p-gutter bg-transparent border-none focus:ring-0 font-code-block text-code-block resize-none ${
                  isDark
                    ? "text-on-surface placeholder:text-outline-variant/40"
                    : "text-[#111319] placeholder:text-gray-400"
                }`}
                placeholder={`# Start typing your markdown here...

- **Bold**, *italic*, ~~strikethrough~~
- [Links](https://example.com)
- \`inline code\` or fenced code blocks
- > Blockquotes
- Tables, task lists, and more`}
              />
            </div>

            {/* Char count + Convert button */}
            <div
              className={`border-t border-outline-variant ${
                isDark ? "bg-surface-container-low" : "bg-gray-50"
              }`}
            >
              <div className="px-gutter py-2 flex items-center justify-between">
                <span
                  className={`font-ui-label text-ui-label ${
                    isDark ? "text-on-surface-variant" : "text-[#888]"
                  }`}
                >
                  {charCount.toLocaleString()} chars
                </span>
                {isDragOver && (
                  <span className="font-ui-label text-ui-label text-primary animate-pulse">
                    Drop to load file
                  </span>
                )}
              </div>
              <div className="px-gutter pb-gutter">
                <button
                  onClick={handleConvert}
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner" />
                      <span>Converting…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[20px]">
                        transform
                      </span>
                      <span>Convert to HTML →</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* Panel divider */}
          <div className="panel-divider hidden md:block" />

          {/* RIGHT — HTML Output */}
          <section
            className={`flex-1 flex flex-col relative ${
              isDark ? "bg-surface-container-low" : "bg-gray-50"
            }`}
          >
            {/* Panel header */}
            <header
              className={`h-10 px-gutter flex items-center justify-between border-b border-outline-variant ${
                isDark ? "bg-surface-container" : "bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-1.5">
                {/* Tabs */}
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-ui-label font-ui-label transition-all ${
                    activeTab === "preview"
                      ? "bg-primary text-on-primary"
                      : isDark
                      ? "text-on-surface-variant hover:bg-surface-variant"
                      : "text-[#666] hover:bg-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    visibility
                  </span>
                  Preview
                </button>
                <button
                  onClick={() => setActiveTab("raw")}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-ui-label font-ui-label transition-all ${
                    activeTab === "raw"
                      ? "bg-primary text-on-primary"
                      : isDark
                      ? "text-on-surface-variant hover:bg-surface-variant"
                      : "text-[#666] hover:bg-gray-200"
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    code
                  </span>
                  Raw HTML
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHtml}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-ui-label font-ui-label border border-outline-variant transition-colors ${
                    isDark
                      ? "text-on-surface-variant hover:bg-surface-variant"
                      : "text-[#666] hover:bg-gray-200"
                  }`}
                  title="Copy HTML"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    content_copy
                  </span>
                  <span className="hidden sm:inline">Copy HTML</span>
                </button>
                <button
                  onClick={handleDownload}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-ui-label font-ui-label border border-outline-variant transition-colors ${
                    isDark
                      ? "text-on-surface-variant hover:bg-surface-variant"
                      : "text-[#666] hover:bg-gray-200"
                  }`}
                  title="Download .html"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    download
                  </span>
                  <span className="hidden sm:inline">Download .html</span>
                </button>
              </div>
            </header>

            {/* Output content */}
            <div className="flex-1 overflow-auto p-gutter custom-scrollbar">
              {!html ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isDark ? "bg-surface-container" : "bg-gray-200"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[32px] text-primary">
                      html
                    </span>
                  </div>
                  <div>
                    <p
                      className={`font-headline-md text-headline-md mb-1 ${
                        isDark ? "text-on-surface" : "text-[#111]"
                      }`}
                    >
                      Ready to convert
                    </p>
                    <p className="text-on-surface-variant max-w-xs">
                      Start typing in the markdown panel or upload a file, then
                      click Convert to HTML.
                    </p>
                  </div>
                </div>
              ) : activeTab === "preview" ? (
                <div
                  className={`preview-content max-w-none ${
                    isDark ? "text-on-surface" : "text-[#111319]"
                  }`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : (
                <pre
                  className={`text-sm overflow-x-auto rounded-lg border border-outline-variant ${
                    isDark ? "bg-surface-container-lowest" : "bg-gray-900"
                  }`}
                  style={{ padding: "1rem" }}
                >
                  <code ref={rawCodeRef} className="language-html">
                    {html}
                  </code>
                </pre>
              )}
            </div>
          </section>
        </main>

        {/* Toast notifications */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-xl min-w-[240px] max-w-sm toast-enter ${
                isDark
                  ? "bg-surface-container-high border border-outline-variant"
                  : "bg-white border border-gray-200"
              } ${toastBorderColor(toast.type)}`}
            >
              <span
                className={`material-symbols-outlined text-[18px] flex-shrink-0 ${
                  toast.type === "success"
                    ? "text-success"
                    : toast.type === "error"
                    ? "text-error"
                    : "text-primary"
                }`}
              >
                {toastIcon(toast.type)}
              </span>
              <span
                className={`font-body-base text-body-base ${
                  isDark ? "text-on-surface" : "text-[#111]"
                }`}
              >
                {toast.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
