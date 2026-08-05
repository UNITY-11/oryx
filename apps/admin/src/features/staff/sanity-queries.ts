export const STAFF_PROJECTION = `{
  "id": _id,
  name,
  role,
  phone,
  email,
  baseSalary,
  status,
  "imageUrl": image.asset->url,
  joinedDate,
  "todayAttendance": *[_type == "attendance" && staff._ref == ^._id && date == $today][0] {
    "id": _id,
    "staffId": staff._ref,
    date,
    checkIn,
    checkOut,
    totalHours,
    status
  }
}`;

export const STAFF_QUERY = `*[_type == "staff"] | order(_createdAt desc) ${STAFF_PROJECTION}`;

export const STAFF_BY_ID_QUERY = `*[_type == "staff" && _id == $id][0] {
  "id": _id,
  name,
  role,
  phone,
  email,
  baseSalary,
  status,
  "imageUrl": image.asset->url,
  joinedDate
}`;

export const ATTENDANCE_BY_STAFF_QUERY = `*[_type == "attendance" && staff._ref == $staffId && date match $month + "*"] | order(date desc) {
  "id": _id,
  "staffId": staff._ref,
  date,
  checkIn,
  checkOut,
  totalHours,
  status
}`;

export const ATTENDANCE_REASON_QUERY = `*[_type == "attendance" && _id == $id][0] {
  reason
}`;

export type StaffListQueryInput = {
  q?: string;
  phoneDigits?: string;
  start: number;
  end: number;
};

function buildStaffFilterClause(): string {
  return `_type == "staff"
    && (
      !defined($q) || $q == "" ||
      name match $pattern ||
      role match $pattern ||
      email match $pattern ||
      phone match $pattern ||
      (defined($phoneDigits) && $phoneDigits != "" && phone match $phonePattern)
    )`;
}

export function buildStaffListQueries(input: StaffListQueryInput) {
  const filter = buildStaffFilterClause();
  const listQuery = `*[${filter}] | order(_createdAt desc) [${input.start}...${input.end}] ${STAFF_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;

  return { listQuery, countQuery };
}
