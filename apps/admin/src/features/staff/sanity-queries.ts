export const STAFF_QUERY = `*[_type == "staff"] | order(_createdAt desc) {
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

