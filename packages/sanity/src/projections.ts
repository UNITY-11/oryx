/**
 * Shared GROQ projections for Sanity document types.
 *
 * These are the canonical field projections used across both the web
 * (customer-facing) and admin apps. Each app may compose its own queries
 * using these projections as building blocks.
 */

export const SERVICE_PROJECTION = `{
  "id": _id,
  name,
  category,
  status,
  description,
  shortDescription,
  image,
  pricingTiers,
  options,
  preparationTime,
  cleanupTime,
  maxCapacity,
  tags,
  createdAt
}`;

export const PRODUCT_PROJECTION = `{
  "id": _id,
  name,
  brand,
  volumeOrWeight,
  quantity,
  price,
  category,
  image,
  status
}`;

export const HERO_PROJECTION = `{
  "id": _id,
  type,
  src,
  title,
  order,
  createdAt
}`;

export const COUPON_PROJECTION = `{
  "id": _id,
  title,
  type,
  code,
  icon,
  createdAt
}`;

export const REVIEW_PROJECTION = `{
  "id": _id,
  name,
  text,
  rating,
  status,
  initials,
  avatar,
  createdAt
}`;
