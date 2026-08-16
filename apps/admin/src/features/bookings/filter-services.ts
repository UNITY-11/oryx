import type { Service } from "../services/types";

/** Match services by name, category, or any option name. */
export function filterServicesByQuery(
  services: Service[],
  query: string
): Service[] {
  const q = query.trim().toLowerCase();
  if (!q) return services;

  return services.filter((service) => {
    if (service.name.toLowerCase().includes(q)) return true;
    if ((service.category ?? "").toLowerCase().includes(q)) return true;
    return (service.options ?? []).some((option) =>
      option.name.toLowerCase().includes(q)
    );
  });
}
