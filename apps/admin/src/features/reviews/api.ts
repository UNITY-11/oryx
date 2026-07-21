import { parseOrThrow } from "@/shared/lib/api-helpers";

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  status: "Active" | "Inactive";
  initials: string;
  avatar: string | null;
}

export async function fetchReviews(): Promise<Review[]> {
  const res = await fetch("/api/reviews", { cache: "no-store" });
  return parseOrThrow<Review[]>(res, "Failed to load reviews");
}

export async function fetchReviewById(id: string): Promise<Review> {
  const res = await fetch(`/api/reviews/${id}`, { cache: "no-store" });
  return parseOrThrow<Review>(res, "Failed to load review");
}

export async function createReview(
  payload: Partial<Omit<Review, "id">>
): Promise<Review> {
  const res = await fetch("/api/reviews", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Review>(res, "Failed to create review");
}

export async function updateReview(
  id: string,
  payload: Partial<Omit<Review, "id">>
): Promise<Review> {
  const res = await fetch(`/api/reviews/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseOrThrow<Review>(res, "Failed to update review");
}

export async function deleteReview(id: string): Promise<void> {
  const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    throw new Error(errorBody?.error ?? "Failed to delete review");
  }
}
