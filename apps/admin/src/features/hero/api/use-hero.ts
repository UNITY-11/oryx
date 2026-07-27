import { useEffect, useState } from "react";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import { fetchHeroItems } from "../api";
import { HeroItem } from "../types";

export function useHero() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadHeroItems = () => {
    setLoading(true);
    setError(null);
    fetchHeroItems()
      .then(setHeroItems)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load hero slides"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadHeroItems();
  }, []);

  useSanityListener('*[_type == "hero"]', reloadHeroItems);

  return {
    heroItems,
    loading,
    error,
    reloadHeroItems,
  };
}
