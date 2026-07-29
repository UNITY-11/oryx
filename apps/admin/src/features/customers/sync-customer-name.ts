import { sanityClient } from "@/shared/lib/sanity/client";

function digitsOnly(value: string | null | undefined): string {
  return String(value || "").replace(/\D/g, "");
}

/** Match phones allowing country-code / formatting differences. */
function phonesMatch(
  a: string | null | undefined,
  b: string | null | undefined
): boolean {
  const da = digitsOnly(a);
  const db = digitsOnly(b);
  if (!da || !db) return false;
  if (da === db) return true;
  if (da.endsWith(db) || db.endsWith(da)) return true;
  if (da.length >= 8 && db.length >= 8) {
    return da.slice(-8) === db.slice(-8);
  }
  return false;
}

function replaceName(
  text: string | null | undefined,
  from: string,
  to: string
) {
  if (!text || !from || from === to) return text ?? undefined;
  if (!text.includes(from)) return text;
  return text.split(from).join(to);
}

/**
 * Sync renamed customer across bookings + notifications.
 * Notifications are matched by phone number.
 */
export async function syncCustomerNameEverywhere(opts: {
  customerId: string;
  oldName: string;
  newName: string;
  phone?: string | null;
}): Promise<{ bookingsUpdated: number; notificationsUpdated: number }> {
  const customerId = opts.customerId;
  const customerPhone = (opts.phone || "").trim();
  const previousName = (opts.oldName || "").trim();
  const nextName = (opts.newName || "").trim();

  if (!nextName || nextName === previousName) {
    return { bookingsUpdated: 0, notificationsUpdated: 0 };
  }

  let bookingsUpdated = 0;
  let notificationsUpdated = 0;

  // --- Bookings ---
  const bookings = await sanityClient.fetch<
    {
      _id: string;
      phone?: string;
      customerName?: string;
      customerId?: string | null;
    }[]
  >(`*[_type == "booking"]{ _id, phone, customerName, customerId }`);

  for (const b of bookings) {
    const matched =
      phonesMatch(b.phone, customerPhone) ||
      (Boolean(b.customerId) && b.customerId === customerId) ||
      (Boolean(previousName) && b.customerName === previousName);

    if (!matched) continue;

    await sanityClient
      .patch(b._id)
      .set({
        customerId,
        customerName: nextName,
      })
      .commit();
    bookingsUpdated += 1;
  }

  // --- Notifications: find by phone on bookingData ---
  const notifications = await sanityClient.fetch<
    {
      _id: string;
      title?: string;
      message?: string;
      bookingData?: Record<string, unknown> | null;
    }[]
  >(
    `*[_type == "notification" && defined(bookingData)]{
      _id,
      title,
      message,
      bookingData
    }`
  );

  for (const n of notifications) {
    const bd = n.bookingData;
    if (!bd || typeof bd !== "object") continue;

    const notifPhone =
      (typeof bd.customerPhone === "string" && bd.customerPhone) ||
      (typeof bd.phone === "string" && bd.phone) ||
      "";

    // Primary rule: same phone number
    if (!customerPhone || !phonesMatch(notifPhone, customerPhone)) {
      continue;
    }

    const nextTitle = replaceName(n.title, previousName, nextName);
    const nextMessage = replaceName(n.message, previousName, nextName);

    // Write full bookingData object (confirm/decline uses this pattern successfully)
    const nextBookingData: Record<string, unknown> = {
      ...bd,
      customerId,
      customerName: nextName,
      customerPhone: customerPhone || notifPhone,
    };

    const patch: Record<string, unknown> = {
      bookingData: nextBookingData,
    };
    if (typeof nextTitle === "string" && nextTitle !== n.title) {
      patch.title = nextTitle;
    }
    if (typeof nextMessage === "string" && nextMessage !== n.message) {
      patch.message = nextMessage;
    }

    await sanityClient.patch(n._id).set(patch).commit();
    notificationsUpdated += 1;
  }

  return { bookingsUpdated, notificationsUpdated };
}
