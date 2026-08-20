import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import CourseForm from "../CourseForm";
import ModuleEditor from "./ModuleEditor";
import AddModuleForm from "./AddModuleForm";
import type { Lesson } from "@/lib/types";

// Service-role reads for the same reason as /admin: this page must show
// unpublished courses and full lesson content, which the RLS-scoped client
// can't see. Access is already gated by middleware (admin-only).
export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = createAdminClient();

  const { data: course } = await supabase.from("courses").select("*").eq("id", courseId).maybeSingle();
  if (!course) notFound();

  const { data: modules } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_number", { ascending: true });

  const moduleIds = (modules ?? []).map((m) => m.id);
  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds.length > 0 ? moduleIds : ["00000000-0000-0000-0000-000000000000"])
    .order("order_number", { ascending: true });

  const lessonsByModule = new Map<string, Lesson[]>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByModule.get(lesson.module_id) ?? [];
    list.push(lesson);
    lessonsByModule.set(lesson.module_id, list);
  }

  return (
    <div className="container-page py-16 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Edit course</h1>

      <CourseForm course={course} />

      <h2 className="text-lg font-semibold mt-10 mb-5">Curriculum</h2>
      <div className="space-y-6">
        {(modules ?? []).map((courseModule) => (
          <ModuleEditor
            key={courseModule.id}
            courseModule={courseModule}
            lessons={lessonsByModule.get(courseModule.id) ?? []}
          />
        ))}
      </div>

      <div className="mt-6">
        <AddModuleForm courseId={courseId} />
      </div>
    </div>
  );
}
