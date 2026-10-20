"use client";
import Link from "next/link";
import {
  Download,
  ArrowUpRight,
  RotateCcw,
  CheckCircle2,
  Target,
} from "lucide-react";
import { useStudy } from "./study-provider";
import { lessons } from "@/content";
import { emptyProgress, type Confidence } from "@/lib/study";
import { useLessonActions } from "./lesson";
import { PageHeading, Loading, Status, CategoryIcon, Empty } from "./ui";
export function Tracker({ revision = false }: { revision?: boolean }) {
  const { state, hydrated, exportData } = useStudy(),
    change = useLessonActions();
  if (!hydrated) return <Loading />;
  const complete = lessons.filter(
    (l) => state.progress[l.id]?.status === "completed",
  ).length;
  const due = lessons.filter((l) => {
    const p = state.progress[l.id];
    return (
      p &&
      (p.nextReview
        ? new Date(p.nextReview) <= new Date()
        : p.confidence === "low")
    );
  });
  const ordered = revision
    ? [
        ...due,
        ...lessons.filter(
          (l) => !due.includes(l) && state.progress[l.id]?.nextReview,
        ),
      ].sort((a, b) =>
        (state.progress[a.id]?.nextReview ?? "").localeCompare(
          state.progress[b.id]?.nextReview ?? "",
        ),
      )
    : lessons;
  return (
    <>
      <PageHeading
        eyebrow={
          revision ? "RECALL BUILDS RETENTION" : "YOUR PROGRESS, MADE VISIBLE"
        }
        title={revision ? "Make it stick." : "Every lesson moves you forward."}
        description={
          revision
            ? "Return to the right concepts at the right time. Your confidence shapes your next review."
            : "Track your understanding, spot the gaps, and see how far you’ve come."
        }
        action={
          <button className="button secondary" onClick={exportData}>
            <Download size={15} />
            Export progress
          </button>
        }
      />
      <div className="tracker-summary">
        <section className="panel completion-panel">
          <span className="eyebrow">
            {revision ? "READY TO REVISIT" : "OVERALL COMPLETION"}
          </span>
          <strong>
            {revision
              ? due.length
              : Math.round((complete / lessons.length) * 100)}
            <small>{revision ? " lessons" : "%"}</small>
          </strong>
          <div className="progress-track">
            <span style={{ width: `${(complete / lessons.length) * 100}%` }} />
          </div>
          <p>
            {revision
              ? "Due reviews appear first. Rate your confidence after revising."
              : `${complete} of ${lessons.length} lessons completed. Keep showing up.`}
          </p>
        </section>
        <section className="panel confidence-panel">
          <h2>
            <Target size={19} />
            Your confidence check
          </h2>
          {[
            ["high", "Confident"],
            ["medium", "Getting there"],
            ["low", "Need practice"],
          ].map(([value, label]) => (
            <div key={value}>
              <span className={`confidence-dot ${value}`} />
              {label}
              <strong>
                {
                  lessons.filter(
                    (l) => state.progress[l.id]?.confidence === value,
                  ).length
                }
              </strong>
            </div>
          ))}
        </section>
      </div>
      <div className="section-heading">
        <h2>
          {revision ? "Your review schedule" : "Your complete learning roadmap"}
        </h2>
        <span className="muted">{ordered.length} lessons</span>
      </div>
      {ordered.length ? (
        <div className="tracker-table">
          <div className="tracker-row table-head">
            <span>LESSON</span>
            <span>STATUS</span>
            <span>CONFIDENCE</span>
            <span>{revision ? "NEXT REVIEW" : "LAST STUDIED"}</span>
            <span />
          </div>
          {ordered.map((l) => {
            const p = state.progress[l.id] ?? emptyProgress();
            return (
              <div className="tracker-row" key={l.id}>
                <Link className="tracker-title" href={`/lessons/${l.id}`}>
                  <CategoryIcon category={l.category} />
                  <span>
                    <strong>{l.title}</strong>
                    <small>
                      {l.category} · {l.minutes} min
                    </small>
                  </span>
                </Link>
                <Status progress={p} />
                <select
                  aria-label={`Confidence for ${l.title}`}
                  value={p.confidence}
                  onChange={(e) =>
                    change(l.id, "confidence", e.target.value as Confidence)
                  }
                >
                  <option value="">Not rated</option>
                  <option value="low">Need practice</option>
                  <option value="medium">Getting there</option>
                  <option value="high">Confident</option>
                </select>
                <span
                  className={`tracker-date ${revision && due.includes(l) ? "due" : ""}`}
                >
                  {revision
                    ? due.includes(l)
                      ? "Due now"
                      : p.nextReview
                        ? new Date(p.nextReview).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"
                    : p.lastStudied
                      ? new Date(p.lastStudied).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                </span>
                {revision ? (
                  <button
                    className="icon-button"
                    title="Record revision"
                    aria-label={`Record revision for ${l.title}`}
                    onClick={() => change(l.id, "review")}
                  >
                    <CheckCircle2 size={18} />
                  </button>
                ) : (
                  <Link
                    className="icon-button"
                    href={`/lessons/${l.id}`}
                    aria-label={`Open ${l.title}`}
                  >
                    <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty
          title="Your review queue is clear"
          description="Complete a lesson or rate your confidence to schedule a review."
        />
      )}
      <section className="panel revision-history">
        <div className="panel-heading">
          <h2>
            <RotateCcw size={18} />
            Revision history
          </h2>
          <span className="small-badge">{state.revisions.length} reviews</span>
        </div>
        {state.revisions.length ? (
          <div className="history-list">
            {[...state.revisions]
              .reverse()
              .slice(0, 30)
              .map((r) => (
                <div key={r.id}>
                  <span className="history-dot" />
                  <Link href={`/lessons/${r.topicId}`}>
                    {lessons.find((l) => l.id === r.topicId)?.title ??
                      r.topicId}
                  </Link>
                  <span className={`confidence-dot ${r.confidence}`} />
                  <time dateTime={r.at}>
                    {new Date(r.at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
          </div>
        ) : (
          <p className="muted">
            Your first recorded revision will appear here. Start with one
            concept you want to remember.
          </p>
        )}
      </section>
    </>
  );
}
