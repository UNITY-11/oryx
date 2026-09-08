/**
 * Tell the public web app to purge ISR/page caches after CMS changes.
 * Failures are logged only — never block the admin mutation response.
 */
export async function revalidateWebSite(): Promise<void> {
  const baseUrl = process.env.WEB_APP_URL?.replace(/\/$/, "");
  const secret = process.env.REVALIDATE_SECRET;

  if (!baseUrl || !secret) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[revalidate-web] Skipping: set WEB_APP_URL and REVALIDATE_SECRET to refresh the public site."
      );
    }
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/api/revalidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({}),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        `[revalidate-web] Failed (${res.status}): ${text || res.statusText}`
      );
    }
  } catch (error) {
    console.error("[revalidate-web] Request failed:", error);
  }
}
