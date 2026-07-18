export const BOOKING_PROJECTION = `{
  "id": _id,
  customerName,
  phone,
  "services": services[]{ name, addons },
  date,
  time,
  status,
  amount
}`;

export const BOOKINGS_LIST_QUERY = `*[_type == "booking"] | order(date desc, time desc) ${BOOKING_PROJECTION}`;

export const BOOKING_BY_ID_QUERY = `*[_type == "booking" && _id == $id][0] ${BOOKING_PROJECTION}`;
