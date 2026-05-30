import Head from "next/head";
import Link from "next/link";
import { useState, useEffect } from "react";

type Section = {
  id: string;
  label: string;
  icon: string;
};

const SECTIONS: Section[] = [
  { id: "overview", label: "Architecture Overview", icon: "schema" },
  { id: "stack", label: "Tech Stack", icon: "layers" },
  { id: "dataflow", label: "Data Flow", icon: "account_tree" },
  { id: "api-convert", label: "POST /api/convert", icon: "data_object" },
  { id: "api-convert-file", label: "POST /api/convert-file", icon: "upload_file" },
  { id: "errors", label: "Error Reference", icon: "report" },
  { id: "deployment", label: "Deployment", icon: "cloud_upload" },
];

export default function TechDocs() {
  const [isDark, setIsDark] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const root = document.documentElement;
    isDark ? root.classList.add("dark") : root.classList.remove("dark");
    isDark ? root.classList.remove("light") : root.classList.add("light");
  }, [isDark]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const surface = isDark ? "bg-surface text-on-surface" : "bg-bg-light text-[#111319]";
  const card = isDark ? "bg-surface-dark border-outline-variant" : "bg-white border-gray-200";
  const muted = isDark ? "text-on-surface-variant" : "text-[#666]";
  const codeBg = isDark ? "bg-surface-container-lowest" : "bg-gray-900";
  const sidebarBg = isDark ? "bg-surface-container-low" : "bg-gray-50";
  const inlineBadge = isDark ? "bg-surface-container text-primary" : "bg-purple-50 text-purple-700";

  const SectionHead = ({ id, title, icon }: { id: string; title: string; icon: string }) => (
    <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-20">
      <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-on-primary-container text-[20px]">{icon}</span>
      </div>
      <h2 className="font-display-lg text-[22px] font-bold">{title}</h2>
    </div>
  );

  const InlineCode = ({ children }: { children: string }) => (
    <code className={`font-code-block text-[12px] px-1.5 py-0.5 rounded ${inlineBadge}`}>
      {children}
    </code>
  );

  const CodeBlock = ({ children, lang = "bash" }: { children: string; lang?: string }) => (
    <pre className={`rounded-xl border border-outline-variant p-4 overflow-x-auto font-code-block text-code-block ${muted} ${codeBg} mb-4`}>
      <code className={`language-${lang}`}>{children}</code>
    </pre>
  );

  const Row = ({ label, value }: { label: string; value: string }) => (
    <tr className={`border-t border-outline-variant`}>
      <td className={`py-2.5 pr-4 font-code-block text-[12px] font-medium ${isDark ? "text-primary" : "text-purple-700"} whitespace-nowrap`}>
        {label}
      </td>
      <td className={`py-2.5 text-body-base ${muted}`}>{value}</td>
    </tr>
  );

  return (
    <>
      <Head>
        <title>Markpress — Technical Documentation</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={`min-h-screen font-sans ${surface}`}>
        {/* Navbar */}
        <header className={`fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-[48px] border-b border-outline-variant gradient-border-top ${isDark ? "bg-surface" : "bg-white"}`}>
          <div className="flex items-center gap-4">
            <span className="font-display-lg text-[22px] font-bold gradient-text tracking-tight">
              Markpress
            </span>
            <span className={`px-2 py-0.5 rounded border border-outline-variant font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>
              Internal Docs
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className={`font-ui-label text-ui-label hover:text-primary transition-colors ${muted}`}>
              ← Back to App
            </Link>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "hover:bg-surface-variant text-on-surface-variant" : "hover:bg-gray-100 text-[#666]"}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDark ? "light_mode" : "dark_mode"}
              </span>
            </button>
          </div>
        </header>

        <div className="flex pt-[48px]">
          {/* Sidebar TOC */}
          <aside className={`hidden lg:flex flex-col h-[calc(100vh-48px)] sticky top-[48px] w-60 flex-shrink-0 border-r border-outline-variant p-4 gap-1 ${sidebarBg}`}>
            <p className={`font-ui-label text-[10px] uppercase tracking-widest mb-3 px-2 ${muted}`}>
              Contents
            </p>
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all font-ui-label text-ui-label ${
                  activeSection === s.id
                    ? "bg-secondary-container text-on-secondary-container"
                    : `${muted} hover:bg-surface-variant`
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{s.icon}</span>
                <span className="truncate">{s.label}</span>
              </a>
            ))}
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-3xl mx-auto px-6 md:px-margin py-12 space-y-16">

              {/* OVERVIEW */}
              <section>
                <SectionHead id="overview" title="Architecture Overview" icon="schema" />
                <p className={`mb-6 leading-relaxed ${muted}`}>
                  Markpress is a <strong className="text-on-surface">monorepo single-app</strong> built with Next.js Pages Router.
                  There is no separate backend process — the API lives inside Next.js API routes, which Vercel deploys as
                  independent serverless functions. The frontend and API share the same origin and port.
                </p>

                {/* Architecture diagram */}
                <div className={`rounded-xl border border-outline-variant p-6 font-code-block text-[12px] leading-7 ${codeBg} ${muted} mb-6`}>
                  <div className="text-primary font-bold mb-2">┌─ Browser ──────────────────────────────────────┐</div>
                  <div className="ml-2">│  <span className="text-on-surface">pages/index.tsx</span>    → Editor UI (React)          │</div>
                  <div className="ml-2">│  <span className="text-on-surface">pages/docs.tsx</span>     → API Docs UI (React)        │</div>
                  <div className="ml-2">│  <span className="text-on-surface">pages/tech-docs.tsx</span> → Internal Docs (this page) │</div>
                  <div className="text-primary font-bold mt-2 mb-2">├─ Next.js API Routes (Node.js, serverless) ─────┤</div>
                  <div className="ml-2">│  <span className="text-tertiary">POST /api/convert</span>       → marked.js parse        │</div>
                  <div className="ml-2">│  <span className="text-tertiary">POST /api/convert-file</span>  → formidable + marked.js │</div>
                  <div className="text-primary font-bold mt-2">└────────────────────────────────────────────────┘</div>
                </div>

                <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                  <p className={`font-ui-label text-[10px] uppercase tracking-widest mb-3 text-primary`}>Key Design Principles</p>
                  <ul className={`space-y-2 text-body-base ${muted}`}>
                    <li className="flex gap-2"><span className="text-success">✓</span> <span><strong className="text-on-surface">Stateless</strong> — no database, no sessions, no auth. Every request is self-contained.</span></li>
                    <li className="flex gap-2"><span className="text-success">✓</span> <span><strong className="text-on-surface">Single origin</strong> — frontend and API on the same host; no CORS complexity for the UI itself.</span></li>
                    <li className="flex gap-2"><span className="text-success">✓</span> <span><strong className="text-on-surface">Public CORS</strong> — <InlineCode>Access-Control-Allow-Origin: *</InlineCode> so third-party clients can call the API directly.</span></li>
                    <li className="flex gap-2"><span className="text-success">✓</span> <span><strong className="text-on-surface">1 MB cap</strong> — enforced at both the Next.js body-parser level and inside each handler.</span></li>
                  </ul>
                </div>
              </section>

              {/* STACK */}
              <section>
                <SectionHead id="stack" title="Tech Stack" icon="layers" />
                <div className={`rounded-xl border border-outline-variant overflow-hidden ${card}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`${isDark ? "bg-surface-container" : "bg-gray-50"}`}>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>Layer</th>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>Technology</th>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>Purpose</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Framework", "Next.js 16 (Pages Router)", "SSR, routing, API routes, Vercel integration"],
                        ["Language", "TypeScript 5", "Type safety across frontend and API"],
                        ["Styling", "Tailwind CSS v3", "Utility-first CSS with custom design tokens"],
                        ["Markdown", "marked.js ^12", "GFM-compliant Markdown → HTML parsing"],
                        ["Syntax HL", "highlight.js 11 (CDN)", "HTML code highlighting in Raw HTML tab"],
                        ["File parse", "formidable ^3", "Multipart form-data parsing for file uploads"],
                        ["Fonts", "Inter + JetBrains Mono", "UI typography and code display (Google Fonts)"],
                        ["Icons", "Material Symbols Outlined", "UI icons (Google CDN)"],
                        ["Hosting", "Vercel", "Edge network, serverless functions, CI/CD"],
                      ].map(([layer, tech, purpose]) => (
                        <tr key={layer} className={`border-t border-outline-variant`}>
                          <td className={`py-2.5 px-4 font-ui-label text-[11px] text-primary whitespace-nowrap`}>{layer}</td>
                          <td className={`py-2.5 px-4 font-code-block text-[12px] text-on-surface`}>{tech}</td>
                          <td className={`py-2.5 px-4 text-body-base ${muted}`}>{purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* DATA FLOW */}
              <section>
                <SectionHead id="dataflow" title="Data Flow" icon="account_tree" />

                <div className="space-y-4 mb-6">
                  {/* Text conversion flow */}
                  <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-4">Text Conversion Flow</p>
                    <div className={`space-y-2 font-code-block text-[12px] ${muted}`}>
                      {[
                        ["User", "Types/pastes Markdown into textarea"],
                        ["Browser", "onClick → fetch POST /api/convert {markdown}"],
                        ["API Route", "Validates field exists, size ≤ 1 MB"],
                        ["marked.js", "parse(markdown, {gfm:true, breaks:true})"],
                        ["API Route", "Returns {html, success:true}"],
                        ["Browser", "Sets html state → renders Preview or Raw HTML tab"],
                      ].map(([actor, action], i, arr) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className={`w-24 flex-shrink-0 ${isDark ? "text-tertiary" : "text-orange-600"}`}>{actor}</span>
                          <span>{action}</span>
                          {i < arr.length - 1 && (
                            <span className="ml-auto text-outline">↓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* File upload flow */}
                  <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-secondary mb-4">File Upload Flow</p>
                    <div className={`space-y-2 font-code-block text-[12px] ${muted}`}>
                      {[
                        ["User", "Drags .md file onto left panel, or clicks Upload .md"],
                        ["Browser", "FileReader.text() reads file content into textarea state"],
                        ["User", "Clicks Convert to HTML →"],
                        ["Browser", "fetch POST /api/convert {markdown: fileContent}"],
                        ["API Route", "Same as text flow above"],
                      ].map(([actor, action]) => (
                        <div key={action} className="flex gap-3 items-start">
                          <span className={`w-24 flex-shrink-0 ${isDark ? "text-secondary" : "text-indigo-600"}`}>{actor}</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                    <p className={`mt-3 text-[11px] ${muted}`}>
                      Note: <InlineCode>/api/convert-file</InlineCode> is the dedicated multipart endpoint — the frontend currently reads the file client-side and sends it as text to <InlineCode>/api/convert</InlineCode>. The file endpoint is available for direct API consumers.
                    </p>
                  </div>
                </div>
              </section>

              {/* API: /api/convert */}
              <section>
                <SectionHead id="api-convert" title="POST /api/convert" icon="data_object" />
                <div className={`rounded-xl border-l-[6px] border-primary border overflow-hidden mb-6 ${card}`}>
                  <div className="p-6">
                    <div className={`grid grid-cols-2 gap-4 mb-6 text-sm ${muted}`}>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-primary">Method</span>POST</div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-primary">Auth</span>None</div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-primary">Content-Type</span><InlineCode>application/json</InlineCode></div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-primary">Max body</span>1 MB</div>
                    </div>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-2">Request Schema</p>
                    <CodeBlock lang="json">{`{
  "markdown": string   // required, non-empty, ≤ 1 MB UTF-8
}`}</CodeBlock>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-2">Success Response — 200</p>
                    <CodeBlock lang="json">{`{
  "html":    string,   // converted HTML string
  "success": true
}`}</CodeBlock>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-2">Error Responses</p>
                    <div className={`rounded-xl border border-outline-variant overflow-hidden ${codeBg}`}>
                      <table className="w-full font-code-block text-[12px]">
                        <thead>
                          <tr className={`border-b border-outline-variant`}>
                            <th className={`text-left py-2 px-4 ${muted}`}>Status</th>
                            <th className={`text-left py-2 px-4 ${muted}`}>Condition</th>
                            <th className={`text-left py-2 px-4 ${muted}`}>Body</th>
                          </tr>
                        </thead>
                        <tbody>
                          <Row label="400" value='markdown missing or empty → {"error":"markdown field is required","success":false}' />
                          <Row label="400" value='body > 1 MB → {"error":"Input exceeds 1MB limit","success":false}' />
                          <Row label="405" value='Non-POST method → {"error":"Method not allowed"}' />
                        </tbody>
                      </table>
                    </div>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mt-6 mb-2">marked.js Options Applied</p>
                    <CodeBlock lang="javascript">{`marked.setOptions({
  gfm:    true,   // GitHub Flavored Markdown (tables, strikethrough, etc.)
  breaks: true,   // convert \\n to <br> inside paragraphs
})`}</CodeBlock>
                  </div>
                </div>
              </section>

              {/* API: /api/convert-file */}
              <section>
                <SectionHead id="api-convert-file" title="POST /api/convert-file" icon="upload_file" />
                <div className={`rounded-xl border-l-[6px] border-secondary border overflow-hidden mb-6 ${card}`}>
                  <div className="p-6">
                    <div className={`grid grid-cols-2 gap-4 mb-6 text-sm ${muted}`}>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-secondary">Method</span>POST</div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-secondary">Auth</span>None</div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-secondary">Content-Type</span><InlineCode>multipart/form-data</InlineCode></div>
                      <div><span className="font-ui-label text-[10px] uppercase tracking-widest block mb-1 text-secondary">Max file</span>1 MB</div>
                    </div>

                    <p className={`mb-4 text-sm ${muted}`}>
                      Uses <InlineCode>formidable</InlineCode> to parse the multipart stream. Next.js body-parser is disabled for this route via <InlineCode>export const config = {"{ api: { bodyParser: false } }"}</InlineCode>.
                    </p>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-secondary mb-2">Form Field</p>
                    <CodeBlock lang="bash">{`file  — binary .md / .markdown / .txt file (required)`}</CodeBlock>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-secondary mb-2">Success Response — 200</p>
                    <CodeBlock lang="json">{`{
  "html":     string,   // converted HTML
  "success":  true,
  "filename": string    // e.g. "README.html" (input name with .html extension)
}`}</CodeBlock>

                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-secondary mb-2">Error Responses</p>
                    <div className={`rounded-xl border border-outline-variant overflow-hidden ${codeBg}`}>
                      <table className="w-full font-code-block text-[12px]">
                        <thead>
                          <tr className="border-b border-outline-variant">
                            <th className={`text-left py-2 px-4 ${muted}`}>Status</th>
                            <th className={`text-left py-2 px-4 ${muted}`}>Condition</th>
                          </tr>
                        </thead>
                        <tbody>
                          <Row label="400" value="No file field in form, or wrong extension (.pdf, .docx, etc.)" />
                          <Row label="400" value="File exceeds 1 MB (formidable rejects at parse time)" />
                          <Row label="400" value="Multipart parse failure (malformed request)" />
                          <Row label="405" value="Non-POST method" />
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              {/* ERROR REFERENCE */}
              <section>
                <SectionHead id="errors" title="Error Reference" icon="report" />
                <div className={`rounded-xl border border-outline-variant overflow-hidden ${card}`}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className={`${isDark ? "bg-surface-container" : "bg-gray-50"}`}>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>HTTP</th>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>error field</th>
                        <th className={`text-left py-2.5 px-4 font-ui-label text-[10px] uppercase tracking-widest ${muted}`}>Endpoint</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["400", "markdown field is required", "/api/convert"],
                        ["400", "Input exceeds 1MB limit", "/api/convert"],
                        ["400", "No file uploaded or invalid file type", "/api/convert-file"],
                        ["400", "Failed to parse file upload", "/api/convert-file"],
                        ["405", "Method not allowed", "Both"],
                      ].map(([status, error, endpoint]) => (
                        <tr key={error} className="border-t border-outline-variant">
                          <td className={`py-2.5 px-4 font-code-block text-[12px] ${status === "400" ? "text-warning" : "text-error"}`}>{status}</td>
                          <td className={`py-2.5 px-4 font-code-block text-[12px] ${muted}`}>{error}</td>
                          <td className={`py-2.5 px-4 font-code-block text-[11px] text-primary`}>{endpoint}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* DEPLOYMENT */}
              <section>
                <SectionHead id="deployment" title="Deployment" icon="cloud_upload" />
                <div className="space-y-4">
                  <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-3">Vercel (Recommended)</p>
                    <CodeBlock lang="bash">{`# Option A — Vercel CLI
npm i -g vercel
vercel

# Option B — GitHub integration
# Connect niteshthakur498/markpress on vercel.com
# Every push to master auto-deploys`}</CodeBlock>
                    <p className={`text-sm ${muted}`}>
                      <InlineCode>vercel.json</InlineCode> sets <InlineCode>maxDuration: 10</InlineCode> on the file upload function.
                      All other routes use Vercel defaults (no custom config needed).
                    </p>
                  </div>

                  <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-3">Local Development</p>
                    <CodeBlock lang="bash">{`git clone https://github.com/niteshthakur498/markpress.git
cd markpress
npm install
npm run dev        # → http://localhost:3000
npm run build      # production build
npm run start      # serve production build locally`}</CodeBlock>
                  </div>

                  <div className={`rounded-xl border border-outline-variant p-5 ${card}`}>
                    <p className="font-ui-label text-[10px] uppercase tracking-widest text-primary mb-3">Environment Variables</p>
                    <p className={`text-sm mb-3 ${muted}`}>
                      None required. The app is fully stateless — no external services, no secrets.
                    </p>
                    <div className={`rounded-lg border border-outline-variant p-3 font-code-block text-[12px] text-success ${codeBg}`}>
                      # No .env file needed — deploy as-is
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <footer className={`border-t border-outline-variant py-gutter px-margin flex justify-between items-center ${isDark ? "bg-surface-container-lowest" : "bg-gray-50"}`}>
              <span className={`font-ui-label text-ui-label ${muted}`}>
                Markpress · Internal Technical Documentation · <span className="text-on-surface-variant">Not indexed by search engines</span>
              </span>
              <Link href="/" className={`font-ui-label text-ui-label hover:text-primary transition-colors ${muted}`}>
                ← Back to App
              </Link>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
