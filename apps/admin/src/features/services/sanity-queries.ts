export const SERVICE_PROJECTION = `{
  "id": _id,
  name,
  category,
  status,
  description,
  shortDescription,
  image,
  pricingTiers,
  addons,
  preparationTime,
  cleanupTime,
  maxCapacity,
  tags,
  createdAt
}`;

export const SERVICES_LIST_QUERY = `*[_type == "service"] | order(createdAt desc) ${SERVICE_PROJECTION}`;

export const SERVICE_BY_ID_QUERY = `*[_type == "service" && _id == $id][0] ${SERVICE_PROJECTION}`;
