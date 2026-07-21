import { REVIEW_PROJECTION } from "@repo/sanity";

export const REVIEWS_LIST_QUERY = `*[_type == "review"] | order(_createdAt desc) ${REVIEW_PROJECTION}`;

export const REVIEW_BY_ID_QUERY = `*[_type == "review" && _id == $id][0] ${REVIEW_PROJECTION}`;
