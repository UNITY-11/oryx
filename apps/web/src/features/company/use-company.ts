import { useEffect, useState } from "react";

import type { CompanyDetails } from "./types";

export function useCompany() {
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/company", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Failed to load company details");
        }
        return res.json() as Promise<{ company: CompanyDetails | null }>;
      })
      .then((data) => {
        if (!cancelled) setCompany(data.company);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load company details"
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

  return {
    company,
    socialLinks: company?.socialLinks ?? [],
    loading,
    error,
  };
}
