import type { Profile } from "@/lib/types/database";

export type AccessState = "trialing" | "active" | "expired";

type AccessProfile = Pick<Profile, "trial_ends_at" | "current_period_end">;

function isFuture(iso: string | null): boolean {
  return Boolean(iso) && new Date(iso!).getTime() > Date.now();
}

/** Mirrors the SQL `has_active_access` function — trial and paid-period access are both timestamp-based, not a stored/webhook-synced status. */
export function hasActiveAccess(profile: AccessProfile | null | undefined): boolean {
  if (!profile) return false;
  return isFuture(profile.trial_ends_at) || isFuture(profile.current_period_end);
}

export function accessState(profile: AccessProfile | null | undefined): AccessState {
  if (!profile) return "expired";
  if (isFuture(profile.current_period_end)) return "active";
  if (isFuture(profile.trial_ends_at)) return "trialing";
  return "expired";
}

export function daysLeft(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
