import { parseOrThrow } from "@/shared/lib/api-helpers";

export interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  status: "Active" | "Inactive";
  avatar: string | null;
}

export async function fetchReviews(): Promise<Review[]> {
  const res = await fetch("/api/reviews", { cache: "no-store" });
  return parseOrThrow<Review[]>(res, "Failed to load reviews");
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
