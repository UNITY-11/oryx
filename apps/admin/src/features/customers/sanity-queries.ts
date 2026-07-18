export const CUSTOMER_PROJECTION = `{
  "id": _id,
  name,
  email,
  phone,
  avatar,
  tier,
  totalSpent,
  lastVisit,
  status,
  age
}`;

export const CUSTOMERS_LIST_QUERY = `*[_type == "customer"] | order(name asc) ${CUSTOMER_PROJECTION}`;

export const CUSTOMER_BY_ID_QUERY = `*[_type == "customer" && _id == $id][0] ${CUSTOMER_PROJECTION}`;
