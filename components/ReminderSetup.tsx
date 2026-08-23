"use client";

import { useEffect, useState } from "react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am–10pm, matching the hourly cron coverage

function formatHour(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:00 ${period}`;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "idle" | "working" | "enabled" | "dismissed" | "unsupported";

export default function ReminderSetup() {
  const [hour, setHour] = useState(17);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [needsHomeScreen, setNeedsHomeScreen] = useState(false);

  useEffect(() => {
    // Feature/platform detection has to run client-side (navigator/window
    // aren't available during server rendering, and using them during the
    // initial render would cause a hydration mismatch), so deferring to an
    // effect that runs once on mount is the correct approach here, not the
    // needless-effect anti-pattern this lint rule usually catches.
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNeedsHomeScreen(isIos && !isStandalone);
    setStatus(supported ? "idle" : "unsupported");
  }, []);

  async function handleEnable() {
    setError(null);
    setStatus("working");
    try {
      if (needsHomeScreen) {
        setError("On iPhone, add this site to your Home Screen first (Share → Add to Home Screen), then open it from there and try again.");
        setStatus("idle");
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError("Notifications were blocked. You can still set your reminder time, but you won't get a push alert.");
        setStatus("idle");
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) throw new Error("Push isn't configured yet.");

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });
      const json = subscription.toJSON();

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
      });
      await fetch("/api/push/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderTime: `${String(hour).padStart(2, "0")}:00`, enabled: true }),
      });

      setStatus("enabled");
    } catch {
      setError("Could not enable notifications. Please try again.");
      setStatus("idle");
    }
  }

  async function handleDismiss() {
    setStatus("working");
    await fetch("/api/push/reminder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderTime: `${String(hour).padStart(2, "0")}:00`, enabled: false }),
    });
    setStatus("dismissed");
  }

  if (status === "dismissed" || status === "enabled") {
    return (
      <div className="card p-5 mb-8">
        <p className="text-sm">
          {status === "enabled"
            ? `✅ Daily reminder set for ${formatHour(hour)} — we'll nudge you if you haven't studied yet that day.`
            : "No problem — you can turn on daily reminders any time from your dashboard."}
        </p>
      </div>
    );
  }

  return (
    <div className="card p-5 mb-8">
      <p className="text-sm font-semibold mb-1">Want a daily reminder to keep learning?</p>
      <p className="text-sm text-[var(--muted)] mb-4">
        Pick a time — if you haven&apos;t completed a lesson by then, we&apos;ll send a notification to your phone.
      </p>

      {status === "unsupported" ? (
        <p className="text-sm text-[var(--muted)]">
          Your browser doesn&apos;t support notifications, so this isn&apos;t available here.
        </p>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4">
            <select
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              className="field-input w-auto"
              disabled={status === "working"}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </div>
          {needsHomeScreen && (
            <p className="text-xs text-[var(--muted)] mb-3">
              On iPhone: add this site to your Home Screen first (Share → Add to Home Screen), then reopen it from
              there to enable notifications.
            </p>
          )}
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={handleEnable} disabled={status === "working"}>
              {status === "working" ? "Setting up…" : "Enable notifications"}
            </button>
            <button className="btn btn-secondary" onClick={handleDismiss} disabled={status === "working"}>
              Not now
            </button>
          </div>
        </>
      )}
    </div>
  );
}
