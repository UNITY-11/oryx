"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SOCIAL_PLATFORMS,
  type SocialLink,
  type SocialPlatform,
} from "@/features/company/types";
import {
  fetchPromotionalBanner,
  savePromotionalBanner,
} from "@/features/promotional-banner/api";
import {
  EMPTY_PROMOTIONAL_BANNER,
  type PromotionalBannerInput,
} from "@/features/promotional-banner/types";
import {
  hasFieldErrors,
  validateBannerMediaFile,
  validatePromotionalBanner,
  type FieldErrors,
} from "@/features/promotional-banner/validation";
import { uploadServiceImage } from "@/features/services/api";
import { ImageCropModal } from "@/shared/ui/image-crop-modal";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  ImageIcon,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Save,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";

const inputClass =
  "border-primary/20 focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 disabled:opacity-60";
const labelClass = "text-primary-dark mb-1.5 block text-sm font-medium";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";
const BANNER_ASPECT = 21 / 9;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

function newSocialLink(): SocialLink {
  return {
    id: `social-${Date.now()}`,
    platform: "Instagram",
    url: "",
  };
}

function mapBannerInput(banner: {
  title?: string;
  description?: string;
  image?: string;
  status?: "Active" | "Inactive";
  socialLinks?: SocialLink[];
}): PromotionalBannerInput {
  return {
    title: banner.title || "",
    description: banner.description || "",
    image: banner.image || "",
    status: banner.status === "Active" ? "Active" : "Inactive",
    socialLinks: (banner.socialLinks ?? []).map((link, index) => ({
      id:
        link.id ||
        (link as SocialLink & { _key?: string })._key ||
        `social-${index}`,
      platform: (link.platform as SocialPlatform) || "Other",
      url: link.url || "",
    })),
  };
}

export default function PromotionalBannerPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<PromotionalBannerInput>(
    EMPTY_PROMOTIONAL_BANNER
  );
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const banner = await fetchPromotionalBanner();
      const next = banner ? mapBannerInput(banner) : EMPTY_PROMOTIONAL_BANNER;
      setForm(next);
      setInitialSnapshot(JSON.stringify(next));
      setPendingImageFile(null);
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load promotional banner"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialSnapshot || Boolean(pendingImageFile),
    [form, initialSnapshot, pendingImageFile]
  );

  const update = <K extends keyof PromotionalBannerInput>(
    key: K,
    value: PromotionalBannerInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaError = validateBannerMediaFile(file);
    if (mediaError) {
      setFieldErrors((prev) => ({ ...prev, image: mediaError }));
      setToast({ type: "error", message: mediaError });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setCropImageSrc(reader.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropConfirm = (file: File) => {
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
    setFieldErrors((prev) => {
      if (!prev.image) return prev;
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setCropImageSrc(null);
    setShowCropModal(false);
  };

  const addSocialLink = () => {
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newSocialLink()],
    }));
    setFieldErrors((prev) => {
      if (!prev.socialLinks) return prev;
      const next = { ...prev };
      delete next.socialLinks;
      return next;
    });
  };

  const updateSocialLink = (
    id: string,
    patch: Partial<Pick<SocialLink, "platform" | "url">>
  ) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link) =>
        link.id === id ? { ...link, ...patch } : link
      ),
    }));
    setFieldErrors((prev) => {
      if (!prev.socialLinks) return prev;
      const next = { ...prev };
      delete next.socialLinks;
      return next;
    });
  };

  const removeSocialLink = (id: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((link) => link.id !== id),
    }));
    setFieldErrors((prev) => {
      if (!prev.socialLinks) return prev;
      const next = { ...prev };
      delete next.socialLinks;
      return next;
    });
  };

  const handleSave = async () => {
    const payload: PromotionalBannerInput = {
      ...form,
      socialLinks: form.socialLinks.filter((link) => link.url.trim()),
    };
    const errors = validatePromotionalBanner(payload, {
      hasPendingImage: Boolean(pendingImageFile),
    });
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      let imageUrl = payload.image;
      if (pendingImageFile) {
        imageUrl = await uploadServiceImage(pendingImageFile);
      }

      const saved = await savePromotionalBanner({
        ...payload,
        image: imageUrl,
      });
      const next = mapBannerInput(saved);
      setForm(next);
      setInitialSnapshot(JSON.stringify(next));
      setPendingImageFile(null);
      setToast({ type: "success", message: "Promotional banner saved" });
    } catch (err) {
      const error = err as Error & { fieldErrors?: FieldErrors };
      if (error.fieldErrors) setFieldErrors(error.fieldErrors);
      setToast({
        type: "error",
        message: error.message || "Failed to save promotional banner",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const restored = JSON.parse(initialSnapshot) as PromotionalBannerInput;
    setForm(restored);
    setPendingImageFile(null);
    setFieldErrors({});
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center pt-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />
      <ImageCropModal
        open={showCropModal && Boolean(cropImageSrc)}
        imageSrc={cropImageSrc ?? ""}
        aspect={BANNER_ASPECT}
        title="Crop banner image"
        onClose={() => {
          setShowCropModal(false);
          setCropImageSrc(null);
        }}
        onConfirm={handleCropConfirm}
      />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <Megaphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                Promotional Banner
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                Homepage banner shown before customer reviews
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={load}
              disabled={saving}
              className="border-primary/20 text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="bg-primary hover:bg-primary-dark inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors disabled:opacity-60 sm:px-5 sm:text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        </div>

        {loadError && (
          <div className="border-b border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:px-8">
            {loadError}
          </div>
        )}

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Status */}
            <section>
              <label className={labelClass}>Status</label>
              <div className="flex gap-2">
                {(["Active", "Inactive"] as const).map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    onClick={() => update("status", statusOption)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      form.status === statusOption
                        ? statusOption === "Active"
                          ? "bg-green-600 text-white"
                          : "bg-gray-500 text-white"
                        : "border-primary/20 text-primary border bg-white"
                    }`}
                  >
                    {statusOption}
                  </button>
                ))}
              </div>
            </section>

            {/* Image */}
            <section>
              <label className={labelClass}>Banner image</label>
              <p className="text-text-secondary mb-3 text-xs">
                Recommended wide format (21:9). Image will be cropped to fit the
                homepage banner area.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
              />

              {form.image ? (
                <div className="space-y-3">
                  <div
                    className="border-primary/10 relative overflow-hidden rounded-2xl border"
                    style={{ aspectRatio: `${21} / ${9}` }}
                  >
                    <img
                      src={form.image}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-primary/20 text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      Replace image
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        update("image", "");
                        setPendingImageFile(null);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/20 text-primary hover:bg-primary/5 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-gray-50/80 px-4 py-12 transition-colors"
                >
                  <ImageIcon className="text-primary/40 h-10 w-10" />
                  <span className="text-sm font-medium">
                    Upload banner image
                  </span>
                  <span className="text-text-secondary text-xs">
                    JPG, PNG, WEBP or GIF up to 8 MB
                  </span>
                </button>
              )}
              <FieldError message={fieldErrors.image} />
            </section>

            {/* Text */}
            <section className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="banner-title">
                  Title
                </label>
                <input
                  id="banner-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Summer Glow Special"
                  className={inputClass}
                  maxLength={120}
                />
                <FieldError message={fieldErrors.title} />
              </div>

              <div>
                <label className={labelClass} htmlFor="banner-description">
                  Short description
                </label>
                <textarea
                  id="banner-description"
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="A brief message for your promotion"
                  rows={3}
                  maxLength={300}
                  className={`${inputClass} resize-none`}
                />
                <FieldError message={fieldErrors.description} />
              </div>
            </section>

            {/* Social links */}
            <section>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-primary-dark font-serif text-lg font-medium">
                    Social media links
                  </h2>
                  <p className="text-text-secondary text-xs">
                    Optional links shown on the banner
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addSocialLink}
                  className="border-primary/20 text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add link
                </button>
              </div>

              {form.socialLinks.length === 0 ? (
                <div className="border-primary/10 rounded-2xl border border-dashed bg-gray-50/80 px-4 py-8 text-center">
                  <Share2 className="text-primary/30 mx-auto mb-2 h-8 w-8" />
                  <p className="text-text-secondary text-sm">
                    No social links yet. Add links to display on the banner.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="border-primary/10 grid grid-cols-1 gap-3 rounded-2xl border bg-gray-50/50 p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start sm:p-4"
                    >
                      <select
                        value={link.platform}
                        onChange={(e) =>
                          updateSocialLink(link.id, {
                            platform: e.target.value as SocialPlatform,
                          })
                        }
                        className={inputClass}
                      >
                        {SOCIAL_PLATFORMS.map((platform) => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateSocialLink(link.id, { url: e.target.value })
                        }
                        placeholder="https://instagram.com/oryxspa"
                        className={inputClass}
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                        title="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <FieldError message={fieldErrors.socialLinks} />
            </section>

            {isDirty && (
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors"
                >
                  Discard changes
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save banner
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
