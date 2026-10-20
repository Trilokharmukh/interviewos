"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  NotebookPen,
} from "lucide-react";
import { lessons, deepDives, categoryClass } from "@/content";
import type { Lesson, DeepDive } from "@/content/types";
import {
  emptyProgress,
  nextReview,
  localDay,
  type Confidence,
} from "@/lib/study";
import { useStudy } from "./study-provider";
import { Loading, Status } from "./ui";
export function useLessonActions() {
  const { update, notify } = useStudy();
  function change(
    id: string,
    kind: "start" | "complete" | "confidence" | "review",
    confidence?: Confidence,
  ) {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) return;
    const at = new Date().toISOString();
    update((state) => {
      const old = state.progress[id] ?? emptyProgress();
      const p = { ...old, lastStudied: at };
      if (kind === "start") p.status = "in-progress";
      if (kind === "complete") {
        p.status = old.status === "completed" ? "in-progress" : "completed";
        if (p.status === "completed")
          p.nextReview = nextReview(p.confidence || "medium", p.reviews);
      }
      if (kind === "confidence") {
        p.confidence = confidence ?? "";
        p.nextReview = nextReview(p.confidence, p.reviews);
      }
      if (kind === "review") {
        p.reviews++;
        p.nextReview = nextReview(p.confidence || "medium", p.reviews);
        if (p.status === "not-started") p.status = "in-progress";
      }
      const detail =
        kind === "complete"
          ? p.status === "completed"
            ? "Lesson completed"
            : "Lesson reopened"
          : kind === "confidence"
            ? `Confidence: ${p.confidence || "not rated"}`
            : kind === "review"
              ? "Revision completed"
              : "Study session started";
      return {
        ...state,
        progress: { ...state.progress, [id]: p },
        studyLog: [
          ...state.studyLog,
          { topicId: id, day: localDay(), at },
        ].slice(-10000),
        activity: [
          ...state.activity,
          { type: kind, title: lesson.title, detail, at },
        ].slice(-10000),
        revisions:
          kind === "review"
            ? [
                ...state.revisions,
                {
                  id: crypto.randomUUID(),
                  topicId: id,
                  at,
                  confidence: p.confidence,
                },
              ].slice(-10000)
            : state.revisions,
      };
    });
    notify(
      kind === "review"
        ? "Revision recorded. Your next review has been scheduled."
        : kind === "confidence"
          ? "Confidence updated."
          : "Progress saved.",
    );
  }
  return change;
}
function CodeBlock({ code }: { code: string }) {
  const { notify } = useStudy();
  return (
    <div className="code-block">
      <div className="code-toolbar">
        <span>
          <i />
          <i />
          <i />
        </span>
        <small>CODE EXAMPLE</small>
        <button
          onClick={() =>
            navigator.clipboard
              ?.writeText(code)
              .then(() => notify("Code copied."))
              .catch(() => notify("Copy is unavailable in this browser."))
          }
        >
          <Copy size={13} />
          Copy
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
function Simulation({ visual }: { visual: NonNullable<DeepDive["visual"]> }) {
  const [step, setStep] = useState(0),
    frame = visual.frames[step];
  return (
    <div className="simulation">
      <div className="simulation-header">
        <span className="eyebrow">INTERACTIVE DRY RUN</span>
        <span>
          {step + 1} / {visual.frames.length}
        </span>
      </div>
      <h3>{visual.title}</h3>
      <div className="simulation-stage">
        <div className="simulation-stack">
          {[...(frame.stack ?? [])].reverse().map((item, i) => (
            <div key={`${i}-${item}`} className={i === 0 ? "top" : ""}>
              {item}
            </div>
          ))}
        </div>
        <div>
          <span className="small-badge">Step {step + 1}</span>
          <h4>{frame.caption}</h4>
          <p>{frame.detail}</p>
        </div>
      </div>
      <div className="simulation-controls">
        <button
          className="button secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <div className="step-dots" aria-label="Simulation steps">
          {visual.frames.map((_, i) => (
            <button
              key={i}
              className={step === i ? "current" : ""}
              aria-label={`Go to step ${i + 1}`}
              aria-pressed={step === i}
              onClick={() => setStep(i)}
            />
          ))}
        </div>
        <button
          className="button secondary"
          disabled={step === visual.frames.length - 1}
          onClick={() => setStep((s) => s + 1)}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
export function LessonView({ lesson }: { lesson: Lesson }) {
  const { state, hydrated, update, notify } = useStudy();
  const change = useLessonActions();
  if (!hydrated) return <Loading />;
  const p = state.progress[lesson.id] ?? emptyProgress(),
    deep = deepDives[lesson.id],
    answer = state.quiz[lesson.id];
  const idx = lessons.findIndex((l) => l.id === lesson.id),
    next = lessons[idx + 1];
  const selectAnswer = (index: number) =>
    update((s) => ({ ...s, quiz: { ...s.quiz, [lesson.id]: index } }));
  return (
    <>
      <Link href="/topics" className="back-link">
        <ArrowLeft size={15} />
        Learning library<span>/</span>
        {lesson.category}
      </Link>
      <div className="lesson-heading">
        <div>
          <div className="lesson-tags">
            <span className={`category-pill ${categoryClass[lesson.category]}`}>
              {lesson.category}
            </span>
            <span className="small-badge">{lesson.level}</span>
            <span className="muted">
              <Clock3 size={14} />
              {lesson.minutes} min
            </span>
          </div>
          <h1>{lesson.title}</h1>
          <p>{lesson.summary}</p>
        </div>
        <Status progress={p} />
      </div>
      <div className="lesson-layout">
        <article className="lesson-body">
          <section id="overview" className="lesson-section">
            <span className="eyebrow">THE BIG PICTURE</span>
            <h2>Understand it simply.</h2>
            <p className="analogy">{lesson.analogy}</p>
            <div className="takeaways">
              <h3>
                <Sparkles size={17} />
                The ideas to take with you
              </h3>
              <ul>
                {lesson.takeaways.map((t, i) => (
                  <li key={i}>
                    <CheckCircle2 size={16} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              className="button secondary"
              onClick={() => change(lesson.id, "start")}
            >
              <Play size={15} />
              Start a study session
            </button>
          </section>
          <section id="flow" className="lesson-section">
            <span className="eyebrow">FOLLOW THE LOGIC</span>
            <h2>From start to finish.</h2>
            <ol className="flow-grid">
              {lesson.flow.map((f, i) => (
                <li key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{f}</strong>
                  {i < lesson.flow.length - 1 && <ArrowRight size={16} />}
                </li>
              ))}
            </ol>
          </section>
          <section id="explanation" className="lesson-section">
            <span className="eyebrow">BUILD YOUR FOUNDATION</span>
            <h2>Let’s break it down.</h2>
            {lesson.sections.map((s, i) => (
              <div className="reading-section" key={i}>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </section>
          {deep && (
            <section id="deep-dive" className="lesson-section">
              <span className="eyebrow">GO A LEVEL DEEPER</span>
              <h2>A closer look.</h2>
              <p>{deep.intro}</p>
              {deep.chapters.map((chapter, i) => (
                <div className="reading-section deep-chapter" key={i}>
                  <h3>{chapter.heading}</h3>
                  {chapter.paragraphs.map((text, j) => (
                    <p key={j}>{text}</p>
                  ))}
                  {chapter.code && <CodeBlock code={chapter.code} />}{" "}
                  {chapter.steps && (
                    <ol className="dry-run">
                      {chapter.steps.map((s, j) => (
                        <li key={j}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
              ))}
              {deep.visual && <Simulation visual={deep.visual} />}
              <div className="pitfalls">
                <h3>Common interview pitfalls</h3>
                <ul>
                  {deep.pitfalls.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}
          <section id="code" className="lesson-section">
            <span className="eyebrow">LEARN BY DOING</span>
            <h2>See it in code.</h2>
            <CodeBlock code={lesson.code} />
            <h3 className="dry-run-title">
              Walk through it, one step at a time.
            </h3>
            <ol className="dry-run">
              {lesson.walkthrough.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          </section>
          <section id="interview" className="lesson-section">
            <span className="eyebrow">EXPLAIN IT WITH CONFIDENCE</span>
            <h2>The interview conversation.</h2>
            <div className="interview-answer">
              <h3>{lesson.interview.question}</h3>
              <span className="eyebrow">A STRONG ANSWER</span>
              <p>{lesson.interview.answer}</p>
            </div>
            {deep && (
              <>
                {deep.questions.map((q, i) => (
                  <details className="question" key={i}>
                    <summary>{q.q}</summary>
                    <p>{q.a}</p>
                  </details>
                ))}
                <div className="say-it">
                  <span className="eyebrow">TRY SAYING THIS OUT LOUD</span>
                  <p>{deep.say}</p>
                </div>
              </>
            )}
          </section>
          <section id="quiz" className="lesson-section">
            <span className="eyebrow">CHECK YOUR UNDERSTANDING</span>
            <h2>A quick knowledge check.</h2>
            <h3>{lesson.quiz.question}</h3>
            <div className="quiz-options">
              {lesson.quiz.options.map((option, i) => (
                <button
                  key={i}
                  disabled={answer !== undefined}
                  onClick={() => selectAnswer(i)}
                  className={
                    answer === undefined
                      ? ""
                      : i === lesson.quiz.correct
                        ? "correct"
                        : i === answer
                          ? "incorrect"
                          : ""
                  }
                >
                  <span>{String.fromCharCode(65 + i)}</span>
                  {option}
                  {answer !== undefined && i === lesson.quiz.correct && (
                    <Check size={18} />
                  )}
                </button>
              ))}
            </div>
            {answer !== undefined && (
              <div
                className={`quiz-feedback ${answer === lesson.quiz.correct ? "correct" : "incorrect"}`}
                role="status"
              >
                <strong>
                  {answer === lesson.quiz.correct
                    ? "You’ve got it."
                    : "A useful point to revisit."}
                </strong>
                <p>{lesson.quiz.explanation}</p>
                <button
                  className="text-link"
                  onClick={() =>
                    update((s) => {
                      const quiz = { ...s.quiz };
                      delete quiz[lesson.id];
                      return { ...s, quiz };
                    })
                  }
                >
                  <RotateCcw size={13} />
                  Try again
                </button>
              </div>
            )}
          </section>
          <section id="notes" className="lesson-section">
            <span className="eyebrow">MAKE THE CONCEPT YOURS</span>
            <h2>Your study notes.</h2>
            <p>
              Capture the explanation in your own words, or keep a tricky
              example for later.
            </p>
            <label className="sr-only" htmlFor="lesson-notes">
              Notes for {lesson.title}
            </label>
            <textarea
              id="lesson-notes"
              className="notes-editor"
              rows={7}
              maxLength={100000}
              placeholder="The idea that finally clicked for me…"
              value={state.notes[lesson.id] ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                update((s) => ({
                  ...s,
                  notes: { ...s.notes, [lesson.id]: value },
                }));
              }}
            />
            <div className="notes-caption">
              <span>
                <NotebookPen size={13} />
                Autosaved on this device
              </span>
              <span>
                {(state.notes[lesson.id] ?? "").length.toLocaleString()}{" "}
                characters
              </span>
            </div>
          </section>
          <section
            id="confidence"
            className="lesson-section confidence-section"
          >
            <span className="eyebrow">A MOMENT TO REFLECT</span>
            <h2>How confident do you feel?</h2>
            <p>
              Your rating helps build your revision queue. Review sooner when
              you need more practice.
            </p>
            <div className="confidence-options">
              {[
                ["low", "Need practice", "Review in 1 day"],
                ["medium", "Getting there", "Review in 3 days"],
                ["high", "Confident", "Review in 7+ days"],
              ].map(([value, label, hint]) => (
                <button
                  className={p.confidence === value ? "selected" : ""}
                  key={value}
                  onClick={() =>
                    change(lesson.id, "confidence", value as Confidence)
                  }
                  aria-pressed={p.confidence === value}
                >
                  <span className={`confidence-dot ${value}`} />
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </button>
              ))}
            </div>
            <div className="lesson-actions">
              <button
                className="button primary"
                onClick={() => change(lesson.id, "complete")}
              >
                <CheckCircle2 size={16} />
                {p.status === "completed"
                  ? "Reopen lesson"
                  : "Mark lesson complete"}
              </button>
              <button
                className="button secondary"
                onClick={() => change(lesson.id, "review")}
              >
                <RotateCcw size={15} />
                Record a revision
              </button>
            </div>
            {p.nextReview && (
              <p className="next-review">
                Next review:{" "}
                {new Date(p.nextReview).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}{" "}
                · {p.reviews} revisions recorded
              </p>
            )}
          </section>
          <div className="lesson-pagination">
            <Link href="/topics">
              <ArrowLeft size={16} />
              Back to the library
            </Link>
            {next && (
              <Link
                href={`/lessons/${next.id}`}
                onClick={() => notify("Opening the next lesson.")}
              >
                <span>
                  <small>UP NEXT</small>
                  {next.title}
                </span>
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </article>
        <aside className="lesson-toc">
          <span className="eyebrow">IN THIS LESSON</span>
          {[
            ["overview", "The big picture"],
            ["flow", "Visual flow"],
            ["explanation", "Core concepts"],
            ...(deep ? [["deep-dive", "Extended deep dive"]] : []),
            ["code", "Code & dry run"],
            ["interview", "Interview questions"],
            ["quiz", "Knowledge check"],
            ["notes", "Your notes"],
            ["confidence", "Confidence & revision"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
          <div className="lesson-tip">
            <Sparkles size={22} />
            <h3>Say it out loud.</h3>
            <p>
              Explain this concept in two minutes. If you can teach it simply,
              you’re building real understanding.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
