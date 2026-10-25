# AGENTS.md — PaglaROUTER

## Stack & entrypoints
- Stateless **Cloudflare Worker** (Hono) at `src/index.ts` — dual protocol (`POST /v1/chat/completions` OpenAI + `POST /v1/messages` Anthropic) with cascade failover.
- `src/config.ts` — provider matrix (8 providers), quotas, `MODEL_ROUTES` cascade, `buildAccounts`/`resolveRoutes`. Single source of truth for routing.
- `src/scheduler/` — `weight.ts` (`W = H·S·(α·Rrpm/Lrpm+β·Rtpm/Ltpm+γ·Rrpd/Lrpd)/(1+C)`) + `sliding-window.ts` (KV token buckets, health/circuit-breaker).
- `src/adapters/` — per-provider translation (`gemini.ts`, `groq.ts`, `qwen.ts`, `kimi.ts`, `openai-generic.ts`).
- `src/telemetry/` — `bpe.ts` (token estimate), `header-parser.ts` (`x-ratelimit-*` / `Retry-After`), `error-classify.ts` (mirrors `paglaai_onboard.py` — keep in sync).
- `Tests/` — Vitest unit suite (pure modules + in-memory KV mock in `Tests/helpers.ts`).

## Commands
```bash
npm ci                          # Node 22 required (CI uses 22); Node 20+ minimum
npm run typecheck               # tsc --noEmit --strict (must pass before push)
npm test                        # vitest run — Tests/**/*.test.ts, env node
npm run dev                     # wrangler dev (loads .dev.vars, local KV emulation)
npm run build                   # wrangler deploy --dry-run --outdir dist (no deploy)
```

Single test / filtered run:
```bash
npx vitest run Tests/weight.test.ts
npx vitest run -t "computeWeight"
```

CI order (`ci.yml`): `typecheck` → `test` → `build`. Deploy workflows (`deploy-worker.yml`, `deploy-pages.yml`) are `workflow_dispatch` only.

No linter/formatter configured — `strict` TS + `.editorconfig` (2-space, LF, `trim_trailing_whitespace` except `*.md`).

## Env & secrets
- Local: `cp .dev.vars.example .dev.vars` — `wrangler dev` loads it. Never commit `.dev.vars`/`.env` (gitignored).
- Production: `npx wrangler secret put <NAME> --env production` per provider. Secrets accept comma-separated keys (`GEMINI_API_KEY=k1,k2` → `provider#0`, `provider#1`).
- Canonical secret is `*_API_KEY`; `*_API_KEYS` alias (claude-code-proxy/uni-api compat) is **read-only fallback** — only used when canonical is unset (`src/config.ts:239`).
- `ROUTER_ADMIN_TOKEN` — required for all `/v1/*` routes via `Authorization: Bearer <token>`; missing or invalid tokens receive `401`.
- `ROUTER_ALLOWED_ORIGINS` — optional comma-separated browser-origin allowlist. Unset means no CORS allow-origin header; preflight requests still pass through to the CORS handler.
- `ROUTER_MAX_REQUEST_BYTES` — optional request-body limit in bytes. Defaults to 1 MiB and is capped at 10 MiB; oversized authenticated requests receive `413` before JSON parsing.
- KV binding `PAGLA_TELEMETRY_KV` (`quota:<accountId>`, `state:<accountId>`) is defined in `wrangler.jsonc` and points to the dedicated PaglaROUTER telemetry namespace. Isolate-local `memCache` + `inFlight` Map — for cross-isolate consistency swap to Redis.
- `wrangler.jsonc` — Worker entrypoint, compatibility settings, production environment, and KV binding. Configure the `router.paglaai.space` custom domain/route in the connected Cloudflare Worker settings.

## TypeScript quirks
- `strict: true`, `verbatimModuleSyntax: true` — use `import type` for type-only imports or build fails.
- `moduleResolution: Bundler`, `isolatedModules: true`, `noEmit: true` — typecheck only; `wrangler` bundles.

## Gotchas
- **Daily window** (`sliding-window.ts:38`): `pacific-midnight` → `America/Los_Angeles`, `cst-midnight` → `Asia/Shanghai` via `Intl.DateTimeFormat` — never round-trip through `new Date()` string parsing. `dailyWindowStart`/`zonedMidnight` is host-TZ independent; test with explicit TZ.
- **Error cascade** (`src/index.ts:153`): `429` quarantine → `401/403` lockout (`H=0`) → `400 invalid_key/key_type_unsupported` lockout → `>=500` circuit-breaker (`S=0` after >3). `key_type_unsupported` = Google standard-key rejection (post Jun 2026). Taxonomy must stay aligned with `paglaai_onboard.py`.
- **Weight exclusion**: `computeWeight` returns `0` if `H<=0 || S<=0` or quota field is `0`; caller drops zero-weight accounts — empty evaluated set → `429 rate_limit_exhausted`.
- **Anthropic streaming** (`src/index.ts:365`): `ar.stream=true` falls through to `routeChat` as SSE passthrough — format-mismatched by design, no Anthropic→SSE translation.
- **Token accounting**: `estimatePromptTokens` on request + `usageFromBody` on success, fallback `estimateCompletion` (ceil len/4). `tpmRemaining < tokenEstimate` forces weight to `0`.
- **Tests are pure** — no Worker runtime needed. Use `makeKv()` from `Tests/helpers.ts` for scheduler tests; don't add integration tests requiring live KV/providers without documenting prerequisites.

## Workflow
- Branch `feat/<name>`, rebase on `main`, imperative commits. Run `typecheck` + `test` before push (CI enforces same).
- `src/telemetry/error-classify.ts` changes require updating the onboarding wizard's classifier.
- `docs/` is Jekyll/GitHub Pages (no custom Pages workflow needed — builds natively from `main:/docs`). `public/` is Cloudflare Pages portal.
