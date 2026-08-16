export type WhatsAppConfig = {
  enabled: boolean;
  token: string;
  phoneNumberId: string;
  apiVersion: string;
  templateLanguage: string;
  templateNewBooking: string;
  templateBookingConfirmed: string;
  templateInvoice: string;
};

export function getWhatsAppConfig(): WhatsAppConfig | null {
  const token = process.env.WHATSAPP_API_TOKEN?.trim() ?? "";
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const explicitlyDisabled = process.env.WHATSAPP_ENABLED === "false";

  if (explicitlyDisabled || !token || !phoneNumberId) {
    return null;
  }

  return {
    enabled: true,
    token,
    phoneNumberId,
    apiVersion: process.env.WHATSAPP_API_VERSION?.trim() || "v21.0",
    templateLanguage: process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en",
    templateNewBooking:
      process.env.WHATSAPP_TEMPLATE_NEW_BOOKING?.trim() || "new_booking_alert",
    templateBookingConfirmed:
      process.env.WHATSAPP_TEMPLATE_BOOKING_CONFIRMED?.trim() ||
      "booking_confirmed",
    templateInvoice:
      process.env.WHATSAPP_TEMPLATE_INVOICE?.trim() || "invoice_message",
  };
}
