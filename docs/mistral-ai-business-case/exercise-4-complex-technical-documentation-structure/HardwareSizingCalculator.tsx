import React, { useState, useMemo } from 'react';

const MODELS = [
  { label: 'Mistral 7B', params: 7, defaultPrecision: 2 },
  { label: 'Mistral Nemo 12B', params: 12, defaultPrecision: 2 },
  { label: 'Devstral / Small 3.x (24B)', params: 24, defaultPrecision: 2 },
  { label: 'Mistral Medium 3.5 (128B)', params: 128, defaultPrecision: 1 },
];

const PRECISIONS = [
  { label: 'FP16 / BF16 (2 bytes/param)', bytes: 2 },
  { label: 'FP8 (1 byte/param)', bytes: 1 },
  { label: 'INT4 / AWQ (0.5 bytes/param)', bytes: 0.5 },
];

export default function HardwareSizingCalculator() {
  const [modelIdx, setModelIdx] = useState(3);
  const [precisionIdx, setPrecisionIdx] = useState(1);
  const [contextK, setContextK] = useState(32);
  const [concurrency, setConcurrency] = useState(64);

  const result = useMemo(() => {
    const paramsB = MODELS[modelIdx].params;
    const precisionBytes = PRECISIONS[precisionIdx].bytes;
    const totalTokens = contextK * 1024;

    const weightsGB = paramsB * precisionBytes;
    const kvBytesPerToken = paramsB * precisionBytes * 9362;
    const kvCacheGB = (kvBytesPerToken * totalTokens * concurrency) / (1024 * 1024 * 1024);
    const overheadGB = (weightsGB + kvCacheGB) * 0.15;
    const totalGB = weightsGB + kvCacheGB + overheadGB;

    const gpuCount = Math.max(1, Math.ceil(totalGB / 80));
    const tpSize = gpuCount <= 1 ? 1 : gpuCount <= 2 ? 2 : gpuCount <= 4 ? 4 : 8;

    return { weightsGB, kvCacheGB, totalGB, gpuCount, tpSize, totalTokens };
  }, [modelIdx, precisionIdx, contextK, concurrency]);

  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 };
  const labelStyle: React.CSSProperties = { fontSize: 13, color: 'var(--ifm-color-emphasis-700)', width: 150, flexShrink: 0 };
  const outStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, minWidth: 80, textAlign: 'right' };

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)', margin: '1.5rem 0' }}>
      <div style={rowStyle}>
        <label style={labelStyle}>Model</label>
        <select value={modelIdx} onChange={(e) => setModelIdx(Number(e.target.value))} style={{ flex: 1 }}>
          {MODELS.map((m, i) => (
            <option key={m.label} value={i}>{m.label}</option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Precision</label>
        <select value={precisionIdx} onChange={(e) => setPrecisionIdx(Number(e.target.value))} style={{ flex: 1 }}>
          {PRECISIONS.map((p, i) => (
            <option key={p.label} value={i}>{p.label}</option>
          ))}
        </select>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Context length</label>
        <input
          type="range" min={4} max={256} step={4} value={contextK}
          onChange={(e) => setContextK(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={outStyle}>{contextK}k tokens</span>
      </div>

      <div style={rowStyle}>
        <label style={labelStyle}>Concurrent requests</label>
        <input
          type="range" min={1} max={512} value={concurrency}
          onChange={(e) => setConcurrency(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={outStyle}>{concurrency}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, margin: '20px 0' }}>
        <div style={{ background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)', marginBottom: 4 }}>Estimated VRAM needed</div>
          <div style={{ fontSize: 22, fontWeight: 600, color: result.totalGB > 640 ? 'var(--ifm-color-danger)' : 'inherit' }}>
            {Math.round(result.totalGB).toLocaleString()} GB
          </div>
          <div style={{ fontSize: 11, color: 'var(--ifm-color-emphasis-700)', marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--ifm-color-emphasis-300)' }}>
            weights {Math.round(result.weightsGB)} GB + KV cache {Math.round(result.kvCacheGB).toLocaleString()} GB + 15% overhead
          </div>
        </div>
        <div style={{ background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)', marginBottom: 4 }}>GPUs (80GB H100/A100)</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{result.gpuCount}</div>
        </div>
        <div style={{ background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, padding: 14 }}>
          <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)', marginBottom: 4 }}>Recommended tensor-parallel-size</div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{result.tpSize}</div>
        </div>
      </div>

      <div style={{ padding: 14, border: '1px solid var(--ifm-color-primary)', borderRadius: 8, background: 'var(--ifm-color-primary-lightest)' }}>
        <div style={{ fontSize: 11, color: 'var(--ifm-color-primary-darker)', fontWeight: 600, marginBottom: 4 }}>vLLM flags</div>
        <code style={{ fontSize: 13 }}>
          --tensor-parallel-size={result.tpSize} --max-model-len={result.totalTokens} --max-num-seqs={concurrency}
        </code>
      </div>

      <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)', padding: '12px 14px', background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, marginTop: 16, lineHeight: 1.6 }}>
        KV cache is estimated using <code>2 × precision_bytes × params(B) × 9,362 bytes/token/B-param</code> — a
        constant derived from Mistral 7B's published architecture (32 layers, 8 KV heads via GQA, head_dim 128),
        extrapolated to other model tiers. This is a planning estimate, not a guarantee: confirm final sizing
        against vLLM's own <code>--gpu-memory-utilization</code> profiling output before purchasing hardware.
        KV cache — not model weights — dominates VRAM at high concurrency or long context.
      </div>
    </div>
  );
}
