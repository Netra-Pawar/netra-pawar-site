import { useState, useMemo } from "react";
import {
  categoryMeta,
  severityMeta,
  findings as allFindings,
  beforeAfterItems,
  roadmap,
  aiReadiness,
  summaryStats,
} from "../../../data/mistralBusinessCase/exercise1/docAuditReportData";
import "../../../css/mistralBusinessCase/exercise1/docAuditReport.css";

/**
 * Minimal markdown-to-JSX for the before/after content blocks.
 *
 * Not a general-purpose parser — deliberately scoped to the subset actually
 * used in this data (paragraphs, **bold**, `inline code`, fenced code
 * blocks, pipe tables). Pulling in a markdown library for four constructs
 * felt like the wrong trade, so this is about 40 lines instead of a new
 * dependency.
 */
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={`${keyPrefix}-${i}`}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function renderMarkdownish(text) {
  const blocks = text.split(/\n\n+/);
  return blocks.map((block, bi) => {
    const trimmed = block.trim();

    // Fenced code block
    const codeMatch = trimmed.match(/^```(\w*)\n([\s\S]*?)```$/);
    if (codeMatch) {
      return (
        <pre className="mistral-audit-code-block" key={bi}>
          <code>{codeMatch[2]}</code>
        </pre>
      );
    }

    // Pipe table
    if (trimmed.startsWith("|")) {
      const rows = trimmed.split("\n").filter((r) => r.trim().startsWith("|"));
      const dataRows = rows.filter((r) => !/^\|[\s-:|]+\|$/.test(r.trim()));
      const [headerRow, ...bodyRows] = dataRows;
      const splitCells = (row) =>
        row.split("|").slice(1, -1).map((c) => c.trim());
      const headers = splitCells(headerRow);
      return (
        <table className="mistral-audit-table" key={bi}>
          <thead>
            <tr>
              {headers.map((h, hi) => (
                <th key={hi}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri}>
                {splitCells(row).map((cell, ci) => (
                  <td key={ci}>{renderInline(cell, `${bi}-${ri}-${ci}`)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return <p key={bi}>{renderInline(trimmed, bi)}</p>;
  });
}

/**
 * Documentation Audit Report — interactive components
 *
 * Embedded inline in exercise-1-documentation-critique-and-rewrite/index.mdx,
 * the same pattern as RetrievalDiagnostic.jsx and SemanticSearchDemo.jsx in
 * Exercise 2 — components live next to the prose paragraph they support,
 * not stacked into a separate dashboard page.
 *
 * Design decisions:
 * - Filter chips over a dropdown: the panel is scanning under time pressure,
 *   and chips let them see every category (and how many findings sit in it)
 *   without an extra click.
 * - Before/after as a toggle, not a side-by-side diff: at mobile widths a
 *   diff view collapses to the same thing anyway, and the toggle keeps the
 *   reader's focus on one state at a time rather than splitting attention.
 * - No client-side state persists across a page reload — this is a report,
 *   not an app. Simplicity over cleverness.
 */

export function Badge({ children, style }) {
  return (
    <span className="mistral-audit-badge" style={style}>
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const meta = severityMeta[severity];
  return (
    <Badge style={{ background: meta.bg, color: meta.color }}>
      {meta.label}
    </Badge>
  );
}

export function CategoryBadge({ category }) {
  const meta = categoryMeta[category];
  return (
    <Badge style={{ background: meta.color + "16", color: meta.color }}>
      {meta.label}
    </Badge>
  );
}

const EFFORT_LABEL = {
  low: "Quick fix",
  medium: "Moderate",
  high: "Strategic",
};

/* ── Hero with score ring ── */
export function AuditHero() {
  const r = 34;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (summaryStats.score / 10) * circumference;

  return (
    <div className="mistral-audit-root">
      <div className="mistral-audit-hero">
        <div className="mistral-audit-kicker">Exercise 1 — docs.mistral.ai</div>
        <h2 className="mistral-audit-hero-title">
          Documentation Critique &amp; Redesign Rationale
        </h2>
        <div className="mistral-audit-score-row">
          <div className="mistral-audit-score-ring">
            <svg width="84" height="84" viewBox="0 0 84 84" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="42" cy="42" r={r} fill="none" stroke="#EAEAEC" strokeWidth="5" />
              <circle
                cx="42" cy="42" r={r}
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 1s ease-out" }}
              />
            </svg>
            <div className="mistral-audit-score-number">{summaryStats.score}</div>
          </div>
          <div className="mistral-audit-score-caption">
            Not because the writing is bad — it isn&rsquo;t. The quickstarts are clean, code
            samples are consistent. The six reflects structural problems that cost Mistral
            real money: lost evaluators, stalled deals, and support tickets for content
            that already exists but can&rsquo;t be found.
          </div>
        </div>
      </div>

      <div className="mistral-audit-stats">
        {[
          [summaryStats.totalPages, "Pages audited"],
          [summaryStats.deadWeight, "Dead weight"],
          [summaryStats.deprecatedModels, "Legacy rows"],
          [summaryStats.missingPages, "Missing pages"],
          [summaryStats.audienceSegments, "Reader segments"],
        ].map(([number, label]) => (
          <div className="mistral-audit-stat" key={label}>
            <div className="mistral-audit-stat-number">{number}</div>
            <div className="mistral-audit-stat-label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Thesis callout ── */
export function AuditThesis({ children }) {
  return (
    <div className="mistral-audit-root">
      <div className="mistral-audit-thesis">
        <p>{children}</p>
      </div>
    </div>
  );
}

/* ── Filterable findings ── */
export function FindingsExplorer() {
  const [active, setActive] = useState("all");

  const counts = useMemo(() => {
    const c = { all: allFindings.length };
    allFindings.forEach((f) => (c[f.category] = (c[f.category] || 0) + 1));
    return c;
  }, []);

  const visible = useMemo(
    () => (active === "all" ? allFindings : allFindings.filter((f) => f.category === active)),
    [active]
  );

  const categories = ["all", ...Object.keys(categoryMeta)];

  return (
    <div className="mistral-audit-root">
      <div className="mistral-audit-filters" role="group" aria-label="Filter findings by category">
        {categories.map((cat) => {
          const count = counts[cat] || 0;
          if (cat !== "all" && !count) return null;
          const isActive = active === cat;
          const meta = cat !== "all" ? categoryMeta[cat] : null;
          return (
            <button
              key={cat}
              className={`mistral-audit-chip ${isActive ? "mistral-audit-chip-active" : ""}`}
              onClick={() => setActive(cat)}
              aria-pressed={isActive}
            >
              {meta && (
                <span
                  className="mistral-audit-chip-dot"
                  style={{ background: isActive ? "#fff" : meta.color }}
                />
              )}
              {cat === "all" ? "All findings" : meta.label}
              <span className="mistral-audit-chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="mistral-audit-findings">
        {visible.map((f) => (
          <article className="mistral-audit-finding" key={f.id}>
            <div className="mistral-audit-finding-header">
              <span className="mistral-audit-finding-id">{f.id}</span>
              <h4 className="mistral-audit-finding-title">{f.title}</h4>
              <div className="mistral-audit-badges">
                <SeverityBadge severity={f.severity} />
                <CategoryBadge category={f.category} />
                <span className="mistral-audit-badge mistral-audit-badge-effort">
                  {EFFORT_LABEL[f.effort]}
                </span>
              </div>
            </div>

            <div className="mistral-audit-finding-field">
              <div className="mistral-audit-finding-label">Evidence</div>
              {f.evidence}
            </div>
            <div className="mistral-audit-finding-field">
              <div className="mistral-audit-finding-label">Recommendation</div>
              {f.recommendation}
            </div>
            <div className="mistral-audit-finding-impact">
              <b>Why this matters:</b> {f.impact}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Before / after toggle ── */
function BeforeAfterCard({ item }) {
  const [view, setView] = useState("before");

  return (
    <div className="mistral-audit-ba">
      <div className="mistral-audit-ba-header">
        <h4 className="mistral-audit-ba-title">{item.title}</h4>
        <div className="mistral-audit-ba-context">{item.context}</div>
      </div>
      <div className="mistral-audit-ba-toggle">
        <button
          className={`mistral-audit-ba-btn ${view === "before" ? "mistral-audit-ba-btn-active-before" : ""}`}
          onClick={() => setView("before")}
          aria-pressed={view === "before"}
        >
          Before
        </button>
        <button
          className={`mistral-audit-ba-btn ${view === "after" ? "mistral-audit-ba-btn-active-after" : ""}`}
          onClick={() => setView("after")}
          aria-pressed={view === "after"}
        >
          After
        </button>
      </div>
      <div className="mistral-audit-ba-content">
        {renderMarkdownish(view === "before" ? item.before : item.after)}
      </div>
      <div className="mistral-audit-ba-why">
        <b>Why this matters:</b>
        {item.whyItMatters}
      </div>
    </div>
  );
}

export function BeforeAfterExplorer() {
  return (
    <div className="mistral-audit-root">
      {beforeAfterItems.map((item) => (
        <BeforeAfterCard item={item} key={item.id} />
      ))}
    </div>
  );
}

/* ── AI readiness checklist ── */
export function AIReadinessChecklist() {
  const missing = aiReadiness.filter((i) => !i.present).length;
  return (
    <div className="mistral-audit-root">
      <p className="mistral-audit-ai-intro">
        {missing} of {aiReadiness.length} agent-facing affordances are absent from
        docs.mistral.ai — confirmed by direct audit, July 2026.
      </p>
      <div className="mistral-audit-ai-grid">
        {aiReadiness.map((item) => (
          <div className="mistral-audit-ai-row" key={item.feature}>
            <div
              className={`mistral-audit-ai-icon ${
                item.present ? "mistral-audit-ai-icon-present" : "mistral-audit-ai-icon-missing"
              }`}
            >
              {item.present ? "✓" : "✕"}
            </div>
            <div>
              <div className="mistral-audit-ai-feature">{item.feature}</div>
              <div className="mistral-audit-ai-desc">{item.description}</div>
            </div>
            <div className="mistral-audit-ai-competitor">{item.competitor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── 30-day roadmap ── */
export function Roadmap() {
  return (
    <div className="mistral-audit-root">
      <div className="mistral-audit-roadmap">
        {roadmap.map((phase) => (
          <div className="mistral-audit-roadmap-row" key={phase.phase}>
            <div className="mistral-audit-roadmap-label">
              <div className="mistral-audit-roadmap-phase">{phase.phase}</div>
              <div className="mistral-audit-roadmap-caption">{phase.label}</div>
              <span
                className={`mistral-audit-roadmap-tag ${
                  phase.tag === "quick-win"
                    ? "mistral-audit-roadmap-tag-quick"
                    : "mistral-audit-roadmap-tag-strategic"
                }`}
              >
                {phase.tag === "quick-win" ? "Quick win" : "Strategic"}
              </span>
            </div>
            <div className="mistral-audit-roadmap-body">
              {phase.items.map((item, i) => (
                <div className="mistral-audit-roadmap-item" key={i}>
                  → {item}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
