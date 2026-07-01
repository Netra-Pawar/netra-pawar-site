/**
 * Data for the Exercise 1 documentation audit report.
 *
 * Kept separate from the components so the findings, before/after examples,
 * and roadmap can be edited without touching render logic. Every entry here
 * traces back to a verified finding from the audit — evidence and
 * recommendations are not placeholders.
 */

export const categoryMeta = {
  ia: { label: "Information Architecture", color: "#5B6EAE" },
  dx: { label: "Developer Experience", color: "#3E5678" },
  ux: { label: "UX & Navigation", color: "#6B5B95" },
  content: { label: "Content Quality", color: "#4B6B4E" },
  bugs: { label: "Bugs & Accuracy", color: "#A33B26" },
  "ai-ready": { label: "AI Readiness", color: "#2E6B7E" },
  enterprise: { label: "Enterprise Readiness", color: "#93631A" },
  support: { label: "Support Deflection", color: "#8A4A6B" },
  trust: { label: "Trust & Governance", color: "#7A6A2E" },
};

export const severityMeta = {
  critical: { label: "Critical", color: "#A33B26", bg: "#FBF0EC" },
  high: { label: "High", color: "#93631A", bg: "#FBF3E4" },
  medium: { label: "Medium", color: "#3E5678", bg: "#EEF2F7" },
  low: { label: "Low", color: "#4B6B4E", bg: "#EFF4EF" },
};

export const findings = [
  {
    id: "F-01",
    title: "Model Selection Guide is a comparison surface, not a decision guide",
    severity: "high",
    category: "content",
    evidence:
      "/models/model-selection-guide now renders body content: the page heading is “Compare Models” and it presents model cards with pricing, features, IDs, license, weights, and parameter data. That is useful reference content, but the page still asks readers to start from model names rather than from jobs-to-be-done such as “cheap general chat,” “agentic coding,” “self-hosting,” or “document processing.”",
    recommendation:
      "Keep the comparison data, but add a use-case-first decision matrix above it: use case → recommended model → price → context window → license → API string → next step. This is still the first page I would improve on day one.",
    impact:
      "Evaluators comparing Mistral to competitors still have to translate a catalogue into a decision. The content exists, but the decision path is under-authored.",
    effort: "medium",
  },
  {
    id: "F-02",
    title: "Tabbed code samples duplicate in extracted page text",
    severity: "medium",
    category: "ai-ready",
    evidence:
      "In fetched text for developer quickstarts, tabbed examples appear duplicated or collapsed: the first API request page repeats the same Python sample twice, and the tool-use page repeats the same Python block across steps. This may not hurt the visual browser experience, but it matters for search snippets, AI agents, and Copy-for-LLM style exports.",
    recommendation:
      "Audit tabbed-code rendering for machine-readable output. Ensure hidden tab panels are correctly labelled or excluded from extracted text, and expose a clean Markdown route for agents.",
    impact:
      "A human can ignore duplicated hidden-tab content. An agent may treat duplicate code as authoritative context, increasing the chance of stale or noisy generated answers.",
    effort: "low",
  },
  {
    id: "F-03",
    title: "Production-critical content exists but is architecturally invisible",
    severity: "high",
    category: "ia",
    evidence:
      "The error glossary at /resources/error-glossary has complete HTTP codes, an error JSON schema, and a working retry code sample \u2014 but it\u2019s filed under Developers \u2192 Resources. Rate limits are documented under Admin \u2192 User Management. A developer debugging a 429 at 11pm has no reason to look in either location.",
    recommendation:
      "Cross-link (don\u2019t duplicate) the existing error-glossary and rate-limit content into a Studio-visible \u201CProduction\u201D section. Write only what\u2019s genuinely missing: model pinning and cost estimation.",
    impact:
      "Every undiscoverable answer becomes a support ticket. This is a findability problem wearing a missing-content costume.",
    effort: "low",
  },
  {
    id: "F-04",
    title: "Meta descriptions duplicated across major landing pages",
    severity: "medium",
    category: "ux",
    evidence:
      "The Studio overview and Vibe overview pages both carry the identical meta-description: \u201CDocumentation for the deployment and usage of Mistral AI\u2019s LLMs.\u201D Confirmed via direct fetch of both.",
    recommendation:
      "Audit all meta-descriptions in a single sweep. Each page should have a unique, accurate description under 155 characters.",
    impact:
      "Affects search ranking and social-share previews on two of the highest-traffic entry points.",
    effort: "low",
  },
  {
    id: "F-05",
    title: "No agent-facing affordances \u2014 and Mistral\u2019s own products are underserved",
    severity: "high",
    category: "ai-ready",
    evidence:
      "No llms.txt, no clean-Markdown export, no Copy-for-LLM. Mistral already distinguishes MistralAI-User from MistralAI-Index at /robots, and Mistral\u2019s own models read llms.txt \u201Cwhere present, with caveats.\u201D The product line has committed to this world. The docs haven\u2019t caught up.",
    recommendation:
      "Ship llms.txt and page-level Copy-for-LLM in Week 1 (near-zero marginal cost against MDX source). Scope a page-grounded assistant separately \u2014 that\u2019s a real feature, not a 30-day cleanup item.",
    impact:
      "Coding agents (Cursor, Claude Code, Vibe Code itself) can\u2019t reliably extract model strings or parameters. That\u2019s a product bug, not a docs bug.",
    effort: "low",
  },
  {
    id: "F-06",
    title: "Model overview is an undifferentiated catalogue with a data bug",
    severity: "high",
    category: "bugs",
    evidence:
      "The Legacy/Deprecated table has 45 rows (recounted directly). Devstral 2 appears simultaneously in the \u201CFeatured Models\u201D carousel and the Legacy/Deprecated table, both showing version 25.12. Confirmed via two separate fetches.",
    recommendation:
      "Split into a \u201CCurrent models\u201D page (active only, use-case tagged) and a \u201CLegacy models\u201D page linked from a footer note. Fix the Devstral 2 duplicate.",
    impact:
      "A reader scanning the legacy table could conclude a currently-recommended model is deprecated.",
    effort: "medium",
  },
  {
    id: "F-07",
    title: "Four competing navigation schemes fragment the reader\u2019s mental model",
    severity: "high",
    category: "ia",
    evidence:
      "Top nav: Getting Started | Models | Products | Developers | Admin | API. Sidebar on product pages: Vibe > \u2026 | Studio > \u2026 Homepage cards: Vibe | Studio | Admin. Quickstart tabs: Vibe Work | Vibe Code | Studio | API | Admin. Four different schemes within four clicks.",
    recommendation:
      "Collapse to one IA. The top nav should mirror the sidebar. Cut the \u201CProducts\u201D container page \u2014 it adds a click without adding understanding.",
    impact:
      "A reader navigating from the homepage to a quickstart to a product page encounters three different hierarchies.",
    effort: "high",
  },
  {
    id: "F-08",
    title: "No \u201Cgoing to production\u201D guide between quickstart and API reference",
    severity: "high",
    category: "dx",
    evidence:
      "The quickstart sequence ends abruptly. Some underlying content exists (error glossary, rate limits) but nothing ties model pinning, retries, cost estimation, and security into a production-readiness narrative.",
    recommendation:
      "Ship a \u201CPrepare for production\u201D guide: partly new writing (pinning, cost estimation), partly cross-linking existing content.",
    impact:
      "Quickstart-to-production drop-off: developers complete the quickstart, get excited, and stall.",
    effort: "medium",
  },
  {
    id: "F-09",
    title: "Enterprise deployment content is scattered or absent",
    severity: "high",
    category: "enterprise",
    evidence:
      "No compliance page, no security architecture overview, no deployment topology diagrams. Deployment content exists under /models/deployment/ but is model-focused, not architecture-focused.",
    recommendation:
      "Create a top-level \u201CDeploy\u201D section: compliance, architecture diagrams (screenshot-safe for SEs), and relocate existing cloud/self-hosted pages.",
    impact:
      "SEs improvise from blog posts for customer demos. Every improvised answer is a consistency risk across deals.",
    effort: "high",
  },
  {
    id: "F-10",
    title: "Migration guides exist but are invisible to their audience",
    severity: "medium",
    category: "support",
    evidence:
      "/resources/migration-guides covers \u201CFrom OpenAI\u201D and \u201CFrom self-hosted Llama\u201D with working code \u2014 but is buried under Developers \u2192 Resources. An evaluator deciding between Mistral and OpenAI won\u2019t navigate there.",
    recommendation:
      "Surface via a link from Getting Started and the future Model Selection Guide. No new writing required \u2014 this is a pure findability fix.",
    impact:
      "Content that directly serves competitive acquisition is invisible to the audience it was written for.",
    effort: "low",
  },
  {
    id: "F-11",
    title: "Connectors appear in four unconnected locations",
    severity: "medium",
    category: "ia",
    evidence:
      "Connectors content exists at /vibe/work/connectors, /studio-api/knowledge-rag/connectors, /admin/security-access/connectors, and /studio-api/workflows/building-workflows/connectors. Each serves a different audience but the relationship is never made explicit.",
    recommendation:
      "Add a single \u201CConnectors overview\u201D page that maps each location to its audience and links out.",
    impact:
      "A reader who finds one Connectors page may not realize there are three others that apply to their use case.",
    effort: "low",
  },
];

export const beforeAfterItems = [
  {
    id: "ba-model-guide",
    title: "Model Selection Guide",
    context: "The highest-intent page for evaluators choosing between Mistral, OpenAI, and Anthropic.",
    before:
      'Page title: "Model Selection Guide." Visible heading: "Compare Models." The page presents detailed model cards and pricing fields, but the first interaction is still catalogue browsing, not decision support.',
    after:
      "Start with **Mistral Small 4** \u2014 it handles most general tasks well at the lowest cost.\n\n```python\nimport os\nfrom mistralai import Mistral\nclient = Mistral(api_key=os.environ[\"MISTRAL_API_KEY\"])\nresponse = client.chat.complete(\n    model=\"mistral-small-2603\",  # 256k ctx \u00b7 $0.15/$0.6 per M tokens\n    messages=[{\"role\": \"user\", \"content\": \"Hello\"}]\n)\n```\n\n| Use case | Model | Price (in/out) | Context |\n|---|---|---|---|\n| General chat | Mistral Small 4 | $0.15 / $0.6 | 256k |\n| Agentic / coding | Mistral Medium 3.5 | $1.5 / $7.5 | 256k |\n| Self-hosting | Mistral Large 3 | $0.5 / $1.5 | 256k |\n| Document processing | OCR 4 | $4/1k pages | \u2014 |\n\nPricing should be re-verified against the live model cards before publishing, because model availability and pricing change frequently.",
    whyItMatters:
      "The entry point is the use case, not a model name the reader doesn\u2019t yet know. This single table replaces a 45-row legacy catalogue and answers the four questions every evaluator asks: which model, how much, how big, and can I self-host it?",
  },
  {
    id: "ba-top-nav",
    title: "Top Navigation",
    context: "The persistent nav bar that frames every page on the site.",
    before:
      "Getting Started | Models | Products | Developers | Admin | API\n\n\u201CProducts\u201D is a container page that adds a click without adding understanding. \u201CDevelopers\u201D is redundant with Studio.",
    after:
      "Getting Started | Models | Vibe | Studio & API | Deploy | Admin\n\nFollows the reader\u2019s decision sequence: arrive \u2192 orient \u2192 choose a model \u2192 build \u2192 deploy \u2192 govern. \u201CDeploy\u201D gives enterprise content a first-class entry point. Two container items removed.",
    whyItMatters:
      "The current nav has four competing organisational schemes within four clicks. Collapsing to one IA that mirrors the sidebar is a structural prerequisite for every other improvement.",
  },
  {
    id: "ba-audience",
    title: "Same question, two readers",
    context: '"Which model should I use, and how do I deploy it?" \u2014 asked by two different people.',
    before:
      "Both readers land on the same comparison surface or wade through a 45-row legacy catalogue. The page contains useful facts, but it does not differentiate by reader context, expertise, or urgency.",
    after:
      "**For the Self-Serve Developer** (wants working code in <2 min):\nStart with Mistral Small 4 \u2014 code sample, price, one paragraph. Done.\n\n**For the Solutions Engineer** (on a call with a bank\u2019s security team):\n\u201CFor deployments where data cannot leave customer infrastructure: Mistral Large 3 and Medium 3.5 are open weights, self-hostable in a VPC. OCR 4 is tagged Premier \u2014 flag this distinction early in any regulated deal.\u201D",
    whyItMatters:
      "Same underlying facts, different load-bearing details. Get the developer\u2019s page wrong and they close the tab. Get the SE\u2019s page wrong and a six-figure enterprise deal stalls in procurement.",
  },
];

export const roadmap = [
  {
    phase: "Week 1",
    label: "Quick wins \u2014 build credibility",
    tag: "quick-win",
    items: [
      "Reframe the Model Selection Guide as a decision guide (F-01)",
      "Audit tabbed-code extraction / Copy-for-LLM output (F-02)",
      "Fix Devstral 2 duplicate listing (F-06)",
      "Fix meta-descriptions (F-04)",
      "Ship llms.txt and Copy-for-LLM (F-05)",
    ],
  },
  {
    phase: "Week 2",
    label: "Ship the rebuilt Models section",
    tag: "quick-win",
    items: [
      "Ship the Model Selection Guide with the decision table",
      "Split Legacy/Deprecated onto its own page",
      "Cross-link error glossary and rate limits into Studio",
      "Surface migration guides in Getting Started",
    ],
  },
  {
    phase: "Weeks 3\u20134",
    label: "Strategic architecture",
    tag: "strategic",
    items: [
      "Scope the Deploy section \u2014 interview 2\u20133 SEs about real customer questions",
      "Write the production guide: model pinning, cost estimation",
      "Begin architecture diagrams (screenshot-safe, shareable without login)",
      "Establish the blog \u2192 docs launch SOP for the next feature release",
    ],
  },
];

export const aiReadiness = [
  {
    feature: "llms.txt",
    description: "Curated, machine-readable index of the site\u2019s most important content for IDE agents and RAG pipelines.",
    present: false,
    competitor: "Stripe, Anthropic, Vercel, Cloudflare",
  },
  {
    feature: "Copy for LLM",
    description: "One-click clean Markdown copy of any page, formatted for a prompt context window.",
    present: false,
    competitor: "Stripe (on every page)",
  },
  {
    feature: "View as Markdown",
    description: "Expose the actual page source for agents that fetch content directly.",
    present: false,
    competitor: "Stripe (on every page)",
  },
  {
    feature: "Page-scoped assistant",
    description: '"Ask about this page" \u2014 grounded to page content with visible source citation.',
    present: false,
    competitor: "Stripe (Ask about this page)",
  },
  {
    feature: "Structured frontmatter",
    description: "Per-page metadata (product_area, user_intent, prerequisites, related_tasks) for retrieval.",
    present: false,
    competitor: "Vercel (llms-full.txt with inline content)",
  },
  {
    feature: "MCP server",
    description: "Model Context Protocol server exposing docs search to Cursor, Claude Code, etc.",
    present: false,
    competitor: "Stripe (mcp.stripe.com)",
  },
];

export const summaryStats = {
  score: 6,
  totalPages: "~130",
  deadWeight: 15,
  deprecatedModels: 45,
  missingPages: 17,
  audienceSegments: 9,
};
