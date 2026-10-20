import { test, expect } from "@playwright/test";
test("legacy progress survives migration, lesson edits, and refresh", async ({
  page,
}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem("seeded")) {
      localStorage.setItem(
        "interviewos-v1",
        JSON.stringify({
          progress: {
            closures: {
              status: "completed",
              confidence: "high",
              lastStudied: "2026-10-20T00:00:00.000Z",
            },
          },
          notes: { closures: "My original closure notes" },
          quiz: {},
          studyLog: [],
          reminders: [],
          activity: [],
          daily: { enabled: false, time: "20:00", lastFired: "" },
        }),
      );
      localStorage.setItem("seeded", "yes");
    }
  });
  await page.goto("/lessons/closures");
  await expect(
    page.getByRole("heading", {
      name: "Closures & Practical Uses",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator("#lesson-notes")).toHaveValue(
    "My original closure notes",
  );
  await page
    .locator("#lesson-notes")
    .fill("Closures keep lexical bindings reachable.");
  await page
    .getByRole("button", { name: "Record a revision", exact: true })
    .click();
  await expect(page.getByText("1 revisions recorded")).toBeVisible();
  await page.reload();
  await expect(page.locator("#lesson-notes")).toHaveValue(
    "Closures keep lexical bindings reachable.",
  );
  const original = await page.evaluate(
    () => JSON.parse(localStorage.getItem("interviewos-v1")!).notes.closures,
  );
  expect(original).toBe("My original closure notes");
});
test("library search, quiz, and reminders are interactive", async ({
  page,
}) => {
  await page.goto("/topics");
  await page
    .getByRole("textbox", { name: "Search lessons" })
    .fill("Binary Search");
  await expect(page.locator(".lesson-card")).toHaveCount(1);
  await page.locator(".lesson-card").click();
  await page.getByRole("button", { name: "B To guarantee progress" }).click();
  await expect(page.getByText("You’ve got it.")).toBeVisible();
  await page.goto("/reminders");
  await page
    .getByRole("textbox", { name: "What will you focus on?" })
    .fill("Revise closures");
  await page.locator('input[type="datetime-local"]').fill("2030-01-01T20:00");
  await page.getByRole("button", { name: "Add study reminder" }).click();
  await expect(
    page.getByRole("heading", { name: "Revise closures" }),
  ).toBeVisible();
});
test("dashboard and library fit the viewport without horizontal overflow", async ({
  page,
}) => {
  for (const path of ["/", "/topics", "/tracker", "/settings"]) {
    await page.goto(path);
    await expect(page.locator(".loading")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  }
});

test("cloud conflicts keep the local copy and can accept cloud progress without looping", async ({
  page,
}) => {
  const empty = {
    progress: {},
    notes: {},
    quiz: {},
    studyLog: [],
    reminders: [],
    activity: [],
    revisions: [],
    daily: { enabled: false, time: "20:00", lastFired: "" },
  };
  const device = {
    ...empty,
    notes: { closures: "Unsynced device explanation" },
  };
  const cloud = { ...empty, notes: { closures: "Newer cloud explanation" } };
  await page.addInitScript(
    ({ device, empty }) => {
      localStorage.setItem(
        "interviewos-v4-account:conflict-test",
        JSON.stringify(device),
      );
      localStorage.setItem(
        "interviewos-v4-account:conflict-test:synced",
        JSON.stringify(empty),
      );
    },
    { device, empty },
  );
  await page.route("**/api/health", (route) =>
    route.fulfill({
      json: { status: "ok", storage: "postgresql", accounts: true },
    }),
  );
  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({
      json: {
        user: {
          id: "conflict-test",
          name: "Test Learner",
          email: "test@example.test",
          emailVerified: false,
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
        session: {
          id: "session",
          token: "test-session",
          userId: "conflict-test",
          expiresAt: "2030-01-01T00:00:00Z",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      },
    }),
  );
  await page.route("**/api/study", (route) =>
    route.fulfill({ json: { data: cloud, version: 2 } }),
  );
  await page.goto("/settings");
  await expect(
    page.getByRole("button", { name: "Reload cloud progress", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Reload cloud progress", exact: true })
    .click();
  await expect(
    page.getByText("Your cloud progress is up to date."),
  ).toBeVisible();
  const copies = await page.evaluate(() => ({
    current: JSON.parse(
      localStorage.getItem("interviewos-v4-account:conflict-test")!,
    ),
    recovery: JSON.parse(
      localStorage.getItem(
        "interviewos-v4-account:conflict-test:conflict-backup",
      )!,
    ),
  }));
  expect(copies.current.notes.closures).toBe("Newer cloud explanation");
  expect(copies.recovery.notes.closures).toBe("Unsynced device explanation");
});
