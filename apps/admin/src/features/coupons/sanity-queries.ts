import { COUPON_PROJECTION } from "@repo/sanity";

export const GET_ALL_COUPONS_QUERY = `
  *[_type == "coupon"] | order(_createdAt desc) ${COUPON_PROJECTION}
`;

export const GET_COUPON_BY_ID_QUERY = `
  *[_type == "coupon" && _id == $id][0] ${COUPON_PROJECTION}
`;
