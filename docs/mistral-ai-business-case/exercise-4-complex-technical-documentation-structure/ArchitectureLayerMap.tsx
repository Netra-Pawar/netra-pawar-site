import React, { useState } from 'react';

type Layer = {
  id: string;
  num: string;
  title: string;
  sub: string;
  personas: string[];
  components: string[];
  docs: { label: string; desc: string }[];
  trustNote?: string;
  numColor: string;
};

const LAYERS: Layer[] = [
  {
    id: 'orchestration',
    num: '1',
    title: 'Orchestration plane (Mistral-hosted)',
    sub: 'Studio, model registry, agent runtime. Optional, lives outside customer perimeter.',
    personas: ['se', 'sec'],
    components: ['AI Studio', 'Model registry', 'Agent runtime'],
    docs: [
      { label: 'architecture', desc: 'Where control plane fits in the stack' },
      { label: 'decision-guide', desc: 'Hybrid vs. fully on-prem vs. air-gapped' },
    ],
    numColor: 'var(--ifm-color-warning-darker)',
  },
  {
    id: 'boundary',
    num: '\u{1F512}',
    title: 'Data sovereignty boundary',
    sub: 'Network perimeter — everything below stays on customer infrastructure.',
    personas: ['se', 'sec', 'de'],
    components: [],
    docs: [
      { label: 'security', desc: 'Data residency, auth, audit, compliance evidence' },
      { label: 'install/air-gapped', desc: 'Zero external connectivity pattern' },
    ],
    trustNote: 'Guarantee: prompt data, completions, weights, and telemetry never cross this boundary. In air-gapped mode, no network path exists at all.',
    numColor: 'var(--ifm-color-danger-darker)',
  },
  {
    id: 'gateway',
    num: '2',
    title: 'API gateway and authentication',
    sub: 'TLS termination, auth enforcement, rate limiting, request routing.',
    personas: ['de', 'sec', 'sre'],
    components: ['Ingress / LB', 'vLLM --api-key', 'Rate limiter'],
    docs: [
      { label: 'install/kubernetes-production', desc: 'Service, PDB, auth config' },
      { label: 'configuration', desc: 'API endpoint tuning, auth setup' },
    ],
    numColor: 'var(--ifm-color-primary-darker)',
  },
  {
    id: 'inference',
    num: '3',
    title: 'Inference engine (vLLM)',
    sub: 'Model serving, tensor parallelism, continuous batching, KV cache.',
    personas: ['de', 'sre'],
    components: ['vLLM server', 'Tensor parallel', 'OpenAI-compat API'],
    docs: [
      { label: 'install/kubernetes-production', desc: 'Full annotated manifest' },
      { label: 'install/single-node-eval', desc: 'Docker-based fast path' },
      { label: 'configuration', desc: 'Runtime tuning' },
    ],
    numColor: 'var(--ifm-color-success-darker)',
  },
  {
    id: 'hardware',
    num: '4',
    title: 'Hardware and GPU foundation',
    sub: 'NVIDIA GPU operator, CUDA, NVMe storage, bare metal or VM hosts.',
    personas: ['se', 'de'],
    components: ['NVIDIA H100/A100', 'GPU operator', 'NVMe PVCs'],
    docs: [
      { label: 'planning', desc: 'GPU sizing, storage IOPS, readiness checklist' },
      { label: 'reference', desc: 'Compatibility matrix' },
    ],
    numColor: 'var(--ifm-color-info-darker)',
  },
  {
    id: 'ops',
    num: '\u{1F4C8}',
    title: 'Observability and operations',
    sub: 'Monitoring, alerting, scaling, rollback, troubleshooting. Spans all layers above.',
    personas: ['sre'],
    components: ['Prometheus', 'Grafana', 'Alertmanager'],
    docs: [
      { label: 'operations', desc: 'Health model, metrics, alerts, maintenance' },
      { label: 'rollback-recovery', desc: 'Model rollback, config revert, disaster recovery' },
      { label: 'troubleshooting', desc: 'Symptom matrix, diagnostics, escalation' },
      { label: 'validation', desc: 'Acceptance criteria checklist' },
    ],
    numColor: 'var(--ifm-color-emphasis-700)',
  },
];

const PERSONAS = [
  { key: 'all', label: 'All layers' },
  { key: 'se', label: 'Solutions engineer' },
  { key: 'de', label: 'Deployment engineer' },
  { key: 'sec', label: 'Security reviewer' },
  { key: 'sre', label: 'SRE / support' },
];

export default function ArchitectureLayerMap() {
  const [openLayer, setOpenLayer] = useState<string | null>(null);
  const [persona, setPersona] = useState('all');

  return (
    <div style={{ fontFamily: 'var(--ifm-font-family-base)', margin: '1.5rem 0' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {PERSONAS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPersona(p.key)}
            style={{
              fontSize: 12, padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
              border: persona === p.key ? '1px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
              background: persona === p.key ? 'var(--ifm-color-primary-lightest)' : 'transparent',
              color: persona === p.key ? 'var(--ifm-color-primary-darker)' : 'var(--ifm-color-emphasis-700)',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {LAYERS.map((layer, i) => {
        const dimmed = persona !== 'all' && !layer.personas.includes(persona);
        const isOpen = openLayer === layer.id;
        return (
          <React.Fragment key={layer.id}>
            <div
              style={{
                border: isOpen ? '1px solid var(--ifm-color-primary)' : '1px solid var(--ifm-color-emphasis-300)',
                borderRadius: 12, marginBottom: 12, overflow: 'hidden',
                opacity: dimmed ? 0.35 : 1, pointerEvents: dimmed ? 'none' : 'auto',
                transition: 'opacity .2s, border-color .2s',
              }}
            >
              <div
                onClick={() => setOpenLayer(isOpen ? null : layer.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, flexShrink: 0, background: 'var(--ifm-color-emphasis-100)', color: layer.numColor,
                }}>
                  {layer.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{layer.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)' }}>{layer.sub}</div>
                </div>
                <span style={{ fontSize: 14, color: 'var(--ifm-color-emphasis-600)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                  &#9660;
                </span>
              </div>

              {isOpen && (
                <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--ifm-color-emphasis-300)' }}>
                  {layer.trustNote && (
                    <div style={{ fontSize: 12, color: 'var(--ifm-color-emphasis-700)', padding: '8px 12px', background: 'var(--ifm-color-emphasis-100)', borderRadius: 8, marginTop: 12, borderLeft: '2px solid var(--ifm-color-primary)', lineHeight: 1.5 }}>
                      {layer.trustNote}
                    </div>
                  )}
                  {layer.components.length > 0 && (
                    <div style={{ marginTop: 10, fontSize: 12, color: 'var(--ifm-color-emphasis-700)' }}>
                      Components:{' '}
                      {layer.components.map((c) => (
                        <span key={c} style={{ display: 'inline-flex', fontSize: 11, padding: '3px 8px', borderRadius: 4, margin: 2, border: '1px solid var(--ifm-color-emphasis-300)' }}>
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 12 }}>
                    {layer.docs.map((d) => (
                      <div key={d.label} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--ifm-color-emphasis-300)' }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}><code>{d.label}</code></div>
                        <div style={{ fontSize: 11, color: 'var(--ifm-color-emphasis-700)', marginTop: 2, lineHeight: 1.4 }}>{d.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {i < LAYERS.length - 1 && (
              <div style={{ textAlign: 'center', color: 'var(--ifm-color-emphasis-500)', fontSize: 12, margin: '4px 0' }}>
                {i === LAYERS.length - 2 ? '\u25B2 Day 1 (build)  |  Day 2 (operate) \u25BC' : '\u25BC'}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
