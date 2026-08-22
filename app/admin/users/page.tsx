import { createAdminClient } from "@/lib/supabase/admin";
import UserBanToggle from "./UserBanToggle";

// Service-role read, same reasoning as the rest of /admin: profiles has no
// public read policy for other users' rows, and ban status only lives on
// auth.users (via the Admin API), which the client-side key can't reach at
// all. Access to this whole /admin section is already gated by middleware
// checking profiles.role === 'admin'.
export default async function AdminUsersPage() {
  const admin = createAdminClient();

  const [{ data: profiles }, { data: authList }, { data: enrollmentRows }] = await Promise.all([
    admin.from("profiles").select("user_id, full_name, email, role, created_at"),
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("enrollments").select("user_id"),
  ]);

  const bannedUntilByUser = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.banned_until as string | null | undefined]),
  );
  const enrollmentCounts = new Map<string, number>();
  for (const e of enrollmentRows ?? []) {
    enrollmentCounts.set(e.user_id, (enrollmentCounts.get(e.user_id) ?? 0) + 1);
  }

  const now = new Date().getTime();
  const users = (profiles ?? [])
    .map((p) => {
      const bannedUntil = bannedUntilByUser.get(p.user_id);
      return {
        userId: p.user_id,
        name: p.full_name || p.email,
        email: p.email,
        role: p.role,
        createdAt: p.created_at,
        enrollments: enrollmentCounts.get(p.user_id) ?? 0,
        banned: Boolean(bannedUntil && new Date(bannedUntil).getTime() > now),
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-8">Admin — Users</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Enrollments</th>
              <th className="p-4">Joined</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.userId} className="border-b border-[var(--border)] last:border-0">
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 text-[var(--muted)]">{u.email}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4">{u.enrollments}</td>
                <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  {u.role === "admin" ? (
                    <span className="text-xs text-[var(--muted)]">Admin</span>
                  ) : (
                    <UserBanToggle userId={u.userId} initialBanned={u.banned} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
