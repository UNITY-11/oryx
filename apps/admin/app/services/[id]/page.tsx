"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteService,
  fetchService,
  updateService,
  uploadServiceImage,
} from "@features/services/api";
import { Service, ServiceCategory, ServiceOption } from "@features/services/types";
import {
  AlertCircle,
  ArrowLeft,
  Ban,
  Check,
  CheckCircle,
  ChevronDown,
  Clock,
  ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

const CATEGORIES: ServiceCategory[] = [
  "Massage",
  "Facial",
  "Body Treatment",
  "Hair",
  "Nails",
  "Package",
];

/* ── Custom Category Dropdown ── */
function CategoryDropdown({
  value,
  onChange,
}: {
  value: ServiceCategory;
  onChange: (v: ServiceCategory) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="border-primary/40 hover:border-primary focus:border-primary text-primary-dark flex w-full items-center justify-between rounded-2xl border bg-transparent px-4 py-3 text-sm transition-colors focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown
          className={`text-primary/60 h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white shadow-xl">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
              className={`hover:bg-primary/5 flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${cat === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{cat}</span>
              {cat === value && <Check className="text-primary h-4 w-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchService(id)
      .then((data) => setService(data))
      .catch((err) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p>Loading service...</p>
      </div>
    );
  }

  if (loadError || !service) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="mb-4 text-lg">{loadError ?? "Service not found."}</p>
        <button
          onClick={() => router.push("/services")}
          className="text-primary text-sm underline"
        >
          Back to Services
        </button>
      </div>
    );
  }

  const update = <K extends keyof Service>(key: K, value: Service[K]) =>
    setService((prev) => (prev ? { ...prev, [key]: value } : prev));

  /* Image */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => update("image", reader.result as string);
    reader.readAsDataURL(file);
  };


  /* ServiceOptions */
  const addOption = () => {
    const current = service.options || [];
    if (current.some((o) => !o.name.trim())) return;
    update("options", [
      ...current,
      { id: `a-${Date.now()}`, name: "", price: 0 },
    ]);
  };
  const removeOption = (id: string) =>
    update(
      "options",
      (service.options || []).filter((a) => a.id !== id)
    );
  const updateOption = (
    id: string,
    field: keyof ServiceOption,
    value: string | number
  ) =>
    update(
      "options",
      (service.options || []).map((a) => (a.id === id ? { ...a, [field]: value } : a))
    );

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      let imageUrl = service.image;
      if (pendingImageFile) {
        imageUrl = await uploadServiceImage(pendingImageFile);
      }
      const payload = { ...service, image: imageUrl };
      const result = await updateService(id, payload);
      setService(result);
      setPendingImageFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to save changes"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      await deleteService(id as string);
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
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Top Bar */}
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-6 py-5 md:px-8">
          <button
            onClick={() => router.push("/services")}
            className="text-text-secondary hover:text-primary-dark group flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Services
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`rounded-full border px-4 py-1.5 text-xs font-medium ${
                service.status === "Active"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-100 text-gray-500"
              }`}
            >
              {service.status}
            </div>

            <button
              onClick={() =>
                update(
                  "status",
                  service.status === "Active" ? "Inactive" : "Active"
                )
              }
              className="text-primary hover:bg-primary/5 border-primary flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              {service.status === "Active" ? (
                <>
                  <Ban className="h-4 w-4" />
                  Disable
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Enable
                </>
              )}
            </button>

            <button
              onClick={handleDelete}
              className="text-primary hover:bg-primary/5 border-primary flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium shadow-sm transition-all disabled:opacity-60 ${
                saved
                  ? "bg-green-500 text-white"
                  : "bg-primary text-white hover:opacity-90"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="scrollbar-hide flex-1 overflow-auto p-6 md:p-8">
          {saveError && (
            <div className="mx-auto mb-6 flex max-w-5xl items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}
          <div className="mx-auto flex max-w-5xl flex-col gap-8 lg:flex-row">
            {/* LEFT — Image + Basic Info */}
            <div className="flex shrink-0 flex-col gap-6 lg:w-72">
              {/* Image Frame 3:4 */}
              <div>
                <label className="text-text-secondary mb-3 block text-sm font-medium">
                  Service Image
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-primary/30 hover:border-primary/60 bg-primary/5 group relative w-full cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-colors"
                  style={{ aspectRatio: "3/4" }}
                >
                  {service.image ? (
                    <>
                      <img
                        src={service.image}
                        alt={service.name}
                        className="h-full w-full object-cover"
                      />
                      <div className="bg-primary-dark/40 absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
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
                        <p className="mt-0.5 text-[10px]">
                          3:4 ratio recommended
                        </p>
                      </div>
                      <Upload className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <p className="text-text-secondary mt-2 text-center text-[10px]">
                  Click to choose from gallery
                </p>
              </div>


            </div>

            {/* RIGHT — Details */}
            <div className="min-w-0 flex-1 space-y-8">
              {/* Name & Category */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Service Name
                  </label>
                  <input
                    value={service.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="border-primary/40 focus:border-primary text-primary-dark w-full rounded-2xl border bg-transparent px-4 py-3 text-base font-medium focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                    Category
                  </label>
                  <CategoryDropdown
                    value={service.category}
                    onChange={(v) => update("category", v)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-semibold tracking-wider uppercase">
                  Description
                </label>
                <textarea
                  value={service.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={5}
                  placeholder="Describe the service experience..."
                  className="border-primary/40 focus:border-primary text-primary-dark placeholder:text-primary/30 w-full resize-none rounded-2xl border bg-transparent px-4 py-3 text-sm focus:outline-none"
                />
              </div>



              {/* ServiceOptions */}
              <div>
                <div className="mb-3">
                  <label className="text-text-secondary text-xs font-semibold tracking-wider uppercase">
                    Service Options
                  </label>
                </div>
                {(!service.options || service.options.length === 0) ? (
                  <div className="border-primary/40 text-text-secondary flex flex-col items-center justify-center rounded-2xl border border-dashed p-8 text-center text-sm">
                    <p className="mb-3">No options added yet.</p>
                    <button
                      onClick={addOption}
                      className="bg-primary hover:bg-primary-dark rounded-full px-5 py-2 text-xs font-semibold text-white transition-colors"
                    >
                      <Plus className="mr-1 inline-block h-3 w-3" /> Add Service Option
                    </button>
                  </div>
                ) : (
                  <div className="border-primary/20 overflow-hidden rounded-2xl border">
                    <div className="text-text-secondary border-primary/10 grid grid-cols-[1fr_130px_44px] border-b bg-gray-50 px-4 py-3 text-[10px] tracking-wider uppercase">
                      <span>Name</span>
                      <span>Price (QAR)</span>
                      <span />
                    </div>
                    <div className="divide-primary/10 divide-y">
                      {(service.options || []).map((option) => (
                        <div
                          key={option.id}
                          className="grid grid-cols-[1fr_130px_44px] items-center gap-2 bg-white px-4 py-2"
                        >
                          <input
                            value={option.name}
                            onChange={(e) =>
                              updateOption(option.id, "name", e.target.value)
                            }
                            placeholder="e.g. Hot Stone"
                            className="text-primary-dark w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
                          />
                          <input
                            type="number"
                            value={option.price === 0 ? "" : option.price}
                            onChange={(e) =>
                              updateOption(
                                option.id,
                                "price",
                                Number(e.target.value)
                              )
                            }
                            placeholder="0"
                            className="text-primary-dark w-full bg-transparent px-2 py-2 text-sm font-medium focus:outline-none"
                          />
                          <button
                            onClick={() => removeOption(option.id)}
                            className="text-primary/40 hover:text-red-500 flex justify-center transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="border-primary/10 border-t bg-gray-50 p-2">
                      <button
                        onClick={addOption}
                        className="text-primary hover:bg-primary/5 flex w-full items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                        disabled={(service.options || []).some(o => !o.name.trim())}
                      >
                        <Plus className="h-4 w-4" /> Add Option
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm duration-200">
          <div className="animate-in zoom-in-95 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl duration-200 md:p-8">
            <div className="mb-4 flex items-center gap-4">
              <div className="bg-primary/10 text-primary rounded-full p-3">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-primary-dark font-serif text-xl font-semibold">
                Delete Service
              </h3>
            </div>
            <p className="text-text-secondary mb-8">
              Are you sure you want to completely delete this service? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="border-primary/20 text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 font-medium transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={saving}
                className="bg-primary hover:bg-primary-dark flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Delete Service"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
