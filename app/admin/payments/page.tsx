import { createAdminClient } from "@/lib/supabase/admin";
import RefundButton from "./RefundButton";
import MarkVerifiedButton from "./MarkVerifiedButton";

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  success: { background: "var(--success)", color: "white" },
  pending: { background: "var(--surface)", color: "var(--muted)" },
  failed: { background: "#dc2626", color: "white" },
  refunded: { background: "#f59e0b", color: "white" },
};

const PROVIDER_LABEL: Record<string, string> = {
  paystack: "Paystack",
  mpesa: "M-Pesa (STK)",
  mpesa_manual: "M-Pesa (manual)",
};

// Service-role read, same reasoning as the rest of /admin: payments has no
// public read policy for other users' rows.
export default async function AdminPaymentsPage() {
  const admin = createAdminClient();

  const { data: payments } = await admin
    .from("payments")
    .select(
      "id, user_id, reference, amount, status, provider, phone, mpesa_manual_code, manual_verified_at, created_at, courses(title)",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const userIds = [...new Set((payments ?? []).map((p) => p.user_id))];
  const { data: profiles } = await admin
    .from("profiles")
    .select("user_id, email")
    .in("user_id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);
  const emailByUser = new Map((profiles ?? []).map((p) => [p.user_id, p.email]));

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-2">Admin — Payments</h1>
      <p className="text-sm text-[var(--muted)] mb-8">
        The public policy is no refunds. &quot;Refund&quot; here is for our own billing errors only —
        a duplicate charge, or a payment that went through without granting access.
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              <th className="p-4">Learner</th>
              <th className="p-4">Course</th>
              <th className="p-4">Amount</th>
              <th className="p-4">Provider</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((payment) => {
              const course = payment.courses as unknown as { title: string } | null;
              const style = STATUS_STYLE[payment.status] ?? STATUS_STYLE.pending;
              return (
                <tr key={payment.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4 font-medium">{emailByUser.get(payment.user_id) ?? "—"}</td>
                  <td className="p-4">{course?.title ?? "—"}</td>
                  <td className="p-4">KSh {Number(payment.amount).toLocaleString()}</td>
                  <td className="p-4">
                    {PROVIDER_LABEL[payment.provider] ?? payment.provider}
                    {payment.phone && <span className="text-[var(--muted)]"> · {payment.phone}</span>}
                    {payment.mpesa_manual_code && (
                      <div className="text-xs text-[var(--muted)] mt-0.5">
                        Code: <span className="font-mono">{payment.mpesa_manual_code}</span>
                        {payment.manual_verified_at ? (
                          <span style={{ color: "var(--success)" }}> · Verified</span>
                        ) : (
                          <span> · Not yet checked</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="p-4">{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={style}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {payment.provider === "mpesa_manual" && !payment.manual_verified_at && (
                        <MarkVerifiedButton paymentId={payment.id} />
                      )}
                      {payment.status === "success" && <RefundButton paymentId={payment.id} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
