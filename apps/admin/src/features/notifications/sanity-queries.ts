export const NOTIFICATION_PROJECTION = `{
  "id": _id,
  type,
  title,
  message,
  timestamp,
  status,
  isStarred,
  actionUrl,
  bookingData
}`;

export const NOTIFICATIONS_LIST_QUERY = `*[_type == "notification"] | order(_createdAt desc) ${NOTIFICATION_PROJECTION}`;

export const NOTIFICATION_BY_ID_QUERY = `*[_type == "notification" && _id == $id][0] ${NOTIFICATION_PROJECTION}`;
