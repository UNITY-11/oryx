export type InvoiceLineItem = {
  name: string;
  options: { name: string; price: number }[];
};

export type BookingServiceLine = {
  name: string;
  options?: string[];
};

export type BookingWhatsAppPayload = {
  id: string;
  bookingCode?: string;
  customerName: string;
  phone: string;
  services: BookingServiceLine[];
  date: string;
  time: string;
  amount: number;
  status?: string;
  membershipId?: string;
  discountPercent?: number;
  discountAmount?: number;
  subtotal?: number;
};

export type InvoiceSummaryPayload = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  hasDiscount: boolean;
  membershipId?: string;
};

export type CompanyWhatsAppContext = {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  country?: string;
};

export type WhatsAppSendResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
  messageId?: string;
};
