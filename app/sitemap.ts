import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, updated_at")
    .eq("published", true);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/courses`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const coursePages: MetadataRoute.Sitemap = (courses ?? []).map((course) => ({
    url: `${SITE_URL}/courses/${course.id}`,
    lastModified: course.updated_at,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticPages, ...coursePages];
}
