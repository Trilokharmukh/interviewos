"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import {
  DEVICE_KEY,
  LEGACY_KEY,
  initialStudy,
  parseBackup,
  studySchema,
  localDay,
  mergeStudy,
  type StudyState,
} from "@/lib/study";
type Account = { id: string; name: string; email: string };
type Sync = "device" | "loading" | "synced" | "saving" | "offline" | "conflict";
interface StudyContext {
  state: StudyState;
  hydrated: boolean;
  account: Account | null;
  accountsReady: boolean;
  sync: Sync;
  update: (fn: (s: StudyState) => StudyState) => void;
  notify: (message: string) => void;
  refreshSession: () => Promise<void>;
  syncNow: () => Promise<void>;
  reloadCloud: () => Promise<void>;
  exportData: () => void;
  importDevice: () => void;
}
const Context = createContext<StudyContext | null>(null);
function readDevice(): StudyState {
  const current = localStorage.getItem(DEVICE_KEY);
  if (current) return parseBackup(JSON.parse(current));
  const legacy = localStorage.getItem(LEGACY_KEY);
  // The original v1 entry remains untouched as a migration backup.
  return legacy ? parseBackup(JSON.parse(legacy)) : initialStudy();
}
export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialStudy);
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [accountsReady, setAccountsReady] = useState(false);
  const [sync, setSync] = useState<Sync>("device");
  const [message, setMessage] = useState("");
  const current = useRef(state);
  useEffect(() => {
    current.current = state;
  }, [state]);
  const storageKey = useRef(DEVICE_KEY),
    version = useRef(0),
    remote = useRef(""),
    cloud = useRef(false),
    conflict = useRef(false),
    inFlight = useRef(false),
    identity = useRef("device");
  const notify = useCallback((text: string) => setMessage(text), []);
  useEffect(() => {
    if (message) {
      const id = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(id);
    }
  }, [message]);
  const update = useCallback(
    (fn: (s: StudyState) => StudyState) => setState((prev) => fn(prev)),
    [],
  );
  const loadAccount = useCallback(
    async (user: Account | null, acceptCloud = false) => {
      // Flush the current device snapshot before switching accounts.
      try {
        if (hydrated)
          localStorage.setItem(
            storageKey.current,
            JSON.stringify(current.current),
          );
      } catch {}
      cloud.current = false;
      conflict.current = false;
      identity.current = user?.id ?? "device";
      const key = user ? `interviewos-v4-account:${user.id}` : DEVICE_KEY;
      storageKey.current = key;
      setAccount(user);
      setSync(user ? "loading" : "device");
      setHydrated(false);
      let local = initialStudy();
      try {
        local = user
          ? parseBackup(
              JSON.parse(
                localStorage.getItem(key) || JSON.stringify(initialStudy()),
              ),
            )
          : readDevice();
      } catch {
        notify(
          "Stored data could not be read. Your original backup is still preserved.",
        );
      }
      if (!user) {
        setState(local);
        setHydrated(true);
        return;
      }
      try {
        const response = await fetch("/api/study", { cache: "no-store" });
        if (!response.ok) throw new Error();
        const result = await response.json();
        if (identity.current !== user.id) return;
        const data = result.data ? studySchema.parse(result.data) : local;
        // Preserve unsynced work from a prior session instead of silently discarding it.
        const baseKey = key + ":synced";
        const base = localStorage.getItem(baseKey);
        const localJson = JSON.stringify(local);
        const hasLocal = Boolean(localStorage.getItem(key));
        const unsynced =
          hasLocal &&
          (base
            ? base !== localJson
            : localJson !== JSON.stringify(initialStudy()));
        version.current = result.version;
        remote.current = JSON.stringify(result.data ? data : initialStudy());
        localStorage.setItem(baseKey, remote.current);
        cloud.current = true;
        if (
          !acceptCloud &&
          unsynced &&
          result.data &&
          JSON.stringify(data) !== JSON.stringify(local)
        ) {
          setState(local);
          conflict.current = true;
          setSync("conflict");
        } else {
          setState(data);
          setSync("synced");
        }
      } catch {
        setState(local);
        setSync("offline");
      }
      setHydrated(true);
    },
    [hydrated, notify],
  );
  const loadAccountRef = useRef(loadAccount);
  useEffect(() => {
    loadAccountRef.current = loadAccount;
  }, [loadAccount]);
  const refreshSession = useCallback(async () => {
    const { data } = await authClient.getSession();
    await loadAccountRef.current(data?.user ?? null);
  }, []);
  useEffect(() => {
    // Browser storage can only be hydrated after mount; it is external state.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(readDevice());
    } catch {
      setMessage(
        "Could not read stored data. The original backup has been kept.",
      );
    }
    setHydrated(true);
    let cancelled = false;
    void fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then(async (health) => {
        if (cancelled) return;
        setAccountsReady(Boolean(health.accounts));
        if (health.accounts) {
          const { data } = await authClient.getSession();
          if (!cancelled && data?.user) await loadAccountRef.current(data.user);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const syncNow = useCallback(async () => {
    if (!account || conflict.current || inFlight.current) return;
    if (!cloud.current) {
      await loadAccountRef.current(account);
      return;
    }
    const snapshot = current.current,
      serialized = JSON.stringify(snapshot);
    if (serialized === remote.current) {
      setSync("synced");
      return;
    }
    inFlight.current = true;
    setSync("saving");
    const accountId = account.id;
    const key = storageKey.current;
    try {
      const response = await fetch("/api/study", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: snapshot, version: version.current }),
      });
      if (identity.current !== accountId) return;
      if (response.status === 409) {
        conflict.current = true;
        setSync("conflict");
        return;
      }
      if (!response.ok) throw new Error();
      const result = await response.json();
      version.current = result.version;
      remote.current = serialized;
      localStorage.setItem(key + ":synced", serialized);
      setSync("synced");
    } catch {
      if (identity.current === accountId) setSync("offline");
    } finally {
      inFlight.current = false;
    }
  }, [account]);
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey.current, JSON.stringify(state));
    } catch {
      // Display a user-visible error when writing external browser storage fails.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      notify(
        "This browser could not save your changes. Export a backup to keep them safe.",
      );
    }
    const timer = setTimeout(() => void syncNow(), 1000);
    return () => clearTimeout(timer);
  }, [state, hydrated, syncNow, notify]);
  useEffect(() => {
    const retry = () => void syncNow();
    window.addEventListener("online", retry);
    // Also catches edits made during a previous in-flight save.
    const timer = setInterval(retry, 15000);
    return () => {
      window.removeEventListener("online", retry);
      clearInterval(timer);
    };
  }, [syncNow]);
  const exportData = useCallback(() => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            version: 4,
            exportedAt: new Date().toISOString(),
            data: current.current,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = `interviewos-backup-${localDay()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Backup exported.");
  }, [notify]);
  const reloadCloud = useCallback(async () => {
    if (!account) return;
    // Keep a recoverable conflict copy before accepting the cloud version.
    localStorage.setItem(
      storageKey.current + ":conflict-backup",
      JSON.stringify(current.current),
    );
    localStorage.removeItem(storageKey.current + ":synced");
    await loadAccountRef.current(account, true);
  }, [account]);
  const importDevice = useCallback(() => {
    try {
      const device = readDevice();
      setState((prev) => mergeStudy(prev, device));
      notify("Device progress imported. Existing cloud notes were kept.");
    } catch {
      notify("Device progress could not be read.");
    }
  }, [notify]);
  useEffect(() => {
    const check = () => {
      if (!hydrated || document.hidden) return;
      const now = new Date(),
        day = localDay(now),
        time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const prev = current.current;
      let changed = false;
      const titles: string[] = [];
      const daily = { ...prev.daily };
      if (daily.enabled && time >= daily.time && daily.lastFired !== day) {
        daily.lastFired = day;
        changed = true;
        titles.push("Time for interview prep — one concept today.");
      }
      const reminders = prev.reminders.map((r) => {
        if (!r.done && !r.notified && new Date(r.at) <= now) {
          changed = true;
          titles.push(r.title);
          return { ...r, notified: true };
        }
        return r;
      });
      if (!changed) return;
      const next = { ...prev, daily, reminders };
      current.current = next;
      setState(next);
      notify(titles.join(" · "));
      if ("Notification" in window && Notification.permission === "granted")
        for (const title of titles) {
          try {
            new Notification("InterviewOS", {
              body: title,
              tag: `interviewos-${day}-${title}`,
            });
          } catch {}
        }
    };
    const timer = setInterval(check, 30000);
    document.addEventListener("visibilitychange", check);
    check();
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [hydrated, notify]);
  return (
    <Context.Provider
      value={{
        state,
        hydrated,
        account,
        accountsReady,
        sync,
        update,
        notify,
        refreshSession,
        syncNow,
        reloadCloud,
        exportData,
        importDevice,
      }}
    >
      {children}
      {message && (
        <div role="status" className="toast">
          {message}
        </div>
      )}
    </Context.Provider>
  );
}
export function useStudy() {
  const value = useContext(Context);
  if (!value) throw new Error("StudyProvider is required.");
  return value;
}
