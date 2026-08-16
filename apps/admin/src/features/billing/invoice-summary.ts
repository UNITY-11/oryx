import type { Booking } from "../bookings/types";
import type { Service } from "../services/types";
import { getInvoiceTotal, type InvoiceLineItem } from "./invoice-lines";

export type InvoiceSummary = {
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  hasDiscount: boolean;
  membershipId?: string;
};

export function computeMembershipDiscount(
  subtotal: number,
  discountPercent: number
): { discountAmount: number; total: number } {
  const pct = Math.min(100, Math.max(0, discountPercent));
  const discountAmount = Math.round(((subtotal * pct) / 100) * 100) / 100;
  const total = Math.round((subtotal - discountAmount) * 100) / 100;
  return { discountAmount, total };
}

export function getInvoiceSummary(
  booking: Booking,
  catalog: Service[]
): InvoiceSummary {
  const subtotal = getInvoiceTotal(booking, catalog);
  const membershipId = booking.membershipId?.trim() || "";
  const discountPercent = booking.discountPercent ?? 0;
  const hasDiscount = Boolean(membershipId) && discountPercent > 0;

  if (!hasDiscount) {
    return {
      subtotal,
      discountPercent: 0,
      discountAmount: 0,
      total: subtotal || booking.amount || 0,
      hasDiscount: false,
    };
  }

  const { discountAmount, total } = computeMembershipDiscount(
    subtotal,
    discountPercent
  );

  return {
    subtotal,
    discountPercent,
    discountAmount,
    total,
    hasDiscount: true,
    membershipId,
  };
}

export function applyMembershipDiscountToBooking(
  booking: Booking,
  catalog: Service[],
  membershipId: string,
  companyDiscountPercent: number
): Booking {
  const trimmedId = membershipId.trim();
  const subtotal = getInvoiceTotal(booking, catalog);

  if (!trimmedId) {
    return {
      ...booking,
      membershipId: "",
      discountPercent: 0,
      discountAmount: 0,
      subtotal: 0,
      amount: subtotal,
    };
  }

  const percent = Math.min(100, Math.max(0, companyDiscountPercent));
  const { discountAmount, total } = computeMembershipDiscount(
    subtotal,
    percent
  );

  return {
    ...booking,
    membershipId: trimmedId,
    discountPercent: percent,
    discountAmount,
    subtotal,
    amount: total,
  };
}

export type { InvoiceLineItem };
