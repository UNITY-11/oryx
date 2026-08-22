import type { Product, ProductCategory } from "./types";

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  "Skincare",
  "Body Care",
  "Hair Care",
  "Aromatherapy",
  "Accessories",
  "Supplements",
];

export type ProductFormData = {
  name: string;
  brand: string;
  volumeOrWeight: string;
  quantity: number;
  price: number;
  category: ProductCategory;
  image: string | null;
  status: "Active" | "Inactive";
};

export type ProductFieldErrors = Partial<
  Record<keyof ProductFormData | "image", string>
>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 120;
const MIN_BRAND_LENGTH = 2;
const MAX_BRAND_LENGTH = 80;
const MIN_SIZE_LENGTH = 2;
const MAX_SIZE_LENGTH = 40;
const MAX_PRICE = 1_000_000;
const MAX_QUANTITY = 1_000_000;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function isValidProductCategory(
  value: unknown
): value is ProductCategory {
  return (
    typeof value === "string" &&
    PRODUCT_CATEGORIES.includes(value as ProductCategory)
  );
}

export function isValidProductStatus(
  value: unknown
): value is Product["status"] {
  return value === "Active" || value === "Inactive";
}

function hasAtMostTwoDecimalPlaces(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-8;
}

function validateName(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return "Product name is required";
  if (trimmed.length < MIN_NAME_LENGTH) {
    return `Name must be at least ${MIN_NAME_LENGTH} characters`;
  }
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or less`;
  }
  return undefined;
}

function validateBrand(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length < MIN_BRAND_LENGTH) {
    return `Brand must be at least ${MIN_BRAND_LENGTH} characters`;
  }
  if (trimmed.length > MAX_BRAND_LENGTH) {
    return `Brand must be ${MAX_BRAND_LENGTH} characters or less`;
  }
  return undefined;
}

function validateVolumeOrWeight(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length < MIN_SIZE_LENGTH) {
    return `Size must be at least ${MIN_SIZE_LENGTH} characters`;
  }
  if (trimmed.length > MAX_SIZE_LENGTH) {
    return `Size must be ${MAX_SIZE_LENGTH} characters or less`;
  }
  return undefined;
}

function validateCategory(value: ProductCategory): string | undefined {
  if (!isValidProductCategory(value)) {
    return "Select a valid category";
  }
  return undefined;
}

function validatePrice(value: number): string | undefined {
  if (!Number.isFinite(value)) {
    return "Price must be a valid number";
  }
  if (value <= 0) {
    return "Price must be greater than 0";
  }
  if (!hasAtMostTwoDecimalPlaces(value)) {
    return "Price can have at most 2 decimal places";
  }
  if (value > MAX_PRICE) {
    return `Price cannot exceed ${MAX_PRICE.toLocaleString()} QAR`;
  }
  return undefined;
}

function validateQuantity(value: number): string | undefined {
  if (!Number.isFinite(value)) {
    return "Quantity must be a valid number";
  }
  if (!Number.isInteger(value)) {
    return "Quantity must be a whole number";
  }
  if (value < 0) {
    return "Quantity cannot be negative";
  }
  if (value > MAX_QUANTITY) {
    return `Quantity cannot exceed ${MAX_QUANTITY.toLocaleString()}`;
  }
  return undefined;
}

function validateStatus(value: unknown): string | undefined {
  if (!isValidProductStatus(value)) {
    return "Status must be Active or Inactive";
  }
  return undefined;
}

export function validateProduct(
  data: Pick<
    ProductFormData,
    "name" | "brand" | "volumeOrWeight" | "quantity" | "price" | "category"
  > & { status?: ProductFormData["status"] }
): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  const nameError = validateName(data.name);
  if (nameError) errors.name = nameError;

  const brandError = validateBrand(data.brand);
  if (brandError) errors.brand = brandError;

  const sizeError = validateVolumeOrWeight(data.volumeOrWeight);
  if (sizeError) errors.volumeOrWeight = sizeError;

  const categoryError = validateCategory(data.category);
  if (categoryError) errors.category = categoryError;

  const priceError = validatePrice(data.price);
  if (priceError) errors.price = priceError;

  const quantityError = validateQuantity(data.quantity);
  if (quantityError) errors.quantity = quantityError;

  if (data.status !== undefined) {
    const statusError = validateStatus(data.status);
    if (statusError) errors.status = statusError;
  }

  return errors;
}

export function validateProductImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Use a JPG, PNG, WEBP, or GIF image";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 5 MB or smaller";
  }
  return null;
}

export function hasProductFieldErrors(errors: ProductFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export function firstProductFieldError(
  errors: ProductFieldErrors
): string | null {
  const first = Object.values(errors).find(Boolean);
  return first ?? null;
}

export function productToFormData(product: Product): ProductFormData {
  return {
    name: product.name ?? "",
    brand: product.brand ?? "",
    volumeOrWeight: product.volumeOrWeight ?? "",
    quantity: product.quantity ?? 0,
    price: product.price ?? 0,
    category: product.category,
    image: product.image,
    status: product.status,
  };
}
