export default function StarRating({
  rating,
  reviewCount,
  size = "text-sm",
}: {
  rating: number;
  reviewCount?: number;
  size?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <span className={`inline-flex items-center gap-1 ${size}`} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span aria-hidden style={{ color: "#f59e0b" }}>
        {"★".repeat(rounded)}
        <span style={{ color: "var(--border)" }}>{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-[var(--muted)]">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" && ` (${reviewCount})`}
      </span>
    </span>
  );
}
