"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import {
  deleteService,
  fetchService,
  updateService,
  uploadServiceImage,
} from "@features/services/api";
import { Service, ServiceOption } from "@features/services/types";
import {
  hasServiceFieldErrors,
  isOptionComplete,
  parseOptionalDuration,
  parsePositivePrice,
  validateService,
  validateServiceImageFile,
  type OptionFieldErrors,
  type ServiceFieldErrors,
} from "@features/services/validation";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  CheckCircle,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

const fieldLabel =
  "text-text-secondary mb-2 block text-[11px] font-semibold tracking-wider uppercase";
const fieldControl =
  "border-primary/30 focus:border-primary text-primary-dark h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none transition-colors focus:ring-4 focus:ring-primary/10 sm:rounded-2xl";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [service, setService] = useState<Service | null>(null);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ServiceFieldErrors>({});
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const optionsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchService(id)
      .then((data) => {
        const normalized = { ...data, featured: data.featured ?? false };
        setService(normalized);
        setInitialSnapshot(formSnapshot(normalized));
        setPendingImageFile(null);
      })
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const isDirty = useMemo(
    () => isFormDirty(service, initialSnapshot) || Boolean(pendingImageFile),
    [service, initialSnapshot, pendingImageFile]
  );

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center gap-3 px-4">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-sm">Loading service...</p>
      </div>
    );
  }

  if (loadError || !service) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <p className="text-base">{loadError ?? "Service not found."}</p>
        <button
          onClick={() => router.push("/services")}
          className="text-primary text-sm font-medium underline"
        >
          Back to Services
        </button>
      </div>
    );
  }

  const update = <K extends keyof Service>(key: K, value: Service[K]) => {
    setService((prev) => (prev ? { ...prev, [key]: value } : prev));
    setFieldErrors((prev) => {
      if (!prev[key as keyof ServiceFieldErrors]) return prev;
      const next = { ...prev };
      delete next[key as keyof ServiceFieldErrors];
      return next;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaError = validateServiceImageFile(file);
    if (mediaError) {
      setFieldErrors((prev) => ({ ...prev, image: mediaError }));
      setSaveError(mediaError);
      e.target.value = "";
      return;
    }

    setFieldErrors((prev) => {
      if (!prev.image) return prev;
      const next = { ...prev };
      delete next.image;
      return next;
    });
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };

  const addOption = () => {
    const current = service.options || [];
    if (current.some((o) => !isOptionComplete(o))) return;
    update("options", [
      ...current,
      { id: `a-${Date.now()}`, name: "", price: 0, duration: undefined },
    ]);
    setTimeout(() => {
      if (optionsScrollRef.current) {
        optionsScrollRef.current.scrollTop =
          optionsScrollRef.current.scrollHeight;
      }
    }, 50);
  };

  const removeOption = (optionId: string) =>
    update(
      "options",
      (service.options || []).filter((a) => a.id !== optionId)
    );

  const updateOption = (
    optionId: string,
    field: keyof ServiceOption,
    value: string | number | undefined
  ) => {
    update(
      "options",
      (service.options || []).map((a) =>
        a.id === optionId ? { ...a, [field]: value } : a
      )
    );
    setFieldErrors((prev) => {
      const fieldName = field as keyof OptionFieldErrors;
      if (!prev.optionErrors?.[optionId]?.[fieldName]) {
        return prev;
      }
      const nextOptionErrors = { ...prev.optionErrors };
      const optionError = { ...nextOptionErrors[optionId] };
      delete optionError[fieldName];
      if (Object.keys(optionError).length === 0) {
        delete nextOptionErrors[optionId];
      } else {
        nextOptionErrors[optionId] = optionError;
      }
      const next: ServiceFieldErrors = {
        ...prev,
        optionErrors: nextOptionErrors,
      };
      if (Object.keys(nextOptionErrors).length === 0) {
        delete next.optionErrors;
        delete next.options;
      }
      return next;
    });
  };

  const canSave = !saving && isDirty;

  const handleSave = async () => {
    if (!isDirty) return;

    const errors = validateService(service, {
      hasPendingImage: Boolean(pendingImageFile),
    });
    if (hasServiceFieldErrors(errors)) {
      setFieldErrors(errors);
      setSaveError("Please fix the highlighted fields");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setFieldErrors({});
    try {
      let imageUrl = service.image;
      if (pendingImageFile) {
        imageUrl = await uploadServiceImage(pendingImageFile);
      }
      const result = await updateService(id, { ...service, image: imageUrl });
      setService(result);
      setInitialSnapshot(formSnapshot(result));
      setPendingImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      const error = err as Error & { fieldErrors?: ServiceFieldErrors };
      if (error.fieldErrors) setFieldErrors(error.fieldErrors);
      setSaveError(error.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteService(id);
      router.push("/services");
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to delete service"
      );
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden pt-4 sm:gap-4">
      {/* Header */}
      <header className="border-primary/10 flex shrink-0 items-center gap-2 rounded-2xl border bg-white px-2.5 py-2 shadow-sm sm:gap-3 sm:rounded-3xl sm:px-4 sm:py-2.5 md:px-5">
        <MobileMenuButton className="-ml-0" />
        <button
          type="button"
          onClick={() => router.push("/services")}
          className="text-text-secondary hover:text-primary-dark hover:bg-primary/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
          aria-label="Back to services"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-primary truncate font-serif text-base leading-tight font-medium uppercase sm:text-xl md:text-2xl">
            Service Details
          </h1>
          {service.name ? (
            <p className="text-text-secondary mt-0.5 truncate text-xs sm:text-sm">
              {service.name}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-primary/25 text-primary hover:bg-primary/5 inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition-colors sm:px-4"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            type="button"
            onClick={() =>
              update(
                "status",
                service.status === "Active" ? "Inactive" : "Active"
              )
            }
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition-colors sm:px-4 ${
              service.status === "Active"
                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
            title={service.status}
          >
            {service.status === "Active" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">{service.status}</span>
          </button>

          <button
            type="button"
            onClick={() => update("featured", !service.featured)}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full border px-2.5 text-sm font-semibold transition-colors sm:px-4 ${
              service.featured
                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
            title={service.featured ? "Featured" : "Normal"}
          >
            <Star
              className={`h-4 w-4 ${service.featured ? "fill-current" : ""}`}
            />
            <span className="hidden sm:inline">
              {service.featured ? "Featured" : "Normal"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-45 sm:px-5 ${
              saved
                ? "bg-green-500 text-white"
                : "bg-primary text-white hover:opacity-90"
            }`}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Saving" : saved ? "Saved" : "Save"}</span>
          </button>
        </div>
      </header>

      {/* Body card */}
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[28px]">
        <div className="scrollbar-hide flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8">
            {saveError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-red-50 px-3.5 py-3 text-sm text-red-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8 lg:gap-10">
              {/* Image */}
              <div className="mx-auto w-full max-w-[200px] shrink-0 sm:max-w-[220px] md:mx-0 md:w-[220px] lg:w-[240px]">
                <label className={fieldLabel}>Service Image</label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/30 hover:border-primary/60 bg-primary/5 group focus:ring-primary/10 relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-dashed transition-colors focus:ring-4 focus:outline-none"
                >
                  {service.image ? (
                    <>
                      <img
                        src={service.image}
                        alt={service.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 text-white opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                        <Upload className="h-5 w-5" />
                        <span className="text-xs font-medium">Change</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-primary/40 group-hover:text-primary absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center transition-colors">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-xs font-medium">Upload image</span>
                      <span className="text-[10px] opacity-70">
                        3:4 recommended
                      </span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <FieldError message={fieldErrors.image} />
              </div>

              {/* Fields */}
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div className="min-w-0">
                  <label className={fieldLabel} htmlFor="service-name">
                    Service Name
                  </label>
                  <input
                    id="service-name"
                    value={service.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="e.g. Signature Massage"
                    maxLength={100}
                    className={`${fieldControl} font-medium ${
                      fieldErrors.name ? "border-red-400" : ""
                    }`}
                  />
                  <FieldError message={fieldErrors.name} />
                </div>

                <div>
                  <label className={fieldLabel} htmlFor="service-description">
                    Description
                  </label>
                  <textarea
                    id="service-description"
                    value={service.description}
                    onChange={(e) => update("description", e.target.value)}
                    rows={4}
                    maxLength={3000}
                    placeholder="Describe the service experience..."
                    className={`border-primary/30 focus:border-primary text-primary-dark placeholder:text-primary/30 focus:ring-primary/10 min-h-[112px] w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm transition-colors outline-none focus:ring-4 sm:rounded-2xl ${
                      fieldErrors.description ? "border-red-400" : ""
                    }`}
                  />
                  <FieldError message={fieldErrors.description} />
                </div>

                <div>
                  <div className="mb-2.5 flex h-5 items-center justify-between gap-3">
                    <label className="text-text-secondary text-[11px] font-semibold tracking-wider uppercase">
                      Service Options
                    </label>
                    {(service.options?.length ?? 0) > 0 && (
                      <span className="text-text-secondary text-xs tabular-nums">
                        {service.options.length}
                      </span>
                    )}
                  </div>
                  <FieldError message={fieldErrors.options} />

                  {!service.options || service.options.length === 0 ? (
                    <div className="border-primary/25 text-text-secondary flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-4 py-8 text-center">
                      <p className="text-sm">No options added yet</p>
                      <button
                        type="button"
                        onClick={addOption}
                        className="bg-primary inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-4 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Option
                      </button>
                    </div>
                  ) : (
                    <div className="border-primary/15 overflow-hidden rounded-2xl border">
                      <div className="text-text-secondary border-primary/10 hidden grid-cols-[minmax(0,1.4fr)_72px_88px_36px] gap-2 border-b bg-gray-50/80 px-3 py-2 text-[10px] font-semibold tracking-wider uppercase lg:grid">
                        <span>Name</span>
                        <span className="text-center">Mins</span>
                        <span className="text-center">QAR</span>
                        <span />
                      </div>

                      <div
                        ref={optionsScrollRef}
                        className="divide-primary/10 scrollbar-hide max-h-[320px] divide-y overflow-y-auto sm:max-h-[380px]"
                      >
                        {(service.options || []).map((option) => (
                          <div
                            key={option.id}
                            className="grid grid-cols-1 gap-2.5 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-3 lg:grid-cols-[minmax(0,1.4fr)_72px_88px_36px] lg:items-center lg:gap-2 lg:px-3 lg:py-2"
                          >
                            <div className="min-w-0">
                              <label className="text-text-secondary mb-1.5 block text-[10px] font-semibold uppercase lg:hidden">
                                Name
                              </label>
                              <input
                                value={option.name}
                                onChange={(e) =>
                                  updateOption(
                                    option.id,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g. Hot Stone"
                                maxLength={80}
                                className={`border-primary/20 focus:border-primary text-primary-dark focus:ring-primary/10 h-10 w-full rounded-xl border bg-white px-3 text-sm outline-none focus:ring-2 lg:h-9 lg:border-transparent lg:bg-transparent lg:px-1 lg:focus:ring-0 ${
                                  fieldErrors.optionErrors?.[option.id]?.name
                                    ? "border-red-400"
                                    : ""
                                }`}
                              />
                              <FieldError
                                message={
                                  fieldErrors.optionErrors?.[option.id]?.name
                                }
                              />
                            </div>

                            <div className="grid grid-cols-[1fr_1fr_36px] items-end gap-2 sm:w-[220px] sm:shrink-0 lg:contents">
                              <div>
                                <label className="text-text-secondary mb-1.5 block text-[10px] font-semibold uppercase lg:hidden">
                                  Mins
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={option.duration ?? ""}
                                  onChange={(e) =>
                                    updateOption(
                                      option.id,
                                      "duration",
                                      parseOptionalDuration(e.target.value)
                                    )
                                  }
                                  placeholder="—"
                                  className={`border-primary/20 focus:border-primary text-primary-dark focus:ring-primary/10 h-10 w-full rounded-xl border bg-white px-2 text-center text-sm outline-none focus:ring-2 lg:h-9 lg:border-transparent lg:bg-transparent lg:focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                    fieldErrors.optionErrors?.[option.id]
                                      ?.duration
                                      ? "border-red-400"
                                      : ""
                                  }`}
                                />
                                <FieldError
                                  message={
                                    fieldErrors.optionErrors?.[option.id]
                                      ?.duration
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-text-secondary mb-1.5 block text-[10px] font-semibold uppercase lg:hidden">
                                  QAR
                                </label>
                                <input
                                  type="number"
                                  min={0}
                                  step={0.01}
                                  value={option.price === 0 ? "" : option.price}
                                  onChange={(e) =>
                                    updateOption(
                                      option.id,
                                      "price",
                                      parsePositivePrice(e.target.value)
                                    )
                                  }
                                  placeholder="0"
                                  className={`border-primary/20 focus:border-primary text-primary-dark focus:ring-primary/10 h-10 w-full rounded-xl border bg-white px-2 text-center text-sm font-medium outline-none focus:ring-2 lg:h-9 lg:border-transparent lg:bg-transparent lg:focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
                                    fieldErrors.optionErrors?.[option.id]?.price
                                      ? "border-red-400"
                                      : ""
                                  }`}
                                />
                                <FieldError
                                  message={
                                    fieldErrors.optionErrors?.[option.id]?.price
                                  }
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeOption(option.id)}
                                className="text-primary/35 flex h-10 w-9 items-center justify-center rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 lg:h-9 lg:w-9"
                                aria-label="Remove option"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-primary/10 border-t bg-gray-50/70 p-2">
                        <button
                          type="button"
                          onClick={addOption}
                          disabled={(service.options || []).some(
                            (o) => !isOptionComplete(o)
                          )}
                          className="text-primary hover:bg-primary/5 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Option
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="border-primary/10 w-full max-w-sm rounded-3xl border bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="bg-primary/10 text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-primary-dark font-serif text-lg font-semibold">
                Delete Service
              </h3>
            </div>
            <p className="text-text-secondary mb-5 text-sm leading-relaxed">
              Are you sure you want to delete this service? This cannot be
              undone.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
                className="border-primary/20 text-primary hover:bg-primary/5 h-11 flex-1 rounded-full border text-sm font-semibold transition-colors"
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
