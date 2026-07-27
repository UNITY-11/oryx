"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createHeroItem } from "@/features/hero/api";
import { HeroItem } from "@/features/hero/types";
import {
  hasHeroFieldErrors,
  validateHero,
  validateHeroMediaFile,
  type HeroFieldErrors,
} from "@/features/hero/validation";
import { uploadServiceImage } from "@/features/services/api";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Upload,
  Video,
} from "lucide-react";

type NewHeroState = Omit<HeroItem, "id" | "createdAt">;

const DEFAULT_STATE: NewHeroState = {
  title: "",
  type: "image",
  src: "",
  order: 1,
};

const inputClass =
  "border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-60";
const inputErrorClass = "border-red-400 focus:border-red-500";
const labelClass =
  "text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export default function NewHeroPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hero, setHero] = useState<NewHeroState>(DEFAULT_STATE);
  const [saving, setSaving] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<HeroFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);

  const update = <K extends keyof NewHeroState>(
    key: K,
    value: NewHeroState[K]
  ) => {
    setHero((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key as keyof HeroFieldErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof HeroFieldErrors];
      return next;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaError = validateHeroMediaFile(file, hero.type);
    if (mediaError) {
      setFieldErrors((prev) => ({
        ...prev,
        media: mediaError,
        src: mediaError,
      }));
      setToast({ type: "error", message: mediaError });
      e.target.value = "";
      return;
    }

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.media;
      delete next.src;
      return next;
    });
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("src", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    const errors = validateHero(hero, {
      hasPendingFile: Boolean(pendingImageFile),
    });
    if (hasHeroFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      let srcUrl = hero.src;
      if (pendingImageFile) {
        srcUrl = await uploadServiceImage(pendingImageFile);
      }

      await createHeroItem({ ...hero, src: srcUrl, title: hero.title.trim() });
      setToast({ type: "success", message: "Hero slide created" });
      setTimeout(() => router.push("/hero"), 900);
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to create hero slide",
      });
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <button
              type="button"
              onClick={() => router.push("/hero")}
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                New Hero Slide
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                Add a homepage banner image or video
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="bg-primary inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-5 sm:text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Creating…" : "Create Slide"}</span>
            </button>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:gap-8 lg:flex-row">
            <div className="mx-auto w-full max-w-md shrink-0 lg:mx-0 lg:w-96">
              <label className={labelClass}>Slide Media *</label>

              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    update("type", "image");
                    setPendingImageFile(null);
                    update("src", "");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    hero.type === "image"
                      ? "bg-primary text-white"
                      : "bg-primary/5 text-primary-dark border-primary/20 border"
                  }`}
                >
                  <ImageIcon className="h-4 w-4" /> Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    update("type", "video");
                    setPendingImageFile(null);
                    update("src", "");
                  }}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium transition-colors ${
                    hero.type === "video"
                      ? "bg-primary text-white"
                      : "bg-primary/5 text-primary-dark border-primary/20 border"
                  }`}
                >
                  <Video className="h-4 w-4" /> Video
                </button>
              </div>

              {hero.type === "image" ? (
                <>
                  <div
                    onClick={() => !saving && fileInputRef.current?.click()}
                    className={`border-primary/30 hover:border-primary/60 bg-primary/5 group relative aspect-video w-full cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-colors sm:rounded-3xl ${
                      fieldErrors.src || fieldErrors.media
                        ? "border-red-400"
                        : ""
                    }`}
                  >
                    {hero.src ? (
                      <>
                        <img
                          src={hero.src}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                          <Upload className="h-6 w-6 text-white" />
                          <span className="text-xs font-medium text-white">
                            Change Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-primary/40 group-hover:text-primary absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors">
                        <ImageIcon className="h-10 w-10" />
                        <div className="text-center">
                          <p className="text-xs font-medium">Upload Image</p>
                          <p className="mt-0.5 text-[10px]">16:9 · max 8 MB</p>
                        </div>
                        <Upload className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <FieldError message={fieldErrors.src ?? fieldErrors.media} />
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-text-secondary text-xs">
                    Upload video or enter URL (.mp4)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <Upload className="h-3 w-3" /> Upload File
                  </button>
                  <input
                    value={pendingImageFile ? pendingImageFile.name : hero.src}
                    onChange={(e) => update("src", e.target.value)}
                    placeholder="/videos/animate-video.mp4"
                    disabled={Boolean(pendingImageFile)}
                    className={`${inputClass} ${fieldErrors.src ? inputErrorClass : ""}`}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <FieldError message={fieldErrors.src ?? fieldErrors.media} />
                  {hero.src && !pendingImageFile && (
                    <div className="border-primary/20 mt-2 aspect-video overflow-hidden rounded-2xl border sm:rounded-3xl">
                      <video
                        src={hero.src}
                        className="h-full w-full object-cover"
                        muted
                        autoPlay
                        loop
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-5 sm:space-y-6">
              <div>
                <label className={labelClass}>Title (Optional)</label>
                <input
                  value={hero.title}
                  disabled={saving}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="e.g. Welcome to ORYX"
                  className={`${inputClass} text-base font-medium ${fieldErrors.title ? inputErrorClass : ""}`}
                />
                <FieldError message={fieldErrors.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
