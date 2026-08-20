import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/** Confirms the logged-in user is an admin. Used at the top of every /api/admin/* route. */
export async function requireAdmin(
  supabase: SupabaseClient<Database>,
): Promise<{ ok: true; userId: string } | { ok: false; status: number; error: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required." };
  }

  return { ok: true, userId: user.id };
}
