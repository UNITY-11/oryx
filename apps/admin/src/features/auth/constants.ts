/** Single allowed admin login email (not stored in env). */
export const ADMIN_EMAIL = "oryxbeauty.qa@gmail.com";

export const ADMIN_AUTH_DOCUMENT_ID = "adminAuth";

export const SESSION_COOKIE_NAME = "admin_session";

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export const RESET_TOKEN_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export const PUBLIC_AUTH_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;
