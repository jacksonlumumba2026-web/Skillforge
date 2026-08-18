import "server-only";

const BASE_URL =
  process.env.MPESA_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;

  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`M-Pesa auth failed: ${res.status} ${await res.text()}`);

  const data = await res.json();
  const expiresInMs = Number(data.expires_in ?? 3599) * 1000;
  cachedToken = { value: data.access_token, expiresAt: Date.now() + expiresInMs - 30_000 };
  return cachedToken.value;
}

/** Normalizes a Kenyan phone number (07.., 01.., +254.., 254..) to Daraja's expected 2547XXXXXXXX / 2541XXXXXXXX form. */
export function normalizeKenyanPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  let normalized: string;
  if (digits.startsWith("254")) normalized = digits;
  else if (digits.startsWith("0")) normalized = `254${digits.slice(1)}`;
  else if (digits.startsWith("7") || digits.startsWith("1")) normalized = `254${digits}`;
  else normalized = digits;

  if (!/^254(7|1)\d{8}$/.test(normalized)) {
    throw new Error("invalid_phone_number");
  }
  return normalized;
}

function darajaTimestamp(): string {
  // Daraja expects the timestamp in Africa/Nairobi (EAT, UTC+3, no DST).
  const nairobi = new Date(Date.now() + 3 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${nairobi.getUTCFullYear()}${pad(nairobi.getUTCMonth() + 1)}${pad(nairobi.getUTCDate())}` +
    `${pad(nairobi.getUTCHours())}${pad(nairobi.getUTCMinutes())}${pad(nairobi.getUTCSeconds())}`
  );
}

export interface StkPushResult {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

/** Initiates an M-Pesa STK Push (Lipa Na M-Pesa Online) prompt to the customer's phone. */
export async function initiateStkPush(params: {
  phone: string;
  amountKes: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<StkPushResult> {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  const timestamp = darajaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
  const token = await getAccessToken();

  const res = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(params.amountKes),
      PartyA: params.phone,
      PartyB: shortcode,
      PhoneNumber: params.phone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc,
    }),
    cache: "no-store",
  });

  const data = await res.json();
  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage ?? `M-Pesa STK push failed: ${res.status}`);
  }
  return data as StkPushResult;
}

