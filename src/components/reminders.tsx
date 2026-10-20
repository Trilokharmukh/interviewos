"use client";
import { useState } from "react";
import {
  Bell,
  Check,
  CalendarDays,
  Plus,
  Trash2,
  Repeat2,
  Download,
  Info,
} from "lucide-react";
import { useStudy } from "./study-provider";
import { localDay } from "@/lib/study";
import { PageHeading, Loading, Empty } from "./ui";
function calendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n?|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}
function stamp(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}
export function Reminders() {
  const { state, hydrated, update, notify } = useStudy();
  const [permission, setPermission] = useState("");
  if (!hydrated) return <Loading />;
  const active = [...state.reminders]
    .filter((r) => !r.done)
    .sort((a, b) => a.at.localeCompare(b.at));
  async function enable() {
    if (!("Notification" in window)) {
      notify(
        "This browser does not support desktop notifications. Use the calendar export.",
      );
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    notify(
      result === "granted"
        ? "Browser notifications enabled."
        : "Notifications were not enabled. Calendar reminders are available.",
    );
  }
  function exportCalendar() {
    const events = active.map((r) =>
      [
        "BEGIN:VEVENT",
        `UID:${r.id}@interviewos`,
        `DTSTAMP:${stamp(new Date())}`,
        `DTSTART:${stamp(new Date(r.at))}`,
        `DTEND:${stamp(new Date(new Date(r.at).getTime() + 30 * 60000))}`,
        `SUMMARY:${calendarText(r.title)}`,
        "DESCRIPTION:InterviewOS study session",
        "BEGIN:VALARM",
        "ACTION:DISPLAY",
        "DESCRIPTION:Time for interview prep",
        "TRIGGER:-PT10M",
        "END:VALARM",
        "END:VEVENT",
      ].join("\r\n"),
    );
    if (state.daily.enabled) {
      const date = new Date();
      const [h, m] = state.daily.time.split(":").map(Number);
      date.setHours(h, m, 0, 0);
      if (date <= new Date()) date.setDate(date.getDate() + 1);
      const localStamp = (d: Date) =>
        `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}00`;
      events.push(
        [
          "BEGIN:VEVENT",
          "UID:interviewos-daily-study@interviewos",
          `DTSTAMP:${stamp(new Date())}`,
          `DTSTART:${localStamp(date)}`,
          `DTEND:${localStamp(new Date(date.getTime() + 30 * 60000))}`,
          "RRULE:FREQ=DAILY",
          "SUMMARY:InterviewOS daily study",
          "BEGIN:VALARM",
          "ACTION:DISPLAY",
          "DESCRIPTION:Time for interview prep",
          "TRIGGER:-PT10M",
          "END:VALARM",
          "END:VEVENT",
        ].join("\r\n"),
      );
    }
    if (!events.length) {
      notify("Add a reminder or enable your daily routine first.");
      return;
    }
    const data = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//InterviewOS//Study Reminders//EN",
      "CALSCALE:GREGORIAN",
      ...events,
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([data], { type: "text/calendar;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "interviewos-study-reminders.ics";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(
      "Calendar file exported. Import it into your calendar to receive reminders while the app is closed.",
    );
  }
  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      fields = new FormData(form),
      title = String(fields.get("title") ?? "").trim(),
      date = new Date(String(fields.get("at")));
    if (!title || !Number.isFinite(date.getTime()) || date <= new Date()) {
      notify("Add a title and choose a future date and time.");
      return;
    }
    update((s) => ({
      ...s,
      reminders: [
        ...s.reminders,
        {
          id: crypto.randomUUID(),
          title,
          at: date.toISOString(),
          done: false,
          notified: false,
        },
      ],
    }));
    form.reset();
    notify("Study reminder added.");
  }
  return (
    <>
      <PageHeading
        eyebrow="MAKE ROOM FOR YOUR NEXT ROLE"
        title="A routine that works for you."
        description="Plan a little focused time. Come back, recall, and build on what you know."
        action={
          <button className="button secondary" onClick={exportCalendar}>
            <Download size={16} />
            Add to calendar
          </button>
        }
      />
      <div className="reminders-layout">
        <div>
          <section className="panel reminder-settings">
            <div className="settings-title">
              <span className="stat-icon purple">
                <Repeat2 size={21} />
              </span>
              <div>
                <h2>Your daily study time</h2>
                <p>A small appointment with your future self.</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={state.daily.enabled}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    update((s) => ({ ...s, daily: { ...s.daily, enabled } }));
                  }}
                  aria-label="Enable daily study reminder"
                />
                <span />
              </label>
            </div>
            <label className="time-setting">
              <span>
                <strong>Remind me every day</strong>
                <small>In your device’s local time</small>
              </span>
              <input
                type="time"
                required
                value={state.daily.time}
                onChange={(e) => {
                  const time = e.target.value;
                  if (time)
                    update((s) => ({ ...s, daily: { ...s.daily, time } }));
                }}
              />
            </label>
            <div className="notice">
              <Info size={17} />
              <p>
                Browser reminders work while InterviewOS is open. Export to your
                calendar for reminders when the app is closed. Calendar events
                are a snapshot; export again after changes.
              </p>
            </div>
            <button
              className="button secondary"
              onClick={enable}
              disabled={permission === "granted"}
            >
              <Bell size={15} />
              {permission === "granted"
                ? "Notifications enabled"
                : "Enable browser notifications"}
            </button>
          </section>
          <section className="panel reminder-form-panel">
            <span className="eyebrow">ONE INTENTION AT A TIME</span>
            <h2>Plan a study session.</h2>
            <form onSubmit={add}>
              <label>
                What will you focus on?
                <input
                  name="title"
                  maxLength={100}
                  required
                  placeholder="e.g. Practice binary search boundaries"
                />
              </label>
              <label>
                When?
                <input
                  name="at"
                  type="datetime-local"
                  min={`${localDay()}T00:00`}
                  required
                />
              </label>
              <button className="button primary">
                <Plus size={17} />
                Add study reminder
              </button>
            </form>
          </section>
        </div>
        <div>
          <section className="panel scheduled-panel">
            <div className="panel-heading">
              <h2>
                <CalendarDays size={18} />
                Coming up
              </h2>
              <span className="small-badge">{active.length}</span>
            </div>
            {active.length ? (
              <div className="reminder-list">
                {active.map((r) => (
                  <div className="reminder-item" key={r.id}>
                    <span className="reminder-date">
                      <strong>{new Date(r.at).getDate()}</strong>
                      <small>
                        {new Date(r.at).toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </small>
                    </span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>
                        {new Date(r.at).toLocaleTimeString("en-IN", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        ·{" "}
                        {new Date(r.at).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                        })}
                      </p>
                      {new Date(r.at) <= new Date() && (
                        <span className="due">Ready when you are</span>
                      )}
                    </div>
                    <button
                      className="icon-button"
                      aria-label={`Complete reminder ${r.title}`}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          reminders: s.reminders.map((item) =>
                            item.id === r.id ? { ...item, done: true } : item,
                          ),
                        }))
                      }
                    >
                      <Check size={17} />
                    </button>
                    <button
                      className="icon-button"
                      aria-label={`Delete reminder ${r.title}`}
                      onClick={() =>
                        update((s) => ({
                          ...s,
                          reminders: s.reminders.filter(
                            (item) => item.id !== r.id,
                          ),
                        }))
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                title="A little time, set aside."
                description="Your planned sessions will appear here. Start with 20 minutes and one topic."
              />
            )}
          </section>
          <div className="quote-card">
            <span>✳</span>
            <h2>
              Consistency
              <br />
              builds confidence.
            </h2>
            <p>
              You don’t have to learn everything today.
              <br />
              Just come back tomorrow.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
