import Head from "next/head";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type Tab = "curl" | "python" | "javascript";
type Toast = { id: number; message: string; type: "success" | "error" | "info" };

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hljs: any;
  }
}

const snippets: Record<"convert" | "convertFile", Record<Tab, string>> = {
  convert: {
    curl: `curl -X POST https://your-app.vercel.app/api/convert \\
  -H "Content-Type: application/json" \\
  -d '{"markdown": "# Hello World\\nThis is **bold** text."}'`,
    python: `import requests

response = requests.post(
    "https://your-app.vercel.app/api/convert",
    json={"markdown": "# Hello World\\nThis is **bold** text."}
)
data = response.json()
print(data["html"])`,
    javascript: `const response = await fetch(
  "https://your-app.vercel.app/api/convert",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      markdown: "# Hello World\\nThis is **bold** text."
    })
  }
);
const { html } = await response.json();
console.log(html);`,
  },
  convertFile: {
    curl: `curl -X POST https://your-app.vercel.app/api/convert-file \\
  -F "file=@README.md"`,
    python: `import requests

with open("README.md", "rb") as f:
    response = requests.post(
        "https://your-app.vercel.app/api/convert-file",
        files={"file": ("README.md", f, "text/markdown")}
    )
data = response.json()
print(data["html"])`,
    javascript: `const formData = new FormData();
formData.append("file", fileInput.files[0]);

const response = await fetch(
  "https://your-app.vercel.app/api/convert-file",
  { method: "POST", body: formData }
);
const { html, filename } = await response.json();
console.log(filename, html);`,
  },
};

export default function Docs() {
  const [isDark, setIsDark] = useState(true);
  const [convertTab, setConvertTab] = useState<Tab>("curl");
  const [convertFileTab, setConvertFileTab] = useState<Tab>("curl");
  const [testInput, setTestInput] = useState("## Try it live...\n\nThis is **awesome**!");
  const [testOutput, setTestOutput] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastRef = useRef(0);
  const codeRefs = useRef<Record<string, HTMLElement | null>>({});

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

  useEffect(() => {
    if (window.hljs) {
      Object.values(codeRefs.current).forEach((el) => {
        if (el) {
          el.removeAttribute("data-highlighted");
          window.hljs.highlightElement(el);
        }
      });
    }
  });

  const addToast = (message: string, type: Toast["type"] = "success") => {
    const id = ++toastRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    addToast(`${label} copied!`, "success");
  };

  const handleTest = async () => {
    setTestLoading(true);
    setTestOutput("");
    try {
      const res = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markdown: testInput }),
      });
      const data = await res.json();
      setTestOutput(JSON.stringify(data, null, 2));
    } catch {
      setTestOutput(JSON.stringify({ error: "Network error", success: false }, null, 2));
    } finally {
      setTestLoading(false);
    }
  };

  const surface = isDark ? "bg-surface" : "bg-bg-light";
  const card = isDark
    ? "bg-surface-dark border-outline-variant"
    : "bg-white border-gray-200";
  const text = isDark ? "text-on-surface" : "text-[#111319]";
  const muted = isDark ? "text-on-surface-variant" : "text-[#666]";
  const codeBg = isDark ? "bg-surface-container-lowest" : "bg-gray-900";
  const sidebarBg = isDark ? "bg-surface-container-low" : "bg-gray-50";

  const TabBar = ({
    active,
    setActive,
    endpoint,
  }: {
    active: Tab;
    setActive: (t: Tab) => void;
    endpoint: "convert" | "convertFile";
  }) => (
    <div
      className={`rounded-xl border border-outline-variant overflow-hidden ${
        isDark ? "bg-surface-container-lowest" : "bg-gray-900"
      }`}
    >
      <div className="flex border-b border-outline-variant">
        {(["curl", "python", "javascript"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`px-4 py-2 font-ui-label text-ui-label transition-colors ${
              active === t
                ? "text-primary border-b-2 border-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t === "javascript" ? "JS / TS" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button
          onClick={() => copyToClipboard(snippets[endpoint][active], active.toUpperCase())}
          className="ml-auto px-3 text-on-surface-variant hover:text-on-surface transition-colors"
          title="Copy snippet"
        >
          <span className="material-symbols-outlined text-[16px]">content_copy</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code
          ref={(el) => { codeRefs.current[`${endpoint}-${active}`] = el; }}
          className={`font-code-block text-code-block text-on-surface-variant ${
            active === "curl" ? "language-bash" : active === "python" ? "language-python" : "language-javascript"
          }`}
        >
          {snippets[endpoint][active]}
        </code>
      </pre>
    </div>
  );

  return (
    <>
      <Head>
        <title>Markpress | API Documentation</title>
        <meta name="description" content="API documentation for the Markpress Markdown to HTML conversion API." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen font-sans ${surface} ${text}`}>
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
              <Link
                href="/"
                className={`font-ui-label text-ui-label uppercase hover:text-primary transition-colors ${muted}`}
              >
                Editor
              </Link>
              <span className="text-primary font-bold border-b-2 border-primary pb-0.5 font-ui-label text-ui-label uppercase">
                API Docs
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden md:flex items-center gap-1.5 font-ui-label text-ui-label hover:text-primary transition-colors ${muted}`}
            >
              <span className="material-symbols-outlined text-[18px]">code</span>
              <span>GitHub</span>
            </a>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark ? "hover:bg-surface-variant text-on-surface-variant" : "hover:bg-gray-100 text-[#666]"
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        </header>

        <div className="flex pt-[48px]">
          {/* Sidebar */}
          <aside
            className={`hidden md:flex flex-col h-[calc(100vh-48px)] sticky top-[48px] w-64 flex-shrink-0 border-r border-outline-variant p-4 gap-1 ${sidebarBg}`}
          >
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-container text-[20px]">api</span>
              </div>
              <div>
                <p className={`font-headline-md text-[14px] font-semibold leading-none ${text}`}>
                  Developer Portal
                </p>
                <p className="font-ui-label text-[10px] text-on-surface-variant">v1.0.0 · No auth required</p>
              </div>
            </div>

            <nav className="flex flex-col gap-1">
              {[
                { icon: "edit_note", label: "Editor", href: "/" },
                { icon: "api", label: "Endpoints", href: "#endpoints", active: true },
                { icon: "science", label: "Try it Live", href: "#try-it" },
                { icon: "code", label: "Examples", href: "#examples" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all font-ui-label text-ui-label ${
                    item.active
                      ? "bg-secondary-container text-on-secondary-container"
                      : `${muted} hover:bg-surface-variant`
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-auto">
              <div className={`pt-4 border-t border-outline-variant text-[11px] ${muted} px-3 leading-relaxed`}>
                <p className="font-bold mb-1">No API key required.</p>
                <p>Free to use. CORS enabled. Max 1MB per request.</p>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-margin py-12">
              {/* Hero */}
              <section className="mb-16">
                <h1 className={`font-display-lg text-[40px] md:text-[48px] font-bold mb-4 ${text}`}>
                  Developer API
                </h1>
                <p className={`text-lg leading-relaxed max-w-2xl ${muted}`}>
                  Integrate fast, stateless Markdown-to-HTML conversion directly into your workflow.
                  No authentication required. CORS enabled for all origins.
                </p>

                <div
                  className={`mt-8 p-4 rounded-xl border border-outline-variant inline-flex items-center gap-4 ${
                    isDark ? "bg-surface-container-high" : "bg-gray-100"
                  }`}
                >
                  <span className="font-ui-label text-ui-label text-primary">Base URL:</span>
                  <code className="font-code-block text-code-block text-secondary">
                    https://your-app.vercel.app
                  </code>
                  <button
                    onClick={() => copyToClipboard("https://your-app.vercel.app", "Base URL")}
                    className={`material-symbols-outlined text-[18px] transition-colors ${muted} hover:text-on-surface`}
                    title="Copy base URL"
                  >
                    content_copy
                  </button>
                </div>

                {/* Quick stat badges */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { icon: "bolt", label: "Sub-50ms avg" },
                    { icon: "lock_open", label: "No auth required" },
                    { icon: "public", label: "CORS: *" },
                    { icon: "data_object", label: "JSON + Multipart" },
                  ].map((b) => (
                    <span
                      key={b.label}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant font-ui-label text-ui-label ${muted}`}
                    >
                      <span className="material-symbols-outlined text-[14px] text-primary">{b.icon}</span>
                      {b.label}
                    </span>
                  ))}
                </div>
              </section>

              {/* Endpoints section */}
              <section id="endpoints" className="mb-12 scroll-mt-16">
                <h2 className={`font-headline-md text-headline-md font-bold mb-8 flex items-center gap-2 ${text}`}>
                  <span className="material-symbols-outlined text-primary">api</span>
                  Endpoints
                </h2>

                {/* POST /api/convert */}
                <div
                  className={`rounded-xl border-l-[6px] border-primary border overflow-hidden mb-8 ${card}`}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-primary text-on-primary font-bold text-ui-label rounded">
                        POST
                      </span>
                      <code className="font-code-block text-lg text-on-surface">/api/convert</code>
                    </div>
                    <p className={`mb-6 ${muted}`}>
                      Convert a raw Markdown string to sanitized HTML. Accepts JSON body, returns JSON.
                    </p>

                    {/* Request */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-ui-label text-primary mb-2 uppercase tracking-widest text-[10px]">
                          Request Body
                        </h4>
                        <div className={`p-4 rounded-lg border border-outline-variant font-code-block text-code-block ${codeBg}`}>
                          <span className="text-syntax-keyword">{"{"}</span>
                          <br />
                          &nbsp;&nbsp;
                          <span className="text-tertiary">&quot;markdown&quot;</span>:{" "}
                          <span className="text-success">&quot;# Hello World\nThis is **bold**.&quot;</span>
                          <br />
                          <span className="text-syntax-keyword">{"}"}</span>
                        </div>
                      </div>

                      {/* Response */}
                      <div>
                        <h4 className="font-ui-label text-primary mb-2 uppercase tracking-widest text-[10px]">
                          Success Response (200)
                        </h4>
                        <div className={`p-4 rounded-lg border border-outline-variant font-code-block text-code-block ${codeBg}`}>
                          <span className="text-syntax-keyword">{"{"}</span>
                          <br />
                          &nbsp;&nbsp;<span className="text-tertiary">&quot;html&quot;</span>:{" "}
                          <span className="text-success">&quot;&lt;h1&gt;Hello World&lt;/h1&gt;\n&lt;p&gt;This is &lt;strong&gt;bold&lt;/strong&gt;.&lt;/p&gt;&quot;</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-tertiary">&quot;success&quot;</span>:{" "}
                          <span className="text-warning">true</span>
                          <br />
                          <span className="text-syntax-keyword">{"}"}</span>
                        </div>
                      </div>

                      {/* Errors */}
                      <div>
                        <h4 className="font-ui-label text-primary mb-2 uppercase tracking-widest text-[10px]">
                          Error Responses
                        </h4>
                        <div className="space-y-2">
                          {[
                            { status: "400", msg: '{ "error": "markdown field is required", "success": false }' },
                            { status: "400", msg: '{ "error": "Input exceeds 1MB limit", "success": false }' },
                            { status: "405", msg: '{ "error": "Method not allowed" }' },
                          ].map((e, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <span className="px-2 py-0.5 rounded bg-error/20 text-error font-ui-label text-ui-label flex-shrink-0">
                                {e.status}
                              </span>
                              <code className={`font-code-block text-[12px] ${muted}`}>{e.msg}</code>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code snippets */}
                      <div>
                        <h4 className="font-ui-label text-primary mb-2 uppercase tracking-widest text-[10px]">
                          Code Snippets
                        </h4>
                        <TabBar active={convertTab} setActive={setConvertTab} endpoint="convert" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* POST /api/convert-file */}
                <div className={`rounded-xl border-l-[6px] border-secondary border overflow-hidden ${card}`}>
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-secondary text-on-secondary font-bold text-ui-label rounded">
                        POST
                      </span>
                      <code className="font-code-block text-lg text-on-surface">/api/convert-file</code>
                    </div>
                    <p className={`mb-6 ${muted}`}>
                      Upload a <code className="text-on-surface">.md</code>,{" "}
                      <code className="text-on-surface">.markdown</code>, or{" "}
                      <code className="text-on-surface">.txt</code> file via multipart form data.
                    </p>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-ui-label text-secondary mb-2 uppercase tracking-widest text-[10px]">
                          Form Data Fields
                        </h4>
                        <div className={`p-4 rounded-lg border border-outline-variant font-code-block text-code-block ${codeBg}`}>
                          <span className="text-syntax-comment"># multipart/form-data</span>
                          <br />
                          <span className="text-tertiary">file</span>:{" "}
                          <span className="text-success">(binary — .md, .markdown, .txt, max 1MB)</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-ui-label text-secondary mb-2 uppercase tracking-widest text-[10px]">
                          Success Response (200)
                        </h4>
                        <div className={`p-4 rounded-lg border border-outline-variant font-code-block text-code-block ${codeBg}`}>
                          <span className="text-syntax-keyword">{"{"}</span>
                          <br />
                          &nbsp;&nbsp;<span className="text-tertiary">&quot;html&quot;</span>:{" "}
                          <span className="text-success">&quot;&lt;h1&gt;...&lt;/h1&gt;&quot;</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-tertiary">&quot;success&quot;</span>:{" "}
                          <span className="text-warning">true</span>,
                          <br />
                          &nbsp;&nbsp;<span className="text-tertiary">&quot;filename&quot;</span>:{" "}
                          <span className="text-success">&quot;README.html&quot;</span>
                          <br />
                          <span className="text-syntax-keyword">{"}"}</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-ui-label text-secondary mb-2 uppercase tracking-widest text-[10px]">
                          Code Snippets
                        </h4>
                        <TabBar
                          active={convertFileTab}
                          setActive={setConvertFileTab}
                          endpoint="convertFile"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Try it live */}
              <section id="try-it" className="mb-16 scroll-mt-16">
                <div
                  className={`rounded-2xl border border-outline-variant p-6 md:p-8 relative overflow-hidden ${
                    isDark ? "bg-surface-container-low" : "bg-gray-50"
                  }`}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                  <h2 className={`font-headline-md text-headline-md font-bold mb-6 flex items-center gap-2 ${text}`}>
                    <span className="material-symbols-outlined text-primary">science</span>
                    Test the API
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4">
                      <label className="font-ui-label text-on-surface-variant uppercase text-[10px] tracking-widest">
                        Markdown Input
                      </label>
                      <textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        className={`rounded-xl p-4 font-code-block text-code-block focus:border-primary focus:ring-0 h-40 resize-none border border-outline-variant ${
                          isDark ? "bg-surface text-on-surface" : "bg-white text-[#111]"
                        }`}
                        placeholder="## Try it live..."
                      />
                      <button
                        onClick={handleTest}
                        disabled={testLoading}
                        className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-on-primary font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {testLoading ? (
                          <>
                            <span className="spinner" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            Send Request
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex flex-col gap-4">
                      <label className="font-ui-label text-on-surface-variant uppercase text-[10px] tracking-widest">
                        JSON Response
                      </label>
                      <div
                        className={`rounded-xl border border-outline-variant p-4 h-40 overflow-y-auto font-code-block text-[12px] ${
                          isDark ? "bg-surface-container-lowest text-on-surface-variant" : "bg-gray-900 text-gray-300"
                        }`}
                      >
                        {testOutput ? (
                          <pre className="whitespace-pre-wrap">{testOutput}</pre>
                        ) : (
                          <span className="text-syntax-comment">
                            {`// Click "Send Request" to see output`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Examples section */}
              <section id="examples" className="mb-16 scroll-mt-16">
                <h2 className={`font-headline-md text-headline-md font-bold mb-6 flex items-center gap-2 ${text}`}>
                  <span className="material-symbols-outlined text-primary">integration_instructions</span>
                  Integration Examples
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "description",
                      title: "Documentation Sites",
                      desc: "Render user-written Markdown in your docs portal without a build step.",
                    },
                    {
                      icon: "edit_square",
                      title: "CMS Previews",
                      desc: "Show live HTML previews of Markdown content in your headless CMS.",
                    },
                    {
                      icon: "smart_toy",
                      title: "LLM Output",
                      desc: "Convert AI-generated Markdown responses to clean HTML for display.",
                    },
                  ].map((card) => (
                    <div
                      key={card.title}
                      className={`rounded-xl border border-outline-variant p-5 ${
                        isDark ? "bg-surface-container" : "bg-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-[28px] mb-3 block">
                        {card.icon}
                      </span>
                      <h3 className={`font-semibold mb-2 ${text}`}>{card.title}</h3>
                      <p className={`text-sm leading-relaxed ${muted}`}>{card.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer */}
            <footer
              className={`border-t border-outline-variant py-gutter px-margin flex flex-col md:flex-row justify-between items-center gap-4 ${
                isDark ? "bg-surface-container-lowest" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-ui-label font-bold text-on-surface">Markpress</span>
                <span className={`font-ui-label text-ui-label ${muted}`}>
                  © 2025 Markpress Utility. Built for developers.
                </span>
              </div>
              <nav className="flex gap-6">
                {["Privacy", "Terms", "Changelog", "Status"].map((l) => (
                  <a
                    key={l}
                    href="#"
                    className={`font-ui-label text-ui-label hover:text-on-surface underline ${muted}`}
                  >
                    {l}
                  </a>
                ))}
              </nav>
            </footer>
          </main>
        </div>

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border-l-4 shadow-xl min-w-[220px] toast-enter ${
                isDark
                  ? "bg-surface-container-high border border-outline-variant"
                  : "bg-white border border-gray-200"
              } ${t.type === "success" ? "border-l-success" : "border-l-error"}`}
            >
              <span
                className={`material-symbols-outlined text-[18px] flex-shrink-0 ${
                  t.type === "success" ? "text-success" : "text-error"
                }`}
              >
                {t.type === "success" ? "check_circle" : "error"}
              </span>
              <span className={`font-body-base text-body-base ${text}`}>{t.message}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
