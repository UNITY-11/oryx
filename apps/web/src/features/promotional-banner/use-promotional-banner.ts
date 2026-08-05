import { useEffect, useState } from "react";

import type { PromotionalBannerDetails } from "./types";

export function usePromotionalBanner() {
  const [banner, setBanner] = useState<PromotionalBannerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/promotional-banner", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load promotional banner");
        }
        return res.json() as Promise<{
          banner: PromotionalBannerDetails | null;
        }>;
      })
      .then((data) => {
        if (!cancelled) setBanner(data.banner);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load promotional banner"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { banner, loading, error };
}
