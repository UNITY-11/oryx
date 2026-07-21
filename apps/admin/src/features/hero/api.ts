import { HeroItem } from "./types";

export async function fetchHeroItems(): Promise<HeroItem[]> {
  const res = await fetch("/api/hero");
  if (!res.ok) {
    throw new Error("Failed to fetch hero items");
  }
  return res.json();
}

export async function fetchHeroItemById(id: string): Promise<HeroItem> {
  const res = await fetch(`/api/hero/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch hero item");
  }
  return res.json();
}

export async function createHeroItem(data: Omit<HeroItem, "id" | "createdAt">): Promise<HeroItem> {
  const res = await fetch("/api/hero", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create hero item");
  }
  return res.json();
}

export async function updateHeroItem(id: string, data: Partial<HeroItem>): Promise<HeroItem> {
  const res = await fetch(`/api/hero/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update hero item");
  }
  return res.json();
}

export async function deleteHeroItem(id: string): Promise<void> {
  const res = await fetch(`/api/hero/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error("Failed to delete hero item");
  }
}

export async function reorderHeroItems(updates: { id: string; order: number }[]): Promise<void> {
  const res = await fetch(`/api/hero/reorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates }),
  });
  if (!res.ok) {
    throw new Error("Failed to reorder hero items");
  }
}
