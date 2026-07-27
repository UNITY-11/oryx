export type HeroFormData = {
  title: string;
  type: "image" | "video";
  src: string;
  order: number;
};

export type HeroFieldErrors = Partial<
  Record<keyof HeroFormData | "media", string>
>;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const URL_RE = /^(https?:\/\/|\/).+/i;

function isBlank(value: string | null | undefined): boolean {
  return !value || !String(value).trim();
}

export function validateHero(
  data: HeroFormData,
  opts?: { hasPendingFile?: boolean }
): HeroFieldErrors {
  const errors: HeroFieldErrors = {};

  if (!isBlank(data.title) && data.title.trim().length > 120) {
    errors.title = "Title must be 120 characters or less";
  }

  if (data.type !== "image" && data.type !== "video") {
    errors.type = "Select image or video";
  }

  if (!opts?.hasPendingFile) {
    if (isBlank(data.src)) {
      errors.src =
        data.type === "video"
          ? "Upload a video or provide a video URL"
          : "Upload an image";
    } else if (
      data.type === "video" &&
      !URL_RE.test(data.src.trim()) &&
      !data.src.startsWith("data:")
    ) {
      errors.src = "Enter a valid video URL (http/https or /path)";
    }
  }

  if (
    Number.isNaN(data.order) ||
    !Number.isInteger(data.order) ||
    data.order < 1
  ) {
    errors.order = "Order must be a whole number of 1 or greater";
  }

  return errors;
}

export function validateHeroMediaFile(
  file: File,
  type: "image" | "video"
): string | null {
  if (type === "image") {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Use a JPG, PNG, WEBP, or GIF image";
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return "Image must be 8 MB or smaller";
    }
  } else {
    if (
      !ALLOWED_VIDEO_TYPES.includes(file.type) &&
      !file.type.startsWith("video/")
    ) {
      return "Use an MP4, WEBM, or MOV video";
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return "Video must be 50 MB or smaller";
    }
  }
  return null;
}

export function hasHeroFieldErrors(errors: HeroFieldErrors): boolean {
  return Object.values(errors).some(Boolean);
}
