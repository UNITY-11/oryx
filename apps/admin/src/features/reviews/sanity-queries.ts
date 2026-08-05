import { REVIEW_PROJECTION } from "@repo/sanity";

export const REVIEWS_LIST_QUERY = `*[_type == "review"] | order(_createdAt desc) ${REVIEW_PROJECTION}`;

export const REVIEW_BY_ID_QUERY = `*[_type == "review" && _id == $id][0] ${REVIEW_PROJECTION}`;

export type ReviewsListQueryInput = {
  q?: string;
  start: number;
  end: number;
};

function buildReviewsFilterClause(): string {
  return `_type == "review"
    && (
      !defined($q) || $q == "" ||
      name match $pattern ||
      text match $pattern
    )`;
}

export function buildReviewsListQueries(input: ReviewsListQueryInput) {
  const filter = buildReviewsFilterClause();
  const listQuery = `*[${filter}] | order(_createdAt desc) [${input.start}...${input.end}] ${REVIEW_PROJECTION}`;
  const countQuery = `count(*[${filter}])`;
  const activeCountQuery = `count(*[_type == "review" && status == "Active"])`;
  const inactiveCountQuery = `count(*[_type == "review" && status == "Inactive"])`;

  return { listQuery, countQuery, activeCountQuery, inactiveCountQuery };
}
