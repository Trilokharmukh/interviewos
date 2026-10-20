import Link from "next/link";
import { ArrowUpRight, BookOpen, Check, Clock3 } from "lucide-react";
import { categoryClass, categoryMark } from "@/content";
import type { Lesson } from "@/content/types";
import type { Progress } from "@/lib/study";
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="loading-dot" />
      Opening your workspace…
    </div>
  );
}
export function CategoryIcon({ category }: { category: string }) {
  return (
    <span className={`category-icon ${categoryClass[category]}`}>
      {categoryMark[category] ?? "◇"}
    </span>
  );
}
export function Status({ progress }: { progress?: Progress }) {
  return (
    <span className={`status ${progress?.status ?? "not-started"}`}>
      {progress?.status === "completed" ? (
        <>
          <Check size={12} />
          Completed
        </>
      ) : progress?.status === "in-progress" ? (
        "In progress"
      ) : (
        "Not started"
      )}
    </span>
  );
}
export function LessonCard({
  lesson,
  progress,
}: {
  lesson: Lesson;
  progress?: Progress;
}) {
  return (
    <Link className="lesson-card" href={`/lessons/${lesson.id}`}>
      <div className="card-top">
        <CategoryIcon category={lesson.category} />
        <span className="card-category">{lesson.category}</span>
        <ArrowUpRight size={17} />
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.summary}</p>
      <div className="card-foot">
        <span>
          <Clock3 size={13} />
          {lesson.minutes} min
        </span>
        <Status progress={progress} />
      </div>
    </Link>
  );
}
export function Empty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty">
      <BookOpen size={30} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
