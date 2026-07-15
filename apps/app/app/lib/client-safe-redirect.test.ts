import assert from "node:assert/strict";
import test from "node:test";

import { DEFAULT_CLIENT_REDIRECT_PATH, getClientSafeRedirectPath } from "./client-safe-redirect";

test("accepts only same-origin root-relative redirect paths with query and hash", () => {
  for (const [candidate, expected] of [
    ["/app", "/app"],
    ["/app?launch=cloudberry", "/app?launch=cloudberry"],
    ["/app#activity", "/app#activity"],
    ["/app?launch=cloudberry#activity", "/app?launch=cloudberry#activity"],
    ["/login?next=%2Fapp%3Flaunch%3Dcloudberry", "/login?next=%2Fapp%3Flaunch%3Dcloudberry"],
  ] satisfies Array<[string, string]>) {
    assert.equal(getClientSafeRedirectPath(candidate), expected, candidate);
  }
});

test("rejects attacker, empty, malformed, and control-character redirect inputs", () => {
  const rejectedInputs: Array<string | null | undefined> = [
    null,
    undefined,
    "",
    "app",
    " /app",
    "https://evil.example/app",
    "http://evil.example/app",
    "javascript:alert(1)",
    "//evil.example/app",
    "///evil.example/app",
    "\\evil.example\\app",
    "/\\evil.example/app",
    "/%5C%5Cevil.example/app",
    "/%2F%2Fevil.example/app",
    "/app\n/evil",
    "/app%0A/evil",
    "/app%",
    "\u0000/app",
  ];

  for (const candidate of rejectedInputs) {
    assert.equal(getClientSafeRedirectPath(candidate), DEFAULT_CLIENT_REDIRECT_PATH, String(candidate));
  }
});
