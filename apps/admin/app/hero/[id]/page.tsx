"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  deleteHeroItem,
  fetchHeroItemById,
  updateHeroItem,
} from "@/features/hero/api";
import { HeroItem } from "@/features/hero/types";
import {
  hasHeroFieldErrors,
  validateHero,
  validateHeroMediaFile,
  type HeroFieldErrors,
} from "@/features/hero/validation";
import { uploadServiceImage } from "@/features/services/api";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  ArrowLeft,
  ImageIcon,
  Loader2,
  Save,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

type EditHeroState = Omit<HeroItem, "createdAt">;

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

export default function EditHeroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = React.use(params);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hero, setHero] = useState<EditHeroState | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<HeroFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);

  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    fetchHeroItemById(id)
      .then((data) => {
        setHero(data);
        setInitialSnapshot(formSnapshot(data));
        setPendingImageFile(null);
        setFieldErrors({});
      })
      .catch((err) =>
        setLoadError(
          err instanceof Error ? err.message : "Failed to load hero slide"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const update = <K extends keyof EditHeroState>(
    key: K,
    value: EditHeroState[K]
  ) => {
    setHero((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => {
      if (!prev[key as keyof HeroFieldErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof HeroFieldErrors];
      return next;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hero) return;

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

  const isDirty = useMemo(() => {
    if (!hero) return false;
    return isFormDirty(hero, initialSnapshot) || Boolean(pendingImageFile);
  }, [hero, initialSnapshot, pendingImageFile]);

  const handleUpdate = async () => {
    if (!hero || !isDirty) return;

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

      const result = await updateHeroItem(hero.id, {
        ...hero,
        src: srcUrl,
        title: hero.title.trim(),
        subtitle: hero.subtitle?.trim(),
      });
      setHero(result);
      setInitialSnapshot(formSnapshot(result));
      setPendingImageFile(null);
      setFieldErrors({});
      setToast({ type: "success", message: "Hero slide saved" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save changes",
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!hero) return;
    try {
      setSaving(true);
      await deleteHeroItem(hero.id);
      setToast({ type: "success", message: "Hero slide deleted" });
      router.push("/hero");
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to delete slide",
      });
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading hero slide...</p>
      </div>
    );
  }

  if (loadError || !hero) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="text-primary-dark mb-1 text-lg font-semibold">
          Slide unavailable
        </p>
        <p className="text-text-secondary mb-5 max-w-sm text-sm">
          {loadError ?? "This hero slide could not be found."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={load}
            className="border-primary text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.push("/hero")}
            className="bg-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Hero
          </button>
        </div>
      </div>
    );
  }

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
                {hero.title || "Hero slide"}
              </h1>
              <p className="text-text-secondary truncate text-[11px] capitalize sm:text-xs">
                {hero.type} slide · order {hero.order}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving}
              className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={handleUpdate}
              disabled={saving || !isDirty}
              className="bg-primary inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 sm:px-5 sm:text-sm"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? "Saving…" : "Save"}</span>
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
                  }}
                  disabled={saving}
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
                  }}
                  disabled={saving}
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
                    disabled={saving}
                    className="bg-primary/10 hover:bg-primary/20 text-primary inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-xs font-semibold transition-colors"
                  >
                    <Upload className="h-3 w-3" /> Upload File
                  </button>
                  <input
                    value={pendingImageFile ? pendingImageFile.name : hero.src}
                    onChange={(e) => update("src", e.target.value)}
                    placeholder="/videos/animate-video.mp4"
                    disabled={Boolean(pendingImageFile) || saving}
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

              <div>
                <label className={labelClass}>Subtitle (Optional)</label>
                <input
                  value={hero.subtitle || ""}
                  disabled={saving}
                  onChange={(e) => update("subtitle", e.target.value)}
                  placeholder="e.g. The ultimate relaxation experience."
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-primary/10 w-full max-w-md rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 md:p-8">
            <div className="mb-3 flex items-center gap-3 sm:mb-4 sm:gap-4">
              <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-primary-dark font-serif text-lg font-semibold sm:text-xl">
                Delete Slide
              </h3>
            </div>
            <p className="text-text-secondary mb-6 text-sm leading-relaxed sm:mb-8">
              Are you sure you want to delete{" "}
              <span className="text-primary-dark font-semibold">
                {hero.title || "this slide"}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={saving}
                className="bg-primary flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
