/**
 * We don't have real per-lesson video length (`lessons.duration_seconds`
 * is unset catalog-wide), so this deliberately gives actionable general
 * guidance instead of a fabricated "this lesson uses N MB" figure that
 * could be wrong and cost someone their data bundle.
 */
export default function DataSaverNote({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="text-xs rounded-lg p-3 flex gap-2 items-start"
      style={{ background: "var(--surface)", color: "var(--muted)" }}
    >
      <span aria-hidden>📶</span>
      <p>
        On a limited data plan? Tap the gear icon (⚙️) in the video player and choose{" "}
        <strong>480p or lower</strong> — standard-definition video uses a fraction of the data HD
        does and still looks fine on a phone.
        {!compact && " Save HD quality for when you're on Wi-Fi."}
      </p>
    </div>
  );
}
