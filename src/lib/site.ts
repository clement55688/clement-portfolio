const LOCAL_SITE_URL = "http://localhost:3000";

/** Public origin. `NEXT_PUBLIC_SITE_URL` is inlined at build time. */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!configured) return LOCAL_SITE_URL;
  try {
    const url = new URL(configured);
    if (url.protocol !== "http:" && url.protocol !== "https:") return LOCAL_SITE_URL;
    return url.origin;
  } catch {
    return LOCAL_SITE_URL;
  }
}
