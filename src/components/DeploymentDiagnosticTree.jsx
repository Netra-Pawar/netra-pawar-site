import { useState } from "react";

const TREE = {
  root: {
    question: "What is the primary symptom?",
    options: [
      { label: "Pod is stuck in Pending — never starts", next: "pod_pending" },
      { label: "Pod starts then crashes (CrashLoopBackOff)", next: "pod_crashloop" },
      { label: "GPU shows 0 allocatable on the node", next: "gpu_zero" },
      { label: "Inference returns errors or times out", next: "inference_error" },
      { label: "Inference works but is very slow", next: "perf_slow" },
    ],
  },
  pod_pending: {
    question: "What does `kubectl describe pod <pod>` say in the Events section?",
    options: [
      { label: "0/N nodes are schedulable — insufficient nvidia.com/gpu", next: "gpu_scheduling" },
      { label: "persistentvolumeclaim not found or unbound", next: "pvc_unbound" },
      { label: "Different scheduling error or no events", next: "pod_pending_other" },
    ],
  },
  gpu_scheduling: {
    diagnosis: "GPU device plugin not labeling nodes",
    stage: "Kubernetes scheduling",
    explanation:
      "The scheduler can't find any node advertising nvidia.com/gpu resources. The NVIDIA GPU Operator isn't running, hasn't labeled the node yet, or is installed in the wrong namespace. GPU Operator installs to the gpu-operator namespace — not kube-system.",
    commands: [
      "# GPU Operator runs in gpu-operator, not kube-system",
      "kubectl get pods -n gpu-operator",
      "",
      "# Check GPU resources advertised on the node",
      "kubectl describe node <node-name> | grep -A5 'Allocatable'",
      "",
      "# Verify device plugin daemonset exists",
      "kubectl get daemonset -n gpu-operator nvidia-device-plugin-daemonset",
    ],
    next_steps: [
      "If the gpu-operator namespace doesn't exist: install NVIDIA GPU Operator via Helm (not just the standalone device plugin).",
      "If pods are in CrashLoopBackOff: check that the CUDA driver on the host is >= 525 — run nvidia-smi on the host directly.",
      "If the node shows nvidia.com/gpu: 0: the driver is loaded but the device plugin hasn't reconciled — restart the device plugin pod.",
      "After fixing: kubectl delete pod <pending-pod> to trigger rescheduling.",
    ],
  },
  pvc_unbound: {
    diagnosis: "PersistentVolumeClaim not bound — model storage unavailable",
    stage: "Storage provisioning",
    explanation:
      "The pod can't start because it's waiting on a PersistentVolumeClaim that either doesn't exist or hasn't been bound to a PersistentVolume. Model weights (7–123 GB) require a pre-provisioned volume — the pod will stay Pending indefinitely without one.",
    commands: [
      "# List PVCs in the deployment namespace",
      "kubectl get pvc -n <namespace>",
      "",
      "# Describe the unbound PVC to see why binding failed",
      "kubectl describe pvc <pvc-name> -n <namespace>",
      "",
      "# Check available PersistentVolumes",
      "kubectl get pv",
    ],
    next_steps: [
      "If the PVC is missing entirely: apply the PVC manifest before the deployment manifest.",
      "If the PVC exists but is Pending: check that a StorageClass is configured with a provisioner (kubectl get storageclass).",
      "If PVC is Bound but pod is still Pending: the volume may be on the wrong node — check volumeBindingMode: WaitForFirstConsumer in the StorageClass.",
      "Confirm model weights are pre-loaded onto the volume before starting vLLM.",
    ],
  },
  pod_pending_other: {
    diagnosis: "Node affinity, taint, or resource constraint",
    stage: "Kubernetes scheduling",
    explanation:
      "The pod is pending for a reason other than GPU or storage — typically a node selector, taint/toleration mismatch, or insufficient CPU/memory.",
    commands: [
      "# Full describe — look at Events and Conditions sections",
      "kubectl describe pod <pod-name> -n <namespace>",
      "",
      "# Check node taints",
      "kubectl get nodes -o custom-columns=NAME:.metadata.name,TAINTS:.spec.taints",
      "",
      "# Timeline of all scheduling events",
      "kubectl get events --sort-by=.lastTimestamp -n <namespace>",
    ],
    next_steps: [
      "Match the pod's tolerations to the node's taints.",
      "If CPU or memory is insufficient: check resource requests vs. available node capacity with kubectl top nodes.",
      "If using nodeSelector or affinity rules: verify the target nodes carry the required labels.",
    ],
  },
  pod_crashloop: {
    question: "What do the pod logs show? (`kubectl logs <pod> --previous`)",
    options: [
      { label: "CUDA out of memory / torch.cuda.OutOfMemoryError", next: "oom" },
      { label: "NCCL or NVLink error / 'Unhandled NCCL error'", next: "nccl_error" },
      { label: "Model files not found / FileNotFoundError", next: "model_not_found" },
      { label: "No log output or unrecognised error", next: "crashloop_other" },
    ],
  },
  oom: {
    diagnosis: "GPU out of memory during model load or KV cache allocation",
    stage: "Inference engine (vLLM)",
    explanation:
      "vLLM pre-allocates the full KV cache at startup based on --max-num-seqs and --max-model-len. If model weights + KV cache exceed GPU VRAM, the process crashes before serving any requests.",
    commands: [
      "# Check logs for the exact OOM trigger",
      "kubectl logs <pod> --previous -n <namespace> | grep -i 'memory\\|OOM\\|killed'",
      "",
      "# Check current GPU memory from inside the pod",
      "kubectl exec -it <pod> -n <namespace> -- nvidia-smi",
    ],
    next_steps: [
      "Reduce --max-num-seqs (max concurrent sequences) — this directly reduces KV cache allocation.",
      "Reduce --max-model-len (context window) — shorter contexts use proportionally less KV cache.",
      "Switch to lower precision: --dtype float16 or --quantization gptq to shrink model weight footprint.",
      "Add more GPUs and increase --tensor-parallel-size to distribute memory across devices.",
      "Use the Hardware Sizing Calculator to re-estimate VRAM for your configuration before redeploying.",
    ],
  },
  nccl_error: {
    diagnosis: "GPU interconnect failure — NCCL can't initialise collective communication",
    stage: "Hardware / GPU topology",
    explanation:
      "NCCL is the library vLLM uses for tensor parallelism across multiple GPUs. Errors here almost always mean the GPUs can't communicate at the required bandwidth — NVLink isn't enabled, PCIe bandwidth is insufficient, or the NCCL version is incompatible with the CUDA driver.",
    commands: [
      "# Check NVLink status between GPUs",
      "nvidia-smi nvlink --status",
      "",
      "# Check GPU-to-GPU topology",
      "nvidia-smi topo --matrix",
      "",
      "# Enable verbose NCCL logging in the pod env",
      "# Add to deployment: env: [{name: NCCL_DEBUG, value: INFO}]",
      "kubectl exec -it <pod> -- env | grep NCCL",
    ],
    next_steps: [
      "If NVLink shows 'inactive': verify NVLink bridges are physically installed and all power connectors are seated.",
      "If GPUs are PCIe-only: reduce --tensor-parallel-size to 1 or 2 — PCIe works but only for smaller TP sizes.",
      "Set NCCL_DEBUG=INFO and NCCL_DEBUG_SUBSYS=ALL in the pod environment to get verbose NCCL output.",
      "Verify the CUDA driver version on the host matches what the NCCL version bundled in PyTorch expects.",
    ],
  },
  model_not_found: {
    diagnosis: "Model weights not present at the expected path",
    stage: "Storage / Ingestion",
    explanation:
      "The container started but vLLM can't find the model files at the path specified by --model. Either the PVC wasn't pre-loaded with weights, the mount path in the manifest is wrong, or the model download failed mid-way.",
    commands: [
      "# List files on the model volume from inside the pod",
      "kubectl exec -it <pod> -n <namespace> -- ls -lh /models",
      "",
      "# Check the volumeMount path in the deployment",
      "kubectl get deployment <deploy> -o jsonpath='{.spec.template.spec.containers[0].volumeMounts}'",
      "",
      "# Check what path vLLM is expecting",
      "kubectl get deployment <deploy> -o jsonpath='{.spec.template.spec.containers[0].args}'",
    ],
    next_steps: [
      "If /models is empty: pre-load the model weights using an init container or a separate download job before the vLLM pod starts.",
      "If there's a path mismatch: align the --model flag in the vLLM args with the actual mountPath in volumeMounts.",
      "Confirm the PVC is bound to the PV that actually contains the weights (not a freshly provisioned empty volume).",
    ],
  },
  crashloop_other: {
    diagnosis: "Startup failure — collect full logs for diagnosis",
    stage: "Unknown",
    explanation:
      "The crash reason isn't in the common categories. Collect the full startup logs and pod events to identify the root cause.",
    commands: [
      "# Full logs from the crashed container",
      "kubectl logs <pod> --previous -n <namespace>",
      "",
      "# Pod events and conditions",
      "kubectl describe pod <pod> -n <namespace>",
      "",
      "# Check the container exit code",
      "kubectl get pod <pod> -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'",
    ],
    next_steps: [
      "Exit code 137 means OOM-killed by the kernel (not CUDA OOM) — increase the pod's memory limit or reduce --cpu-memory-utilization-threshold.",
      "Exit code 1 with no output usually means a Python import error — check for missing dependencies or version mismatches.",
      "Use kubectl exec to open an interactive shell in the container and reproduce the crash manually.",
    ],
  },
  gpu_zero: {
    diagnosis: "GPU Operator or device plugin not running",
    stage: "Hardware / Kubernetes",
    explanation:
      "The node doesn't advertise nvidia.com/gpu resources. The NVIDIA GPU Operator isn't installed, the device plugin pod isn't running on this node, or the CUDA driver isn't loaded on the host. GPU Operator installs to the gpu-operator namespace — not kube-system.",
    commands: [
      "# GPU Operator runs in gpu-operator, not kube-system",
      "kubectl get pods -n gpu-operator",
      "",
      "# Check CUDA driver on the host via a debug pod",
      "kubectl debug node/<node-name> -it --image=ubuntu -- nvidia-smi",
      "",
      "# Check node labels set by GPU Operator",
      "kubectl get node <node-name> -o jsonpath='{.metadata.labels}' | tr ',' '\\n' | grep nvidia",
    ],
    next_steps: [
      "If the gpu-operator namespace is missing: install GPU Operator via Helm — see NVIDIA's Operator documentation.",
      "If pods are running but the node still shows 0 GPUs: the CUDA driver on the host is missing or wrong version — verify nvidia-smi on the host directly.",
      "If the driver is present: restart the nvidia-device-plugin daemonset pod to force re-detection.",
      "After fixing: kubectl get node <node-name> should show allocatable nvidia.com/gpu within 2 minutes.",
    ],
  },
  inference_error: {
    question: "What type of error are you seeing?",
    options: [
      { label: "HTTP 503 or connection refused on the endpoint", next: "inference_503" },
      { label: "Request succeeds for short inputs but fails for long ones", next: "inference_context" },
      { label: "HTTP 200 but output is garbled or truncated", next: "inference_output" },
    ],
  },
  inference_503: {
    diagnosis: "vLLM process not ready or crashed after startup",
    stage: "Inference engine (vLLM)",
    explanation:
      "A 503 or connection refused means the vLLM HTTP server isn't accepting connections. The pod may still be loading the model (large models take 2–5 minutes) or the process crashed after starting.",
    commands: [
      "# Check pod status",
      "kubectl get pods -n <namespace>",
      "",
      "# Follow logs during startup",
      "kubectl logs -f <pod> -n <namespace>",
      "",
      "# Test health endpoint from inside the pod",
      "kubectl exec -it <pod> -n <namespace> -- curl -s http://localhost:8000/health",
    ],
    next_steps: [
      "If logs show 'Loading model weights...': the model is still loading — wait and retry. Large models take 2–5 minutes.",
      "If logs stopped unexpectedly: the process crashed — see CrashLoopBackOff diagnosis above.",
      "Verify the Service port and targetPort match the --port flag passed to vLLM (default: 8000).",
      "Check readinessProbe configuration — if it fires before the model finishes loading, the pod is marked unready but not restarted.",
    ],
  },
  inference_context: {
    diagnosis: "Input exceeds --max-model-len",
    stage: "vLLM configuration",
    explanation:
      "vLLM rejects requests where input + expected output tokens exceed --max-model-len. If short requests succeed and long ones fail with a 400 or validation error, this is the cause.",
    commands: [
      "# Check the configured max model length",
      "kubectl exec -it <pod> -- curl -s http://localhost:8000/v1/models | python3 -m json.tool",
      "",
      "# Check vLLM startup args in the deployment",
      "kubectl get deployment <deploy> -o jsonpath='{.spec.template.spec.containers[0].args}'",
    ],
    next_steps: [
      "Increase --max-model-len in the deployment manifest (up to the model's native context length).",
      "Recalculate VRAM after increasing context length — KV cache grows linearly with max_model_len × max_num_seqs.",
      "If VRAM is already tight: reduce --max-num-seqs to free space for a larger context window.",
    ],
  },
  inference_output: {
    diagnosis: "Model output quality issue — not an infrastructure failure",
    stage: "Model / Prompt",
    explanation:
      "If inference succeeds (HTTP 200) but output is wrong or truncated, the infrastructure is working. This is a model behaviour or prompting issue.",
    commands: [
      "# Verify the loaded model identity",
      "curl http://<endpoint>/v1/models",
      "",
      "# Run a minimal sanity-check request",
      "curl http://<endpoint>/v1/chat/completions \\",
      "  -H 'Content-Type: application/json' \\",
      "  -d '{\"model\": \"<model-id>\", \"messages\": [{\"role\": \"user\", \"content\": \"Say hello.\"}], \"max_tokens\": 32}'",
    ],
    next_steps: [
      "If output is truncated: increase max_tokens in the request, or increase --max-model-len at server startup.",
      "If output is nonsensical: confirm the correct model checkpoint is loaded — check the --model flag.",
      "If the model ignores instructions: verify you're using the Instruct variant of the model (not the base model).",
      "Output quality issues are outside infrastructure scope — see Mistral's API documentation for prompt guidance.",
    ],
  },
  perf_slow: {
    question: "What do GPU metrics show during a slow inference request?",
    options: [
      { label: "nvidia-smi shows <50% GPU utilisation during inference", next: "perf_underutilised" },
      { label: "GPU is at 80–100% utilisation but latency is still high", next: "perf_saturated" },
    ],
  },
  perf_underutilised: {
    diagnosis: "Batch size too small — GPU is compute-starved",
    stage: "Inference configuration",
    explanation:
      "vLLM batches requests together for efficiency. If --max-num-seqs is too low or there's not enough concurrent traffic, GPUs are underutilised and throughput suffers even though latency may seem acceptable.",
    commands: [
      "# Check vLLM metrics (requires --enable-metrics at startup)",
      "curl http://<endpoint>/metrics | grep -E 'num_requests|gpu_cache_usage|running'",
      "",
      "# Monitor GPU utilisation live",
      "kubectl exec -it <pod> -- watch -n1 nvidia-smi",
    ],
    next_steps: [
      "Increase --max-num-seqs to allow more concurrent requests to be batched together.",
      "Enable vLLM metrics (--enable-metrics) and scrape with Prometheus to track batch efficiency over time.",
      "If traffic is genuinely low, GPU underutilisation is expected — this is not an error condition.",
    ],
  },
  perf_saturated: {
    diagnosis: "Insufficient GPU compute for the current load",
    stage: "Hardware capacity",
    explanation:
      "The GPU is fully utilised but can't keep up with the request rate. Options are to scale horizontally (more pod replicas) or increase tensor parallelism (more GPUs per pod).",
    commands: [
      "# Check waiting request queue depth",
      "curl http://<endpoint>/metrics | grep 'vllm:num_requests_waiting'",
      "",
      "# Check GPU memory and compute utilisation",
      "kubectl exec -it <pod> -- nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv",
    ],
    next_steps: [
      "Scale horizontally: increase the Deployment's replica count and put a load balancer in front.",
      "If a single model is too large for one pod: increase --tensor-parallel-size and provision more GPUs per pod.",
      "Determine the bottleneck: if GPU memory bandwidth is saturated, larger batches won't help — more GPUs are needed.",
      "Consider a smaller or quantised model if latency SLOs are the primary constraint.",
    ],
  },
};

function CommandBlock({ commands }) {
  return (
    <div
      style={{
        background: "#1e1e2e",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "14px",
      }}
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
        Commands
      </div>
      <code
        style={{
          display: "block",
          fontSize: "12px",
          color: "#cdd6f4",
          lineHeight: 1.9,
          whiteSpace: "pre-wrap",
          fontFamily: "monospace",
          margin: 0,
        }}
      >
        {commands.join("\n")}
      </code>
    </div>
  );
}

function DiagnosisCard({ node }) {
  return (
    <div
      style={{
        border: "1.5px solid #0369a1",
        borderRadius: "10px",
        padding: "20px",
        backgroundColor: "#f0f9ff",
        marginTop: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <span style={{ fontSize: "15px", fontWeight: 700, color: "#0369a1" }}>{node.diagnosis}</span>
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#0369a1",
          fontWeight: 500,
          backgroundColor: "#e0f2fe",
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: "4px",
          marginBottom: "12px",
        }}
      >
        Stage: {node.stage}
      </div>
      <p style={{ fontSize: "14px", color: "#374151", lineHeight: 1.6, margin: "0 0 14px 0" }}>
        {node.explanation}
      </p>

      {node.commands && <CommandBlock commands={node.commands} />}

      <div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#111827", marginBottom: "6px" }}>
          Next steps
        </div>
        <ul style={{ margin: 0, paddingLeft: "18px" }}>
          {node.next_steps.map((s, i) => (
            <li
              key={i}
              style={{ fontSize: "13px", color: "#4b5563", lineHeight: 1.6, marginBottom: "4px" }}
            >
              {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function DeploymentDiagnosticTree() {
  const [path, setPath] = useState(["root"]);

  const currentKey = path[path.length - 1];
  const currentNode = TREE[currentKey];
  const isDiagnosis = !!currentNode.diagnosis;

  const handleSelect = (nextKey) => setPath([...path, nextKey]);
  const handleBack = () => { if (path.length > 1) setPath(path.slice(0, -1)); };
  const handleReset = () => setPath(["root"]);

  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        maxWidth: "640px",
        margin: "32px 0",
      }}
    >
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
        Deployment diagnostic tree
      </div>
      <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 16px 0" }}>
        Describe the symptom to get the exact kubectl or curl commands to diagnose and fix it.
      </p>

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
            const label = node.diagnosis || node.question?.slice(0, 32) + "…";
            const isLast = i === path.length - 1;
            return (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span style={{ color: "#d1d5db", fontSize: "12px" }}>→</span>}
                <span
                  style={{
                    fontSize: "12px",
                    color: isLast ? "#0369a1" : "#9ca3af",
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
                  e.currentTarget.style.borderColor = "#0369a1";
                  e.currentTarget.style.backgroundColor = "#f0f9ff";
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
