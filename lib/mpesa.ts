import "server-only";

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function baseUrl(): string {
  return process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/** Local (07/01...) or already-international phone -> Safaricom's required 2547/2541XXXXXXXX format. Returns null if it doesn't look like a valid Kenyan mobile number. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (/^254[71]\d{8}$/.test(digits)) return digits;
  if (/^0[71]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[71]\d{8}$/.test(digits)) return `254${digits}`;
  return null;
}

async function getAccessToken(): Promise<string> {
  const key = env("MPESA_CONSUMER_KEY");
  const secret = env("MPESA_CONSUMER_SECRET");
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");

  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    cache: "no-store",
  });
  const body = await res.json();
  if (!res.ok || !body.access_token) {
    throw new Error(`M-Pesa auth failed: ${res.status}`);
  }
  return body.access_token as string;
}

export type StkPushResult = {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
};

/**
 * Triggers the M-Pesa PIN prompt on the customer's phone (Lipa Na M-Pesa
 * Online / STK Push). Transaction type defaults to Buy Goods since the
 * business account behind this is a Till number, not a Paybill — set
 * MPESA_TRANSACTION_TYPE=CustomerPayBillOnline if that ever changes.
 */
export async function initiateStkPush(input: {
  phone: string;
  amountKes: number;
  accountReference: string;
  transactionDesc: string;
  callbackUrl: string;
}): Promise<StkPushResult> {
  const token = await getAccessToken();
  const shortcode = env("MPESA_SHORTCODE");
  const passkey = env("MPESA_PASSKEY");
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
  const transactionType = process.env.MPESA_TRANSACTION_TYPE || "CustomerBuyGoodsOnline";

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: transactionType,
      Amount: Math.round(input.amountKes),
      PartyA: input.phone,
      PartyB: shortcode,
      PhoneNumber: input.phone,
      CallBackURL: input.callbackUrl,
      // Daraja caps these at 12 and 13 chars respectively.
      AccountReference: input.accountReference.slice(0, 12),
      TransactionDesc: input.transactionDesc.slice(0, 13),
    }),
  });
  const body = await res.json();
  if (!res.ok || body.ResponseCode !== "0") {
    throw new Error(body.errorMessage || body.ResponseDescription || `M-Pesa STK push failed: ${res.status}`);
  }
  return body as StkPushResult;
}

export type StkQueryResult = {
  ResponseCode?: string;
  ResultCode?: string | number;
  ResultDesc?: string;
};

/**
 * Asks Safaricom directly whether a checkout request actually succeeded —
 * used to re-verify the async callback rather than trusting it alone, since
 * unlike Paystack's webhook, Daraja's callback carries no signature to
 * prove it really came from Safaricom.
 */
export async function queryStkPushStatus(checkoutRequestId: string): Promise<StkQueryResult> {
  const token = await getAccessToken();
  const shortcode = env("MPESA_SHORTCODE");
  const passkey = env("MPESA_PASSKEY");
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");

  const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
  });
  return (await res.json()) as StkQueryResult;
}
