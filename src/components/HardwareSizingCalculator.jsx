import { useState, useMemo } from "react";

const MODELS = [
  {
    key: "mistral-7b",
    label: "Mistral 7B",
    params_b: 7.24,
    num_layers: 32,
    num_kv_heads: 8,
    head_dim: 128,
    hf_id: "mistralai/Mistral-7B-Instruct-v0.3",
    note: null,
  },
  {
    key: "mistral-small-24b",
    label: "Mistral Small 3.1 (24B)",
    params_b: 24,
    num_layers: 40,
    num_kv_heads: 8,
    head_dim: 128,
    hf_id: "mistralai/Mistral-Small-3.1-24B-Instruct-2503",
    note: null,
  },
  {
    key: "codestral-22b",
    label: "Codestral 22B",
    params_b: 22,
    num_layers: 40,
    num_kv_heads: 8,
    head_dim: 128,
    hf_id: "mistralai/Codestral-22B-v0.1",
    note: null,
  },
  {
    key: "mistral-medium-123b",
    label: "Mistral Medium 3.5 (~123B)",
    params_b: 123,
    num_layers: 88,
    num_kv_heads: 8,
    head_dim: 128,
    hf_id: "mistralai/Mistral-Medium-3",
    note: "MoE model. Weight VRAM is based on total params; active compute per token uses ~39B params. Layer and KV head specs are approximate.",
  },
];

const PRECISIONS = [
  { key: "bf16", label: "bf16 (default)", bytes: 2, dtype_flag: "--dtype bfloat16" },
  { key: "fp16", label: "fp16", bytes: 2, dtype_flag: "--dtype float16" },
  { key: "int8", label: "int8 (quantised)", bytes: 1, dtype_flag: "--quantization bitsandbytes --load-in-8bit" },
  { key: "int4", label: "int4 / GPTQ (quantised)", bytes: 0.5, dtype_flag: "--quantization gptq" },
];

const GPUS = [
  { key: "h100-80gb", label: "NVIDIA H100 SXM5 80 GB", vram_gb: 80 },
  { key: "a100-80gb", label: "NVIDIA A100 80 GB", vram_gb: 80 },
  { key: "a100-40gb", label: "NVIDIA A100 40 GB", vram_gb: 40 },
  { key: "rtx4090-24gb", label: "NVIDIA RTX 4090 24 GB (eval only)", vram_gb: 24 },
];

const CONTEXT_OPTIONS = [4096, 8192, 16384, 32768];

const selectStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "13px",
  border: "1.5px solid #d1d5db",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#374151",
  outline: "none",
  cursor: "pointer",
};

const labelStyle = {
  fontSize: "12px",
  fontWeight: 500,
  color: "#374151",
  display: "block",
  marginBottom: "4px",
};

function nextPow2(n) {
  if (n <= 1) return 1;
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

export default function HardwareSizingCalculator() {
  const [modelKey, setModelKey] = useState("mistral-7b");
  const [precisionKey, setPrecisionKey] = useState("bf16");
  const [contextLength, setContextLength] = useState(4096);
  const [concurrency, setConcurrency] = useState(10);
  const [gpuKey, setGpuKey] = useState("h100-80gb");

  const model = MODELS.find((m) => m.key === modelKey);
  const precision = PRECISIONS.find((p) => p.key === precisionKey);
  const gpu = GPUS.find((g) => g.key === gpuKey);

  const calc = useMemo(() => {
    const weightsGb = (model.params_b * 1e9 * precision.bytes) / 1024 ** 3;
    // KV cache: 2 (K+V) × layers × kv_heads × head_dim × context_len × concurrency × bytes/element
    // Formula calibrated against Mistral 7B published architecture: 32 layers, 8 KV heads, head_dim 128
    const kvBytes =
      2 *
      model.num_layers *
      model.num_kv_heads *
      model.head_dim *
      contextLength *
      concurrency *
      precision.bytes;
    const kvCacheGb = kvBytes / 1024 ** 3;
    const overheadGb = 2.5;
    const totalGb = weightsGb + kvCacheGb + overheadGb;
    const gpuCount = Math.ceil(totalGb / gpu.vram_gb);
    const tpSize = nextPow2(gpuCount);
    return {
      weightsGb: weightsGb.toFixed(1),
      kvCacheGb: kvCacheGb.toFixed(1),
      overheadGb: overheadGb.toFixed(1),
      totalGb: totalGb.toFixed(1),
      gpuCount,
      tpSize,
    };
  }, [model, precision, contextLength, concurrency, gpu]);

  const flags = [
    `--model ${model.hf_id}`,
    precision.dtype_flag,
    `--max-model-len ${contextLength}`,
    `--tensor-parallel-size ${calc.tpSize}`,
    `--max-num-seqs ${concurrency}`,
  ];

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "32px 0",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
        Hardware Sizing Calculator
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 20px 0" }}>
        Select model, precision, and workload to get estimated VRAM, GPU count, and the exact vLLM
        flags to paste into your deployment manifest.
      </p>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}
      >
        <div>
          <label style={labelStyle}>Model</label>
          <select value={modelKey} onChange={(e) => setModelKey(e.target.value)} style={selectStyle}>
            {MODELS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Precision</label>
          <select
            value={precisionKey}
            onChange={(e) => setPrecisionKey(e.target.value)}
            style={selectStyle}
          >
            {PRECISIONS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Max context length</label>
          <select
            value={contextLength}
            onChange={(e) => setContextLength(Number(e.target.value))}
            style={selectStyle}
          >
            {CONTEXT_OPTIONS.map((l) => (
              <option key={l} value={l}>
                {l.toLocaleString()} tokens
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>GPU type</label>
          <select value={gpuKey} onChange={(e) => setGpuKey(e.target.value)} style={selectStyle}>
            {GPUS.map((g) => (
              <option key={g.key} value={g.key}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label style={labelStyle}>
          Concurrent requests (--max-num-seqs):{" "}
          <span style={{ color: "#6d28d9", fontWeight: 700 }}>{concurrency}</span>
        </label>
        <input
          type="range"
          min={1}
          max={200}
          value={concurrency}
          onChange={(e) => setConcurrency(Number(e.target.value))}
          style={{ width: "100%", marginTop: "4px", accentColor: "#6d28d9" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "11px",
            color: "#9ca3af",
            marginTop: "2px",
          }}
        >
          <span>1</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
        </div>
      </div>

      <div
        style={{
          background: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "10px" }}>
          VRAM estimate
        </div>
        {[
          { label: "Model weights", gb: calc.weightsGb },
          {
            label: `KV cache (${contextLength.toLocaleString()} tok × ${concurrency} seq)`,
            gb: calc.kvCacheGb,
          },
          { label: "CUDA overhead + activations", gb: calc.overheadGb },
        ].map(({ label, gb }) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "13px", color: "#6b7280" }}>{label}</span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#374151",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {gb} GB
            </span>
          </div>
        ))}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Total VRAM</span>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#6d28d9" }}>
            {calc.totalGb} GB
          </span>
        </div>
      </div>

      <div
        style={{
          background: "#faf5ff",
          border: "1.5px solid #6d28d9",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div>
            <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 500, marginBottom: "4px" }}>
              GPUs required
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#6d28d9", lineHeight: 1 }}
            >
              {calc.gpuCount}
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{gpu.label}</div>
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#7c3aed", fontWeight: 500, marginBottom: "4px" }}>
              --tensor-parallel-size
            </div>
            <div
              style={{ fontSize: "28px", fontWeight: 700, color: "#6d28d9", lineHeight: 1 }}
            >
              {calc.tpSize}
            </div>
            {calc.gpuCount !== calc.tpSize && (
              <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "4px" }}>
                Rounded up from {calc.gpuCount} (must be power of 2)
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{ background: "#1e1e2e", borderRadius: "10px", padding: "16px", marginBottom: "8px" }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#6c7086",
            fontWeight: 500,
            marginBottom: "6px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          vllm serve
        </div>
        <code
          style={{
            display: "block",
            fontSize: "12px",
            color: "#cdd6f4",
            lineHeight: 2,
            whiteSpace: "pre-wrap",
            fontFamily: "monospace",
            margin: 0,
          }}
        >
          {flags.join(" \\\n  ")}
        </code>
      </div>

      {model.note && (
        <p style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic", margin: "8px 0 0" }}>
          Note: {model.note}
        </p>
      )}

      <p style={{ fontSize: "12px", color: "#9ca3af", fontStyle: "italic", margin: "6px 0 0" }}>
        KV-cache formula: 2 × {model.num_layers} layers × {model.num_kv_heads} KV heads ×{" "}
        {model.head_dim} head_dim × context × concurrent_seqs × {precision.bytes} bytes/element.
        Mistral 7B architecture (32 layers, 8 KV heads, head_dim 128) from published specifications.
        Larger model specs are approximate. Excludes NVLink bandwidth requirements.
      </p>
    </div>
  );
}
