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

${ecosystemDirectory}

${emailSection}

## License

PaglaROUTER is open-source software licensed under the **[MIT License](./LICENSE)**.

---

<p align="center">
  <sub>© 2026 AYNAGHOR. PaglaROUTER is part of the PaglaAI ecosystem. Every surface inherits from here.</sub>
</p>
