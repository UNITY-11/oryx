import type {
  BookingWhatsAppPayload,
  CompanyWhatsAppContext,
  InvoiceLineItem,
  InvoiceSummaryPayload,
} from "./types";

function displayBookingRef(booking: BookingWhatsAppPayload): string {
  return booking.bookingCode ?? booking.id;
}

function formatFriendlyDate(isoDate: string): string {
  const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match?.[1] || !match[2] || !match[3]) return isoDate;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFriendlyTime(time: string): string {
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match24?.[1] && match24[2]) {
    let hours = Number(match24[1]);
    const minutes = match24[2];
    const period = hours >= 12 ? "PM" : "AM";
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return `${hours}:${minutes} ${period}`;
  }

  const match12 = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12?.[1] && match12[2] && match12[3]) {
    return `${Number(match12[1])}:${match12[2]} ${match12[3].toUpperCase()}`;
  }

  return time;
}

/** Strip bullets/dots/icons that sometimes leak into catalog names. */
function cleanLabel(value: string): string {
  return value
    .replace(/^[\s.•·‣▪◦●○★☆✦✧*‧∙\-–—]+/u, "")
    .replace(/[\s.•·‣▪◦●○★☆✦✧*‧∙\-–—]+$/u, "")
    .replace(/\s*[.•·‣▪◦●○‧∙]\s*/gu, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Numbered services with dashed options, e.g. "1- Eyebrow Services\n- Eyebrow shaping". */
function formatServicesBlock(
  services: BookingWhatsAppPayload["services"]
): string {
  if (!services.length) return "None";

  return services
    .map((service, index) => {
      const name = cleanLabel(service.name) || service.name.trim();
      const options = (service.options ?? [])
        .map((opt) => cleanLabel(opt) || opt.trim())
        .filter(Boolean);
      const header = `${index + 1}- ${name}`;
      if (options.length === 0) return header;
      const optionLines = options.map((opt) => `- ${opt}`).join("\n");
      return `${header}\n${optionLines}`;
    })
    .join("\n");
}

function formatPricedServicesBlock(lineItems: InvoiceLineItem[]): string {
  if (!lineItems.length) return "None";

  return lineItems
    .map((line, index) => {
      const name = cleanLabel(line.name) || line.name.trim();
      const header = `${index + 1}- ${name}`;
      if (line.options.length === 0) return header;
      const optionLines = line.options
        .map((opt) => {
          const optName = cleanLabel(opt.name) || opt.name.trim();
          return `- ${optName}: QAR ${opt.price}`;
        })
        .join("\n");
      return `${header}\n${optionLines}`;
    })
    .join("\n\n");
}

function formatAmountFooter(
  summary: InvoiceSummaryPayload,
  label = "Total"
): string {
  if (!summary.hasDiscount) {
    return `${label}: QAR ${summary.total}`;
  }
  return (
    `Subtotal: QAR ${summary.subtotal}\n` +
    `Gym discount (${summary.discountPercent}%): −QAR ${summary.discountAmount}\n` +
    `Membership ID: ${summary.membershipId ?? "—"}\n` +
    `${label}: QAR ${summary.total}`
  );
}

export function buildInvoiceSummaryPayload(
  booking: BookingWhatsAppPayload,
  catalogSubtotal: number
): InvoiceSummaryPayload {
  const membershipId = booking.membershipId?.trim() || "";
  const discountPercent = booking.discountPercent ?? 0;
  const hasDiscount = Boolean(membershipId) && discountPercent > 0;

  if (!hasDiscount) {
    return {
      subtotal: catalogSubtotal,
      discountPercent: 0,
      discountAmount: 0,
      total: catalogSubtotal || booking.amount || 0,
      hasDiscount: false,
    };
  }

  const discountAmount =
    booking.discountAmount ??
    Math.round(((catalogSubtotal * discountPercent) / 100) * 100) / 100;
  const total =
    booking.amount ??
    Math.round((catalogSubtotal - discountAmount) * 100) / 100;

  return {
    subtotal: booking.subtotal ?? catalogSubtotal,
    discountPercent,
    discountAmount,
    total,
    hasDiscount: true,
    membershipId,
  };
}

export function formatAdminNewBookingMessage(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  summary?: InvoiceSummaryPayload
): string {
  const brand = company?.name?.trim() || "Oryx Spa";
  const servicesText = formatServicesBlock(booking.services);
  const amountBlock = summary
    ? formatAmountFooter(summary, "Amount")
    : `Amount: QAR ${booking.amount}`;

  return (
    `🌿 New Booking — ${brand}\n\n` +
    `Ref: ${displayBookingRef(booking)}\n` +
    `Customer: ${booking.customerName}\n` +
    `Phone: ${booking.phone}\n\n` +
    `Services:\n${servicesText}\n\n` +
    `Date: ${booking.date}\n` +
    `Time: ${booking.time}\n` +
    `${amountBlock}\n` +
    `Status: ${booking.status ?? "Pending"}`
  );
}

/** Customer → business WhatsApp message after web booking (first-person request). */
export function formatCustomerBookingRequestMessage(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext
): string {
  const brand = company?.name?.trim() || "Oryx Spa";
  const servicesText = formatServicesBlock(booking.services);
  const firstName =
    booking.customerName.trim().split(/\s+/)[0] || booking.customerName;

  return (
    `Hello! 👋\n\n` +
    `This is ${firstName}. I would like to book an appointment at ${brand}.\n\n` +
    `My name: ${booking.customerName}\n` +
    `My WhatsApp: ${booking.phone}\n\n` +
    `Services:\n${servicesText}\n\n` +
    `Date: ${booking.date}\n` +
    `Time: ${booking.time}\n` +
    `Estimated total: QAR ${booking.amount}\n\n` +
    `Booking reference: ${displayBookingRef(booking)}\n\n` +
    `Please confirm my slot. Thank you! 🌸`
  );
}

export function formatCustomerConfirmationMessage(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  summary?: InvoiceSummaryPayload
): string {
  const brand = company?.name?.trim() || "ORYX Beauty Spa & Salon";
  const firstName =
    booking.customerName.trim().split(/\s+/)[0] || booking.customerName;
  const serviceLines = formatServicesBlock(booking.services);
  const total = summary?.total ?? booking.amount;

  return (
    `APPOINTMENT CONFIRMED\n\n` +
    `Hello ${firstName},\n\n` +
    `Your appointment at ${brand} is confirmed.\n\n` +
    `${serviceLines}\n` +
    `Date: ${formatFriendlyDate(booking.date)}\n` +
    `Time: ${formatFriendlyTime(booking.time)}\n` +
    `Total: QAR ${total}\n` +
    `Reference: ${displayBookingRef(booking)}\n\n` +
    `We look forward to welcoming you.\n\n` +
    `Your beauty. Your ORYX experience.`
  );
}

export function formatInvoiceMessage(
  booking: BookingWhatsAppPayload,
  lineItems: InvoiceLineItem[],
  summary: InvoiceSummaryPayload,
  company?: CompanyWhatsAppContext
): string {
  const brand = company?.name?.trim() || "Oryx Spa";
  const servicesText = formatPricedServicesBlock(lineItems);
  const firstName =
    booking.customerName.trim().split(/\s+/)[0] || booking.customerName;

  return (
    `Hello ${firstName},\n\n` +
    `Here is your invoice from ${brand}. 🌿\n\n` +
    `Invoice #: ${displayBookingRef(booking)}\n` +
    `Date: ${booking.date}  |  Time: ${booking.time}\n` +
    `Client: ${booking.customerName}\n\n` +
    `Services:\n${servicesText}\n\n` +
    `${formatAmountFooter(summary, "Total")}\n\n` +
    `Thank you for choosing ${brand}! We look forward to seeing you again. 🌸`
  );
}
