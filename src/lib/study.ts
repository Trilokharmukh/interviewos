import { z } from "zod";
export const LEGACY_KEY = "interviewos-v1";
export const DEVICE_KEY = "interviewos-v4-device";
const timestamp = z.string().max(50);
const progress = z.object({
  status: z
    .enum(["not-started", "in-progress", "completed"])
    .default("not-started"),
  confidence: z.enum(["", "low", "medium", "high"]).default(""),
  lastStudied: timestamp.default(""),
  nextReview: timestamp.optional(),
  reviews: z.number().int().min(0).max(100000).default(0),
});
export const studySchema = z.object({
  progress: z.record(z.string().max(100), progress).default({}),
  notes: z.record(z.string().max(100), z.string().max(100000)).default({}),
  quiz: z
    .record(z.string().max(100), z.number().int().min(0).max(20))
    .default({}),
  studyLog: z
    .array(
      z.object({
        day: z.string().max(10),
        topicId: z.string().max(100),
        at: timestamp,
      }),
    )
    .max(10000)
    .default([]),
  daily: z
    .object({
      enabled: z.boolean().default(false),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/)
        .default("20:00"),
      lastFired: z.string().max(10).default(""),
    })
    .default({ enabled: false, time: "20:00", lastFired: "" }),
  reminders: z
    .array(
      z.object({
        id: z.string().max(100),
        title: z.string().min(1).max(200),
        at: z.iso.datetime(),
        done: z.boolean().default(false),
        notified: z.boolean().default(false),
      }),
    )
    .max(2000)
    .default([]),
  activity: z
    .array(
      z.object({
        type: z.string().max(40),
        title: z.string().max(200),
        detail: z.string().max(1000).default(""),
        at: timestamp,
      }),
    )
    .max(10000)
    .default([]),
  revisions: z
    .array(
      z.object({
        id: z.string().max(100),
        topicId: z.string().max(100),
        at: timestamp,
        confidence: z.enum(["", "low", "medium", "high"]),
      }),
    )
    .max(10000)
    .default([]),
});
export type StudyState = z.infer<typeof studySchema>;
export type Progress = StudyState["progress"][string];
export type Confidence = Progress["confidence"];
export const initialStudy = (): StudyState => studySchema.parse({});
export const emptyProgress = (): Progress => ({
  status: "not-started",
  confidence: "",
  lastStudied: "",
  reviews: 0,
});
export function parseBackup(value: unknown): StudyState {
  if (!value || typeof value !== "object")
    throw new Error("This is not an InterviewOS backup.");
  const raw = "data" in value ? value.data : value;
  if (
    !raw ||
    typeof raw !== "object" ||
    !("progress" in raw) ||
    !("notes" in raw)
  )
    throw new Error("The backup is missing progress or notes.");
  return studySchema.parse(raw);
}
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function nextReview(
  confidence: Confidence,
  count = 0,
  now = new Date(),
) {
  const days =
    confidence === "high"
      ? Math.min(30, 7 * (count + 1))
      : confidence === "medium"
        ? 3
        : 1;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}
export function streak(log: StudyState["studyLog"], now = new Date()) {
  const days = new Set(log.map((l) => l.day));
  const day = new Date(now);
  if (!days.has(localDay(day))) day.setDate(day.getDate() - 1);
  let total = 0;
  while (days.has(localDay(day))) {
    total++;
    day.setDate(day.getDate() - 1);
  }
  return total;
}
// Device import never overwrites a newer cloud lesson or a non-empty cloud note.
export function mergeStudy(cloud: StudyState, device: StudyState): StudyState {
  const progress = { ...device.progress, ...cloud.progress };
  for (const [id, p] of Object.entries(device.progress)) {
    if (!cloud.progress[id] || p.lastStudied > cloud.progress[id].lastStudied)
      progress[id] = p;
  }
  const notes = { ...device.notes, ...cloud.notes };
  for (const [id, n] of Object.entries(device.notes))
    if (!cloud.notes[id]) notes[id] = n;
  function unique<T>(a: T[], b: T[], key: (x: T) => string): T[] {
    return [...new Map([...a, ...b].map((x) => [key(x), x])).values()];
  }
  return studySchema.parse({
    ...cloud,
    progress,
    notes,
    quiz: { ...device.quiz, ...cloud.quiz },
    studyLog: unique(
      device.studyLog,
      cloud.studyLog,
      (x) => `${x.topicId}:${x.at}`,
    ).slice(-10000),
    reminders: unique(device.reminders, cloud.reminders, (x) => x.id).slice(
      -2000,
    ),
    revisions: unique(device.revisions, cloud.revisions, (x) => x.id).slice(
      -10000,
    ),
    activity: unique(
      device.activity,
      cloud.activity,
      (x) => `${x.type}:${x.title}:${x.at}`,
    )
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(-10000),
  });
}
