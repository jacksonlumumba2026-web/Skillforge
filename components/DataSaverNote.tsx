import { formatDataCost } from "@/lib/dataCost";

/**
 * Two modes, and which one shows is decided by whether we know the video's
 * real length.
 *
 * With a duration, the learner gets a figure for this specific lesson. With
 * no duration we give actionable general guidance instead of a fabricated
 * "this lesson uses N MB" — a wrong number could cost somebody their bundle,
 * and they would have budgeted against it.
 */
export default function DataSaverNote({
  compact = false,
  durationSeconds = null,
}: {
  compact?: boolean;
  durationSeconds?: number | null;
}) {
  const cost = formatDataCost(durationSeconds);

  return (
    <div
      className="text-xs rounded-lg p-3 flex gap-2 items-start"
      style={{ background: "var(--surface)", color: "var(--muted)" }}
    >
      <span aria-hidden>📶</span>
      {cost ? (
        <p>
          This lesson uses <strong>{cost}</strong>. Tap the gear icon (⚙️) in the player to pick
          the quality — lower uses less.
          {!compact && " Save HD for when you're on Wi-Fi."}
        </p>
      ) : (
        <p>
          On a limited data plan? Tap the gear icon (⚙️) in the video player and choose{" "}
          <strong>480p or lower</strong> — standard-definition video uses a fraction of the data HD
          does and still looks fine on a phone.
          {!compact && " Save HD quality for when you're on Wi-Fi."}
        </p>
      )}
    </div>
  );
}
