function startOfUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/** Simple day-granularity streak: same day = unchanged, next day = +1, gap = reset to 1. */
export function nextStreakCount(lastActivityAt: string, currentStreak: number): number {
  const daysSince = Math.floor(
    (startOfUtcDay(new Date()) - startOfUtcDay(new Date(lastActivityAt))) / 86_400_000,
  );
  if (daysSince <= 0) return Math.max(currentStreak, 1);
  if (daysSince === 1) return currentStreak + 1;
  return 1;
}
