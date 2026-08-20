import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Service-role Supabase client. Bypasses RLS — use only in trusted server
 * code (API routes, the Paystack webhook) that has already verified the
 * operation is allowed, e.g. creating an enrollment after a verified
 * payment.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
