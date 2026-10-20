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
