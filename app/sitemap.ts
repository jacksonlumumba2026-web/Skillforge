import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";

const staticPages: MetadataRoute.Sitemap = [
  { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
  { url: `${SITE_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
];

/**
 * Course URLs need the service-role key. A build without it used to throw
 * here and fail the whole build, which made the app unbuildable on any
 * machine missing .env.local. Degrade to the static pages instead: a
 * sitemap missing course URLs is a small SEO loss, a failed build is not.
 */
async function coursePages(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("sitemap: Supabase env missing, emitting static pages only");
    return [];
  }

  try {
    const supabase = createAdminClient();
    const { data: courses, error } = await supabase
      .from("courses")
      .select("id, updated_at")
      .eq("published", true)
      .eq("curriculum_status", "published");

    if (error) {
      console.warn(`sitemap: course query failed (${error.message}), emitting static pages only`);
      return [];
    }

    return (courses ?? []).map((course) => ({
      url: `${SITE_URL}/courses/${course.id}`,
      lastModified: course.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (err) {
    console.warn(`sitemap: could not reach Supabase (${String(err)}), emitting static pages only`);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [...staticPages, ...await coursePages()];
}
