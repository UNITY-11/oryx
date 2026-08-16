import type { Booking } from "../bookings/types";
import type { Service } from "../services/types";

export type InvoiceLineItem = {
  name: string;
  base: number;
  options: { name: string; price: number }[];
};

export function getServiceLineItems(
  booking: Booking,
  catalog: Service[]
): InvoiceLineItem[] {
  return booking.services.map((svc) => {
    const catalogService = catalog.find((item) => item.name === svc.name);
    const optionItems = (svc.options || []).map((optionName) => {
      const matched = (catalogService?.options || []).find(
        (opt) => opt.name === optionName
      );
      return { name: optionName, price: matched?.price || 0 };
    });
    return { name: svc.name, base: 0, options: optionItems };
  });
}

export function getInvoiceTotal(booking: Booking, catalog: Service[]): number {
  return getServiceLineItems(booking, catalog).reduce(
    (sum, line) =>
      sum + line.options.reduce((optSum, opt) => optSum + opt.price, 0),
    0
  );
}
