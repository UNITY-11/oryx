import { useEffect, useState } from "react";
import { HeroItem } from "./sanity";

export function useHero() {
  const [slides, setSlides] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/hero", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load hero slides");
        }
        return res.json() as Promise<HeroItem[]>;
      })
      .then((data) => {
        if (!cancelled) setSlides(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Failed to load hero slides"
          );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    slides,
    loading,
    error,
  };
}
