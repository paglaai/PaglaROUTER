# Security Policy

PaglaROUTER handles API credentials that map to real, billable provider
accounts. Please treat any exposure seriously.

## Reporting a vulnerability

Do **not** open a public issue for a security problem. Report privately to the
maintainer (nishidhho) with a subject prefixed `[PaglaROUTER-SEC]` including:

- What you found and how to reproduce it.
- Which component is affected (`src/index.ts`, an adapter, `wrangler.jsonc`, …).
- Any keys involved (rotate them immediately if so).

You should receive a first response within 48 hours.

## Security notes for operators

- **Secrets never enter git.** `.dev.vars`, `.env`, and every `*_API_KEY` /
  `*_API_KEYS` secret are gitignored. Confirm with `git ls-files | grep -i key`.
- **Set Worker secrets, not plaintext config.** Use
  `npx wrangler secret put <NAME> --env production`.
- **Configure `ROUTER_ADMIN_TOKEN`** locally and in production. It is required
  for `/v1/*` endpoints; the router fails closed when it is missing.
- **Configure `ROUTER_ALLOWED_ORIGINS`** as a comma-separated browser-origin
  allowlist. If unset, the gateway emits no CORS allow-origin header; non-browser
  API clients remain unaffected.
- **Keep request bodies bounded.** `ROUTER_MAX_REQUEST_BYTES` defaults to 1 MiB
  and is capped at 10 MiB by the Worker. Lower it when the supported request
  shapes allow a smaller limit.
- **Comma-separated keys multiply exposure.** Each key in a secret is a
  separate billable account; audit the list in `wrangler secret list`.
- **Rotate on lockout.** The router permanently locks out (`H = 0`) keys that
  return 401/403 or an invalid-key / unsupported-key-type 400. When you rotate
  a key, update the secret and clear the KV-backed account state.
- **KV state is sensitive.** The token bucket records live per-account health;
  keep the KV namespace private to the Worker.

## Supported versions

Security fixes land on `main` and are backported on request to the latest
minor release only.
