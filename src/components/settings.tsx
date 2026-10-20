"use client";
import { useState } from "react";
import {
  Cloud,
  Download,
  Upload,
  HardDrive,
  LogOut,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Info,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { parseBackup, mergeStudy } from "@/lib/study";
import { useStudy } from "./study-provider";
import { PageHeading, Loading } from "./ui";
export function Settings() {
  const {
    state,
    hydrated,
    account,
    accountsReady,
    sync,
    refreshSession,
    syncNow,
    reloadCloud,
    notify,
    update,
    exportData,
    importDevice,
  } = useStudy();
  const [mode, setMode] = useState<"signin" | "signup">("signin"),
    [pending, setPending] = useState(false),
    [error, setError] = useState("");
  if (!hydrated) return <Loading />;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const email = String(data.get("email")),
        password = String(data.get("password"));
      const result =
        mode === "signup"
          ? await authClient.signUp.email({
              email,
              password,
              name: String(data.get("name")),
            })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Could not sign in. Please retry.");
        return;
      }
      await refreshSession();
      notify(
        mode === "signup"
          ? "Your account is ready. Import device progress below if you want to sync it."
          : "Signed in. Your account progress is ready.",
      );
    } catch {
      setError("The account service could not be reached. Please retry.");
    } finally {
      setPending(false);
    }
  }
  async function importFile(file?: File) {
    if (!file) return;
    if (file.size > 2_000_000) {
      notify("Please choose a backup under 2 MB.");
      return;
    }
    try {
      const data = parseBackup(JSON.parse(await file.text()));
      update((s) => mergeStudy(s, data));
      notify("Backup merged. Existing notes and newer progress were kept.");
    } catch {
      notify(
        "This file is not a valid InterviewOS backup. Nothing was changed.",
      );
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORKSPACE, YOUR DATA"
        title="Keep your progress with you."
        description="Manage your account, sync between devices, and keep a backup of what you’ve built."
      />
      <div className="settings-grid">
        <section className="panel account-panel">
          <div className="settings-title">
            <span className="stat-icon purple">
              <Cloud size={22} />
            </span>
            <div>
              <h2>
                {account ? "Your cloud workspace" : "Your InterviewOS account"}
              </h2>
              <p>
                {account
                  ? "Personal progress, securely tied to you."
                  : "Sign in to take your learning across devices."}
              </p>
            </div>
          </div>
          {account ? (
            <>
              <div className="account-identity">
                <span className="avatar large">
                  {account.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <h3>{account.name}</h3>
                  <p>{account.email}</p>
                </div>
              </div>
              <div
                className={`sync-status ${sync === "conflict" ? "warning" : ""}`}
              >
                <span className="tiny-dot" />
                {sync === "synced"
                  ? "Your cloud progress is up to date."
                  : sync === "saving"
                    ? "Saving your latest changes…"
                    : sync === "conflict"
                      ? "A newer version exists in the cloud. Your device copy has been preserved."
                      : "Your changes are saved on this device. Cloud sync is currently unavailable."}
              </div>
              {sync === "conflict" ? (
                <div className="notice">
                  <Info size={17} />
                  <div>
                    <p>
                      Export your device copy first, then reload cloud progress.
                      Import the backup afterward to merge your changes. A
                      recovery copy is also kept on this device.
                    </p>
                    <div className="button-row">
                      <button className="button secondary" onClick={exportData}>
                        Export device copy
                      </button>
                      <button
                        className="button secondary"
                        onClick={() => void reloadCloud()}
                      >
                        Reload cloud progress
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => void syncNow()}
                >
                  <RefreshCw size={15} />
                  Sync now
                </button>
              )}
              <div className="device-import">
                <h3>Bring in this device’s progress</h3>
                <p>
                  New accounts start with their own workspace. Import your
                  device history when you’re ready. Your existing account notes
                  stay in place.
                </p>
                <button className="button secondary" onClick={importDevice}>
                  <HardDrive size={15} />
                  Import device progress
                </button>
              </div>
              <button
                className="text-link"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  try {
                    await authClient.signOut();
                    await refreshSession();
                    notify("Signed out. Your device workspace is open.");
                  } catch {
                    notify("Could not sign out. Please retry.");
                  } finally {
                    setPending(false);
                  }
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </>
          ) : accountsReady ? (
            <>
              <div className="auth-tabs">
                <button
                  className={mode === "signin" ? "active" : ""}
                  onClick={() => {
                    setMode("signin");
                    setError("");
                  }}
                >
                  Sign in
                </button>
                <button
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Create account
                </button>
              </div>
              <form onSubmit={submit} className="auth-form">
                {mode === "signup" && (
                  <label>
                    Your name
                    <input
                      name="name"
                      required
                      maxLength={80}
                      autoComplete="name"
                    />
                  </label>
                )}
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    minLength={12}
                    maxLength={128}
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                  />
                  <small>Use at least 12 characters.</small>
                </label>
                {error && (
                  <p className="form-error" role="alert">
                    {error}
                  </p>
                )}
                <button className="button primary" disabled={pending}>
                  {pending
                    ? "Please wait…"
                    : mode === "signup"
                      ? "Create your account"
                      : "Sign in"}
                </button>
              </form>
              <p className="auth-caption">
                <ShieldCheck size={14} />
                Your existing device notes and progress stay on this device
                until you import them.
              </p>
            </>
          ) : (
            <div className="account-pending">
              <HardDrive size={34} />
              <h3>Your device workspace is ready.</h3>
              <p>
                Accounts and cloud sync will become available after the database
                is connected. Your lessons, progress, notes, and reminders are
                saved in this browser.
              </p>
              <span className="summary-badge">
                <CheckCircle2 size={14} />
                You can keep learning now
              </span>
            </div>
          )}
        </section>
        <div>
          <section className="panel backup-panel">
            <div className="settings-title">
              <span className="stat-icon green">
                <ShieldCheck size={21} />
              </span>
              <div>
                <h2>A backup for peace of mind.</h2>
                <p>Your learning history is yours to keep.</p>
              </div>
            </div>
            <p>
              Export all progress, notes, quizzes, reminders, and revision
              history. Import a previous backup to merge it with this workspace.
            </p>
            <div className="button-row">
              <button className="button secondary" onClick={exportData}>
                <Download size={16} />
                Export backup
              </button>
              <label className="button secondary file-button">
                <Upload size={16} />
                Import backup
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    void importFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            </div>
            <div className="backup-counts">
              <div>
                <strong>{Object.keys(state.progress).length}</strong>
                <span>tracked lessons</span>
              </div>
              <div>
                <strong>
                  {Object.values(state.notes).filter((n) => n.trim()).length}
                </strong>
                <span>saved notes</span>
              </div>
              <div>
                <strong>{state.revisions.length}</strong>
                <span>revisions</span>
              </div>
            </div>
          </section>
          <section className="notice migration-notice">
            <Info size={18} />
            <div>
              <h3>Continuing from the earlier InterviewOS?</h3>
              <p>
                Progress from the old app is imported automatically on the same
                browser and domain. The original saved data is preserved. If you
                used another browser, export a backup there and import it here.
              </p>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
