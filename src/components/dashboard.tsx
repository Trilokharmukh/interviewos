"use client";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Flame,
  Target,
  Clock3,
  CalendarDays,
  Download,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { lessons, categories, categoryClass } from "@/content";
import { localDay, streak } from "@/lib/study";
import { useStudy } from "./study-provider";
import { LessonCard, Loading, CategoryIcon } from "./ui";
export function Dashboard() {
  const { state, hydrated, account, exportData } = useStudy();
  if (!hydrated) return <Loading />;
  const completed = lessons.filter(
    (l) => state.progress[l.id]?.status === "completed",
  ).length;
  const started = lessons.filter(
    (l) => state.progress[l.id]?.status === "in-progress",
  );
  const focus =
    [...started].sort((a, b) =>
      (state.progress[b.id]?.lastStudied ?? "").localeCompare(
        state.progress[a.id]?.lastStudied ?? "",
      ),
    )[0] ??
    lessons.find((l) => state.progress[l.id]?.status !== "completed") ??
    lessons[0];
  const due = lessons.filter((l) => {
    const p = state.progress[l.id];
    return (
      p &&
      (p.nextReview
        ? new Date(p.nextReview) <= new Date()
        : p.confidence === "low")
    );
  });
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 6 + i);
    return {
      label: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: localDay(date),
      count: state.studyLog.filter((s) => s.day === localDay(date)).length,
    };
  });
  const max = Math.max(3, ...week.map((d) => d.count));
  const upcoming = state.reminders
    .filter((r) => !r.done)
    .sort((a, b) => a.at.localeCompare(b.at))[0];
  const suggested = [
    focus,
    ...lessons.filter(
      (l) => l.id !== focus.id && state.progress[l.id]?.status !== "completed",
    ),
  ].slice(0, 3);
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Let’s build your confidence.<span className="heading-star">✳</span>
          </h1>
          <p>
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            <span className="dot-separator">·</span>
            {account
              ? `Welcome back, ${account.name.split(" ")[0]}.`
              : "One concept at a time, one step closer."}
          </p>
        </div>
        <button className="button secondary" onClick={exportData}>
          <Download size={16} />
          Export progress
        </button>
      </div>
      <div className="stats-grid">
        {[
          {
            label: "Lessons completed",
            value: String(completed).padStart(2, "0"),
            detail: `of ${lessons.length} in your library`,
            icon: CheckCircle2,
            color: "green",
          },
          {
            label: "In progress",
            value: String(started.length).padStart(2, "0"),
            detail: "Keep your momentum going",
            icon: BookOpen,
            color: "purple",
          },
          {
            label: "Study streak",
            value: streak(state.studyLog),
            detail: "days of showing up",
            icon: Flame,
            color: "orange",
          },
          {
            label: "Ready to revise",
            value: String(due.length).padStart(2, "0"),
            detail: due.length
              ? "A little recall goes a long way"
              : "Your revision queue is clear",
            icon: Target,
            color: "blue",
          },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-card-top">
              <span>{s.label}</span>
              <span className={`stat-icon ${s.color}`}>
                <s.icon size={19} />
              </span>
            </div>
            <strong>{s.value}</strong>
            <p>{s.detail}</p>
          </div>
        ))}
      </div>
      <div className="dashboard-main-grid">
        <section className="focus-card">
          <div className="focus-copy">
            <span className="focus-overline">
              <Sparkles size={14} />
              YOUR NEXT FOCUS
            </span>
            <span className="focus-category">
              {focus.category} <span>·</span> {focus.minutes} minute lesson
            </span>
            <h2>{focus.title}</h2>
            <p>{focus.summary}</p>
            <Link href={`/lessons/${focus.id}`} className="button white">
              {started.length ? "Continue learning" : "Start learning"}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="focus-visual" aria-hidden="true">
            <div className="code-orbit orbit-1" />
            <div className="code-orbit orbit-2" />
            <span className="floating-symbol symbol-1">{"{ }"}</span>
            <span className="floating-symbol symbol-2">✦</span>
            <div className="code-paper">
              <div className="code-dots">
                <i />
                <i />
                <i />
              </div>
              <code>
                <span className="code-purple">function</span> grow() {"{"}
                <br />
                &nbsp; learn();
                <br />
                &nbsp; practice();
                <br />
                &nbsp; <span className="code-green">return</span> confidence;
                <br />
                {"}"}
              </code>
              <span className="paper-sticker">↗</span>
            </div>
          </div>
        </section>
        <section className="panel week-panel">
          <div className="panel-heading">
            <h2>Your study rhythm</h2>
            <span className="small-badge">This week</span>
          </div>
          <div className="week-total">
            <strong>{week.reduce((sum, d) => sum + d.count, 0)}</strong>
            <span>
              study actions
              <br />
              in the last 7 days
            </span>
          </div>
          <div
            className="week-chart"
            aria-label="Study actions for each of the last seven days"
          >
            {week.map((d, i) => (
              <div className="week-column" key={d.date}>
                <div className="week-bar-area">
                  <div
                    className={`week-bar ${i === 6 ? "today" : ""} ${d.count === 0 ? "zero" : ""}`}
                    style={{ height: `${Math.max(6, (d.count / max) * 100)}%` }}
                    title={`${d.label}: ${d.count} study actions`}
                  />
                </div>
                <span>{d.label.slice(0, 2)}</span>
                <span className="sr-only">{d.count} study actions</span>
              </div>
            ))}
          </div>
          <div className="week-caption">
            <span className="tiny-dot" />
            Consistency over intensity.
          </div>
        </section>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE BIG PICTURE</span>
          <h2>Your learning paths</h2>
        </div>
        <Link href="/topics" className="text-link">
          View all topics
          <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="paths-grid">
        {categories.map((category) => {
          const all = lessons.filter((l) => l.category === category),
            done = all.filter(
              (l) => state.progress[l.id]?.status === "completed",
            ).length;
          return (
            <Link
              href={`/topics?category=${encodeURIComponent(category)}`}
              className="path-card"
              key={category}
            >
              <CategoryIcon category={category} />
              <div>
                <h3>{category}</h3>
                <p>
                  {all.length} lessons <span>·</span> {done} completed
                </p>
              </div>
              <div className={`progress-track ${categoryClass[category]}`}>
                <span style={{ width: `${(done / all.length) * 100}%` }} />
              </div>
              <ArrowUpRight size={16} />
            </Link>
          );
        })}
      </div>
      <div className="bottom-grid">
        <div>
          <div className="section-heading">
            <div>
              <span className="eyebrow">MAKE YOUR NEXT MOVE</span>
              <h2>Keep exploring</h2>
            </div>
            <Link href="/topics" className="text-link">
              Browse library
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="lesson-grid three">
            {suggested.map((l) => (
              <LessonCard
                key={l.id}
                lesson={l}
                progress={state.progress[l.id]}
              />
            ))}
          </div>
        </div>
        <aside className="routine-card">
          <span className="routine-icon">
            <CalendarDays size={22} />
          </span>
          <span className="eyebrow">MAKE TIME FOR YOURSELF</span>
          <h2>
            A little practice.
            <br />A lasting difference.
          </h2>
          <p>
            {upcoming
              ? `Next up: ${upcoming.title}`
              : state.daily.enabled
                ? `Your daily study reminder is set for ${state.daily.time}.`
                : "Give your preparation a regular place in your day."}
          </p>
          <Link href="/reminders" className="button secondary">
            {upcoming ? <Clock3 size={15} /> : <CalendarDays size={15} />}Plan
            your study time
            <ArrowUpRight size={15} />
          </Link>
          {due.length > 0 && (
            <Link className="text-link routine-revision" href="/revision">
              <RotateCcw size={14} />
              {due.length} lessons due for revision
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}
