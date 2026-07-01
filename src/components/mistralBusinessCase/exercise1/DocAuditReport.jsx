import { useState } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const FINDINGS = [
  {
    id: "F-09",
    title: "The first-API-request sample fails when you run it",
    severity: "Critical",
    category: "Acquisition",
    evidence:
      "Verified by execution, not just by fetch — I ran the quickstart at /getting-started/quickstarts/developer/first-api-request exactly as printed, and its import raised an error. The form that actually worked is the one already shown on the SDKs page. Whichever import is canonically correct, the two pages a first-time developer meets first contradict each other, and the one with the failing sample is the proof-of-life moment where an evaluator decides whether Mistral works at all.",
    recommendation:
      "Make the quickstart the single canonical, executable source of truth and run it in CI (a doctest that actually executes), so a sample can never ship broken again — then reconcile the SDKs page to the same import. On the proof-of-life page, a sample that doesn't run is worse than no sample: it converts an interested evaluator into a closed tab.",
  },
  {
    id: "F-10",
    title: "First-request page assumes a developer, blocking the Vibe-coder persona",
    severity: "High",
    category: "Onboarding",
    evidence:
      "The page opens straight into import code with no environment setup — no Python version, no virtualenv, no `pip install mistralai`, no guidance on where the API key should live. A career developer fills these gaps from habit. A Vibe-coder — the AI-first builder Mistral's own products create — who lands here from search cannot proceed, and nothing on the page tells them what is missing.",
    recommendation:
      "Add a 'Step 0: set up your environment' (Python version, venv, install, API-key handling) — this is exactly where the currently-standalone 'Activate Studio & generate key' page (D-10) belongs. Ship a downloadable, venv-ready scaffold zip with a .env template so the reader goes from zero to a running call without assembling the setup themselves.",
  },
  {
    id: "F-01",
    title: "Models Overview page is a decision blocker",
    severity: "High",
    category: "Acquisition",
    evidence:
      "45-row Legacy/Deprecated table sits on the main Models Overview page between an evaluator and the six current models that matter. Confirmed by direct page fetch.",
    recommendation:
      "Move the deprecated table to a dedicated /models/legacy page linked from a footer note. The main page shows current models only.",
  },
  {
    id: "F-02",
    title: "Navigation restructures break mid-task journeys",
    severity: "High",
    category: "Trust",
    evidence:
      "Readers following a 'next step' link encounter pages that have moved with no redirect in place. Trust damage compounds: a reader who loses their place once navigates defensively thereafter.",
    recommendation:
      "Run a redirect audit before any restructure goes live. Every old URL must 301 to the correct destination. Verify with a crawl, not manually.",
  },
  {
    id: "F-03",
    title: "Devstral 2 appears as both current and deprecated",
    severity: "High",
    category: "Content Accuracy",
    evidence:
      "Devstral 2 appears simultaneously in the 'Featured Models' carousel (tagged as recommended) and in the Legacy/Deprecated table, both showing identical version 25.12. Confirmed via two direct fetches — not a scraping artifact.",
    recommendation:
      "Remove Devstral 2 from the deprecated table, or add a version qualifier distinguishing the two entries.",
  },
  {
    id: "F-04",
    title: "Migration guide and retry samples are unfindable",
    severity: "High",
    category: "Support Deflection",
    evidence:
      "A working OpenAI-to-Mistral migration guide and a complete exponential-backoff retry sample both exist under Developers → Resources — a location a developer mid-incident has no reason to look.",
    recommendation:
      "Two cross-links, not new content: one from Models Overview for the migration guide, one from the Production section for the retry sample. Roughly a quarter of the effort a 'missing content' diagnosis would suggest.",
  },
  {
    id: "F-05",
    title: "Rate limits documented under Admin, not Production",
    severity: "Medium",
    category: "Support Deflection",
    evidence:
      "Rate limit documentation exists and is correct. It is filed under Admin — a location developers don't navigate to while debugging a 429 at 11pm.",
    recommendation:
      "Cross-link from the Production section and the error reference page. The content doesn't move; the path to it does.",
  },
  {
    id: "F-06",
    title: "Docs aren't structured for AI agent consumption",
    severity: "Medium",
    category: "Agent Readiness",
    evidence:
      "Mistral's own Vibe Code reads these docs to generate correct code. The site has no llms.txt, no per-page Markdown export, and no Copy-for-LLM affordance. Mistral's /robots already distinguishes MistralAI-User from MistralAI-Index — the product has committed to this world; the docs haven't caught up.",
    recommendation:
      "Add llms.txt, per-page Markdown export, and a Copy-for-LLM button. Near-zero marginal cost against content already stored as Markdown. Page-scoped assistant is out of scope for 30 days — it has real trust trade-offs.",
  },
  {
    id: "F-07",
    title: "Deploy section is missing enterprise use cases",
    severity: "High",
    category: "Enterprise Readiness",
    evidence:
      "A Solutions Engineer on a live call with a bank's security team asking about EU AI Act compliance currently has to improvise from blog posts. The Deploy section describes methods but not decisions.",
    recommendation:
      "Three new pages: architecture diagrams an SE can screenshot without NDA issues, a compliance page with real certification dates, and a decision guide that starts from the customer's constraint — not Mistral's product names.",
  },
  {
    id: "F-08",
    title: "Products nav item adds a click, not understanding",
    severity: "Low",
    category: "Navigation",
    evidence:
      "Products is a container page that links to Vibe and Studio — both of which the homepage already cards. It adds one click to every user journey without surfacing anything the homepage doesn't already show.",
    recommendation:
      "Remove Products from the nav. The homepage already serves this role. Trade-off: one reader who wanted a single 'what does Mistral sell' overview loses a nav item — the homepage is that item.",
  },
];

const SEVERITIES = ["All", "Critical", "High", "Medium", "Low"];
const CATEGORIES = [
  "All",
  "Acquisition",
  "Onboarding",
  "Enterprise Readiness",
  "Support Deflection",
  "Agent Readiness",
  "Content Accuracy",
  "Trust",
  "Navigation",
];

const MODEL_ROWS = [
  ["General tasks", "Mistral Small", "mistral-small-latest", "$0.20"],
  ["Complex reasoning", "Mistral Large", "mistral-large-latest", "$2.00"],
  ["Code generation", "Codestral", "codestral-latest", "$0.30"],
  ["Long context / cheap", "Mistral NeMo", "open-mistral-nemo", "$0.15"],
];

const DEPLOY_ROWS = [
  ["Any cloud, fastest start", "Mistral Cloud API", "EU endpoints available", "Article 52 notice required"],
  ["Customer VPC, managed", "Mistral on Azure / GCP", "Customer's cloud region", "Compliant"],
  ["Air-gapped, no internet", "On-premises (vLLM)", "100% customer-owned hardware", "Full customer control"],
];

function PagePreviewTable({ headers, rows, purpleCol }) {
  return (
    <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse", marginBottom: "10px" }}>
      <thead>
        <tr style={{ backgroundColor: "#f9fafb" }}>
          {headers.map((h) => (
            <th key={h} style={{ padding: "5px 8px", textAlign: "left", borderBottom: "1px solid #e5e7eb", fontWeight: 600, color: "#6b7280", whiteSpace: "nowrap" }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
            {row.map((cell, j) => (
              <td key={j} style={{ padding: "5px 8px", color: j === purpleCol ? "#6d28d9" : "#374151", fontFamily: j === purpleCol ? "monospace" : "inherit", fontSize: j === purpleCol ? "10px" : "11px" }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const BEFORE_AFTER = [
  {
    persona: "Self-Serve Developer",
    context:
      "Testing the API for a side project. 20 minutes, maybe less. Wants working code and a number, not a narrative.",
    before: [
      "Opens with a 3-paragraph narrative about Mistral's model philosophy",
      "45-row table including deprecated models before reaching anything current",
      "No pricing visible — a separate Pricing page the user must find",
      "API name buried in the table, not surfaced as the thing to paste into code",
    ],
    renderAfter: () => (
      <div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
          Which model should I use?
        </div>
        <PagePreviewTable
          headers={["Use case", "Model", "API name", "$/1M tokens"]}
          rows={MODEL_ROWS}
          purpleCol={2}
        />
        <div style={{ background: "#1e1e2e", borderRadius: "6px", padding: "10px 12px", marginBottom: "10px" }}>
          <code style={{ fontSize: "11px", color: "#cdd6f4", fontFamily: "monospace", whiteSpace: "pre", display: "block", lineHeight: 1.7 }}>
{`from mistralai import Mistral
client = Mistral(api_key="...")
response = client.chat.complete(
    model="mistral-small-latest",
    messages=[{"role":"user","content":"Hello"}]
)`}
          </code>
        </div>
        <div style={{ fontSize: "11px", color: "#6b7280" }}>
          <span style={{ color: "#6d28d9", cursor: "pointer" }}>Full model reference →</span>
          {"  "}
          <span style={{ color: "#6d28d9", cursor: "pointer" }}>Pricing →</span>
          {"  "}
          <span style={{ color: "#9ca3af" }}>Legacy models ↓ (footer)</span>
        </div>
      </div>
    ),
  },
  {
    persona: "Solutions Engineer",
    context:
      "On a live call with a bank's security team. They just asked about EU AI Act compliance and air-gapped deployment.",
    before: [
      "Same page as the developer — no enterprise routing or persona detection",
      "Compliance information scattered across a blog post and a PDF, no nav path",
      "No decision guide for cloud vs. on-premises vs. air-gapped",
      "No architecture diagram safe to screenshot into a customer slide deck",
    ],
    renderAfter: () => (
      <div>
        <div style={{ fontSize: "12px", fontWeight: 700, color: "#111827", marginBottom: "8px" }}>
          Deploying in regulated environments
        </div>
        <PagePreviewTable
          headers={["Constraint", "Deployment path", "Data residency", "EU AI Act"]}
          rows={DEPLOY_ROWS}
          purpleCol={null}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px" }}>
          {[
            ["Architecture diagrams →", "Cleared for customer-facing use; no NDA risk"],
            ["Compliance evidence →", "Real certification dates, data flow diagrams"],
            ["Decision guide →", "Starts from your constraint, not our product names"],
          ].map(([link, desc]) => (
            <div key={link} style={{ display: "flex", gap: "6px" }}>
              <span style={{ color: "#6d28d9", whiteSpace: "nowrap" }}>{link}</span>
              <span style={{ color: "#9ca3af" }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

const AI_CHECKLIST = [
  {
    id: "ai-1",
    label: "llms.txt at site root",
    effort: "Low",
    status: "missing",
    note: "Standard convention for AI agent access permissions. Mistral's /robots already distinguishes MistralAI-User from MistralAI-Index — llms.txt is the logical next step.",
  },
  {
    id: "ai-2",
    label: "Per-page clean Markdown export",
    effort: "Low",
    status: "missing",
    note: "Content is already stored as Markdown — a /page.md route is near-zero cost and lets agents fetch source without parsing HTML.",
  },
  {
    id: "ai-3",
    label: "Copy-for-LLM button on each page",
    effort: "Low",
    status: "missing",
    note: "Copies page Markdown to clipboard. Stripe ships this; developers already expect it when working with LLM tooling.",
  },
  {
    id: "ai-4",
    label: "Consistent H1 → H2 → H3 heading hierarchy",
    effort: "Low",
    status: "partial",
    note: "Most pages are well structured. A few reference pages skip heading levels, which breaks chunk boundaries in retrieval systems.",
  },
  {
    id: "ai-5",
    label: "All content accessible without JavaScript",
    effort: "Medium",
    status: "partial",
    note: "Navigation and primary content are crawlable. Interactive components are exceptions — acceptable if a static fallback text summary is present on the page.",
  },
  {
    id: "ai-6",
    label: "Code blocks annotated with language identifier",
    effort: "Low",
    status: "partial",
    note: "Most code blocks carry language hints. A handful of curl examples don't, making language detection unreliable for agents extracting code samples.",
  },
  {
    id: "ai-7",
    label: "Self-contained page descriptions — no implicit cross-references",
    effort: "Medium",
    status: "missing",
    note: "'As described above' and 'see the previous section' break when a page is retrieved in isolation — which is how an agent reads it.",
  },
  {
    id: "ai-8",
    label: "Page-scoped assistant",
    effort: "High",
    status: "out-of-scope",
    note: "Deliberately excluded from the 30-day list. Real trust and hallucination trade-offs; not a cleanup item. Benchmarked against Stripe's implementation for a future proposal.",
  },
];

const ROADMAP = [
  {
    week: "Day 1",
    theme: "Stop the bleeding: the first-run is broken",
    items: [
      { id: "R-0", task: "Fix the first-API-request sample so it runs as printed; reconcile to one import with the SDKs page; add a CI doctest so it can never ship broken again", finding: "F-09" },
    ],
  },
  {
    week: "Week 1",
    theme: "Credibility: fast, visible fixes",
    items: [
      { id: "R-1", task: "Run redirect audit; set up 301s before any nav restructure goes live", finding: "F-02" },
      { id: "R-2", task: "Fix Devstral 2 appearing in both Featured Models and the Deprecated table", finding: "F-03" },
      { id: "R-3", task: "Add cross-link to migration guide from the Models Overview page", finding: "F-04" },
      { id: "R-4", task: "Add cross-link to retry sample from the Production section", finding: "F-04" },
      { id: "R-4b", task: "Add 'Step 0' environment setup to the first-request quickstart + downloadable venv-ready scaffold zip", finding: "F-10" },
    ],
  },
  {
    week: "Week 2",
    theme: "Structure: relocation and cuts",
    items: [
      { id: "R-5", task: "Move 45-row deprecated table off Models Overview to a dedicated /models/legacy page", finding: "F-01" },
      { id: "R-6", task: "Restructure top nav: cut Products and Developers; add Getting Started / Models / Studio & API / Deploy / Admin", finding: "F-08" },
      { id: "R-7", task: "Cross-link rate limits from Production section and the error reference page", finding: "F-05" },
    ],
  },
  {
    week: "Weeks 3–4",
    theme: "New content and agent legibility",
    items: [
      { id: "R-8", task: "Write 3 new Deploy pages: architecture diagrams, compliance (with real certification dates), decision guide from customer's constraint", finding: "F-07" },
      { id: "R-9", task: "Add llms.txt, per-page Markdown export, and Copy-for-LLM button", finding: "F-06" },
      { id: "R-10", task: "Write 1 new Production page (model pinning) — error handling and rate limits are cross-links, not new pages", finding: "F-04" },
    ],
  },
];

// ─── Shared style tokens ─────────────────────────────────────────────────────

const SEVERITY_STYLE = {
  Critical: { bg: "#fecaca", text: "#7f1d1d", border: "#ef4444" },
  High:   { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
  Medium: { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
  Low:    { bg: "#f3f4f6", text: "#4b5563", border: "#d1d5db" },
};

const CATEGORY_COLOR = {
  Acquisition:          "#7c3aed",
  Onboarding:           "#0d9488",
  "Enterprise Readiness": "#0369a1",
  "Support Deflection": "#15803d",
  "Agent Readiness":    "#b45309",
  "Content Accuracy":   "#dc2626",
  Trust:                "#6d28d9",
  Navigation:           "#6b7280",
};

const STATUS_STYLE = {
  present:        { label: "Present",      dot: "#16a34a", bg: "#dcfce7", text: "#166534" },
  partial:        { label: "Partial",      dot: "#d97706", bg: "#fef3c7", text: "#92400e" },
  missing:        { label: "Missing",      dot: "#dc2626", bg: "#fee2e2", text: "#991b1b" },
  "out-of-scope": { label: "Out of scope", dot: "#9ca3af", bg: "#f3f4f6", text: "#6b7280" },
};

const BASE_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// ─── Components ──────────────────────────────────────────────────────────────

export function AuditHero() {
  const stats = [
    { value: "9",    label: "reader segments" },
    { value: "~130", label: "pages inventoried" },
    { value: "8",    label: "findings" },
    { value: "30",   label: "day roadmap" },
  ];

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)",
        borderRadius: "12px",
        padding: "28px 32px",
        margin: "24px 0",
        color: "#ffffff",
        fontFamily: BASE_FONT,
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#a5b4fc",
          marginBottom: "8px",
        }}
      >
        Documentation Audit — docs.mistral.ai
      </div>
      <div style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", lineHeight: 1.3 }}>
        Three readers, one site, eight findings
      </div>
      <div
        style={{
          fontSize: "14px",
          color: "#c7d2fe",
          marginBottom: "24px",
          lineHeight: 1.5,
          maxWidth: "560px",
        }}
      >
        Every finding is grounded in a specific page or behaviour confirmed by direct fetch — not
        inferred from a screenshot or assumed from a competitor's docs.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "14px 16px",
            }}
          >
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#e0e7ff", lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "12px", color: "#a5b4fc", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditThesis({ children }) {
  return (
    <div
      style={{
        borderLeft: "4px solid #6d28d9",
        backgroundColor: "#faf5ff",
        borderRadius: "0 8px 8px 0",
        padding: "16px 20px",
        margin: "16px 0",
        fontSize: "15px",
        lineHeight: 1.7,
        color: "#374151",
        fontFamily: BASE_FONT,
      }}
    >
      {children}
    </div>
  );
}

export function FindingsExplorer() {
  const [severity, setSeverity] = useState("All");
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filtered = FINDINGS.filter(
    (f) =>
      (severity === "All" || f.severity === severity) &&
      (category === "All" || f.category === category)
  );

  return (
    <div style={{ fontFamily: BASE_FONT, margin: "24px 0" }}>
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Severity
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            {SEVERITIES.map((s) => (
              <button
                key={s}
                onClick={() => setSeverity(s)}
                style={{
                  fontSize: "12px",
                  padding: "4px 12px",
                  borderRadius: "6px",
                  border: `1px solid ${severity === s ? "#6d28d9" : "#d1d5db"}`,
                  backgroundColor: severity === s ? "#ede9fe" : "#ffffff",
                  color: severity === s ? "#6d28d9" : "#374151",
                  cursor: "pointer",
                  fontWeight: severity === s ? 600 : 400,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "11px", fontWeight: 500, color: "#6b7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Category
          </div>
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                style={{
                  fontSize: "12px",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: `1px solid ${category === c ? "#6d28d9" : "#d1d5db"}`,
                  backgroundColor: category === c ? "#ede9fe" : "#ffffff",
                  color: category === c ? "#6d28d9" : "#374151",
                  cursor: "pointer",
                  fontWeight: category === c ? 600 : 400,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "10px" }}>
        {filtered.length} of {FINDINGS.length} findings
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {filtered.map((f) => {
          const isOpen = expanded === f.id;
          const sev = SEVERITY_STYLE[f.severity];
          const catColor = CATEGORY_COLOR[f.category] || "#6b7280";
          return (
            <div
              key={f.id}
              style={{
                border: `1.5px solid ${isOpen ? "#6d28d9" : "#e5e7eb"}`,
                borderRadius: "10px",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : f.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "14px 16px",
                  background: isOpen ? "#faf5ff" : "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#9ca3af",
                    minWidth: "32px",
                    marginTop: "2px",
                    fontFamily: "monospace",
                  }}
                >
                  {f.id}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.4,
                  }}
                >
                  {f.title}
                </span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: sev.text,
                      backgroundColor: sev.bg,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      border: `1px solid ${sev.border}`,
                    }}
                  >
                    {f.severity}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: catColor,
                      backgroundColor: catColor + "18",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {f.category}
                  </span>
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "16px",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(90deg)" : "none",
                      display: "inline-block",
                    }}
                  >
                    ›
                  </span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: "0 16px 16px 58px", background: "#faf5ff" }}>
                  <div style={{ marginBottom: "12px" }}>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px",
                      }}
                    >
                      Evidence
                    </div>
                    <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
                      {f.evidence}
                    </p>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#6b7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "4px",
                      }}
                    >
                      Recommendation
                    </div>
                    <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.6, margin: 0 }}>
                      {f.recommendation}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            style={{
              fontSize: "14px",
              color: "#9ca3af",
              padding: "24px",
              textAlign: "center",
              border: "1px dashed #e5e7eb",
              borderRadius: "10px",
            }}
          >
            No findings match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
}

export function BeforeAfterExplorer() {
  const [active, setActive] = useState(0);
  const p = BEFORE_AFTER[active];

  return (
    <div style={{ fontFamily: BASE_FONT, margin: "24px 0" }}>
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        {BEFORE_AFTER.map((item, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              fontSize: "13px",
              padding: "8px 16px",
              borderRadius: "8px",
              border: `1.5px solid ${active === i ? "#6d28d9" : "#d1d5db"}`,
              backgroundColor: active === i ? "#ede9fe" : "#ffffff",
              color: active === i ? "#6d28d9" : "#374151",
              cursor: "pointer",
              fontWeight: active === i ? 600 : 400,
            }}
          >
            {item.persona}
          </button>
        ))}
      </div>

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "10px 14px",
          marginBottom: "14px",
          fontStyle: "italic",
        }}
      >
        <strong style={{ color: "#374151", fontStyle: "normal" }}>{p.persona}:</strong>{" "}
        {p.context}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div
          style={{
            border: "1.5px solid #fca5a5",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#fee2e2",
              padding: "10px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#991b1b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Current — what the reader finds
          </div>
          <ul style={{ margin: 0, padding: "14px 16px 14px 32px" }}>
            {p.before.map((issue, i) => (
              <li
                key={i}
                style={{
                  fontSize: "13px",
                  color: "#4b5563",
                  lineHeight: 1.6,
                  marginBottom: "6px",
                }}
              >
                {issue}
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            border: "1.5px solid #6d28d9",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: "#ede9fe",
              padding: "10px 14px",
              fontSize: "11px",
              fontWeight: 700,
              color: "#6d28d9",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Proposed page — what they need
          </div>
          <div style={{ padding: "14px 16px" }}>
            {p.renderAfter()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIReadinessChecklist() {
  const [expanded, setExpanded] = useState(null);

  const counts = AI_CHECKLIST.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: BASE_FONT, margin: "24px 0" }}>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" }}>
        {Object.entries(counts).map(([status, count]) => {
          const cfg = STATUS_STYLE[status];
          return (
            <div
              key={status}
              style={{
                fontSize: "12px",
                fontWeight: 500,
                color: cfg.text,
                backgroundColor: cfg.bg,
                padding: "4px 12px",
                borderRadius: "6px",
              }}
            >
              {count} {cfg.label}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {AI_CHECKLIST.map((item) => {
          const cfg = STATUS_STYLE[item.status];
          const isOpen = expanded === item.id;
          return (
            <div
              key={item.id}
              style={{
                border: `1.5px solid ${isOpen ? "#6d28d9" : "#e5e7eb"}`,
                borderRadius: "8px",
                overflow: "hidden",
                opacity: item.status === "out-of-scope" ? 0.6 : 1,
                transition: "border-color 0.15s",
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 14px",
                  background: isOpen ? "#faf5ff" : "#ffffff",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor: cfg.dot,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{ flex: 1, fontSize: "13px", fontWeight: 500, color: "#111827" }}
                >
                  {item.label}
                </span>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: "11px",
                      color: cfg.text,
                      backgroundColor: cfg.bg,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontWeight: 500,
                    }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#6b7280",
                      backgroundColor: "#f3f4f6",
                      padding: "2px 8px",
                      borderRadius: "4px",
                    }}
                  >
                    Effort: {item.effort}
                  </span>
                  <span
                    style={{
                      color: "#9ca3af",
                      fontSize: "16px",
                      transition: "transform 0.2s",
                      transform: isOpen ? "rotate(90deg)" : "none",
                      display: "inline-block",
                    }}
                  >
                    ›
                  </span>
                </div>
              </button>
              {isOpen && (
                <div style={{ padding: "0 14px 12px 34px", background: "#faf5ff" }}>
                  <p
                    style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6, margin: 0 }}
                  >
                    {item.note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function Roadmap() {
  const [done, setDone] = useState(new Set());

  const toggle = (id) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = ROADMAP.reduce((sum, w) => sum + w.items.length, 0);
  const pct = Math.round((done.size / total) * 100);

  return (
    <div style={{ fontFamily: BASE_FONT, margin: "24px 0" }}>
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "4px",
          }}
        >
          <span>
            {done.size} of {total} items
          </span>
          <span>{pct}%</span>
        </div>
        <div
          style={{
            height: "6px",
            background: "#e5e7eb",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              background: "#6d28d9",
              borderRadius: "3px",
              width: `${pct}%`,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {ROADMAP.map((week) => (
          <div key={week.week}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#6d28d9",
                  backgroundColor: "#ede9fe",
                  padding: "2px 10px",
                  borderRadius: "4px",
                }}
              >
                {week.week}
              </span>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>{week.theme}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {week.items.map((item) => {
                const isDone = done.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1.5px solid #e5e7eb",
                      backgroundColor: isDone ? "#f0fdf4" : "#ffffff",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "50%",
                        border: `2px solid ${isDone ? "#16a34a" : "#d1d5db"}`,
                        backgroundColor: isDone ? "#16a34a" : "transparent",
                        flexShrink: 0,
                        marginTop: "1px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                      }}
                    >
                      {isDone && (
                        <span
                          style={{
                            color: "#ffffff",
                            fontSize: "10px",
                            fontWeight: 700,
                            lineHeight: 1,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        flex: 1,
                        fontSize: "13px",
                        color: isDone ? "#6b7280" : "#111827",
                        textDecoration: isDone ? "line-through" : "none",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.task}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#9ca3af",
                        backgroundColor: "#f3f4f6",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        flexShrink: 0,
                        fontFamily: "monospace",
                      }}
                    >
                      {item.finding}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
