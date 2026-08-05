export const BOOKING_PROJECTION = `{
  "id": _id,
  bookingCode,
  "customerName": coalesce(
    *[_type == "customer" && (
      _id == ^.customerId ||
      (defined(^.phone) && ^.phone != "" && phone == ^.phone)
    )][0].name,
    customerName
  ),
  phone,
  customerId,
  "services": services[]{
    name,
    "options": coalesce(options, addons, [])
  },
  date,
  time,
  status,
  amount,
  "createdAt": _createdAt
}`;

export const BOOKINGS_LIST_QUERY = `*[_type == "booking"] | order(_createdAt desc) ${BOOKING_PROJECTION}`;

export const BOOKING_BY_ID_QUERY = `*[_type == "booking" && _id == $id][0] ${BOOKING_PROJECTION}`;

export type BookingsSortField =
  "createdAt" | "date" | "amount" | "customerName" | "id";

export type BookingsListQueryInput = {
  q?: string;
  phoneDigits?: string;
  status?: string;
  billable?: boolean;
  sort?: BookingsSortField;
  order?: "asc" | "desc";
  start: number;
  end: number;
};

function buildOrderClause(
  sort: BookingsSortField,
  order: "asc" | "desc"
): string {
  const dir = order === "asc" ? "asc" : "desc";
  switch (sort) {
    case "date":
      return `date ${dir}, time ${dir}`;
    case "amount":
      return `amount ${dir}`;
    case "customerName":
      return `customerName ${dir}`;
    case "id":
      return `_id ${dir}`;
    case "createdAt":
    default:
      return `_createdAt ${dir}`;
  }
}

function buildFilterClause(): string {
  return `_type == "booking"
    && ($billable != true || status in ["Started", "Completed"])
    && ($status == "All" || !defined($status) || $status == "" || status == $status)
    && (
      !defined($q) || $q == "" ||
      customerName match $pattern ||
      phone match $pattern ||
      (defined(bookingCode) && bookingCode match $pattern) ||
      _id match $pattern ||
      count(services[name match $pattern]) > 0 ||
      count(services[].options[@ match $pattern]) > 0 ||
      (defined($phoneDigits) && $phoneDigits != "" && phone match $phonePattern)
    )`;
}

export function buildBookingsListQueries(input: BookingsListQueryInput) {
  const sort = input.billable ? "billing" : (input.sort ?? "createdAt");
  const order = input.order ?? "desc";
  const filter = buildFilterClause();
  const orderClause =
    sort === "billing"
      ? `select(status == "Started" => 0, status == "Completed" => 1, 2) asc, date desc`
      : buildOrderClause(sort as BookingsSortField, order);

  const listQuery = `*[${filter}] | order(${orderClause}) [${input.start}...${input.end}] ${BOOKING_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;
  const startedCountQuery = `count(*[_type == "booking" && status == "Started"])`;
  const completedCountQuery = `count(*[_type == "booking" && status == "Completed"])`;

  return { listQuery, countQuery, startedCountQuery, completedCountQuery };
}

export function toGroqSearchPattern(q: string): string {
  const trimmed = q.trim().replace(/[*?[\]]/g, "");
  if (!trimmed) return "";
  return `*${trimmed}*`;
}
