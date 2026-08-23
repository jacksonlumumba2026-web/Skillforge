import { createAdminClient } from "@/lib/supabase/admin";
import CreateDiscountCodeForm from "./CreateDiscountCodeForm";
import ActiveToggle from "./ActiveToggle";

// Service-role read, same reasoning as the rest of /admin: no public read
// policy exists for discount_codes, by design (see migration 0027).
export default async function AdminDiscountCodesPage() {
  const admin = createAdminClient();
  const { data: codes } = await admin
    .from("discount_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-2">Admin — Discount Codes</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        Percent-off codes for learners who can&apos;t pay full price — a 100% code is a full
        scholarship and skips the payment gateway entirely. Each code can be redeemed once per
        learner.
      </p>

      <CreateDiscountCodeForm />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              <th className="p-4">Code</th>
              <th className="p-4">% off</th>
              <th className="p-4">Redeemed</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Note</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(codes ?? []).map((discountCode) => (
              <tr key={discountCode.id} className="border-b border-[var(--border)] last:border-0">
                <td className="p-4 font-mono font-medium">{discountCode.code}</td>
                <td className="p-4">{discountCode.percent_off}%</td>
                <td className="p-4">
                  {discountCode.redemption_count}
                  {discountCode.max_redemptions ? ` / ${discountCode.max_redemptions}` : ""}
                </td>
                <td className="p-4">
                  {discountCode.expires_at ? new Date(discountCode.expires_at).toLocaleDateString() : "Never"}
                </td>
                <td className="p-4 text-[var(--muted)]">{discountCode.note ?? "—"}</td>
                <td className="p-4">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      background: discountCode.active ? "var(--success)" : "var(--surface)",
                      color: discountCode.active ? "white" : "var(--muted)",
                    }}
                  >
                    {discountCode.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <ActiveToggle discountCodeId={discountCode.id} initialActive={discountCode.active} />
                </td>
              </tr>
            ))}
            {(codes ?? []).length === 0 && (
              <tr>
                <td className="p-4 text-[var(--muted)]" colSpan={7}>
                  No discount codes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
