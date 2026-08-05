import { SERVICE_PROJECTION } from "@repo/sanity";

export const SERVICES_LIST_QUERY = `*[_type == "service"] | order(createdAt desc) ${SERVICE_PROJECTION}`;

export const SERVICE_BY_ID_QUERY = `*[_type == "service" && _id == $id][0] ${SERVICE_PROJECTION}`;

export type ServicesListQueryInput = {
  q?: string;
  start: number;
  end: number;
};

function buildServicesFilterClause(): string {
  return `_type == "service"
    && (
      !defined($q) || $q == "" ||
      name match $pattern ||
      description match $pattern ||
      shortDescription match $pattern ||
      category match $pattern
    )`;
}

export function buildServicesListQueries(input: ServicesListQueryInput) {
  const filter = buildServicesFilterClause();
  const listQuery = `*[${filter}] | order(createdAt desc) [${input.start}...${input.end}] ${SERVICE_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;
  const activeCountQuery = `count(*[_type == "service" && status == "Active"])`;
  const inactiveCountQuery = `count(*[_type == "service" && status == "Inactive"])`;

  return { listQuery, countQuery, activeCountQuery, inactiveCountQuery };
}
