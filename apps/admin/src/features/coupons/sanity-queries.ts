import { COUPON_PROJECTION } from "@repo/sanity";

export const GET_ALL_COUPONS_QUERY = `
  *[_type == "coupon"] | order(_createdAt desc) ${COUPON_PROJECTION}
`;

export const GET_COUPON_BY_ID_QUERY = `
  *[_type == "coupon" && _id == $id][0] ${COUPON_PROJECTION}
`;

export type CouponsListQueryInput = {
  q?: string;
  start: number;
  end: number;
};

function buildCouponsFilterClause(): string {
  return `_type == "coupon"
    && (
      !defined($q) || $q == "" ||
      title match $pattern ||
      code match $pattern ||
      type match $pattern
    )`;
}

export function buildCouponsListQueries(input: CouponsListQueryInput) {
  const filter = buildCouponsFilterClause();
  const listQuery = `*[${filter}] | order(_createdAt desc) [${input.start}...${input.end}] ${COUPON_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;

  return { listQuery, countQuery };
}
