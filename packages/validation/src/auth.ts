const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function validateEmail(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Email is required";
  if (trimmed.length > 254) return "Email is too long";
  if (!EMAIL_RE.test(trimmed)) return "Enter a valid email address";
  return "";
}

export function validateRequiredPassword(
  value: string,
  label = "Password"
): string {
  if (!value) return `${label} is required`;
  return "";
}

export function validateNewPassword(value: string, label = "Password"): string {
  if (!value) return `${label} is required`;
  if (value.length < MIN_PASSWORD_LENGTH) {
    return `${label} must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (value.length > MAX_PASSWORD_LENGTH) {
    return `${label} must be ${MAX_PASSWORD_LENGTH} characters or less`;
  }
  return "";
}

export function validatePasswordMatch(
  password: string,
  confirm: string
): string {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return "";
}

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginField = "email" | "password";

export function validateLoginFields(
  data: LoginInput
): Partial<Record<LoginField, string>> {
  const errors: Partial<Record<LoginField, string>> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const passwordError = validateRequiredPassword(data.password);
  if (passwordError) errors.password = passwordError;
  return errors;
}

export function validateLoginInput(data: LoginInput): string | null {
  const errors = validateLoginFields(data);
  const first = Object.values(errors)[0];
  return first ?? null;
}

export type ForgotPasswordInput = {
  email: string;
};

export function validateForgotPasswordFields(
  data: ForgotPasswordInput
): Partial<Record<"email", string>> {
  const errors: Partial<Record<"email", string>> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  return errors;
}

export function validateForgotPasswordInput(
  data: ForgotPasswordInput
): string | null {
  const errors = validateForgotPasswordFields(data);
  return errors.email ?? null;
}

export type ChangePasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordField =
  "currentPassword" | "newPassword" | "confirmPassword";

export function validateChangePasswordFields(
  data: ChangePasswordInput
): Partial<Record<ChangePasswordField, string>> {
  const errors: Partial<Record<ChangePasswordField, string>> = {};

  const currentError = validateRequiredPassword(
    data.currentPassword,
    "Current password"
  );
  if (currentError) errors.currentPassword = currentError;

  const newError = validateNewPassword(data.newPassword, "New password");
  if (newError) errors.newPassword = newError;

  const matchError = validatePasswordMatch(
    data.newPassword,
    data.confirmPassword
  );
  if (matchError) errors.confirmPassword = matchError;

  if (
    data.currentPassword &&
    data.newPassword &&
    data.currentPassword === data.newPassword
  ) {
    errors.newPassword = "New password must be different from current password";
  }

  return errors;
}

export function validateChangePasswordInput(
  data: ChangePasswordInput
): string | null {
  const errors = validateChangePasswordFields(data);
  const first = Object.values(errors)[0];
  return first ?? null;
}

export type ResetPasswordInput = {
  token: string;
  password: string;
  confirmPassword: string;
};

export type ResetPasswordField = "password" | "confirmPassword";

export function validateResetPasswordFields(
  data: ResetPasswordInput
): Partial<Record<ResetPasswordField | "token", string>> {
  const errors: Partial<Record<ResetPasswordField | "token", string>> = {};

  if (!data.token.trim()) {
    errors.token = "Reset token is missing or invalid";
  }

  const passwordError = validateNewPassword(data.password, "Password");
  if (passwordError) errors.password = passwordError;

  const matchError = validatePasswordMatch(data.password, data.confirmPassword);
  if (matchError) errors.confirmPassword = matchError;

  return errors;
}

export function validateResetPasswordInput(
  data: ResetPasswordInput
): string | null {
  const errors = validateResetPasswordFields(data);
  const first = Object.values(errors)[0];
  return first ?? null;
}
