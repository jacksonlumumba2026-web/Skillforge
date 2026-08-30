import "server-only";
import crypto from "node:crypto";

const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");
  return key;
}

export type PaystackTransaction = {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
};

export type PaystackVerification = {
  status: boolean;
  message: string;
  data: {
    status: "success" | "failed" | "abandoned";
    reference: string;
    amount: number;
    currency: string;
    metadata: Record<string, unknown>;
  };
};

/** Starts a Paystack transaction. Amount is in whole KES; Paystack wants the subunit (cents). */
export async function initializeTransaction(input: {
  email: string;
  amountKes: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}): Promise<PaystackTransaction> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amountKes * 100),
      currency: "KES",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
  const body = (await res.json()) as PaystackTransaction;
  if (!res.ok || !body.status) {
    throw new Error(body.message || `Paystack initialize failed: ${res.status}`);
  }
  return body;
}

/**
 * Confirms a transaction's real status directly with Paystack — never trust
 * a webhook payload or client redirect on its own for granting access.
 */
export async function verifyTransaction(reference: string): Promise<PaystackVerification> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });
  const body = (await res.json()) as PaystackVerification;
  if (!res.ok || !body.status) {
    throw new Error(body.message || `Paystack verify failed: ${res.status}`);
  }
  return body;
}

/** Confirms a webhook request actually came from Paystack (HMAC SHA512 over the raw body). */
/**
 * Which Paystack key mode the server is configured with, derived from the key
 * prefix alone -- never the key itself. Exists so a webhook signature failure
 * can say WHY: a live charge signed with a live key will never match a test
 * key, which is exactly how 10 real payments sat `pending` for a week with no
 * trace of the rejection.
 */
export function secretKeyMode(): "test" | "live" | "unknown" {
  const key = process.env.PAYSTACK_SECRET_KEY ?? "";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_")) return "live";
  return "unknown";
}

export function isValidWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false;
  const expected = Buffer.from(
    crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex"),
  );
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length) return false;
  return crypto.timingSafeEqual(expected, actual);
}
