import { sendWhatsAppDocument, sendWhatsAppTemplateMessage } from "./client";
import { getWhatsAppConfig } from "./config";
import {
  buildInvoiceSummaryPayload,
  formatAdminNewBookingMessage,
  formatCustomerConfirmationMessage,
  formatInvoiceMessage,
} from "./messages";
import { generateBookingConfirmationPdf, generateInvoicePdf } from "./pdf";
import { normalizeWhatsAppRecipient } from "./phone";
import type {
  BookingWhatsAppPayload,
  CompanyWhatsAppContext,
  InvoiceLineItem,
  InvoiceSummaryPayload,
  WhatsAppSendResult,
} from "./types";

function resolveAdminRecipient(
  company?: CompanyWhatsAppContext
): string | null {
  const fromCompany = company?.whatsapp?.trim();
  if (fromCompany) return normalizeWhatsAppRecipient(fromCompany);

  const fallback = process.env.ADMIN_WHATSAPP_FALLBACK?.trim();
  return fallback ? normalizeWhatsAppRecipient(fallback) : null;
}

export async function sendAdminNewBookingAlert(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  catalogSubtotal?: number
): Promise<WhatsAppSendResult> {
  const config = getWhatsAppConfig();
  if (!config) {
    console.info("[whatsapp] Admin alert skipped — API not configured");
    return { ok: false, skipped: true };
  }

  const adminPhone = resolveAdminRecipient(company);
  if (!adminPhone) {
    console.warn("[whatsapp] Admin alert skipped — no admin WhatsApp number");
    return {
      ok: false,
      error: "Admin WhatsApp number not configured in company settings",
    };
  }

  const summary =
    catalogSubtotal !== undefined
      ? buildInvoiceSummaryPayload(booking, catalogSubtotal)
      : undefined;
  const message = formatAdminNewBookingMessage(booking, company, summary);
  return sendWhatsAppTemplateMessage(
    adminPhone,
    config.templateNewBooking,
    message
  );
}

export async function sendCustomerBookingConfirmed(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  catalogSubtotal?: number
): Promise<{
  text: WhatsAppSendResult;
  document: WhatsAppSendResult;
}> {
  const config = getWhatsAppConfig();
  if (!config) {
    console.info(
      "[whatsapp] Customer confirmation skipped — API not configured"
    );
    return {
      text: { ok: false, skipped: true },
      document: { ok: false, skipped: true },
    };
  }

  const customerPhone = normalizeWhatsAppRecipient(booking.phone);
  if (!customerPhone) {
    return {
      text: { ok: false, error: "Customer phone missing" },
      document: { ok: false, error: "Customer phone missing" },
    };
  }

  const confirmedBooking: BookingWhatsAppPayload = {
    ...booking,
    status: "Confirmed",
  };

  const summary =
    catalogSubtotal !== undefined
      ? buildInvoiceSummaryPayload(confirmedBooking, catalogSubtotal)
      : buildInvoiceSummaryPayload(confirmedBooking, booking.amount);

  const message = formatCustomerConfirmationMessage(
    confirmedBooking,
    company,
    summary
  );
  const textResult = await sendWhatsAppTemplateMessage(
    customerPhone,
    config.templateBookingConfirmed,
    message
  );

  let documentResult: WhatsAppSendResult = { ok: false, skipped: true };
  try {
    const pdf = await generateBookingConfirmationPdf(
      confirmedBooking,
      company,
      summary
    );
    const ref = booking.bookingCode ?? booking.id;
    documentResult = await sendWhatsAppDocument(
      customerPhone,
      pdf,
      `booking-${ref}.pdf`,
      `Booking confirmation — ${ref}`
    );
  } catch (error) {
    documentResult = {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to generate/send PDF",
    };
    console.error("[whatsapp] PDF confirmation failed:", documentResult.error);
  }

  return { text: textResult, document: documentResult };
}

export async function sendCustomerInvoiceWhatsApp(
  booking: BookingWhatsAppPayload,
  lineItems: InvoiceLineItem[],
  summary: InvoiceSummaryPayload,
  company?: CompanyWhatsAppContext
): Promise<{
  text: WhatsAppSendResult;
  document: WhatsAppSendResult;
}> {
  const config = getWhatsAppConfig();
  if (!config) {
    console.info("[whatsapp] Invoice send skipped — API not configured");
    return {
      text: { ok: false, skipped: true },
      document: { ok: false, skipped: true },
    };
  }

  const customerPhone = normalizeWhatsAppRecipient(booking.phone);
  if (!customerPhone) {
    return {
      text: { ok: false, error: "Customer phone missing" },
      document: { ok: false, error: "Customer phone missing" },
    };
  }

  const message = formatInvoiceMessage(booking, lineItems, summary, company);
  const textResult = await sendWhatsAppTemplateMessage(
    customerPhone,
    config.templateInvoice,
    message
  );

  let documentResult: WhatsAppSendResult = { ok: false, skipped: true };
  try {
    const pdf = await generateInvoicePdf(booking, lineItems, summary, company);
    const ref = booking.bookingCode ?? booking.id;
    documentResult = await sendWhatsAppDocument(
      customerPhone,
      pdf,
      `invoice-${ref}.pdf`,
      `Invoice ${ref} — QAR ${summary.total}`
    );
  } catch (error) {
    documentResult = {
      ok: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to generate/send invoice PDF",
    };
    console.error("[whatsapp] Invoice PDF send failed:", documentResult.error);
  }

  return { text: textResult, document: documentResult };
}
