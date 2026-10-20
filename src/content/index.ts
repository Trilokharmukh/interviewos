import original from "./lessons.json";
import deep from "./deep-dives.json";
import { additionalLessons } from "./more-lessons";
import type { Lesson, DeepDive } from "./types";
export const lessons: Lesson[] = [...original, ...additionalLessons];
export const deepDives = deep as unknown as Record<string, DeepDive>;
export const categories = [
  "JavaScript",
  "React",
  "Next.js",
  "DSA",
  "System Design",
  "Web Platform",
];
export const categoryMark: Record<string, string> = {
  JavaScript: "JS",
  React: "⚛",
  "Next.js": "N",
  DSA: "{ }",
  "System Design": "◇",
  "Web Platform": "⌘",
};
export const categoryClass: Record<string, string> = {
  JavaScript: "amber",
  React: "cyan",
  "Next.js": "violet",
  DSA: "emerald",
  "System Design": "indigo",
  "Web Platform": "pink",
};
