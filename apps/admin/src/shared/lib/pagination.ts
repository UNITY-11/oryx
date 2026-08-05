export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export type PaginatedResponse<
  T,
  M extends Record<string, number> = Record<string, number>,
> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  meta?: M;
};

export function parsePaginationSearchParams(searchParams: URLSearchParams) {
  return {
    paginated: searchParams.get("paginated") === "1",
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    pageSize: Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE)
    ),
    q: (searchParams.get("q") || searchParams.get("search") || "").trim(),
    order:
      searchParams.get("order") === "asc"
        ? ("asc" as const)
        : ("desc" as const),
  };
}

export function toGroqSearchPattern(q: string): string {
  const trimmed = q.trim().replace(/[*?[\]]/g, "");
  if (!trimmed) return "";
  return `*${trimmed}*`;
}

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function buildPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
  meta?: Record<string, number>
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    ...(meta ? { meta } : {}),
  };
}

export function buildFetchPageQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const qs = new URLSearchParams();
  qs.set("paginated", "1");
  for (const [key, value] of Object.entries(params)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "All" &&
      value !== false
    ) {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}
