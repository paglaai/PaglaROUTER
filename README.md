# PaglaROUTER

> High-throughput serverless LLM gateway on Cloudflare Workers with multi-provider pooling, sliding-window rate tracking, and fail-closed security.

---

## What is PaglaROUTER?

PaglaROUTER is the edge LLM gateway for the **PaglaAI** ecosystem, deployed globally on Cloudflare Workers at [router.paglaai.space](https://router.paglaai.space).

It is not simply an API reverse proxy.

It is a stateless intelligent routing layer that consolidates all your AI accounts across multiple providers (Google Gemini, Groq, Alibaba Qwen, Moonshot Kimi, Cerebras, Mistral, GitHub Models, and OpenRouter) into a single, unified, always-available endpoint. It translates requests seamlessly between OpenAI (`/v1/chat/completions`) and Anthropic Claude (`/v1/messages`) protocols while scoring candidates using a sliding-window rate-limiting and health cascade.

When an upstream provider hits rate limits or experiences downtime, PaglaROUTER automatically quarantines the provider and cascades traffic to the next best candidate. Your agents, IDEs, and local tools never experience interruptions.

---

## Purpose

The purpose of this repository is to eliminate single-vendor dependency and API quota bottlenecks across all PaglaAI systems.

This repository governs:

- Universal OpenAI-compatible Chat Completions endpoint (`POST /v1/chat/completions`)
- Universal Anthropic-compatible Messages endpoint (`POST /v1/messages`)
- Multi-Account Credential Pooling & Secret Rotation
- Sliding-Window Token & Request Accounting (`scheduler/sliding-window.ts`)
- Provider Error Taxonomy & Circuit Breakers (`telemetry/error-classify.ts`)
- Fail-Closed, Constant-Time Admin Token Verification (`checkAdmin`)
- Model Discovery & Capabilities Directory (`GET /v1/models`)
- Health & Routing Telemetry Probes (`GET /health`)

---

## Ecosystem

PaglaROUTER provides edge inference routing for the entire PaglaAI stack:

- **PaglaSPACE** — Documents the API reference at `/api/reference.html`.
- **PaglaDESIGN** — Provides design standards and architectural guidelines.
- **PaglaMLX** — Routes cloud-fallback requests through PaglaROUTER when local models are busy or exceed Apple Silicon memory limits.
- **PaglaSHELL** — Uses PaglaROUTER as its remote LLM gateway in terminal workflows.
- **PaglaGPT** — Dispatches architectural reasoning prompts through PaglaROUTER's weighted cascade.
- **PaglaEXTENSION** — Routes optional conversation analysis tasks through PaglaROUTER.

---

## Design Philosophy

In alignment with **PaglaDESIGN** and the **DesignDNA** doctrine:

- **Fail-Closed by Default:** Admin endpoints require explicit authentication. Unset tokens deny access rather than opening the gateway.
- **Constant-Time Verification:** All token comparisons use constant-time XOR byte operations to prevent side-channel timing attacks.
- **Stateless & Resilient:** State is maintained via Cloudflare KV with zero stateful server dependencies.
- **Zero Waste:** Free-tier provider quotas are prioritized and maximized before incurring paid fallback costs.
- **Deterministic Routing:** Requests follow reproducible, weighted priority scoring rather than non-deterministic round-robin.

---

## Repository Structure

```
PaglaROUTER/

README.md                  — repository purpose, architecture, and deployment guide
LICENSE                    — MIT license
package.json               — TypeScript, Hono, and Wrangler dependencies
wrangler.jsonc             — Cloudflare Worker bindings, KV namespaces, and routing
tsconfig.json              — strict TypeScript compiler configuration
vitest.config.ts           — Vitest configuration

src/                       — gateway source code
  index.ts                 — Hono entrypoint, middleware, and route dispatch
  config.ts                — provider registry, model mappings, and credential parsing
  types.ts                 — unified request, response, and provider data contracts

  adapters/                — provider-specific request/response adapters
    gemini.ts              — Google Gemini API adapter and format converter
    groq.ts                — Groq Cloud adapter and transformation
    qwen.ts                — Alibaba DashScope / Qwen adapter
    kimi.ts                — Moonshot AI / Kimi adapter
    openai-generic.ts      — standard OpenAI-compatible upstream client

  scheduler/               — routing intelligence & rate control
    weight.ts              — dynamic score computation (tier, quota, health)
    sliding-window.ts      — KV-backed token/request rate-limiter and circuit breakers

  telemetry/               — telemetry, token estimation, and taxonomy
    bpe.ts                 — fast Byte-Pair Encoding token estimator
    header-parser.ts       — upstream rate-limit header extractor
    error-classify.ts      — upstream error taxonomy (429, 401, 5xx classification)

Tests/                     — comprehensive Vitest test suite (63 automated tests)
  auth.test.ts             — fail-closed and timing-safe admin verification tests
  config.test.ts           — credential parsing and account building tests
  sliding-window.test.ts   — rate-limit windows, quarantine, and circuit tests
  weight.test.ts           — priority scoring and model selection tests
  bpe.test.ts              — token estimation validation
  header-parser.test.ts    — upstream header normalization tests
  error-classify.test.ts   — error taxonomy and recovery classifications
```

---

## Workflow

Every modification to routing rules, adapters, or security models follows the PaglaAI development workflow:

```
Vision
    ↓
Research
    ↓
Documentation
    ↓
Design
    ↓
Review
    ↓
Prototype
    ↓
Implementation
```

All changes require full test passage before deployment to Cloudflare edge networks.

---

## Quickstart

### Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- Cloudflare Wrangler CLI (`npx wrangler`)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/paglaai/PaglaROUTER.git
cd PaglaROUTER

# Install dependencies
npm install

# Run the test suite (63 checks)
npx vitest run

# Configure local secrets for testing
cp .dev.vars.example .dev.vars
# Add your GEMINI_API_KEY, GROQ_API_KEY, ROUTER_ADMIN_TOKEN, etc.

# Start local edge emulator with KV emulation
npm run dev
```

### Making a Request

```bash
curl http://127.0.0.1:8787/v1/chat/completions \
  -H "Authorization: Bearer your-router-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-flash",
    "messages": [
      { "role": "user", "content": "Explain the PaglaAI ecosystem." }
    ]
  }'
```

### Deploying to Production

```bash
# Deploy to Cloudflare Workers edge network
npx wrangler deploy --env production
```

---

## Governance & License

PaglaROUTER is developed and maintained by **AYNAGHOR** (The House of Mirror) for the PaglaAI ecosystem.

Released under the **MIT License**.
