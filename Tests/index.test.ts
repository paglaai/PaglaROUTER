import { describe, expect, it } from "vitest";
import app from "../src/index";
import type { Env } from "../src/config";
import { makeKv } from "./helpers";

function env(overrides: Partial<Env> = {}): Env {
  return {
    PAGLA_TELEMETRY_KV: makeKv() as unknown as KVNamespace,
    ...overrides,
  } as Env;
}

describe("Hono security routes", () => {
  it("fails closed when ROUTER_ADMIN_TOKEN is not configured", async () => {
    const response = await app.request("http://localhost/v1/models", {}, env());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: { message: "Missing or invalid ROUTER_ADMIN_TOKEN.", type: "unauthorized" },
    });
  });

  it("requires the configured bearer token for versioned routes", async () => {
    const environment = env({ ROUTER_ADMIN_TOKEN: "secret" });
    const wrong = await app.request(
      "http://localhost/v1/models",
      { headers: { Authorization: "Bearer wrong" } },
      environment,
    );
    const valid = await app.request(
      "http://localhost/v1/models",
      { headers: { Authorization: "Bearer secret" } },
      environment,
    );

    expect(wrong.status).toBe(401);
    expect(valid.status).toBe(200);
  });

  it("rejects request bodies above the configured limit before parsing", async () => {
    const response = await app.request(
      "http://localhost/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer secret",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "x".repeat(100) }] }),
      },
      env({ ROUTER_ADMIN_TOKEN: "secret", ROUTER_MAX_REQUEST_BYTES: "64" }),
    );

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({
      error: { message: "Request body exceeds the configured maximum size.", type: "request_too_large" },
    });
  });

  it("does not expose account identifiers from the public health endpoint", async () => {
    const response = await app.request(
      "http://localhost/health",
      {},
      env({ GEMINI_API_KEY: "secret-key" }),
    );
    const body = (await response.json()) as Record<string, unknown>;

    expect(response.status).toBe(200);
    expect(body).toMatchObject({ ok: true, configured: true });
    expect(body).not.toHaveProperty("accounts");
  });

  it("returns CORS headers only for configured origins", async () => {
    const environment = env({
      ROUTER_ADMIN_TOKEN: "secret",
      ROUTER_ALLOWED_ORIGINS: "https://app.example, https://admin.example",
    });
    const allowed = await app.request(
      "http://localhost/v1/models",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://app.example",
          "Access-Control-Request-Method": "GET",
        },
      },
      environment,
    );
    const denied = await app.request(
      "http://localhost/v1/models",
      {
        method: "OPTIONS",
        headers: {
          Origin: "https://evil.example",
          "Access-Control-Request-Method": "GET",
        },
      },
      environment,
    );

    expect(allowed.headers.get("access-control-allow-origin")).toBe("https://app.example");
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  });
});
