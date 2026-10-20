import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialStudy,
  parseBackup,
  mergeStudy,
  nextReview,
  localDay,
  streak,
} from "../src/lib/study";
import { lessons, deepDives, categories } from "../src/content";
test("legacy backup migrates without changing original notes, confidence, quizzes, or reminders", () => {
  const legacy = {
    progress: {
      closures: {
        status: "completed",
        confidence: "high",
        lastStudied: "2026-10-20T00:00:00.000Z",
      },
    },
    notes: {
      closures: "A private counter",
      retired: "Keep even old lesson notes",
    },
    quiz: { closures: 1 },
    daily: { enabled: true, time: "20:00", lastFired: "" },
    studyLog: [
      {
        day: "2026-10-20",
        topicId: "closures",
        at: "2026-10-20T00:00:00.000Z",
      },
    ],
    reminders: [
      {
        id: "1",
        title: "Revise closures",
        at: "2026-10-21T14:30:00.000Z",
        done: false,
      },
    ],
    activity: [],
  };
  const copy = JSON.stringify(legacy),
    migrated = parseBackup({ version: 1, data: legacy });
  assert.equal(migrated.notes.retired, "Keep even old lesson notes");
  assert.equal(migrated.progress.closures.confidence, "high");
  assert.equal(migrated.progress.closures.reviews, 0);
  assert.deepEqual(migrated.revisions, []);
  assert.equal(migrated.quiz.closures, 1);
  assert.equal(migrated.reminders[0].notified, false);
  assert.equal(JSON.stringify(legacy), copy);
});
test("malformed imports are rejected instead of replacing data", () => {
  for (const value of [
    null,
    {},
    [],
    { data: {} },
    { progress: { x: { status: "hacked" } }, notes: {} },
    { progress: {}, notes: { x: 3 } },
    { progress: {}, notes: {}, daily: { time: "25:99" } },
  ])
    assert.throws(() => parseBackup(value));
});
test("imports keep cloud notes and newer per-lesson progress while merging history exactly once", () => {
  const cloud = initialStudy(),
    device = initialStudy();
  cloud.notes = { closures: "Cloud note" };
  device.notes = { closures: "Device note", scope: "Lexical scope" };
  cloud.progress.closures = {
    status: "completed",
    confidence: "high",
    lastStudied: "2026-10-20T10:00:00Z",
    reviews: 2,
  };
  device.progress.closures = {
    status: "in-progress",
    confidence: "low",
    lastStudied: "2026-10-19T10:00:00Z",
    reviews: 0,
  };
  cloud.studyLog = [
    { topicId: "closures", day: "2026-10-20", at: "2026-10-20T10:00:00Z" },
  ];
  device.studyLog = [...cloud.studyLog];
  const merged = mergeStudy(cloud, device);
  assert.equal(merged.notes.closures, "Cloud note");
  assert.equal(merged.notes.scope, "Lexical scope");
  assert.equal(merged.progress.closures.status, "completed");
  assert.equal(merged.studyLog.length, 1);
  assert.deepEqual(mergeStudy(merged, device), merged);
});
test("newer device lesson updates can be recovered from a conflict backup", () => {
  const cloud = initialStudy(),
    device = initialStudy();
  cloud.progress.scope = {
    status: "in-progress",
    confidence: "low",
    lastStudied: "2026-10-18T00:00:00Z",
    reviews: 0,
  };
  device.progress.scope = {
    status: "completed",
    confidence: "medium",
    lastStudied: "2026-10-20T00:00:00Z",
    reviews: 1,
  };
  assert.equal(mergeStudy(cloud, device).progress.scope.status, "completed");
});
test("review intervals follow confidence and are bounded", () => {
  const date = new Date("2026-10-20T12:00:00.000Z");
  assert.equal(nextReview("low", 0, date), "2026-10-21T12:00:00.000Z");
  assert.equal(nextReview("medium", 0, date), "2026-10-23T12:00:00.000Z");
  assert.equal(nextReview("high", 0, date), "2026-10-27T12:00:00.000Z");
  assert.equal(nextReview("high", 100, date), "2026-11-19T12:00:00.000Z");
});
test("streak tolerates today not being studied yet and duplicates do not add days", () => {
  const now = new Date(2026, 9, 20, 12),
    entry = (day: string) => ({
      day,
      topicId: "scope",
      at: day + "T10:00:00Z",
    });
  assert.equal(
    streak(
      [entry("2026-10-19"), entry("2026-10-19"), entry("2026-10-18")],
      now,
    ),
    2,
  );
  assert.equal(streak([entry("2026-10-18")], now), 0);
  assert.equal(localDay(now), "2026-10-20");
});
test("every lesson has an original ID, a complete teaching sequence, and a valid knowledge check", () => {
  assert.ok(lessons.length >= 40);
  assert.equal(new Set(lessons.map((l) => l.id)).size, lessons.length);
  for (const lesson of lessons) {
    assert.ok(categories.includes(lesson.category), lesson.id);
    assert.ok(lesson.code.length > 50, lesson.id);
    assert.ok(lesson.sections.length >= 3, lesson.id);
    assert.ok(lesson.walkthrough.length >= 3, lesson.id);
    assert.ok(lesson.flow.length >= 4, lesson.id);
    assert.ok(lesson.interview.answer.length > 50, lesson.id);
    assert.ok(
      lesson.quiz.correct >= 0 &&
        lesson.quiz.correct < lesson.quiz.options.length,
      lesson.id,
    );
  }
});
test("all original deep dives preserve chapters, interview questions, and interactive simulation steps", () => {
  assert.equal(Object.keys(deepDives).length, 9);
  for (const [id, deep] of Object.entries(deepDives)) {
    assert.ok(lessons.some((l) => l.id === id));
    assert.ok(deep.chapters.length >= 3);
    assert.ok(deep.visual && deep.visual.frames.length >= 3);
    assert.ok(deep.questions.every((q) => q.q && q.a));
  }
});
