<p align="center">
  <a href="https://github.com/paglaai/PaglaROUTER">
    <img src="https://raw.githubusercontent.com/paglaai/PaglaROUTER/main/brand/paglarouter-wordmark.svg" alt="PaglaROUTER Wordmark" width="460">
  </a>
</p>

<p align="center">
  <strong>Fail-Closed Intelligent LLM Load Balancer, Latency-Optimized Proxy, and OpenAI-Compatible Gateway.</strong>
</p>

<p align="center">
  <a href="https://www.paglaai.space/products/"><img src="https://img.shields.io/badge/Product_Gateway-PaglaSPACE-6B7EFF?style=flat-square" alt="Product Gateway"></a>
  <a href="https://github.com/paglaai/PaglaROUTER/actions"><img src="https://img.shields.io/badge/Fail_Closed-Security_Hardened-0A0A0B?style=flat-square" alt="Fail Closed"></a>
  <a href="https://github.com/paglaai/PaglaROUTER/releases"><img src="https://img.shields.io/badge/version-2.2.0-0A0A0B?style=flat-square" alt="Version 2.2.0"></a>
  <a href="https://github.com/paglaai/PaglaDESIGN"><img src="https://img.shields.io/badge/DesignDNA-Locked_(D--024)-0A0A0B?style=flat-square" alt="DesignDNA Locked"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-0A0A0B?style=flat-square" alt="License MIT"></a>
</p>

---

## Overview

**PaglaROUTER** is the sovereign load balancer and intelligent inference routing gateway for the PaglaAI ecosystem. It sits between incoming agent requests and underlying compute nodes, automatically routing between local Apple Silicon inference ([PaglaMLX](https://github.com/paglaai/PaglaMLX)) and upstream providers with microsecond latency decisions and strict **fail-closed security**.

If memory saturates or an upstream provider returns errors, PaglaROUTER cleanly fails closed—never exposing unverified tokens or leaking sensitive payload data.

```
                 ┌────────────────────────────────────────┐
                 │        Client / Agent Request          │
                 │     POST /v1/chat/completions          │
                 └───────────────────┬────────────────────┘
                                     │
         ┌───────────────────────────┴───────────────────────────┐
         ▼                                                       ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│   Token Sanitizer & Auth     │              │    Latency & Health Probe    │
│  Zero Plain-Text Leakage     │              │   Sub-Millisecond Monitoring │
└──────────────┬───────────────┘              └──────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                         Intelligent Route Decision                         │
│  Local Apple Silicon (PaglaMLX)  ◄───►  Federated Fallback Upstream        │
└────────────────────────────────────────────────────────────────────────────┘
```

## Core Capabilities

- **Routes Across Hybrid Engines**: Dispatches requests to local Apple Silicon Metal GPU when memory is available; falls back to cloud providers when limits are reached.
- **Enforces Fail-Closed Security**: Drops requests and sanitizes error buffers on any upstream compromise or protocol violation.
- **Provides Standard OpenAI API**: Compatible with all OpenAI-standard SDKs, tools, and coding agents out of the box.
- **Tracks Microsecond Latency Metrics**: Exports Prometheus/OpenTelemetry counters for P50, P95, and P99 latency alongside token throughput.

## Quick Start

Build and execute the high-performance routing binary:

```bash
# Build the router binary
cargo build --release

# Run with local configuration
./target/release/paglarouter --config router.toml
```

Verify health and routing metrics:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/metrics
```

## Architecture & Tech Stack

| Feature | Specification |
| :--- | :--- |
| **Core Runtime** | Rust / Tokio asynchronous runtime |
| **Interface** | OpenAI-compatible HTTP 1.1 / HTTP 2 / SSE |
| **Health Probes** | Active health checks every 1000ms |
| **Security Layer** | Fail-closed token scrubbers, memory bounds checking |

## DesignDNA & Ecosystem Authority

PaglaROUTER inherits its operational discipline from [PaglaDESIGN](https://github.com/paglaai/PaglaDESIGN). Terminal telemetry, dashboard indicators, and structured JSON logs conform directly to the ecosystem color hierarchy and error schema conventions.

## Security & Fail-Closed Policy

- **Zero Plain-Text Token Storage**: Keys are held in memory-locked pages and never flushed to swap.
- **Fail-Closed by Design**: If an upstream connection drops mid-stream, PaglaROUTER terminates the SSE connection immediately without hallucinating padding tokens.

## Ecosystem Directory

| Repository | Role | Surface Link |
| :--- | :--- | :--- |
| **[PaglaSPACE](https://github.com/paglaai/PaglaSPACE)** | Sovereign Web Gateway & Showcase | [www.paglaai.space](https://www.paglaai.space) |
| **[PaglaDESIGN](https://github.com/paglaai/PaglaDESIGN)** | Canonical Design Authority & FastMCP | [paglaai.github.io/pagladesign](https://paglaai.github.io/pagladesign) |
| **[PaglaMLX](https://github.com/paglaai/PaglaMLX)** | Apple Silicon Local MLX Inference | [paglaai.space/products/paglamlx.html](https://www.paglaai.space/products/paglamlx.html) |
| **[PaglaGPT](https://github.com/paglaai/PaglaGPT)** | Sovereign AI Architect & Reasoner | [paglaai.space/products/paglagpt.html](https://www.paglaai.space/products/paglagpt.html) |
| **[PaglaROUTER](https://github.com/paglaai/PaglaROUTER)** | Fail-Closed LLM Load Balancer & Proxy | [paglaai.space/products/](https://www.paglaai.space/products/) |
| **[PaglaDOC](https://github.com/paglaai/PaglaDOC)** | Fern Documentation & OpenAPI Engine | [paglaai.docs.buildwithfern.com](https://paglaai.docs.buildwithfern.com) |
| **[PaglaEXTENSION](https://github.com/paglaai/PaglaEXTENSION)** | Ambient Browser Companion & Sidecar | [paglaai.space/products/](https://www.paglaai.space/products/) |
| **[B3K4R](https://github.com/paglaai/B3K4R)** | Autonomous Agent & Workflow Daemon | [paglaai.space/products/](https://www.paglaai.space/products/) |


## Communications & Inquiries

PaglaAI enforces strictly segmented, dedicated communication channels for operational integrity and privacy:

| Channel | Dedicated Address | Scope & Handling |
| :--- | :--- | :--- |
| **Technical & Product** | `info@paglaai.space` | General developer inquiries, runtime integration, and feedback. |
| **Legal & Compliance** | `legal@paglaai.space` | Licensing, terms of service, IP governance, and compliance. |
| **Security & Disclosure** | `security@paglaai.space` | Vulnerability disclosures, cryptographic review, and audit findings. |
| **Systems & Operations** | `ops@paglaai.space` | Edge infrastructure, routing availability, and deployment health. |
| **Parent Entity (AYNAGHOR)** | `PaglaAI@aynaghor.space` | Organizational leadership, ecosystem charter, and core directives. |
| **Executive Office** | `SecondSON@aynaghor.space` | Strategic architecture, sovereign identity, and high-altitude review. |


## License

PaglaROUTER is open-source software licensed under the **[MIT License](./LICENSE)**.

---

<p align="center">
  <sub>© 2026 AYNAGHOR. PaglaROUTER is part of the PaglaAI ecosystem. Every surface inherits from here.</sub>
</p>
