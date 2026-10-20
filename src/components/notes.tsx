"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, ArrowUpRight, NotebookPen } from "lucide-react";
import { lessons } from "@/content";
import { useStudy } from "./study-provider";
import { PageHeading, Loading, Empty, CategoryIcon } from "./ui";
export function Notes() {
  const { state, hydrated } = useStudy();
  const [query, setQuery] = useState("");
  if (!hydrated) return <Loading />;
  const notes = Object.entries(state.notes)
    .filter(([, value]) => value.trim())
    .map(([id, text]) => ({
      id,
      text,
      lesson: lessons.find((l) => l.id === id),
    }))
    .filter((n) =>
      `${n.lesson?.title} ${n.text}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  return (
    <>
      <PageHeading
        eyebrow="YOUR THINKING, COLLECTED"
        title="Make room for your own words."
        description="The examples, explanations, and little discoveries you want to keep."
        action={
          <span className="summary-badge">
            <NotebookPen size={15} />
            {notes.length} notes
          </span>
        }
      />
      <label className="search-field notes-search">
        <Search size={17} />
        <input
          placeholder="Find something in your notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search your notes"
        />
      </label>
      {notes.length ? (
        <div className="notes-grid">
          {notes.map((n) => (
            <Link
              className="note-card"
              key={n.id}
              href={`/lessons/${n.id}#notes`}
            >
              <div>
                <CategoryIcon category={n.lesson?.category ?? "JavaScript"} />
                <span>{n.lesson?.category ?? "Saved lesson"}</span>
                <ArrowUpRight size={17} />
              </div>
              <h2>{n.lesson?.title ?? n.id}</h2>
              <p>{n.text}</p>
              <span className="text-link">
                Open & edit
                <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title={
            query ? "No matching notes" : "Your notebook starts with one idea."
          }
          description={
            query
              ? "Try another word or phrase."
              : "Open any lesson and write a few lines in your study notes. They’ll be collected here."
          }
        />
      )}
    </>
  );
}
