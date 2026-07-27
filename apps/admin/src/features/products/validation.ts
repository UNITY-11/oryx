import type { Product, ProductCategory } from "./types";

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

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateProduct(
  data: Pick<
    ProductFormData,
    "name" | "brand" | "volumeOrWeight" | "quantity" | "price" | "category"
  >
): ProductFieldErrors {
  const errors: ProductFieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Product name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (data.name.trim().length > 120) {
    errors.name = "Name must be 120 characters or less";
  }

  if (!isBlank(data.brand) && data.brand.trim().length > 80) {
    errors.brand = "Brand must be 80 characters or less";
  }

  if (!isBlank(data.volumeOrWeight) && data.volumeOrWeight.trim().length > 40) {
    errors.volumeOrWeight = "Size must be 40 characters or less";
  }

  if (!data.category) {
    errors.category = "Category is required";
  }

  if (Number.isNaN(data.price) || data.price < 0) {
    errors.price = "Price must be 0 or greater";
  } else if (data.price > 1_000_000) {
    errors.price = "Price is too high";
  }

  if (
    Number.isNaN(data.quantity) ||
    data.quantity < 0 ||
    !Number.isInteger(data.quantity)
  ) {
    errors.quantity = "Quantity must be a whole number (0 or greater)";
  } else if (data.quantity > 1_000_000) {
    errors.quantity = "Quantity is too high";
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
