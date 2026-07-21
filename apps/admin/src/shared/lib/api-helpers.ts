/**
 * Shared API helpers for the admin app.
 *
 * `parseOrThrow` was previously copy-pasted in 6 feature api.ts files.
 * `uploadImage` was previously copy-pasted in 3 feature api.ts files.
 */

/**
 * Parse a fetch Response as JSON or throw a descriptive error.
 * Use this in every client-side API call to get consistent error handling.
 */
export async function parseOrThrow<T>(
  res: Response,
  fallbackMessage: string
): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? fallbackMessage);
  }
  return res.json();
}

/**
 * Upload a file (image/avatar) to the `/api/upload` endpoint.
 * Returns the URL of the uploaded file.
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await parseOrThrow<{ url: string }>(
    res,
    "Failed to upload image"
  );
  return data.url;
}
