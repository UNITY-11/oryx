export type ReviewFormData = {
  name: string;
  text: string;
  rating: number;
  status: "Active" | "Inactive";
};

export type ReviewFieldErrors = Partial<Record<keyof ReviewFormData, string>>;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateReview(data: ReviewFormData): ReviewFieldErrors {
  const errors: ReviewFieldErrors = {};

  if (isBlank(data.name)) {
    errors.name = "Reviewer name is required";
  } else if (data.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (data.name.trim().length > 80) {
    errors.name = "Name must be 80 characters or less";
  }

  if (isBlank(data.text)) {
    errors.text = "Review text is required";
  } else if (data.text.trim().length < 10) {
    errors.text = "Review must be at least 10 characters";
  } else if (data.text.trim().length > 1000) {
    errors.text = "Review must be 1000 characters or less";
  }

  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.rating = "Rating must be between 1 and 5";
  }

  if (data.status !== "Active" && data.status !== "Inactive") {
    errors.status = "Select a valid status";
  }

  return errors;
}

export function hasReviewFieldErrors(errors: ReviewFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
