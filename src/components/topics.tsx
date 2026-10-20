"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { lessons, categories } from "@/content";
import { useStudy } from "./study-provider";
import { LessonCard, PageHeading, Empty, Loading } from "./ui";
export function Topics({
  initialCategory = "All topics",
  initialQuery = "",
}: {
  initialCategory?: string;
  initialQuery?: string;
}) {
  const { state, hydrated } = useStudy();
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState("all");
  if (!hydrated) return <Loading />;
  const filtered = lessons.filter(
    (l) =>
      (category === "All topics" || l.category === category) &&
      `${l.title} ${l.summary} ${l.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (status === "all" ||
        (state.progress[l.id]?.status ?? "not-started") === status),
  );
  return (
    <>
      <PageHeading
        eyebrow="LEARN. UNDERSTAND. EXPLAIN."
        title="Your learning library"
        description="Simple explanations, practical code, visual flows, and questions that make concepts stick."
        action={
          <span className="summary-badge">
            {lessons.length} lessons · 6 learning paths
          </span>
        }
      />
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, patterns, or topics…"
            aria-label="Search lessons"
          />
        </label>
        <label className="filter-select">
          <SlidersHorizontal size={16} />
          <select
            aria-label="Filter by progress"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All progress</option>
            <option value="not-started">Not started</option>
            <option value="in-progress">In progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>
      </div>
      <div className="filter-chips" role="group" aria-label="Learning path">
        {["All topics", ...categories].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="result-heading">
        <h2>
          {category === "All topics"
            ? "Every concept is a step forward."
            : category}
        </h2>
        <span>{filtered.length} lessons</span>
      </div>
      {filtered.length ? (
        <div className="lesson-grid">
          {filtered.map((l) => (
            <LessonCard key={l.id} lesson={l} progress={state.progress[l.id]} />
          ))}
        </div>
      ) : (
        <Empty
          title="No lessons match yet"
          description="Try a different search or progress filter."
        />
      )}
    </>
  );
}
