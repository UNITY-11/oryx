import PDFDocument from "pdfkit";

import type {
  BookingWhatsAppPayload,
  CompanyWhatsAppContext,
  InvoiceLineItem,
  InvoiceSummaryPayload,
} from "./types";

function displayBookingRef(booking: BookingWhatsAppPayload): string {
  return booking.bookingCode ?? booking.id;
}

function writePricingFooter(
  doc: InstanceType<typeof PDFDocument>,
  summary: InvoiceSummaryPayload
) {
  doc.moveDown(1);
  doc.fontSize(11).fillColor("#333333");
  if (summary.hasDiscount) {
    doc.text(`Subtotal: QAR ${summary.subtotal}`, { align: "right" });
    doc.text(
      `Gym discount (${summary.discountPercent}%): −QAR ${summary.discountAmount}`,
      { align: "right" }
    );
    if (summary.membershipId) {
      doc.text(`Membership ID: ${summary.membershipId}`, { align: "right" });
    }
  }
  doc
    .fontSize(14)
    .fillColor("#8B5A3C")
    .text(`Total: QAR ${summary.total}`, { align: "right" });
}

export async function generateBookingConfirmationPdf(
  booking: BookingWhatsAppPayload,
  company?: CompanyWhatsAppContext,
  summary?: InvoiceSummaryPayload
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfBuffer = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const brand = company?.name?.trim() || "Oryx Beauty Spa";
  const address = [company?.addressLine1, company?.city, company?.country]
    .filter(Boolean)
    .join(", ");

  doc.fontSize(22).fillColor("#8B5A3C").text(brand, { align: "center" });
  doc.moveDown(0.3);
  doc
    .fontSize(12)
    .fillColor("#666666")
    .text("Booking Confirmation", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(11).fillColor("#333333");
  doc.text(`Reference: ${displayBookingRef(booking)}`);
  doc.text(`Status: ${booking.status ?? "Confirmed"}`);
  doc.text(`Date: ${booking.date}`);
  doc.text(`Time: ${booking.time}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor("#8B5A3C").text("Customer Details");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#333333");
  doc.text(`Name: ${booking.customerName}`);
  doc.text(`Phone: ${booking.phone}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor("#8B5A3C").text("Services");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#333333");

  if (booking.services.length === 0) {
    doc.text("—");
  } else {
    for (const service of booking.services) {
      doc.text(`• ${service.name}`);
      const options = (service.options ?? []).filter(Boolean);
      for (const option of options) {
        doc.text(`   - ${option}`, { indent: 12 });
      }
    }
  }

  doc.moveDown(1);
  const pricingSummary: InvoiceSummaryPayload = summary ?? {
    subtotal: booking.amount,
    discountPercent: 0,
    discountAmount: 0,
    total: booking.amount,
    hasDiscount: false,
  };
  writePricingFooter(doc, pricingSummary);

  if (address) {
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#666666").text(address, { align: "center" });
  }
  if (company?.phone?.trim()) {
    doc.text(`Phone: ${company.phone}`, { align: "center" });
  }
  if (company?.email?.trim()) {
    doc.text(company.email, { align: "center" });
  }

  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor("#999999")
    .text("Thank you for choosing us. We look forward to seeing you!", {
      align: "center",
    });

  doc.end();

  return pdfBuffer;
}

export async function generateInvoicePdf(
  booking: BookingWhatsAppPayload,
  lineItems: InvoiceLineItem[],
  summary: InvoiceSummaryPayload,
  company?: CompanyWhatsAppContext
): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfBuffer = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const brand = company?.name?.trim() || "Oryx Beauty Spa";
  const address = [company?.addressLine1, company?.city, company?.country]
    .filter(Boolean)
    .join(", ");

  doc.fontSize(22).fillColor("#8B5A3C").text(brand, { align: "center" });
  doc.moveDown(0.3);
  doc.fontSize(12).fillColor("#666666").text("Invoice", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(11).fillColor("#333333");
  doc.text(`Invoice #: ${displayBookingRef(booking)}`);
  doc.text(`Date: ${booking.date}`);
  doc.text(`Time: ${booking.time}`);
  if (booking.status) doc.text(`Status: ${booking.status}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor("#8B5A3C").text("Bill To");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#333333");
  doc.text(`Name: ${booking.customerName}`);
  doc.text(`Phone: ${booking.phone}`);
  doc.moveDown(1);

  doc.fontSize(13).fillColor("#8B5A3C").text("Services");
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor("#333333");

  if (lineItems.length === 0) {
    doc.text("—");
  } else {
    for (const line of lineItems) {
      doc.text(line.name, { continued: false });
      if (line.options.length === 0) {
        doc.moveDown(0.3);
        continue;
      }
      for (const option of line.options) {
        doc.text(`   - ${option.name} — QAR ${option.price}`, { indent: 12 });
      }
      doc.moveDown(0.3);
    }
  }

  doc.moveDown(0.5);
  writePricingFooter(doc, summary);

  if (address) {
    doc.moveDown(2);
    doc.fontSize(10).fillColor("#666666").text(address, { align: "center" });
  }
  if (company?.phone?.trim()) {
    doc.text(`Phone: ${company.phone}`, { align: "center" });
  }
  if (company?.email?.trim()) {
    doc.text(company.email, { align: "center" });
  }

  doc.moveDown(2);
  doc
    .fontSize(10)
    .fillColor("#999999")
    .text("Thank you for your visit. We look forward to seeing you again!", {
      align: "center",
    });

  doc.end();

  return pdfBuffer;
}
