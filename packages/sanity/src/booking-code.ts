import type { SanityClient } from "@sanity/client";

const PREFIX = "oryx";
const CODE_RE = /^oryx(\d+)$/i;

function parseBookingNumber(code: string): number | null {
  const match = CODE_RE.exec(code.trim());
  if (!match?.[1]) return null;
  const n = parseInt(match[1], 10);
  return Number.isFinite(n) ? n : null;
}

/** Next human-readable booking code, e.g. oryx0001, oryx1234 */
export async function generateNextBookingCode(
  client: SanityClient
): Promise<string> {
  const codes = await client.fetch<string[]>(
    `*[_type == "booking" && defined(bookingCode)].bookingCode`
  );

  let max = 0;
  for (const raw of codes ?? []) {
    const n = parseBookingNumber(String(raw));
    if (n !== null) max = Math.max(max, n);
  }

  let candidate = max + 1;
  for (let attempt = 0; attempt < 10; attempt++) {
    const bookingCode = `${PREFIX}${String(candidate).padStart(4, "0")}`;
    const exists = await client.fetch<boolean>(
      `count(*[_type == "booking" && bookingCode == $code]) > 0`,
      { code: bookingCode }
    );
    if (!exists) return bookingCode;
    candidate++;
  }

  throw new Error("Failed to generate unique booking code");
}
