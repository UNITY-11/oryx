export type StaffFormData = {
  name: string;
  role: string;
  phone: string;
  email: string;
  baseSalary: number;
  status: "Active" | "Inactive";
  joinedDate: string;
};

export type StaffFieldErrors = Partial<Record<keyof StaffFormData, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{8,20}$/;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateStaff(data: StaffFormData): StaffFieldErrors {
  const errors: StaffFieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Full name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (data.name.trim().length > 100) {
    errors.name = "Name must be 100 characters or less";
  }

  if (isBlank(data.role)) {
    errors.role = "Job title is required";
  } else if (data.role.trim().length < 2) {
    errors.role = "Job title must be at least 2 characters";
  } else if (data.role.trim().length > 80) {
    errors.role = "Job title must be 80 characters or less";
  }

  if (isBlank(data.phone)) {
    errors.phone = "Phone number is required";
  } else if (
    !PHONE_RE.test(data.phone.trim()) ||
    digitsOnly(data.phone).length < 8
  ) {
    errors.phone = "Enter a valid phone number (at least 8 digits)";
  }

  if (!isBlank(data.email) && !EMAIL_RE.test(data.email.trim())) {
    errors.email = "Enter a valid email address";
  }

  if (Number.isNaN(data.baseSalary) || data.baseSalary < 0) {
    errors.baseSalary = "Salary must be 0 or greater";
  } else if (data.baseSalary > 1_000_000) {
    errors.baseSalary = "Salary is too high";
  }

  if (isBlank(data.joinedDate)) {
    errors.joinedDate = "Joined date is required";
  } else {
    const joined = new Date(data.joinedDate);
    if (Number.isNaN(joined.getTime())) {
      errors.joinedDate = "Enter a valid date";
    } else {
      const tomorrow = new Date();
      tomorrow.setHours(23, 59, 59, 999);
      if (joined > tomorrow) {
        errors.joinedDate = "Joined date cannot be in the future";
      }
    }
  }

  if (data.status !== "Active" && data.status !== "Inactive") {
    errors.status = "Select a valid status";
  }

  return errors;
}

export function validateAttendanceLog(data: {
  date: string;
  status: "Present" | "Absent" | "Half Day";
  checkIn: string;
  checkOut: string;
  reason: string;
}): Partial<
  Record<"date" | "checkIn" | "checkOut" | "reason" | "status", string>
> {
  const errors: Partial<
    Record<"date" | "checkIn" | "checkOut" | "reason" | "status", string>
  > = {};

  if (isBlank(data.date)) {
    errors.date = "Date is required";
  }

  if (data.status !== "Absent") {
    if (isBlank(data.checkIn)) {
      errors.checkIn = "Check-in time is required";
    }
    if (data.checkIn && data.checkOut && data.checkOut < data.checkIn) {
      // Allow overnight only if checkout is earlier - soft warn not block overnight spa shifts
      // Skip overnight validation; only require check-in
    }
  } else if (isBlank(data.reason)) {
    errors.reason = "Reason is required when marking absent";
  }

  return errors;
}

export function hasStaffFieldErrors(errors: StaffFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function hasAttendanceErrors(
  errors: Partial<Record<string, string>>
): boolean {
  return Object.values(errors).some(Boolean);
}
