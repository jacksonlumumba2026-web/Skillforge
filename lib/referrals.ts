import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Referrals: a learner shares their link, someone signs up through it, and
 * when that person makes their FIRST PURCHASE the referrer is issued a
 * single-use 10% discount code.
 *
 * The reward deliberately fires on money, not on signup. Rewarding signup is
 * free to fake — Gmail delivers every name+alias@gmail.com to one inbox, so
 * one person could mint accounts and discount themselves forever. Tying it to
 * a purchase means an abuser has to spend KSh 500 to earn KSh 50 off, which
 * is not an abuse, it is a sale.
 */

/** Survives the whole signup detour: click link -> read the site -> register
 *  -> confirm by email the next morning. httpOnly because nothing in the
 *  browser needs to read it, and the server is the only thing that acts on it. */
export const REFERRAL_COOKIE = "skillforge.ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const REWARD_PERCENT_OFF = 10;

/**
 * How new an account has to be for a referral on it to count.
 *
 * Without this, an established learner could be credited to someone the day
 * before they were going to buy anyway, which turns the programme into a
 * discount tap rather than a way to bring new people in. Seven days is
 * generous on purpose: a confirmation email read a few days late is a real
 * signup, not a gamed one.
 */
const NEW_ACCOUNT_WINDOW_DAYS = 7;

/**
 * Records that `userId` was referred by the owner of `rawCode`.
 *
 * Silent on every rejection. This runs on the authentication path, where the
 * only thing that matters is that the learner gets logged in — a bad, stale
 * or self-issued referral code must never turn into a visible error on the
 * way into the dashboard.
 */
export async function claimReferral(userId: string, rawCode: string): Promise<void> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return;

  try {
    const admin = createAdminClient();

    const { data: referrer } = await admin
      .from("profiles")
      .select("user_id")
      .eq("referral_code", code)
      .maybeSingle();
    // Unknown code, or someone pasting their own link into their own signup.
    if (!referrer || referrer.user_id === userId) return;

    const { data: invitee } = await admin
      .from("profiles")
      .select("created_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (!invitee) return;

    const ageDays = (Date.now() - new Date(invitee.created_at).getTime()) / 86_400_000;
    if (ageDays > NEW_ACCOUNT_WINDOW_DAYS) return;

    // Already learning here before the link was clicked — not a new learner
    // brought in by anyone, whatever the account's age says.
    const { count: existingEnrollments } = await admin
      .from("enrollments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((existingEnrollments ?? 0) > 0) return;

    // referred_user_id is unique, so a second click of a different link is
    // rejected by the database rather than quietly re-parenting the referral.
    // Ignoring the duplicate is the correct outcome: first link wins.
    await admin
      .from("referrals")
      .insert({ referrer_user_id: referrer.user_id, referred_user_id: userId });
  } catch (error) {
    console.error("[claimReferral] could not record referral", { userId, error });
  }
}

/** `REF` plus seven unambiguous characters — no O/0 or I/1, because these get
 *  read aloud and retyped off a phone screen. */
function generateRewardCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "REF";
  for (let i = 0; i < 7; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

/**
 * Called from every path that grants access after money changes hands. If
 * this learner was referred and the referral has not paid out yet, issues the
 * referrer a single-use 10% code.
 *
 * Never throws. A referral bug must not be able to stop a paying customer
 * getting the course they just bought, so everything here is wrapped and the
 * worst case is a logged failure and no reward.
 */
export async function creditReferralOnFirstPurchase(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();

    // Claim the referral BEFORE creating anything. Two payments finalizing at
    // once (webhook and browser callback both land, or a bundle and a course)
    // would otherwise each see an unqualified row and mint a code each. The
    // conditional update is atomic, so exactly one caller gets a row back.
    const { data: claimed } = await admin
      .from("referrals")
      .update({ qualified_at: new Date().toISOString() })
      .eq("referred_user_id", userId)
      .is("qualified_at", null)
      .select("id, referrer_user_id")
      .maybeSingle();
    if (!claimed) return;

    // Single-use globally rather than locked to the referrer: discount_codes
    // has no owner column, and a code shown only on one person's dashboard
    // and burnable exactly once is a small enough blast radius that adding
    // one is not worth a schema change.
    let codeId: string | null = null;
    let code: string | null = null;
    for (let attempt = 0; attempt < 5 && !codeId; attempt += 1) {
      const candidate = generateRewardCode();
      const { data: inserted, error } = await admin
        .from("discount_codes")
        .insert({
          code: candidate,
          percent_off: REWARD_PERCENT_OFF,
          max_redemptions: 1,
          active: true,
          note: `Referral reward for ${claimed.referrer_user_id} — earned when ${userId} made their first purchase.`,
        })
        .select("id")
        .single();
      // 23505 is the unique violation on `code`: astronomically unlikely, but
      // retrying costs nothing and a collision would otherwise lose a reward.
      if (error && error.code !== "23505") throw error;
      if (inserted) {
        codeId = inserted.id;
        code = candidate;
      }
    }

    if (!codeId) {
      // The referral is marked qualified but carries no code. Loud, because
      // it is invisible to the referrer and only this log will say why.
      console.error("[creditReferralOnFirstPurchase] qualified but could not mint a code", {
        referralId: claimed.id,
        referrer: claimed.referrer_user_id,
      });
      return;
    }

    await admin
      .from("referrals")
      .update({ reward_discount_code_id: codeId })
      .eq("id", claimed.id);

    console.info("[creditReferralOnFirstPurchase] reward issued", {
      referrer: claimed.referrer_user_id,
      code,
    });
  } catch (error) {
    console.error("[creditReferralOnFirstPurchase] failed", { userId, error });
  }
}
