import { test } from "node:test";
import assert from "node:assert/strict";
import { GET as getStudy, PUT as putStudy } from "../src/app/api/study/route";
import { GET as health } from "../src/app/api/health/route";
test("study API refuses unauthenticated reads", async () => {
  const response = await getStudy(
    new Request("https://interviewos.test/api/study"),
  );
  assert.equal(response.status, 401);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
});
test("study API rejects missing and cross-origin mutation origins before touching storage", async () => {
  for (const origin of [undefined, "https://attacker.test"]) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (origin) headers.origin = origin;
    const response = await putStudy(
      new Request("https://interviewos.test/api/study", {
        method: "PUT",
        headers,
        body: "{}",
      }),
    );
    assert.equal(response.status, 403);
  }
});
test("same-origin writes still require an authenticated session", async () => {
  const response = await putStudy(
    new Request("https://interviewos.test/api/study", {
      method: "PUT",
      headers: {
        origin: "https://interviewos.test",
        "content-type": "application/json",
      },
      body: "{}",
    }),
  );
  assert.equal(response.status, 401);
});
test("device-only deployments accurately report cloud accounts as unavailable", async () => {
  const response = await health();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    status: "ok",
    storage: "device",
    accounts: false,
  });
});
