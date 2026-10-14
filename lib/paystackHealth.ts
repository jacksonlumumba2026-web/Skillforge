import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";
import { secretKeyMode } from "@/lib/paystack";

export type PaystackHealth = {
  attempts: number;
  successes: number;
  keyMode: "test" | "live" | "unknown";
  looksBroken: boolean;
};

/**
 * Reports whether Paystack checkout is actually completing.
 *
 * A wrong PAYSTACK_SECRET_KEY breaks checkout silently: the charge still
 * reaches Paystack, but verification and the webhook signature both fail
 * against the wrong key, so rows pile up `pending` and the only trace is a
 * server log nobody reads. That ran unnoticed for six weeks once — every
 * sale lost, buyers charged and given nothing. A run of attempts with no
 * successes is the symptom worth surfacing.
 *
 * Lives here rather than in the admin page because reading the clock inside
 * a component body is impure.
 */
export async function getPaystackHealth(
  admin: SupabaseClient<Database>,
  windowDays = 30,
): Promise<PaystackHealth> {
  const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();
  const { data } = await admin
    .from("payments")
    .select("status")
    .eq("provider", "paystack")
    .gte("created_at", since);

  const attempts = data?.length ?? 0;
  const successes = (data ?? []).filter((p) => p.status === "success").length;

  return {
    attempts,
    successes,
    keyMode: secretKeyMode(),
    // Three is enough to distinguish a real outage from one abandoned
    // checkout, without waiting for a week of lost sales to be sure.
    looksBroken: attempts >= 3 && successes === 0,
  };
}
