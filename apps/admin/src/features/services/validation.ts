import type { ServiceOption, ServiceStatus } from "./types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MAX_NAME_LENGTH = 100;
const MIN_NAME_LENGTH = 2;
const MAX_DESCRIPTION_LENGTH = 3000;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_SHORT_DESCRIPTION_LENGTH = 200;
const MAX_OPTION_NAME_LENGTH = 80;
const MIN_OPTION_NAME_LENGTH = 2;
const MAX_PRICE = 999_999;
const MAX_DURATION_MINUTES = 24 * 60;
const MAX_PREP_CLEANUP_MINUTES = 8 * 60;
const MAX_CAPACITY = 50;
const MAX_TAGS = 20;
const MAX_TAG_LENGTH = 50;

export type ServiceFormInput = {
  name: string;
  description: string;
  shortDescription?: string;
  image: string | null;
  preparationTime?: number;
  cleanupTime?: number;
  maxCapacity?: number;
  price?: number;
  options: ServiceOption[];
  status: ServiceStatus;
  featured?: boolean;
  tags?: string[];
};

export type OptionFieldErrors = Partial<
  Record<"name" | "price" | "duration", string>
>;

export type ServiceFieldErrors = Partial<
  Record<
    | "name"
    | "description"
    | "shortDescription"
    | "image"
    | "preparationTime"
    | "cleanupTime"
    | "maxCapacity"
    | "price"
    | "options"
    | "status"
    | "tags",
    string
  >
> & {
  optionErrors?: Record<string, OptionFieldErrors>;
};

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

function isValidStatus(status: unknown): status is ServiceStatus {
  return status === "Active" || status === "Inactive";
}

function validateMinutes(
  value: number | undefined,
  label: string,
  max: number
): string | undefined {
  if (value === undefined || value === null) {
    return `${label} is required`;
  }
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return `${label} must be a whole number`;
  }
  if (value < 0) {
    return `${label} cannot be negative`;
  }
  if (value > max) {
    return `${label} cannot exceed ${max} minutes`;
  }
  return undefined;
}

function validateCapacity(value: number | undefined): string | undefined {
  if (value === undefined || value === null) {
    return "Max capacity is required";
  }
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    return "Max capacity must be a whole number";
  }
  if (value < 1) {
    return "Max capacity must be at least 1";
  }
  if (value > MAX_CAPACITY) {
    return `Max capacity cannot exceed ${MAX_CAPACITY}`;
  }
  return undefined;
}

function validatePriceValue(
  value: number | undefined,
  options: { required?: boolean; label?: string }
): string | undefined {
  const label = options.label ?? "Price";
  if (value === undefined || value === null || value === 0) {
    return options.required ? `${label} is required` : undefined;
  }
  if (!Number.isFinite(value)) {
    return `${label} must be a valid number`;
  }
  if (value < 0) {
    return `${label} cannot be negative`;
  }
  if (value > MAX_PRICE) {
    return `${label} cannot exceed ${MAX_PRICE.toLocaleString()} QAR`;
  }
  return undefined;
}

function validateOption(option: ServiceOption): OptionFieldErrors {
  const errors: OptionFieldErrors = {};
  const name = option.name.trim();

  if (!name) {
    errors.name = "Option name is required";
  } else if (name.length < MIN_OPTION_NAME_LENGTH) {
    errors.name = `Option name must be at least ${MIN_OPTION_NAME_LENGTH} characters`;
  } else if (name.length > MAX_OPTION_NAME_LENGTH) {
    errors.name = `Option name must be ${MAX_OPTION_NAME_LENGTH} characters or fewer`;
  }

  const priceError = validatePriceValue(option.price, {
    required: true,
    label: "Price",
  });
  if (priceError) {
    errors.price =
      option.price === 0 ? "Price must be greater than 0" : priceError;
  } else if (option.price <= 0) {
    errors.price = "Price must be greater than 0";
  }

  if (option.duration !== undefined && option.duration !== null) {
    if (
      !Number.isFinite(option.duration) ||
      !Number.isInteger(option.duration)
    ) {
      errors.duration = "Duration must be a whole number of minutes";
    } else if (option.duration < 0) {
      errors.duration = "Duration cannot be negative";
    } else if (option.duration === 0) {
      errors.duration = "Duration must be at least 1 minute";
    } else if (option.duration > MAX_DURATION_MINUTES) {
      errors.duration = `Duration cannot exceed ${MAX_DURATION_MINUTES} minutes`;
    }
  }

  return errors;
}

export function validateService(
  data: ServiceFormInput,
  opts?: { hasPendingImage?: boolean }
): ServiceFieldErrors {
  const errors: ServiceFieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Service name is required";
  } else if (data.name.trim().length < MIN_NAME_LENGTH) {
    errors.name = `Service name must be at least ${MIN_NAME_LENGTH} characters`;
  } else if (data.name.trim().length > MAX_NAME_LENGTH) {
    errors.name = `Service name must be ${MAX_NAME_LENGTH} characters or fewer`;
  }

  if (isBlank(data.description)) {
    errors.description = "Description is required";
  } else if (data.description.trim().length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters`;
  } else if (data.description.trim().length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`;
  }

  if (
    data.shortDescription &&
    data.shortDescription.trim().length > MAX_SHORT_DESCRIPTION_LENGTH
  ) {
    errors.shortDescription = `Short description must be ${MAX_SHORT_DESCRIPTION_LENGTH} characters or fewer`;
  }

  if (!opts?.hasPendingImage && isBlank(data.image)) {
    errors.image = "Service image is required";
  }

  const prepError = validateMinutes(
    data.preparationTime,
    "Preparation time",
    MAX_PREP_CLEANUP_MINUTES
  );
  if (prepError) errors.preparationTime = prepError;

  const cleanupError = validateMinutes(
    data.cleanupTime,
    "Cleanup time",
    MAX_PREP_CLEANUP_MINUTES
  );
  if (cleanupError) errors.cleanupTime = cleanupError;

  const capacityError = validateCapacity(data.maxCapacity);
  if (capacityError) errors.maxCapacity = capacityError;

  if (data.price !== undefined) {
    const priceError = validatePriceValue(data.price, { label: "Base price" });
    if (priceError) errors.price = priceError;
  }

  if (!isValidStatus(data.status)) {
    errors.status = "Status must be Active or Inactive";
  }

  if (data.tags) {
    if (data.tags.length > MAX_TAGS) {
      errors.tags = `You can add up to ${MAX_TAGS} tags`;
    } else {
      const invalidTag = data.tags.find(
        (tag) => !tag.trim() || tag.trim().length > MAX_TAG_LENGTH
      );
      if (invalidTag !== undefined) {
        errors.tags = `Each tag must be 1–${MAX_TAG_LENGTH} characters`;
      }
    }
  }

  if (!data.options || data.options.length === 0) {
    errors.options = "Add at least one service option";
  } else {
    const optionErrors: Record<string, OptionFieldErrors> = {};
    for (const option of data.options) {
      const optionFieldErrors = validateOption(option);
      if (Object.keys(optionFieldErrors).length > 0) {
        optionErrors[option.id] = optionFieldErrors;
      }
    }
    if (Object.keys(optionErrors).length > 0) {
      errors.optionErrors = optionErrors;
    }
  }

  return errors;
}

export function validateServiceImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 8 MB or smaller";
  }
  return null;
}

export function hasServiceFieldErrors(errors: ServiceFieldErrors): boolean {
  if (
    Object.entries(errors).some(
      ([key, value]) => key !== "optionErrors" && Boolean(value)
    )
  ) {
    return true;
  }
  if (errors.optionErrors) {
    return Object.values(errors.optionErrors).some(
      (optionError) => Object.keys(optionError).length > 0
    );
  }
  return false;
}

export function isOptionComplete(option: ServiceOption): boolean {
  return Object.keys(validateOption(option)).length === 0;
}

export function parseNonNegativeInt(value: string): number {
  if (value === "") return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
}

export function parsePositivePrice(value: string): number {
  if (value === "") return 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100) / 100;
}

export function parseOptionalDuration(value: string): number | undefined {
  if (value === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.max(0, Math.floor(parsed));
}

export function normalizeServiceInput(
  body: Record<string, unknown>
): ServiceFormInput {
  const str = (key: string) =>
    typeof body[key] === "string" ? (body[key] as string).trim() : "";

  const num = (key: string, fallback?: number) => {
    const value = body[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
  };

  const options: ServiceOption[] = Array.isArray(body.options)
    ? body.options.flatMap((item, index) => {
        if (!item || typeof item !== "object") return [];
        const option = item as Record<string, unknown>;
        const id =
          typeof option.id === "string" && option.id.trim()
            ? option.id.trim()
            : `option-${index}`;
        const name = typeof option.name === "string" ? option.name : "";
        const priceRaw = option.price;
        let price = 0;
        if (typeof priceRaw === "number" && Number.isFinite(priceRaw)) {
          price = priceRaw;
        } else if (typeof priceRaw === "string" && priceRaw.trim() !== "") {
          const parsed = Number(priceRaw);
          price = Number.isFinite(parsed) ? parsed : 0;
        }
        const durationRaw = option.duration;
        let duration: number | undefined;
        if (
          durationRaw === null ||
          durationRaw === undefined ||
          durationRaw === ""
        ) {
          duration = undefined;
        } else if (
          typeof durationRaw === "number" &&
          Number.isFinite(durationRaw)
        ) {
          duration = Math.floor(durationRaw);
        } else if (
          typeof durationRaw === "string" &&
          durationRaw.trim() !== ""
        ) {
          const parsed = Number(durationRaw);
          duration = Number.isFinite(parsed) ? Math.floor(parsed) : undefined;
        }

        return [{ id, name, price, duration }];
      })
    : [];

  const tags = Array.isArray(body.tags)
    ? body.tags
        .map((tag) => (typeof tag === "string" ? tag.trim() : ""))
        .filter(Boolean)
    : typeof body.tags === "string"
      ? body.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];

  const status =
    body.status === "Active" || body.status === "Inactive"
      ? body.status
      : "Active";

  return {
    name: str("name"),
    description: str("description"),
    shortDescription: str("shortDescription"),
    image:
      typeof body.image === "string" && body.image.trim()
        ? body.image.trim()
        : null,
    preparationTime: num("preparationTime", 0) ?? 0,
    cleanupTime: num("cleanupTime", 0) ?? 0,
    maxCapacity: num("maxCapacity", 1) ?? 1,
    price: num("price", 0) ?? 0,
    options,
    status,
    featured: Boolean(body.featured),
    tags,
  };
}
