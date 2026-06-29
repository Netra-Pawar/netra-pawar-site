import { useState } from "react";

/**
 * RetrievalDiagnostic
 * 
 * Interactive component for Version B (Vector Embeddings in Production Retrieval Systems).
 * Placed inline after "Failure modes and diagnostics" section.
 * 
 * Purpose: Walk an engineer through the diagnostic process for retrieval failures.
 * Instead of a static table (which Version B already has), this component lets the
 * user describe their symptom and narrows down to the most likely pipeline stage,
 * specific checks, and remediation steps.
 * 
 * Design decision: A decision-tree, not a chatbot. Each step has 2-3 options
 * that map to real production symptoms. The tree is shallow (3-4 levels max)
 * to avoid feeling like a phone tree.
 */

const TREE = {
  root: {
    question: "What is the primary symptom?",
    options: [
      { label: "The correct content never appears in results", next: "missing" },
      { label: "Results appear but the wrong content ranks highest", next: "ranking" },
      { label: "Results are outdated or stale", next: "freshness" },
      { label: "Results are correct sometimes but inconsistent", next: "inconsistent" },
      { label: "Retrieved content looks right but the generated answer is wrong", next: "generation" },
    ],
  },
  missing: {
    question: "Is the content present in your vector store?",
    options: [
      { label: "I don't know / haven't checked", next: "missing_check_index" },
      { label: "Yes, the content is indexed", next: "missing_indexed" },
      { label: "No, it's not in the index", next: "missing_not_indexed" },
    ],
  },
  missing_check_index: {
    diagnosis: "Start with the index",
    stage: "Ingestion / Indexing",
    explanation:
      "Before debugging retrieval logic, confirm the content exists in your vector store. Query the store directly by document ID or metadata — don't rely on semantic search to find it, since that's the system you're debugging.",
    checks: [
      "Query your vector store for the document by ID or metadata filter.",
      "Check ingestion logs for errors or skipped documents.",
      "Verify the document's source URL or file path is in your ingestion config.",
      "If using Libraries, confirm the document upload completed successfully.",
    ],
    next_steps: [
      "If missing → re-ingest and verify.",
      "If present → continue to 'content is indexed but missing from results' below.",
    ],
  },
  missing_not_indexed: {
    diagnosis: "Ingestion failure",
    stage: "Ingestion",
    explanation:
      "The content was never ingested. This is the most common cause of 'missing' results and the simplest to fix — but easy to miss if you assume all documents are indexed.",
    checks: [
      "Was the document included in the ingestion source list?",
      "Did the crawler or uploader encounter an error (auth failure, timeout, format rejection)?",
      "Is the document in a format your parser supports?",
      "If using Connectors (Google Drive / SharePoint), does the service account have read access?",
    ],
    next_steps: [
      "Add the document to your ingestion pipeline.",
      "Re-run ingestion and verify the document appears in the index.",
      "Set up monitoring for ingestion failures.",
    ],
  },
  missing_indexed: {
    question: "Embed the target content and your query directly. Is the similarity score reasonable (> 0.5)?",
    options: [
      { label: "Yes, similarity is reasonable", next: "missing_filtered" },
      { label: "No, similarity is surprisingly low", next: "missing_embedding" },
      { label: "I'm not sure how to check this", next: "missing_how_to_check" },
    ],
  },
  missing_how_to_check: {
    diagnosis: "Test embedding similarity directly",
    stage: "Debugging method",
    explanation:
      "Before reasoning about pipeline failures, you need a direct similarity measurement between your query and the target content. This isolates the embedding step from everything else in the pipeline.",
    checks: [
      "Embed the query with client.embeddings.create(model='mistral-embed', inputs=[query]).",
      "Embed the target chunk with the same call.",
      "Compute cosine similarity between the two vectors.",
      "A score above 0.5 suggests the embedding model sees them as related. Below 0.3 suggests they're in different semantic neighborhoods.",
    ],
    next_steps: [
      "If similarity is reasonable → the problem is downstream (filtering, ranking, or k is too small).",
      "If similarity is low → the problem is the chunk content, query wording, or model-content mismatch.",
    ],
  },
  missing_filtered: {
    diagnosis: "Post-retrieval filtering is excluding the result",
    stage: "Filtering",
    explanation:
      "The embedding model sees the content as relevant, and it's in the index, but something between ANN search and the final result set is removing it. This is almost always a metadata filter.",
    checks: [
      "List all active filters on your retrieval query (product, version, language, access tier, content type).",
      "Check the target document's metadata against each filter.",
      "Try running the same query with no filters — does the result appear?",
      "If using permission-based filtering, verify the test user's access scope includes the target document.",
      "Check if you're over-filtering by combining too many metadata constraints.",
    ],
    next_steps: [
      "Fix metadata on the source document if it's mislabeled.",
      "Relax filters and add fallback behavior (e.g., expand search if zero results).",
      "Log filtered-out document IDs so you can audit exclusions.",
    ],
  },
  missing_embedding: {
    diagnosis: "Embedding representation is weak for this content",
    stage: "Embedding / Content",
    explanation:
      "The embedding model doesn't see the query and the document as semantically related. This can happen when content uses domain-specific terminology the model hasn't been trained on, when the chunk is too short or too long, or when the content type doesn't match the model.",
    checks: [
      "Is the content in a language the embedding model supports?",
      "Is the chunk mostly code? Use codestral-embed instead of mistral-embed.",
      "Is the chunk too short (a heading with no body) or too long (entire document)?",
      "Did text extraction strip important context (table headers, list structure)?",
      "Is domain jargon or acronyms making the content opaque to a general-purpose model?",
    ],
    next_steps: [
      "Re-chunk with better boundaries (include heading + body, not just body).",
      "Add contextual metadata to chunks (prepend the document title or section path).",
      "Try a domain-adapted query (expand acronyms, add synonyms).",
      "Consider LLMQueryRewriter to expand terse queries.",
    ],
  },
  ranking: {
    question: "What kind of content is outranking the correct result?",
    options: [
      { label: "A near-duplicate or older version of the same content", next: "ranking_duplicate" },
      { label: "Semantically similar but wrong topic", next: "ranking_wrong_topic" },
      { label: "The correct content is in results, just ranked too low", next: "ranking_low" },
    ],
  },
  ranking_duplicate: {
    diagnosis: "Near-duplicate contamination",
    stage: "Ingestion / Retrieval",
    explanation:
      "Multiple versions of the same content (v1 and v2 of a guide, localized variants, syndicated articles) create clusters of nearly identical vectors. ANN search returns several of them, consuming top-k slots and potentially pushing the canonical version below the cutoff.",
    checks: [
      "Inspect the top-k results — are multiple chunks from the same or similar documents?",
      "Do you have versioned documents without version metadata?",
      "Are deprecated documents still in the index?",
    ],
    next_steps: [
      "Deduplicate at ingestion time (hash chunk content, skip duplicates).",
      "Add version/status metadata and filter to 'current' or 'active' documents.",
      "Apply reranking (LLMReRanker or CrossEncoderReRanker) to promote authoritative sources.",
      "Remove deprecated content from the index entirely.",
    ],
  },
  ranking_wrong_topic: {
    diagnosis: "Semantic false positive",
    stage: "Retrieval / Query",
    explanation:
      "The embedding model is finding content that is semantically adjacent but doesn't answer the actual question. This often happens with vague queries or when the corpus contains many topically similar documents.",
    checks: [
      "Is the query specific enough? 'Help with my account' matches almost everything.",
      "Are chunks mixing multiple topics (e.g., a long page with many subsections)?",
      "Is the correct answer chunk specific and self-contained?",
    ],
    next_steps: [
      "Encourage more specific queries or use query rewriting (LLMQueryRewriter).",
      "Re-chunk to separate distinct topics within long documents.",
      "Add a reranking step to reorder by answer quality, not just similarity.",
      "Consider hybrid search (BM25 + vector) to boost exact terminology matches.",
    ],
  },
  ranking_low: {
    diagnosis: "Insufficient top-k or weak ranking signal",
    stage: "Retrieval configuration",
    explanation:
      "The correct content is in the index and has reasonable similarity, but it's being pushed below your top-k cutoff by slightly-higher-scoring but less relevant results.",
    checks: [
      "What is your current k value? Try increasing it (e.g., from 5 to 10).",
      "Inspect similarity scores — is the spread between top results very narrow?",
      "Are you using any post-retrieval reranking?",
    ],
    next_steps: [
      "Increase k for retrieval, then apply reranking to promote the best answer.",
      "Use RRFRanker with hybrid search to combine semantic and keyword signals.",
      "Evaluate with recall@k at multiple k values to find the right balance.",
    ],
  },
  freshness: {
    diagnosis: "Stale index",
    stage: "Indexing",
    explanation:
      "The source content has been updated, but the vector store still contains embeddings computed from the old version. This is an operational problem, not a model problem.",
    checks: [
      "When was the index last rebuilt or updated?",
      "Is your indexing pipeline running on a schedule? What's the cadence?",
      "Compare the document's last-modified timestamp with the index entry's timestamp.",
      "If using Libraries, check the library's last sync time.",
    ],
    next_steps: [
      "Re-index updated documents.",
      "Set up incremental indexing triggered by content changes.",
      "Track index freshness lag as a metric (time between document update and index update).",
      "Add 'last updated' metadata to chunks so stale results can be detected or deprioritized.",
    ],
  },
  inconsistent: {
    question: "How does the inconsistency manifest?",
    options: [
      { label: "Same query returns different results at different times", next: "inconsistent_nondeterministic" },
      { label: "Similar queries return very different result sets", next: "inconsistent_sensitivity" },
    ],
  },
  inconsistent_nondeterministic: {
    diagnosis: "Non-deterministic retrieval or concurrent index updates",
    stage: "Infrastructure",
    explanation:
      "ANN search is approximate by design — results near the decision boundary can vary between calls. If your index is also being updated concurrently, results can change mid-session.",
    checks: [
      "Are you using an approximate index (HNSW, IVF) or exact search?",
      "Is the index being written to while queries are running?",
      "Are similarity scores near the boundary very close (within 0.01)?",
    ],
    next_steps: [
      "Use a read replica or snapshot for queries during index updates.",
      "Increase k slightly to create a buffer zone around the decision boundary.",
      "If exact consistency matters, use exact (brute-force) search for small corpora.",
    ],
  },
  inconsistent_sensitivity: {
    diagnosis: "Query sensitivity — small wording changes cause large retrieval shifts",
    stage: "Embedding / Query",
    explanation:
      "This usually indicates the corpus has many chunks with similar scores for the given topic, so minor query rephrasing shifts which ones cross the top-k threshold.",
    checks: [
      "Embed several query variants and compare their vectors — are they similar to each other?",
      "Inspect the top-10 results for each variant — do they overlap significantly?",
      "Is the relevant content present in all result sets but at different positions?",
    ],
    next_steps: [
      "Use query rewriting or expansion to normalize query variations.",
      "Add reranking to stabilize ordering across similar queries.",
      "Consider increasing k and using the generation model to select the best chunk.",
    ],
  },
  generation: {
    diagnosis: "Generation failure — outside the embeddings layer",
    stage: "Generation / Prompting",
    explanation:
      "If the retrieved chunks contain the correct information but the model's answer is wrong, incomplete, or hallucinated, the problem is in the generation step — not in retrieval or embeddings. This is a different debugging surface.",
    checks: [
      "Inspect the retrieved chunks: do they actually contain the answer?",
      "Is the prompt template formatting chunks clearly (separating sources, including metadata)?",
      "Is the context window overflowing — are too many chunks being sent, causing the model to lose focus?",
      "Is the model hallucinating details not present in any retrieved chunk?",
      "Does the answer correctly attribute which chunk it drew from?",
    ],
    next_steps: [
      "This is outside the scope of embeddings documentation.",
      "See Mistral's Agents and Conversations docs for prompt construction and grounding.",
      "Consider adding a grounded-answer rate metric to track how often answers trace to retrieved content.",
      "Test with fewer retrieved chunks (k=2 or k=3) to reduce noise in the context window.",
    ],
  },
};

function DiagnosisCard({ node }) {
  return (
    <div
      style={{
        border: "1.5px solid #6d28d9",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "#faf5ff",
        marginTop: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "18px" }}>🔍</span>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#6d28d9" }}>
          {node.diagnosis}
        </span>
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#7c3aed",
          fontWeight: 500,
          backgroundColor: "#ede9fe",
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: "4px",
          marginBottom: "12px",
        }}
      >
        Pipeline stage: {node.stage}
      </div>
      <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: "0 0 16px 0" }}>
        {node.explanation}
      </p>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
          What to check
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px" }}>
          {node.checks.map((c, i) => (
            <li key={i} style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6, marginBottom: "4px" }}>
              {c}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
          Next steps
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px" }}>
          {node.next_steps.map((s, i) => (
            <li key={i} style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6, marginBottom: "4px" }}>
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function RetrievalDiagnostic() {
  const [path, setPath] = useState(["root"]);

  const currentKey = path[path.length - 1];
  const currentNode = TREE[currentKey];
  const isDiagnosis = !!currentNode.diagnosis;

  const handleSelect = (nextKey) => {
    setPath([...path, nextKey]);
  };

  const handleReset = () => {
    setPath(["root"]);
  };

  const handleBack = () => {
    if (path.length > 1) {
      setPath(path.slice(0, -1));
    }
  };

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "32px 0",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
        Retrieval failure diagnostic
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
        Describe the symptom to narrow down the pipeline stage and get specific checks.
      </p>

      {/* Breadcrumb */}
      {path.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "12px",
            flexWrap: "wrap",
          }}
        >
          {path.map((key, i) => {
            const node = TREE[key];
            const label = node.diagnosis || node.question?.slice(0, 30) + "…";
            const isLast = i === path.length - 1;
            return (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: "#d1d5db", fontSize: "12px" }}>→</span>}
                <span
                  style={{
                    fontSize: "12px",
                    color: isLast ? "#6d28d9" : "#9ca3af",
                    fontWeight: isLast ? 500 : 400,
                    cursor: isLast ? "default" : "pointer",
                    textDecoration: isLast ? "none" : "underline",
                    textDecorationColor: "#d1d5db",
                  }}
                  onClick={() => !isLast && setPath(path.slice(0, i + 1))}
                >
                  {label}
                </span>
              </span>
            );
          })}
        </div>
      )}

      {/* Question or diagnosis */}
      {isDiagnosis ? (
        <DiagnosisCard node={currentNode} />
      ) : (
        <div>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "12px",
              lineHeight: 1.4,
            }}
          >
            {currentNode.question}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {currentNode.options.map((opt) => (
              <button
                key={opt.next}
                onClick={() => handleSelect(opt.next)}
                style={{
                  textAlign: "left",
                  padding: "12px 16px",
                  fontSize: "14px",
                  color: "#374151",
                  backgroundColor: "#ffffff",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "8px",
                  cursor: "pointer",
                  lineHeight: 1.4,
                  transition: "border-color 0.15s ease, background-color 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = "#6d28d9";
                  e.currentTarget.style.backgroundColor = "#faf5ff";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                  e.currentTarget.style.backgroundColor = "#ffffff";
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
        {path.length > 1 && (
          <button
            onClick={handleBack}
            style={{
              fontSize: "13px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}
        {path.length > 1 && (
          <button
            onClick={handleReset}
            style={{
              fontSize: "13px",
              padding: "6px 14px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#ffffff",
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
