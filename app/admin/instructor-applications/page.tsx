import { createAdminClient } from "@/lib/supabase/admin";

// Service-role read, same reasoning as the rest of /admin: this table has
// no RLS policies for anon/authenticated at all.
export default async function InstructorApplicationsPage() {
  const supabase = createAdminClient();
  const { data: applications } = await supabase
    .from("instructor_applications")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="container-page py-16">
      <h1 className="text-2xl font-bold mb-8">Instructor applications</h1>

      {(applications ?? []).length === 0 ? (
        <p className="text-[var(--muted)]">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {(applications ?? []).map((application) => (
            <div key={application.id} className="card p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{application.name}</span>
                <span className="text-xs text-[var(--muted)]">
                  {new Date(application.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm mb-2">
                <a href={`mailto:${application.email}`} style={{ color: "var(--primary)" }}>
                  {application.email}
                </a>{" "}
                — wants to teach: <strong>{application.topic}</strong>
              </p>
              {application.message && (
                <p className="text-sm text-[var(--muted)]">{application.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
