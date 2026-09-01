import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function parseSemver(version: string): { major: number; minor: number; patch: number } {
  const parts = version.split(".").map(Number);
  return { major: parts[0] ?? 0, minor: parts[1] ?? 0, patch: parts[2] ?? 0 };
}

function isVulnerableUndici(version: string): boolean {
  const { major, minor } = parseSemver(version);
  if (major === 7) return minor < 29;
  if (major === 8) return minor < 9;
  return false;
}

describe("undici security", () => {
  it("resolves a non-vulnerable undici version in node_modules", () => {
    const undiciDir = fileURLToPath(
      new URL("../node_modules/undici", import.meta.url),
    );
    const pkg = JSON.parse(
      readFileSync(`${undiciDir}/package.json`, "utf8"),
    ) as { version: string };
    expect(isVulnerableUndici(pkg.version)).toBe(false);
  });
});
