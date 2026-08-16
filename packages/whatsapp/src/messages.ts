import type {
  BookingWhatsAppPayload,
  CompanyWhatsAppContext,
  InvoiceLineItem,
  InvoiceSummaryPayload,
} from "./types";

function displayBookingRef(booking: BookingWhatsAppPayload): string {
  return booking.bookingCode ?? booking.id;
}

function formatPricedServicesBlock(lineItems: InvoiceLineItem[]): string {
  if (!lineItems.length) return "—";

  return lineItems
    .map((line) => {
      if (line.options.length === 0) return `• ${line.name}`;
      const optionLines = line.options
        .map((opt) => `  - ${opt.name}: QAR ${opt.price}`)
        .join("\n");
      return `• ${line.name}\n${optionLines}`;
    })
    .join("\n\n");
}

function formatServicesBlock(
  services: BookingWhatsAppPayload["services"]
): string {
  if (!services.length) return "—";

  return services
    .map((service) => {
      const options = (service.options ?? []).filter(Boolean);
      if (options.length === 0) return `• ${service.name}`;
      const optionLines = options.map((opt) => `  - ${opt}`).join("\n");
      return `• ${service.name}\n${optionLines}`;
    })
    .join("\n");
}

function formatAmountFooter(
  summary: InvoiceSummaryPayload,
  label = "Total"
): string {
  if (!summary.hasDiscount) {
    return `*${label}: QAR ${summary.total}*`;
  }
  return (
    `*Subtotal:* QAR ${summary.subtotal}\n` +
    `*Gym discount (${summary.discountPercent}%):* −QAR ${summary.discountAmount}\n` +
    `*Membership ID:* ${summary.membershipId ?? "—"}\n` +
    `*${label}: QAR ${summary.total}*`
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
    : `*Amount:* QAR ${booking.amount}`;

  return (
    `🌿 *New Booking — ${brand}*\n\n` +
    `*Ref:* ${displayBookingRef(booking)}\n` +
    `*Customer:* ${booking.customerName}\n` +
    `*Phone:* ${booking.phone}\n\n` +
    `*Services:*\n${servicesText}\n\n` +
    `*Date:* ${booking.date}\n` +
    `*Time:* ${booking.time}\n` +
    `${amountBlock}\n` +
    `*Status:* ${booking.status ?? "Pending"}`
  );
}

export function formatCustomerConfirmationMessage(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  summary?: InvoiceSummaryPayload
): string {
  const brand = company?.name?.trim() || "Oryx Spa";
  const servicesText = formatServicesBlock(booking.services);
  const firstName =
    booking.customerName.trim().split(/\s+/)[0] || booking.customerName;
  const amountBlock = summary
    ? formatAmountFooter(summary, "Total")
    : `*Amount:* QAR ${booking.amount}`;

  return (
    `Hello ${firstName},\n\n` +
    `Your booking at *${brand}* has been *confirmed*! ✅\n\n` +
    `*Ref:* ${displayBookingRef(booking)}\n` +
    `*Services:*\n${servicesText}\n\n` +
    `*Date:* ${booking.date}\n` +
    `*Time:* ${booking.time}\n` +
    `${amountBlock}\n\n` +
    `We look forward to welcoming you.\n\n` +
    `A confirmation PDF is attached below.`
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
    `Here is your invoice from *${brand}*. 🌿\n\n` +
    `*Invoice #:* ${displayBookingRef(booking)}\n` +
    `*Date:* ${booking.date}  |  *Time:* ${booking.time}\n` +
    `*Client:* ${booking.customerName}\n\n` +
    `*Services:*\n${servicesText}\n\n` +
    `${formatAmountFooter(summary, "Total")}\n\n` +
    `Thank you for choosing ${brand}! We look forward to seeing you again. 🌸\n\n` +
    `Your invoice PDF is attached.`
  );
}
