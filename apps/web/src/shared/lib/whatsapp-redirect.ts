/** Navigate to wa.me (same tab — reliable after async booking). */
export function redirectToWhatsApp(url: string | null | undefined): boolean {
  if (!url) return false;
  window.location.assign(url);
  return true;
}
