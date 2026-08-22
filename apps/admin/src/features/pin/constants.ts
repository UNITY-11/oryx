export const ADMIN_PIN_LENGTH = 6;

export const ADMIN_PIN_COOKIE = "admin_pin_auth";

export function isValidAdminPinFormat(pin: string): boolean {
  return /^\d{6}$/.test(pin);
}

export function getConfiguredAdminPin(): string | null {
  const pin = process.env.ADMIN_PIN?.trim() ?? "";
  return isValidAdminPinFormat(pin) ? pin : null;
}
