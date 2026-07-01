import React, { useState } from 'react';

type Node = {
  label: string;
  q?: string;
  opts?: { t: string; n: string }[];
  diagnosis?: string;
  fix?: string;
};

const TREE: Record<string, Node> = {
  oom: {
    label: 'OOM / crash on load',
    q: 'When does the crash happen?',
    opts: [
      { t: 'Immediately on startup, before any requests', n: 'oom_startup' },
      { t: 'After running fine for a while, under load', n: 'oom_runtime' },
    ],
  },
  oom_startup: {
    label: 'Crashes on startup',
    diagnosis: 'Model weights exceed available VRAM at the configured precision — check the Hardware Sizing Calculator above, since KV cache reservations at startup can also trigger this if --gpu-memory-utilization is set too high for your context length.',
    fix: '# Check actual VRAM vs. model requirement\nkubectl logs <pod> | grep -i "cuda out of memory"\n\n# Re-run the Hardware Sizing Calculator with your actual\n# context length and concurrency, not just model size',
  },
  oom_runtime: {
    label: 'Crashes under load',
    diagnosis: 'KV cache is exceeding gpu-memory-utilization as concurrent requests and context length grow.',
    fix: '# Check current GPU cache usage\ncurl localhost:8000/metrics | grep vllm:gpu_cache_usage_perc\n# (requires kubectl port-forward svc/mistral-inference-service 8000:80 first)\n\n# Reduce --max-num-seqs or --max-model-len,\n# or increase --gpu-memory-utilization if headroom exists',
  },
  auth: {
    label: '401 / 403 errors',
    q: 'Is this happening for all requests or only some?',
    opts: [
      { t: 'All requests, including ones that worked before', n: 'auth_all' },
      { t: 'Only specific clients or after a recent change', n: 'auth_some' },
    ],
  },
  auth_all: {
    label: 'All requests failing',
    diagnosis: 'Gateway auth policy or vLLM --api-key validation is down or misconfigured.',
    fix: '# Confirm the vLLM container was started with --api-key set\nkubectl get deployment mistral-nemo-vllm -o yaml | grep -A2 api-key\n\n# Verify the client is sending the matching Authorization header\nkubectl logs <pod> | grep -i "401\\|unauthorized"',
  },
  auth_some: {
    label: 'Specific clients failing',
    diagnosis: 'Token rotation or expiry — the failing client is likely using a stale or revoked token.',
    fix: '# Confirm token expiry and rotation schedule\nkubectl get secret huggingface-token -o jsonpath="{.metadata.creationTimestamp}"\n\n# Reissue and redistribute the token to the affected client',
  },
  slow: {
    label: 'Slow / high latency',
    q: 'Is time-to-first-token slow, or is generation itself slow?',
    opts: [
      { t: 'Time to first token is slow (queueing delay)', n: 'slow_ttft' },
      { t: 'Token generation rate is slow throughout', n: 'slow_gen' },
    ],
  },
  slow_ttft: {
    label: 'Slow time-to-first-token',
    diagnosis: 'Request queue depth is too high for current replica count — requests are waiting, not being processed slowly.',
    fix: '# Check queue depth metric\ncurl localhost:8000/metrics | grep vllm:num_requests_waiting\n# (requires kubectl port-forward svc/mistral-inference-service 8000:80 first)\n\n# If consistently high: scale replicas or raise --max-num-seqs',
  },
  slow_gen: {
    label: 'Slow generation throughout',
    diagnosis: 'Tensor parallelism may be misconfigured, or GPUs are being shared with another workload.',
    fix: '# Confirm no other pods share these GPUs\nkubectl describe node <gpu-node> | grep -A5 "Allocated resources"\n\n# Verify tensor-parallel-size matches GPUs actually assigned to this pod',
  },
  notready: {
    label: 'Pod stuck, not ready',
    q: 'What does kubectl describe show for the pod?',
    opts: [
      { t: 'Readiness probe failing, container is running', n: 'notready_probe' },
      { t: 'Pod is Pending, not scheduled at all', n: 'notready_pending' },
    ],
  },
  notready_probe: {
    label: 'Readiness probe failing',
    diagnosis: 'Model weights are still loading into VRAM — this can take 60-120+ seconds for large models on first start. Also check that the PersistentVolumeClaim referenced by the pod actually exists; a missing PVC leaves the pod stuck before it ever reaches the probe.',
    fix: '# Check if the PVC exists and is bound\nkubectl get pvc mistral-model-pvc\n\n# If bound, check load progress in logs\nkubectl logs <pod> -f\n# Look for "Uvicorn running" — if absent, model is still loading',
  },
  notready_pending: {
    label: 'Pod not scheduled',
    diagnosis: 'Either no single node has enough free GPUs matching the resource request, or your GPUs are on one node while the anti-affinity rule requires two replicas on two different nodes.',
    fix: '# Check GPU availability per node (not just cluster total)\nkubectl describe nodes | grep -A3 nvidia.com/gpu\n\n# Confirm the NVIDIA device plugin is running — for GPU Operator\n# installs this is usually its own namespace, not kube-system\nkubectl get pods -A | grep nvidia-device-plugin',
  },
};

const SYMPTOMS = [
  { key: 'oom', label: 'OOM / crash on load' },
  { key: 'auth', label: '401 / 403 errors' },
  { key: 'slow', label: 'Slow / high latency' },
  { key: 'notready', label: 'Pod stuck, not ready' },
];

export default function DeploymentDiagnosticTree() {
  const [path, setPath] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const pick = (key: string) => {
    setActive(key);
    setPath([key]);
  };

  const drillIn = (key: string) => {
    setPath([...path, key]);
  };

  const reset = () => {
    setActive(null);
    setPath([]);
  };

  const currentKey = path[path.length - 1];
  const currentNode = currentKey ? TREE[currentKey] : null;

  const btnStyle: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: 8,
    borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-300)', background: 'transparent',
    color: 'inherit', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)', margin: '1.5rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 16 }}>
        {SYMPTOMS.map((s) => (
          <button
            key={s.key}
            onClick={() => pick(s.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8,
              border: active === s.key ? '2px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
              background: active === s.key ? 'var(--ifm-color-primary-lightest)' : 'var(--ifm-background-surface-color)',
              cursor: 'pointer', fontSize: 13, color: 'inherit', textAlign: 'left',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {path.length > 0 && (
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: 'var(--ifm-color-emphasis-700)', marginBottom: 14, flexWrap: 'wrap' }}>
          {path.map((k, i) => (
            <React.Fragment key={k}>
              <span style={{ fontWeight: i === path.length - 1 ? 600 : 400, color: i === path.length - 1 ? 'inherit' : undefined }}>
                {TREE[k].label}
              </span>
              {i < path.length - 1 && <span>&rsaquo;</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {currentNode && (
        <div style={{ border: '1px solid var(--ifm-color-emphasis-300)', borderRadius: 12, padding: '16px 20px', background: 'var(--ifm-background-surface-color)' }}>
          {currentNode.diagnosis ? (
            <>
              <div style={{ padding: '12px 14px', borderRadius: 8, background: 'var(--ifm-color-danger-contrast-background)', border: '1px solid var(--ifm-color-danger-light)', marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--ifm-color-danger-darker)', fontWeight: 600, marginBottom: 4 }}>Likely cause</div>
                <div style={{ fontSize: 13 }}>{currentNode.diagnosis}</div>
              </div>
              <pre style={{ fontSize: 12, background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {currentNode.fix}
              </pre>
              <button onClick={reset} style={{ ...btnStyle, marginTop: 12, marginBottom: 0 }}>
                &#8635; Start over with a different symptom
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>{currentNode.q}</div>
              {currentNode.opts?.map((o) => (
                <button key={o.n} onClick={() => drillIn(o.n)} style={btnStyle}>
                  {o.t}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
