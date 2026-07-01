import { useState } from "react";

const LAYERS = [
  {
    id: "orchestration",
    label: "Layer 1: Orchestration plane",
    sublabel: "Mistral Studio · Model registry · Agent runtime",
    badge: "Hosted by Mistral (optional)",
    badgeColor: "#7c3aed",
    badgeBg: "#ede9fe",
    borderColor: "#7c3aed",
    bg: "#faf5ff",
    accentColor: "#6d28d9",
    personas: ["solutions-engineer"],
    pages: ["architecture", "decision-guide"],
    detail:
      "The Mistral-managed control plane. In a hybrid deployment, this layer stays Mistral-hosted while Layers 2–4 run on your infrastructure. In a fully air-gapped deployment, this layer is absent — the inference engine runs standalone, with no connection to Mistral's hosted services.",
  },
  {
    id: "sovereignty",
    label: "Data sovereignty boundary",
    sublabel: "No prompt or completion data crosses this line",
    badge: "Trust boundary",
    badgeColor: "#92400e",
    badgeBg: "#fef3c7",
    borderColor: "#d97706",
    bg: "#fffbeb",
    accentColor: "#b45309",
    personas: ["security-reviewer"],
    pages: ["security", "install/air-gapped"],
    isBoundary: true,
    detail:
      "The guarantee that customer data — prompts, completions, documents — never leaves customer-controlled infrastructure. Every layer below this line is exclusively owned and operated by the customer. Mistral has no access to data, weights, or compute below this boundary.",
  },
  {
    id: "api-gateway",
    label: "Layer 2: API gateway & authentication",
    sublabel: "TLS · RBAC · Rate limiting · Routing",
    badge: "Customer-owned",
    badgeColor: "#166534",
    badgeBg: "#dcfce7",
    borderColor: "#16a34a",
    bg: "#f0fdf4",
    accentColor: "#15803d",
    personas: ["deployment-engineer", "security-reviewer"],
    pages: ["install/kubernetes-production", "configuration"],
    detail:
      "The entry point to customer infrastructure. Handles TLS termination, API key validation, RBAC enforcement, and request routing to the inference engine. Sits above the inference layer so authentication decisions are made before any GPU compute is consumed — a request that fails auth never touches the model.",
  },
  {
    id: "inference",
    label: "Layer 3: Inference engine (vLLM)",
    sublabel: "Model serving · Tensor parallelism · Continuous batching",
    badge: "Customer-owned",
    badgeColor: "#166534",
    badgeBg: "#dcfce7",
    borderColor: "#16a34a",
    bg: "#f0fdf4",
    accentColor: "#15803d",
    personas: ["deployment-engineer", "developer"],
    pages: ["install/kubernetes-production", "install/single-node-eval", "configuration"],
    detail:
      "vLLM serving the Mistral model. Handles continuous batching, KV cache management, and tensor parallelism across GPUs. The inference engine is stateless — it reads model weights from storage at startup and processes requests in memory; no user data is persisted beyond the active request.",
  },
  {
    id: "hardware",
    label: "Layer 4: Hardware & GPU foundation",
    sublabel: "NVIDIA GPUs · CUDA · NVMe storage · Kubernetes",
    badge: "Customer-owned",
    badgeColor: "#166534",
    badgeBg: "#dcfce7",
    borderColor: "#16a34a",
    bg: "#f0fdf4",
    accentColor: "#15803d",
    personas: ["solutions-engineer", "deployment-engineer"],
    pages: ["planning", "reference"],
    detail:
      "The physical or virtual compute layer. NVIDIA GPUs with CUDA drivers, high-speed NVMe storage for model weights, and Kubernetes as the container orchestrator. GPU topology (NVLink vs. PCIe interconnect) directly affects tensor parallelism performance and must match the --tensor-parallel-size configuration in vLLM.",
  },
  {
    id: "observability",
    label: "Observability & operations",
    sublabel: "Prometheus · Grafana · Alerting · Incident recovery",
    badge: "Cross-cutting (spans all layers)",
    badgeColor: "#075985",
    badgeBg: "#e0f2fe",
    borderColor: "#0369a1",
    bg: "#f0f9ff",
    accentColor: "#0369a1",
    personas: ["sre"],
    pages: ["operations", "rollback-recovery", "troubleshooting", "validation"],
    detail:
      "Monitoring and operational tooling that spans every layer. Prometheus scrapes metrics from vLLM (tokens/sec, queue depth, GPU utilisation) and from the gateway (request latency, error rates). Grafana dashboards surface these metrics. Alerting fires before SLOs are violated, not after.",
  },
];

const PERSONAS = [
  { id: "all", label: "All personas" },
  { id: "solutions-engineer", label: "Solutions Engineer" },
  { id: "deployment-engineer", label: "Deployment Engineer" },
  { id: "security-reviewer", label: "Security Reviewer" },
  { id: "sre", label: "SRE / Support" },
  { id: "developer", label: "Self-Serve Developer" },
];

export default function ArchitectureLayerMap() {
  const [expandedId, setExpandedId] = useState(null);
  const [activePersona, setActivePersona] = useState("all");

  const isRelevant = (layer) =>
    activePersona === "all" || layer.personas.includes(activePersona);

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "32px 0",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
        Layered sovereign stack
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 14px 0" }}>
        Click any layer to expand it. Filter by persona to highlight the layers on your path.
      </p>

      {/* Persona filter */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePersona(p.id)}
            style={{
              fontSize: "12px",
              padding: "5px 12px",
              borderRadius: "6px",
              border: `1px solid ${activePersona === p.id ? "#6d28d9" : "#d1d5db"}`,
              backgroundColor: activePersona === p.id ? "#ede9fe" : "#ffffff",
              color: activePersona === p.id ? "#6d28d9" : "#374151",
              cursor: "pointer",
              fontWeight: activePersona === p.id ? 500 : 400,
              transition: "all 0.15s ease",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Layer stack */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {LAYERS.map((layer) => {
          const relevant = isRelevant(layer);
          const expanded = expandedId === layer.id;

          return (
            <div
              key={layer.id}
              style={{
                opacity: relevant ? 1 : 0.3,
                transition: "opacity 0.2s ease",
              }}
            >
              <div
                onClick={() => setExpandedId(expanded ? null : layer.id)}
                style={{
                  border: `1.5px solid ${expanded ? layer.borderColor : "#e5e7eb"}`,
                  borderRadius: layer.isBoundary ? "6px" : "10px",
                  padding: layer.isBoundary ? "10px 16px" : "14px 16px",
                  backgroundColor: expanded ? layer.bg : layer.isBoundary ? "#fffdf0" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  borderStyle: layer.isBoundary ? "dashed" : "solid",
                }}
                onMouseOver={(e) => {
                  if (!expanded) {
                    e.currentTarget.style.borderColor = layer.borderColor;
                    e.currentTarget.style.backgroundColor = layer.bg;
                  }
                }}
                onMouseOut={(e) => {
                  if (!expanded) {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = layer.isBoundary ? "#fffdf0" : "#ffffff";
                  }
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: layer.isBoundary ? "12px" : "13px",
                          fontWeight: 600,
                          color: layer.accentColor,
                          letterSpacing: layer.isBoundary ? "0.04em" : 0,
                          textTransform: layer.isBoundary ? "uppercase" : "none",
                        }}
                      >
                        {layer.label}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 500,
                          color: layer.badgeColor,
                          backgroundColor: layer.badgeBg,
                          padding: "1px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {layer.badge}
                      </span>
                    </div>
                    {!layer.isBoundary && (
                      <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "3px" }}>
                        {layer.sublabel}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "16px",
                      color: "#9ca3af",
                      marginLeft: "12px",
                      flexShrink: 0,
                      transition: "transform 0.2s ease",
                      transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
                      display: "inline-block",
                    }}
                  >
                    ›
                  </span>
                </div>

                {expanded && (
                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: `1px solid ${layer.borderColor}20` }}>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#374151",
                        lineHeight: 1.6,
                        margin: "0 0 12px 0",
                      }}
                    >
                      {layer.detail}
                    </p>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", marginBottom: "4px" }}>
                          Relevant pages
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {layer.pages.map((page) => (
                            <span
                              key={page}
                              style={{
                                fontSize: "11px",
                                fontFamily: "monospace",
                                color: layer.accentColor,
                                backgroundColor: layer.badgeBg,
                                padding: "2px 8px",
                                borderRadius: "4px",
                              }}
                            >
                              {page}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 500, color: "#9ca3af", marginBottom: "4px" }}>
                          Primary persona
                        </div>
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                          {layer.personas.map((pid) => {
                            const p = PERSONAS.find((x) => x.id === pid);
                            return (
                              <span
                                key={pid}
                                style={{
                                  fontSize: "11px",
                                  color: "#6b7280",
                                  backgroundColor: "#f3f4f6",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                }}
                              >
                                {p ? p.label : pid}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
