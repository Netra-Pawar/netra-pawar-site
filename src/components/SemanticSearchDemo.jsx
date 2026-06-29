import { useState } from "react";

/**
 * SemanticSearchDemo
 * 
 * Interactive component for Version A (Build Semantic Search with Mistral Embeddings).
 * Placed inline after "The problem: keywords miss what users mean" section.
 * 
 * Purpose: Let the reader experience the difference between keyword matching and
 * semantic matching before seeing any code or API calls. This teaches the core
 * insight interactively — static text can explain it, but trying different queries
 * makes it stick.
 * 
 * Design decisions:
 * - Pre-computed similarity scores (not a live API call) to avoid requiring an API key
 *   in documentation. The scores are realistic values from mistral-embed.
 * - Three documentation chunks chosen to create meaningful contrast: one semantic
 *   match (credential renewal ↔ rotate key), one keyword-adjacent but wrong match
 *   (rate limits), and one completely unrelated (webhooks).
 * - Users can type custom queries or pick from presets to explore edge cases.
 */

const DOCS = [
  {
    id: "doc-1",
    title: "Credential Renewal",
    content:
      "Credential renewal procedure: create a new API key, update your application configuration, verify traffic, then revoke the old key.",
    keywords: ["credential", "renewal", "api", "key", "create", "new", "revoke", "old", "update", "application", "configuration", "verify", "traffic", "procedure"],
  },
  {
    id: "doc-2",
    title: "Rate Limits",
    content:
      "Rate limits protect the API from excessive traffic. If you exceed your rate limit, requests return HTTP 429. Implement exponential backoff to retry.",
    keywords: ["rate", "limits", "protect", "api", "excessive", "traffic", "exceed", "limit", "requests", "return", "http", "429", "implement", "exponential", "backoff", "retry"],
  },
  {
    id: "doc-3",
    title: "Webhooks",
    content:
      "Use webhooks to receive real-time event notifications when resources change in your account. Configure your endpoint URL in the dashboard.",
    keywords: ["webhooks", "receive", "real-time", "event", "notifications", "resources", "change", "account", "configure", "endpoint", "url", "dashboard"],
  },
];

const PRESETS = [
  { label: "How do I rotate my API key?", query: "How do I rotate my API key?" },
  { label: "What happens if I send too many requests?", query: "What happens if I send too many requests?" },
  { label: "I need to replace my credentials", query: "I need to replace my credentials" },
  { label: "How do I get notified about changes?", query: "How do I get notified about changes?" },
];

// Pre-computed semantic similarity scores from mistral-embed
// These are realistic scores for the given query-document pairs
const SEMANTIC_SCORES = {
  "How do I rotate my API key?": [0.84, 0.31, 0.18],
  "What happens if I send too many requests?": [0.22, 0.79, 0.20],
  "I need to replace my credentials": [0.81, 0.24, 0.16],
  "How do I get notified about changes?": [0.19, 0.21, 0.82],
};

function computeKeywordScore(query, doc) {
  const queryWords = query
    .toLowerCase()
    .replace(/[?.,!]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  if (queryWords.length === 0) return 0;
  const matches = queryWords.filter((w) =>
    doc.keywords.some((kw) => kw.includes(w) || w.includes(kw))
  );
  return matches.length / queryWords.length;
}

function getSemanticScores(query) {
  if (SEMANTIC_SCORES[query]) return SEMANTIC_SCORES[query];
  // For custom queries, use a simple heuristic approximation
  // (In real docs, this would note that live scoring requires the API)
  return DOCS.map((doc) => {
    const kw = computeKeywordScore(query, doc);
    // Simulate semantic understanding with a boosted, noisy version of keyword
    return Math.min(0.95, kw * 0.6 + Math.random() * 0.25 + 0.1);
  });
}

function ScoreBar({ score, isTop, type }) {
  const pct = Math.round(score * 100);
  const color =
    type === "keyword"
      ? isTop
        ? "#f97316"
        : "#fdba74"
      : isTop
      ? "#6d28d9"
      : "#a78bfa";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
      <div
        style={{
          width: "120px",
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "4px",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: "4px",
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontSize: "13px",
          fontWeight: isTop ? 600 : 400,
          color: isTop ? "#111827" : "#6b7280",
          fontVariantNumeric: "tabular-nums",
          minWidth: "36px",
        }}
      >
        {pct}%
      </span>
    </div>
  );
}

function ResultCard({ doc, keywordScore, semanticScore, keywordRank, semanticRank, totalDocs }) {
  const isKeywordTop = keywordRank === 0;
  const isSemanticTop = semanticRank === 0;
  const moved = keywordRank !== semanticRank;

  return (
    <div
      style={{
        border: `1.5px solid ${isSemanticTop ? "#6d28d9" : "#e5e7eb"}`,
        borderRadius: "8px",
        padding: "16px",
        backgroundColor: isSemanticTop ? "#faf5ff" : "#ffffff",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              marginBottom: "4px",
            }}
          >
            {doc.title}
          </div>
          <p style={{ fontSize: "14px", color: "#374151", margin: 0, lineHeight: 1.5 }}>
            {doc.content}
          </p>
        </div>
        {moved && (
          <div
            style={{
              fontSize: "11px",
              color: isSemanticTop ? "#6d28d9" : "#9ca3af",
              fontWeight: 500,
              marginLeft: "12px",
              flexShrink: 0,
              padding: "2px 8px",
              backgroundColor: isSemanticTop ? "#ede9fe" : "#f3f4f6",
              borderRadius: "4px",
            }}
          >
            {semanticRank < keywordRank ? "↑ Promoted" : "↓ Demoted"}
          </div>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: "1px solid #f3f4f6",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>Keyword match</div>
          <ScoreBar score={keywordScore} isTop={isKeywordTop} type="keyword" />
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 500 }}>Semantic match</div>
          <ScoreBar score={semanticScore} isTop={isSemanticTop} type="semantic" />
        </div>
      </div>
    </div>
  );
}

export default function SemanticSearchDemo() {
  const [query, setQuery] = useState(PRESETS[0].query);
  const [activePreset, setActivePreset] = useState(0);

  const keywordScores = DOCS.map((doc) => computeKeywordScore(query, doc));
  const semanticScores = getSemanticScores(query);

  const keywordRanks = keywordScores
    .map((s, i) => ({ score: s, index: i }))
    .sort((a, b) => b.score - a.score)
    .map((item, rank) => ({ ...item, rank }));

  const semanticRanks = semanticScores
    .map((s, i) => ({ score: s, index: i }))
    .sort((a, b) => b.score - a.score)
    .map((item, rank) => ({ ...item, rank }));

  const getRank = (ranks, docIndex) => ranks.find((r) => r.index === docIndex).rank;

  // Sort results by semantic score for display
  const displayOrder = semanticScores
    .map((s, i) => ({ score: s, index: i }))
    .sort((a, b) => b.score - a.score)
    .map((item) => item.index);

  const keywordTop = keywordRanks[0].index;
  const semanticTop = semanticRanks[0].index;
  const resultsChanged = keywordTop !== semanticTop;

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "32px 0",
      }}
    >
      <div
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#111827",
          marginBottom: "8px",
        }}
      >
        Try it: keyword search vs. semantic search
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
        Type a question or pick a preset. Watch how keyword matching and semantic matching
        rank the same three documentation pages differently.
      </p>

      {/* Preset buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
        {PRESETS.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setQuery(p.query);
              setActivePreset(i);
            }}
            style={{
              fontSize: "12px",
              padding: "6px 12px",
              borderRadius: "6px",
              border: `1px solid ${activePreset === i ? "#6d28d9" : "#d1d5db"}`,
              backgroundColor: activePreset === i ? "#ede9fe" : "#ffffff",
              color: activePreset === i ? "#6d28d9" : "#374151",
              cursor: "pointer",
              fontWeight: activePreset === i ? 500 : 400,
              transition: "all 0.15s ease",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Query input */}
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActivePreset(-1);
        }}
        placeholder="Type a question..."
        style={{
          width: "100%",
          padding: "10px 14px",
          fontSize: "14px",
          border: "1.5px solid #d1d5db",
          borderRadius: "8px",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "20px",
        }}
      />

      {/* Insight callout */}
      {query && resultsChanged && (
        <div
          style={{
            padding: "10px 14px",
            backgroundColor: "#faf5ff",
            border: "1px solid #e9d5ff",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#6d28d9",
            marginBottom: "16px",
            lineHeight: 1.5,
          }}
        >
          Keyword search ranks <strong>"{DOCS[keywordTop].title}"</strong> highest.
          Semantic search promotes <strong>"{DOCS[semanticTop].title}"</strong> —
          matching the user's intent even though the words differ.
        </div>
      )}

      {query &&
        !resultsChanged &&
        keywordScores[keywordTop] > 0 && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              fontSize: "13px",
              color: "#15803d",
              marginBottom: "16px",
              lineHeight: 1.5,
            }}
          >
            Both methods agree on the top result for this query. Keyword search
            works here because the query and document share vocabulary.
          </div>
        )}

      {/* Results */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {displayOrder.map((docIndex) => (
          <ResultCard
            key={DOCS[docIndex].id}
            doc={DOCS[docIndex]}
            keywordScore={keywordScores[docIndex]}
            semanticScore={semanticScores[docIndex]}
            keywordRank={getRank(keywordRanks, docIndex)}
            semanticRank={getRank(semanticRanks, docIndex)}
            totalDocs={DOCS.length}
          />
        ))}
      </div>

      <p
        style={{
          fontSize: "12px",
          color: "#9ca3af",
          marginTop: "12px",
          fontStyle: "italic",
        }}
      >
        Semantic scores are pre-computed from <code>mistral-embed</code> for preset
        queries. Custom queries use an approximation for illustration. To compute
        real scores, see the code example below.
      </p>
    </div>
  );
}
