import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/webpush";

// Vercel's Hobby plan only allows a cron entry to fire once per day, so a
// single */15-style entry that ticks all day isn't possible on that tier.
// vercel.json instead defines one entry per hour (each individually
// "once a day"), all pointing at this same route — together they give
// hourly coverage without needing a paid plan. Vercel may invoke a given
// hour's entry any time within that hour, so "5pm" means "sometime in
// the 17:00 hour," not the exact minute.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();

  const { data: reminders } = await admin
    .from("study_reminders")
    .select("user_id, reminder_time, utc_offset_minutes, last_sent_date")
    .eq("enabled", true);

  let sent = 0;
  let skippedAlreadyDone = 0;
  let skippedAlreadySent = 0;

  for (const reminder of reminders ?? []) {
    const localMinutes =
      ((now.getUTCHours() * 60 + now.getUTCMinutes() + reminder.utc_offset_minutes) % 1440 + 1440) % 1440;
    const [h, m] = reminder.reminder_time.split(":").map(Number);
    const reminderMinutes = h * 60 + m;
    // Only fire once we're in (or just past) the reminder's hour, and not
    // more than 59 minutes past it — keeps a late-running invocation from
    // firing for an hour that already passed.
    if (localMinutes < reminderMinutes || localMinutes - reminderMinutes >= 60) continue;

    const localDateKey = new Date(now.getTime() + reminder.utc_offset_minutes * 60_000)
      .toISOString()
      .slice(0, 10);
    if (reminder.last_sent_date === localDateKey) {
      skippedAlreadySent++;
      continue;
    }

    const startOfLocalDayUtc = new Date(
      `${localDateKey}T00:00:00.000Z`,
    ).getTime() - reminder.utc_offset_minutes * 60_000;

    const { count: completedToday } = await admin
      .from("lesson_progress")
      .select("id", { count: "exact", head: true })
      .eq("user_id", reminder.user_id)
      .eq("completed", true)
      .gte("completed_at", new Date(startOfLocalDayUtc).toISOString());

    if ((completedToday ?? 0) > 0) {
      skippedAlreadyDone++;
      await admin
        .from("study_reminders")
        .update({ last_sent_date: localDateKey })
        .eq("user_id", reminder.user_id);
      continue;
    }

    const { data: subscriptions } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", reminder.user_id);

    for (const sub of subscriptions ?? []) {
      const result = await sendPushNotification(sub, {
        title: "Time to learn 👋",
        body: "You haven't studied today yet — even one lesson keeps your progress moving.",
        url: "/dashboard",
      });
      if (!result.ok && result.gone) {
        await admin.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
    sent++;

    await admin.from("study_reminders").update({ last_sent_date: localDateKey }).eq("user_id", reminder.user_id);
  }

  return NextResponse.json({ sent, skippedAlreadyDone, skippedAlreadySent });
}
