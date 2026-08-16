import { validateCustomerInput, validateCustomerName } from "./customer";
import { isValidPhone, normalizePhone, validatePhoneValue } from "./phone";

export type BookingServiceInput = {
  name: string;
  options?: string[];
};

export type CatalogService = {
  name: string;
  options?: Array<{ name: string }> | null;
};

export type BookingCreateInput = {
  customerName: string;
  phone: string;
  services?: BookingServiceInput[];
  date?: string;
  time?: string;
  amount?: number;
  status?: string;
  membershipId?: string;
  discountPercent?: number;
  discountAmount?: number;
};

export type BookingValidationOptions = {
  /** Reject dates before today (customer-facing bookings). */
  rejectPastDates?: boolean;
  catalog?: CatalogService[];
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

function todayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseTimeTo24Hour(time: string): string | null {
  const trimmed = time.trim();
  const match24 = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (match24) {
    const hours = match24[1] ?? "00";
    const minutes = match24[2] ?? "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  }

  const match12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(trimmed);
  if (match12) {
    let hours = parseInt(match12[1] ?? "0", 10);
    const minutes = match12[2] ?? "00";
    const period = (match12[3] ?? "AM").toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    if (hours < 0 || hours > 23) return null;
    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  return null;
}

export function getServicesMissingOptionsFromCatalog(
  services: BookingServiceInput[],
  catalog: CatalogService[]
): string[] {
  return services
    .filter((svc) => {
      const catalogService = catalog.find((c) => c.name === svc.name);
      const available = catalogService?.options ?? [];
      return available.length > 0 && (svc.options ?? []).length === 0;
    })
    .map((svc) => svc.name);
}

export function validateBookingCreateInput(
  body: BookingCreateInput,
  opts?: BookingValidationOptions
): { error: string } | { ok: true; data: BookingCreateInput } {
  const customerError = validateCustomerInput({
    name: body.customerName ?? "",
    phone: body.phone ?? "",
  });
  if (customerError) return { error: customerError };

  const services: BookingServiceInput[] = Array.isArray(body.services)
    ? body.services
    : [];
  if (services.length === 0) {
    return { error: "At least one service is required" };
  }

  for (const svc of services) {
    if (!svc.name || typeof svc.name !== "string" || !svc.name.trim()) {
      return { error: "Each service must have a name" };
    }
    if (svc.options !== undefined && !Array.isArray(svc.options)) {
      return { error: "Service options must be an array" };
    }
  }

  if (opts?.catalog) {
    const missing = getServicesMissingOptionsFromCatalog(
      services,
      opts.catalog
    );
    if (missing.length > 0) {
      return {
        error: `Select service options for: ${missing.join(", ")}`,
      };
    }
  }

  const date = body.date?.trim() || todayIsoDate();
  if (!DATE_RE.test(date)) {
    return { error: "Enter a valid booking date" };
  }
  const parsedDate = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return { error: "Enter a valid booking date" };
  }
  if (opts?.rejectPastDates && date < todayIsoDate()) {
    return { error: "Booking date cannot be in the past" };
  }

  const rawTime = body.time?.trim() || "10:00";
  const time = parseTimeTo24Hour(rawTime);
  if (!time) {
    return { error: "Enter a valid booking time" };
  }

  const amount = body.amount ?? 0;
  if (typeof amount !== "number" || Number.isNaN(amount) || amount < 0) {
    return { error: "Amount must be 0 or greater" };
  }

  if (body.discountPercent !== undefined) {
    const pct = body.discountPercent;
    if (typeof pct !== "number" || Number.isNaN(pct) || pct < 0 || pct > 100) {
      return { error: "Discount percent must be between 0 and 100" };
    }
  }

  if (body.discountAmount !== undefined) {
    const amt = body.discountAmount;
    if (typeof amt !== "number" || Number.isNaN(amt) || amt < 0) {
      return { error: "Discount amount must be 0 or greater" };
    }
  }

  return {
    ok: true,
    data: {
      ...body,
      customerName: body.customerName.trim(),
      phone: normalizePhone(body.phone),
      services: services.map((svc) => ({
        name: svc.name.trim(),
        options: (svc.options ?? [])
          .map((o) => String(o).trim())
          .filter(Boolean),
      })),
      date,
      time,
      amount,
    },
  };
}

export function validateBookingPatchFields(
  fields: Partial<BookingCreateInput>,
  opts?: BookingValidationOptions
): string | null {
  if (fields.customerName !== undefined) {
    const err = validateCustomerName(fields.customerName);
    if (err) return err;
  }

  if (fields.phone !== undefined) {
    const err = validatePhoneValue(fields.phone, {
      required: true,
      label: "phone number",
    });
    if (err) return err;
  }

  if (fields.services !== undefined) {
    if (!Array.isArray(fields.services) || fields.services.length === 0) {
      return "At least one service is required";
    }
    for (const svc of fields.services) {
      if (!svc.name?.trim()) return "Each service must have a name";
    }
    if (opts?.catalog) {
      const missing = getServicesMissingOptionsFromCatalog(
        fields.services,
        opts.catalog
      );
      if (missing.length > 0) {
        return `Select service options for: ${missing.join(", ")}`;
      }
    }
  }

  if (fields.date !== undefined) {
    const date = fields.date.trim();
    if (!DATE_RE.test(date)) return "Enter a valid booking date";
    if (opts?.rejectPastDates && date < todayIsoDate()) {
      return "Booking date cannot be in the past";
    }
  }

  if (fields.time !== undefined) {
    if (!parseTimeTo24Hour(fields.time)) return "Enter a valid booking time";
  }

  if (fields.amount !== undefined) {
    if (
      typeof fields.amount !== "number" ||
      Number.isNaN(fields.amount) ||
      fields.amount < 0
    ) {
      return "Amount must be 0 or greater";
    }
  }

  if (fields.discountPercent !== undefined) {
    const pct = fields.discountPercent;
    if (typeof pct !== "number" || Number.isNaN(pct) || pct < 0 || pct > 100) {
      return "Discount percent must be between 0 and 100";
    }
  }

  if (fields.discountAmount !== undefined) {
    const amt = fields.discountAmount;
    if (typeof amt !== "number" || Number.isNaN(amt) || amt < 0) {
      return "Discount amount must be 0 or greater";
    }
  }

  if (fields.membershipId !== undefined && fields.membershipId !== null) {
    if (typeof fields.membershipId !== "string") {
      return "Membership ID must be a string";
    }
  }

  return null;
}

/** Client-side helpers aligned with shared rules */
export function isBookingCustomerDetailsValid(
  name: string,
  phone: string
): boolean {
  return validateCustomerName(name) === "" && isValidPhone(phone);
}
