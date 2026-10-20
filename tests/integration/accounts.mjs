import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
const base = "http://127.0.0.1:3000";
for (let i = 0; i < 60; i++) {
  try {
    const response = await fetch(base + "/api/health");
    if (response.ok) {
      const data = await response.json();
      assert.equal(data.accounts, true);
      break;
    }
    if (i === 59) throw new Error("Database readiness failed");
  } catch (error) {
    if (i === 59) throw error;
  }
  await setTimeout(500);
}
const headers = { "content-type": "application/json", origin: base };
async function signup() {
  const id = randomUUID();
  const response = await fetch(base + "/api/auth/sign-up/email", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: "Integration Learner",
      email: `learner-${id}@example.test`,
      password: "A-disposable-ci-passphrase-42",
    }),
  });
  assert.equal(
    response.status,
    200,
    `Sign up returned ${response.status}: ${await response.clone().text()}`,
  );
  const cookies = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  assert.ok(cookies, "Sign up did not create a session");
  return cookies;
}
async function get(cookie) {
  return fetch(base + "/api/study", { headers: { cookie }, cache: "no-store" });
}
async function put(cookie, data, version) {
  return fetch(base + "/api/study", {
    method: "PUT",
    headers: { ...headers, cookie },
    body: JSON.stringify({ data, version }),
  });
}
const one = await signup(),
  two = await signup();
assert.equal((await fetch(base + "/api/study")).status, 401);
assert.deepEqual(await (await get(one)).json(), { data: null, version: 0 });
const first = {
  progress: {
    closures: {
      status: "completed",
      confidence: "high",
      lastStudied: "2026-10-20T00:00:00.000Z",
      reviews: 0,
    },
  },
  notes: { closures: "Private account-one note" },
};
let response = await put(one, first, 0);
assert.equal(response.status, 200);
assert.equal((await response.json()).version, 1);
assert.equal(
  (await (await get(one)).json()).data.notes.closures,
  "Private account-one note",
);
assert.deepEqual(
  await (await get(two)).json(),
  { data: null, version: 0 },
  "Account two can see account-one data",
);
response = await put(
  one,
  { ...first, notes: { closures: "Newer account-one note" } },
  1,
);
assert.equal(response.status, 200);
assert.equal((await response.json()).version, 2);
response = await put(one, first, 1);
assert.equal(response.status, 409, "A stale version overwrote newer data");
assert.equal(
  (await (await get(one)).json()).data.notes.closures,
  "Newer account-one note",
);
response = await put(
  two,
  { notes: { closures: "Independent account-two note" }, progress: {} },
  0,
);
assert.equal(response.status, 200);
assert.equal(
  (await (await get(one)).json()).data.notes.closures,
  "Newer account-one note",
);
response = await put(
  one,
  { progress: { x: { status: "invalid" } }, notes: {} },
  2,
);
assert.equal(response.status, 400);
response = await fetch(base + "/api/study", {
  method: "PUT",
  headers: { ...headers, origin: "https://attacker.test", cookie: one },
  body: JSON.stringify({ data: first, version: 2 }),
});
assert.equal(response.status, 403);
response = await fetch(base + "/api/auth/sign-in/email", {
  method: "POST",
  headers,
  body: JSON.stringify({
    email: "missing@example.test",
    password: "wrong-password-example",
  }),
});
assert.ok(response.status >= 400);
response = await fetch(base + "/api/auth/sign-out", {
  method: "POST",
  headers: { ...headers, cookie: one },
  body: "{}",
});
assert.equal(response.status, 200);
assert.equal(
  (await get(one)).status,
  401,
  "Signed-out session is still accepted",
);
console.log(
  "PostgreSQL integration passed: account creation, session cookies, private persistence, independent accounts, stale-write rejection, validation, origin checks, invalid login, and session revocation.",
);
