"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  ChartNoAxesCombined,
  Bell,
  NotebookPen,
  RotateCcw,
  Settings2,
  Search,
  ArrowUpRight,
  Menu,
  X,
  GraduationCap,
  Cloud,
  HardDrive,
} from "lucide-react";
import { useStudy } from "./study-provider";
import { lessons } from "@/content";
const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/topics", label: "Learning library", icon: BookOpen },
  { href: "/revision", label: "Revision queue", icon: RotateCcw },
  { href: "/tracker", label: "Progress tracker", icon: ChartNoAxesCombined },
  { href: "/notes", label: "My notes", icon: NotebookPen },
  { href: "/reminders", label: "Reminders", icon: Bell },
];
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const [open, setOpen] = useState(false);
  const { state, account, sync } = useStudy();
  useEffect(() => {
    if (location.hash.startsWith("#/")) {
      const old = location.hash.slice(2);
      const next = old.startsWith("topic/")
        ? "/lessons/" + old.slice(6)
        : old === "dashboard"
          ? "/"
          : "/" + old;
      router.replace(next);
    }
  }, [router]);
  const complete = lessons.filter(
    (l) => state.progress[l.id]?.status === "completed",
  ).length;
  return (
    <div className="app">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Close navigation"
        />
      )}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">
            <GraduationCap size={23} />
          </span>
          <strong>
            Interview<span>OS</span>
          </strong>
          <span className="brand-dot" />
        </Link>
        <div className="workspace-label">YOUR LEARNING WORKSPACE</div>
        <nav aria-label="Main navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/"
                ? path === "/"
                : path.startsWith(href) ||
                  (href === "/topics" && path.startsWith("/lessons"));
            return (
              <Link
                href={href}
                key={href}
                className={`nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {href === "/topics" && <small>{lessons.length}</small>}
                {active && <i />}
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <span className="eyebrow">A LITTLE EVERY DAY</span>
            <h3>Build your next chapter.</h3>
            <p>
              {complete} of {lessons.length} lessons completed
            </p>
            <div className="progress-track">
              <span
                style={{ width: `${(complete / lessons.length) * 100}%` }}
              />
            </div>
            <Link href="/topics">
              Keep learning <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link
            className={`nav-link ${path === "/settings" ? "active" : ""}`}
            href="/settings"
            onClick={() => setOpen(false)}
          >
            <Settings2 size={19} />
            Account & data
          </Link>
          <div className="sidebar-footer">
            <span className="tiny-dot" />
            Made for steady progress
          </div>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="breadcrumb">
              Workspace <span>/</span>{" "}
              <strong>
                {path.startsWith("/lessons")
                  ? "Lesson"
                  : (links.find((l) => l.href === path)?.label ??
                    "Account & data")}
              </strong>
            </span>
          </div>
          <div className="topbar-right">
            <form action="/topics" className="global-search">
              <Search size={16} />
              <input
                name="q"
                placeholder="Find a topic…"
                aria-label="Find a topic"
              />
              <kbd>↵</kbd>
            </form>
            <Link
              href="/settings"
              className="storage-label"
              title="Account and sync status"
            >
              {account ? <Cloud size={15} /> : <HardDrive size={15} />}
              <span>
                {account
                  ? sync === "synced"
                    ? "Cloud synced"
                    : sync === "saving"
                      ? "Saving…"
                      : sync === "conflict"
                        ? "Resolve conflict"
                        : sync === "loading"
                          ? "Loading cloud…"
                          : "Saved on device"
                  : "Device workspace"}
              </span>
            </Link>
            <Link href="/settings" className="avatar" aria-label="Open account">
              {account?.name?.slice(0, 1).toUpperCase() ?? "Y"}
            </Link>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <footer className="page-footer">
          <span>Small steps. Strong foundations.</span>
          <span>
            InterviewOS <span className="footer-dot">·</span> Your next role
            starts here
          </span>
        </footer>
      </div>
    </div>
  );
}
