// Shared between server (lib/mpesa.ts) and client (MpesaPanel) — must use
// NEXT_PUBLIC_ vars since the client bundle needs to read them too.
export const MPESA_PRICES_KES = {
  monthly: Number(process.env.NEXT_PUBLIC_MPESA_PRICE_MONTHLY_KES ?? 2500),
  annual: Number(process.env.NEXT_PUBLIC_MPESA_PRICE_ANNUAL_KES ?? 24000),
} as const;

export type MpesaPlanKey = keyof typeof MPESA_PRICES_KES;
