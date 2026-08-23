import "server-only";
import webpush from "web-push";

let configured = false;

function configure() {
  if (configured) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("VAPID keys are not configured");
  webpush.setVapidDetails("mailto:jacksonlumumba275@gmail.com", publicKey, privateKey);
  configured = true;
}

export type PushSubscriptionKeys = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Sends one push notification. Returns "gone" when the endpoint is dead
 * (410/404 — browser unsubscribed, uninstalled, etc.) so the caller can
 * delete that subscription row instead of retrying it forever.
 */
export async function sendPushNotification(
  subscription: PushSubscriptionKeys,
  payload: { title: string; body: string; url: string },
): Promise<{ ok: true } | { ok: false; gone: boolean }> {
  configure();
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
    return { ok: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    return { ok: false, gone: statusCode === 404 || statusCode === 410 };
  }
}
