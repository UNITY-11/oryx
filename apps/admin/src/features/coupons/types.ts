export interface Coupon {
  id: string;
  title: string;
  type: string;
  code: string;
  icon: string;
  createdAt: string;
}

export type CouponInput = Omit<Coupon, "id" | "createdAt">;
