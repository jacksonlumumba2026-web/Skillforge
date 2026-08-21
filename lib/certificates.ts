import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderedLessons } from "@/lib/courses";

export type IssueCertificateResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Issues a completion certificate — but only after re-verifying completion
 * server-side against lesson_progress, never trusting the client's claim
 * that a course is finished. Idempotent: a learner who already has one for
 * this course just gets the existing id back.
 */
export async function issueCertificate(userId: string, courseId: string): Promise<IssueCertificateResult> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("certificates")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (existing) return { ok: true, id: existing.id };

  const orderedLessons = await getOrderedLessons(admin, courseId);
  if (orderedLessons.length === 0) {
    return { ok: false, error: "This course has no lessons yet." };
  }

  const lessonIds = orderedLessons.map((l) => l.id);
  const { count } = await admin
    .from("lesson_progress")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", lessonIds);
  if ((count ?? 0) < orderedLessons.length) {
    return { ok: false, error: "You haven't completed every lesson in this course yet." };
  }

  const { data: profile } = await admin.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle();
  const learnerName = profile?.full_name?.trim() || profile?.email?.split("@")[0] || "SkillPath Africa Learner";

  const { data: certificate, error } = await admin
    .from("certificates")
    .insert({ user_id: userId, course_id: courseId, learner_name: learnerName })
    .select("id")
    .single();
  if (error || !certificate) {
    return { ok: false, error: error?.message ?? "Could not issue certificate." };
  }

  return { ok: true, id: certificate.id };
}
