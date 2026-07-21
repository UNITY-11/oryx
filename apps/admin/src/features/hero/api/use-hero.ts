import { useEffect, useState } from "react";
import { fetchHeroItems } from "../api";
import { HeroItem } from "../types";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

export function useHero() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadHeroItems = () => {
    fetchHeroItems()
      .then(setHeroItems)
      .catch((err) => setError(err.message))
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
