import type { Service } from "../services/types";
import type { Booking } from "./types";

export function getServicesMissingOptions(
  booking: Booking,
  catalog: Service[]
): string[] {
  return booking.services
    .filter((svc) => {
      const catalogService = catalog.find((s) => s.name === svc.name);
      const availableOptions = catalogService?.options ?? [];
      return availableOptions.length > 0 && (svc.options ?? []).length === 0;
    })
    .map((svc) => svc.name);
}

/** Selected services in add-booking wizard must each have options when the catalog defines them. */
export function getSelectedServicesMissingOptions(
  selectedServiceIds: string[],
  selectedOptionIds: string[],
  catalog: Service[]
): string[] {
  return catalog
    .filter((service) => selectedServiceIds.includes(service.id))
    .filter(
      (service) =>
        service.options.length > 0 &&
        !service.options.some((option) => selectedOptionIds.includes(option.id))
    )
    .map((service) => service.name);
}

export function canProceedFromServicesStep(
  selectedServiceIds: string[],
  selectedOptionIds: string[],
  catalog: Service[]
): boolean {
  if (selectedServiceIds.length === 0) return false;
  return (
    getSelectedServicesMissingOptions(
      selectedServiceIds,
      selectedOptionIds,
      catalog
    ).length === 0
  );
}

export function canPrintBookingInvoice(
  booking: Booking,
  catalog: Service[]
): { allowed: boolean; message?: string } {
  if (booking.services.length === 0) {
    return {
      allowed: false,
      message: "Add at least one service before printing the invoice.",
    };
  }

  const missingOptions = getServicesMissingOptions(booking, catalog);
  if (missingOptions.length > 0) {
    return {
      allowed: false,
      message: `Select service options for: ${missingOptions.join(", ")} before printing the invoice.`,
    };
  }

  return { allowed: true };
}
