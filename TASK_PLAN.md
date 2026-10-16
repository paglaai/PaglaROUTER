# PaglaROUTER — TASK_PLAN

Execution plan for aligning PaglaROUTER's docs/branding/packaging surface with
the LengtaMLX design system, without touching the production routing flow.

**Status:** ✅ Complete — v2.6.0

---

## Workstream A — Docs & brand

| File | Change | Est. time | Est. tokens | Sub-agent | Success | Error | Handoff |
| ---- | ------ | --------- | ----------- | --------- | ------- | ----- | ------- |
| `docs/assets/banner.svg` | PaglaAI-brand banner (`#6B7EFF` on `#0A0A0B`, tagline, node motif) | 10m | 300 | — | Renders at width 1200 | Broken SVG → re-emit | README |
| `docs/assets/architecture.svg` | Pipeline diagram (clients → worker → scheduler → KV/providers) | 10m | 300 | — | Renders, matches ASCII block | Broken SVG → re-emit | README, docs |
| `README.md` | Rewrite: banner, badges, manifesto quote, quickstart, grouped features, ASCII architecture; keep provider matrix/error taxonomy/deploy | 30m | 2.5k | — | All facts preserved, links resolve | Fact drift → diff against prior README | CHANGELOG |
| `docs/*.md` + `docs/_config.yml` | GitHub Pages site (Jekyll/primer) — quickstart, architecture, routing, errors, providers, development | 45m | 4k | — | Pages deploy green; every module referenced is real | Stale path → grep `src/` | CONTRIBUTING |
| `.github/ISSUE_TEMPLATE/*.yml` + `PULL_REQUEST_TEMPLATE.md` | Bug/feature templates + PR checklist | 15m | 800 | — | Valid YAML, PR checks match CI | YAML error → validate | ci.yml |

## Workstream B — Tests, tooling & packaging

| File | Change | Est. time | Est. tokens | Sub-agent | Success | Error | Handoff |
| ---- | ------ | --------- | ----------- | --------- | ------- | ----- | ------- |
| `Tests/*.test.ts` + `Tests/helpers.ts` | Vitest unit suite (weight, bpe, header-parser, error-classify, sliding-window, config) | 1h | 4.5k | — | `npm test` 59 passing | Failed assertion → fix test or bug | package.json |
| `vitest.config.ts` | Node env, `Tests/**/*.test.ts` include | 5m | 150 | — | `npm test` green | — | package.json |
| `package.json` | Add `vitest`, `"test": "vitest run"`; bump 2.5.0 → 2.6.0 | 5m | 100 | — | `npm ci` + test green | Dep resolution → bump pin | CHANGELOG |
| `src/scheduler/sliding-window.ts` | **Bugfix:** TZ-independent `dailyWindowStart` for pacific/cst midnight (Intl, no locale-string round-trip) | 15m | 400 | — | Reset boundary exact in any host TZ; tests pass | Edge TZ date → property tests | tests, CHANGELOG |
| `TASK_PLAN.md` | This file (LengtaMLX field-table format) | 10m | 300 | — | Mirrors LengtaMLX layout | — | README |
| `.vscode/` | Editor settings + extension recommendations | 5m | 100 | — | Loads without error | — | .gitignore |
| `.github/workflows/deploy-worker.yml` | Add `npm test` step to CI | 5m | 100 | — | CI runs tests | — | CONTRIBUTING |
| `CHANGELOG.md`, `CONTRIBUTING.md`, `.gitignore` | 2.6.0 entry, Tests/docs guidance, allow `.vscode/settings.json` | 15m | 600 | — | Entries consistent with repo | — | README |

## Workstream C — Deployment prep & PaglaDESIGN portal

| File | Change | Est. time | Est. tokens | Sub-agent | Success | Error | Handoff |
| ---- | ------ | --------- | ----------- | --------- | ------- | ----- | ------- |
| `public/index.html` | Restyle with PaglaDESIGN (Open Sans typography, `#6B7EFF` accent, `#0A0A0B` dark background, wordmark & tagline) | 15m | 1.2k | — | Renders cleanly, matches brand palette | Design drift → align with brand kit | dashboard.js |
| `public/dashboard.js` | Live telemetry poller formatting & responsive meters | 10m | 400 | — | Live meter polling functional | Script error → fix DOM refs | index.html |
| `wrangler.toml` | Custom domain route `router.paglaai.space/*` and KV telemetry namespace docs | 5m | 150 | — | Valid TOML syntax | Missing zone → check zone_name | deploy-worker.yml |
| `SESSION_SUMMARY.md` | Update all legacy `paglagpt` URLs to official `paglaai` org | 5m | 200 | — | Clean links throughout | Stale links → grep | README |
| `AGENTS.md` | Commit repository specification, routing rules, weight math & taxonomy | 10m | 600 | — | Matches worker behavior | Rule drift → sync | README |

## Not in scope (production flow)

- `src/index.ts`, `src/adapters/*`, `src/types.ts` are **not** modified (zero regression in production routing flow).
- Cloudflare deployment (Worker + Pages portal) is triggered manually via `workflow_dispatch` once `router.paglaai.space` credentials are populated.
- Docs remain served natively on **GitHub Pages** (Jekyll from `docs/`).

## Verification

- `npm test` — 6 files, 59 tests passing
- `npm run typecheck` — clean under `strict`
- `npm run build` — dry-run deploy OK (98.59 KiB / gzip 24.39 KiB)
- `pages-docs.yml` — dropped; GitHub Pages builds `docs/` natively from
  branch `main` at path `/docs` (build_type legacy). The custom workflow path
  (configure-pages `TypeError`, then `jekyll-github-metadata`
  `inject_metadata!` for nil in a development-env container) was abandoned in
  favor of GitHub's own builder, which runs the same gems under production
  env. Verified: `https://paglaai.github.io/PaglaROUTER/` returns 200 with
  all docs pages, stylesheet, and banner assets rendering.
