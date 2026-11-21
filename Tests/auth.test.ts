import { describe, it, expect } from "vitest";
import app from "../src/index";

describe("Admin authentication", () => {
  it("denies access when ROUTER_ADMIN_TOKEN is unset in environment", async () => {
    const res = await app.request(
      "/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer some-token",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [{ role: "user", content: "hi" }],
        }),
      },
      {} // empty env
    );

    expect(res.status).toBe(401);
    const body = (await res.json()) as { error: { message: string; type: string } };
    expect(body.error.type).toBe("unauthorized");
  });

  it("denies access when header has incorrect token", async () => {
    const res = await app.request(
      "/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer wrong-token",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [{ role: "user", content: "hi" }],
        }),
      },
      { ROUTER_ADMIN_TOKEN: "correct-secret-token" }
    );

    expect(res.status).toBe(401);
  });

  it("denies access when header is missing authorization", async () => {
    const res = await app.request(
      "/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [{ role: "user", content: "hi" }],
        }),
      },
      { ROUTER_ADMIN_TOKEN: "correct-secret-token" }
    );

    expect(res.status).toBe(401);
  });

  it("passes auth check when correct token is supplied", async () => {
    const res = await app.request(
      "/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: "Bearer correct-secret-token",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [{ role: "user", content: "hi" }],
        }),
      },
      { ROUTER_ADMIN_TOKEN: "correct-secret-token" }
    );

    // Passed auth check; should proceed to routeChat (which returns 500 configuration_error because no upstream provider keys)
    expect(res.status).toBe(500);
    const body = (await res.json()) as { error: { type: string } };
    expect(body.error.type).toBe("configuration_error");
  });
});
