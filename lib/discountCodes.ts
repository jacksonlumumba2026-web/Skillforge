import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type DiscountValidation =
  | { ok: true; discountCodeId: string; percentOff: number; discountedPrice: number }
  | { ok: false; error: string };

const GENERIC_INVALID_ERROR = "That code isn't valid, has expired, or has already been used.";

/**
 * Read-only check — does not record anything. Safe to call both from the
 * client-facing preview endpoint and immediately before charging in the
 * initiate routes. One generic error message for every failure mode
 * (expired, exhausted, already redeemed, unknown code) so this can't be
 * used to enumerate which codes exist.
 */
export async function validateDiscountCode(
  rawCode: string,
  userId: string,
  originalPrice: number,
): Promise<DiscountValidation> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, error: "Enter a discount code." };

  const admin = createAdminClient();
  const { data: discount } = await admin
    .from("discount_codes")
    .select("id, percent_off, active, max_redemptions, redemption_count, expires_at")
    .eq("code", code)
    .maybeSingle();
  if (!discount || !discount.active) return { ok: false, error: GENERIC_INVALID_ERROR };
  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return { ok: false, error: GENERIC_INVALID_ERROR };
  }
  if (discount.max_redemptions !== null && discount.redemption_count >= discount.max_redemptions) {
    return { ok: false, error: GENERIC_INVALID_ERROR };
  }

  const { data: existingRedemption } = await admin
    .from("discount_code_redemptions")
    .select("id")
    .eq("discount_code_id", discount.id)
    .eq("user_id", userId)
    .maybeSingle();
  if (existingRedemption) return { ok: false, error: GENERIC_INVALID_ERROR };

  const discountedPrice = Math.max(0, Math.round(originalPrice * (1 - discount.percent_off / 100)));
  return { ok: true, discountCodeId: discount.id, percentOff: discount.percent_off, discountedPrice };
}

/**
 * Called only after a payment is confirmed successful (or immediately, for
 * the KES 0 full-scholarship path) — never at initiate time, so an
 * abandoned checkout doesn't burn someone else's redemption slot.
 */
export async function recordDiscountRedemption(
  discountCodeId: string,
  userId: string,
  paymentId: string,
): Promise<void> {
  const admin = createAdminClient();
  await admin
    .from("discount_code_redemptions")
    .insert({ discount_code_id: discountCodeId, user_id: userId, payment_id: paymentId });
  await admin.rpc("increment_discount_redemption", { p_discount_code_id: discountCodeId });
}
