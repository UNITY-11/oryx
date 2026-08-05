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

export type CustomersListQueryInput = {
  q?: string;
  phoneDigits?: string;
  tier?: string;
  start: number;
  end: number;
};

function buildCustomersFilterClause(): string {
  return `_type == "customer"
    && ($tier == "All" || !defined($tier) || $tier == "" || tier == $tier)
    && (
      !defined($q) || $q == "" ||
      name match $pattern ||
      email match $pattern ||
      phone match $pattern ||
      (defined($phoneDigits) && $phoneDigits != "" && phone match $phonePattern)
    )`;
}

export function buildCustomersListQueries(input: CustomersListQueryInput) {
  const filter = buildCustomersFilterClause();
  const listQuery = `*[${filter}] | order(name asc) [${input.start}...${input.end}] ${CUSTOMER_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;
  const activeCountQuery = `count(*[_type == "customer" && status == "Active"])`;
  const inactiveCountQuery = `count(*[_type == "customer" && status == "Inactive"])`;

  return { listQuery, countQuery, activeCountQuery, inactiveCountQuery };
}
