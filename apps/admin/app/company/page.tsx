"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchCompany, saveCompany } from "@/features/company/api";
import {
  EMPTY_COMPANY,
  SOCIAL_PLATFORMS,
  type CompanyInput,
  type SocialLink,
  type SocialPlatform,
} from "@/features/company/types";
import {
  hasFieldErrors,
  toWhatsAppLink,
  validateCompany,
  type FieldErrors,
} from "@/features/company/validation";
import { PhoneInput } from "@/shared/ui/phone-input";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  Building2,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Share2,
  Trash2,
} from "lucide-react";

const inputClass =
  "border-primary/20 focus:border-primary focus:ring-primary/20 w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-all focus:ring-4 disabled:opacity-60";
const labelClass = "text-primary-dark mb-1.5 block text-sm font-medium";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

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

function mapCompanyInput(company: {
  name?: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  socialLinks?: SocialLink[];
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  mapUrl?: string;
  mapEmbedUrl?: string;
  gymMembershipDiscountPercent?: number;
}): CompanyInput {
  return {
    name: company.name || "",
    tagline: company.tagline || "",
    email: company.email || "",
    phone: company.phone || "",
    whatsapp: company.whatsapp || "",
    website: company.website || "",
    socialLinks: (company.socialLinks ?? []).map((link, index) => ({
      id:
        link.id ||
        (link as SocialLink & { _key?: string })._key ||
        `social-${index}`,
      platform: (link.platform as SocialPlatform) || "Other",
      url: link.url || "",
    })),
    addressLine1: company.addressLine1 || "",
    addressLine2: company.addressLine2 || "",
    city: company.city || "",
    state: company.state || "",
    country: company.country || "",
    postalCode: company.postalCode || "",
    mapUrl: company.mapUrl || "",
    mapEmbedUrl: company.mapEmbedUrl || "",
    gymMembershipDiscountPercent: company.gymMembershipDiscountPercent ?? 0,
  };
}

export default function CompanyPage() {
  const [form, setForm] = useState<CompanyInput>(EMPTY_COMPANY);
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");
  const [exists, setExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const closeToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const company = await fetchCompany();
      if (company) {
        const next = mapCompanyInput(company);
        setForm(next);
        setInitialSnapshot(JSON.stringify(next));
        setExists(true);
      } else {
        setForm(EMPTY_COMPANY);
        setInitialSnapshot(JSON.stringify(EMPTY_COMPANY));
        setExists(false);
      }
      setFieldErrors({});
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Failed to load company details"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isDirty = useMemo(
    () => JSON.stringify(form) !== initialSnapshot,
    [form, initialSnapshot]
  );

  const update = <K extends keyof CompanyInput>(
    key: K,
    value: CompanyInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
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

  const handleReset = () => {
    const snapshot = JSON.parse(initialSnapshot) as CompanyInput;
    setForm(snapshot);
    setFieldErrors({});
    setShowResetConfirm(false);
    setToast({ type: "success", message: "Changes discarded" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CompanyInput = {
      ...form,
      socialLinks: form.socialLinks.filter((link) => link.url.trim()),
    };
    const errors = validateCompany(payload);
    if (hasFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      const saved = await saveCompany(payload);
      const next = mapCompanyInput(saved);
      setForm(next);
      setInitialSnapshot(JSON.stringify(next));
      setFieldErrors({});
      setExists(true);
      setToast({
        type: "success",
        message: exists ? "Company details updated" : "Company details created",
      });
    } catch (err) {
      const withFields = err as Error & { fieldErrors?: FieldErrors };
      if (withFields.fieldErrors) {
        setFieldErrors(withFields.fieldErrors);
      }
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save company details",
      });
    } finally {
      setSaving(false);
    }
  };

  const whatsappPreview = toWhatsAppLink(form.whatsapp);

  if (loading) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
        <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
          <div className="text-text-secondary flex flex-1 flex-col items-center justify-center px-4 text-center">
            <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Loading company details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
        <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-7 w-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-primary-dark text-lg font-semibold">
                Couldn&apos;t load company details
              </h2>
              <p className="text-text-secondary mt-1 max-w-sm text-sm">
                {loadError}
              </p>
            </div>
            <button
              type="button"
              onClick={load}
              className="bg-primary inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:opacity-90"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border bg-white shadow-sm sm:rounded-[32px]">
        {/* Header */}
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4 md:px-6 md:py-5 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="text-primary h-5 w-5 shrink-0" />
                <h2 className="text-primary-dark truncate font-serif text-lg font-bold sm:text-xl md:text-2xl">
                  Company Details
                </h2>
              </div>
              <p className="text-text-secondary mt-0.5 line-clamp-2 text-xs sm:mt-1 sm:text-sm">
                {exists
                  ? "Update your spa’s public business profile"
                  : "No company profile yet — fill in the details below to create one"}
              </p>
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex sm:justify-end">
            {isDirty && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={saving}
                className="rounded-full border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              form="company-form"
              disabled={saving || !isDirty}
              className="bg-primary inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : exists ? "Save changes" : "Create profile"}
            </button>
          </div>
        </div>

        {/* Empty hint banner */}
        {!exists && (
          <div className="mx-3 mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 sm:mx-5 sm:mt-4 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm md:mx-6 lg:mx-8">
            Your company profile is empty. Add name, contact, location, and
            WhatsApp so bookings can redirect customers correctly.
          </div>
        )}

        {/* Form */}
        <form
          id="company-form"
          onSubmit={handleSave}
          className="scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto px-3 py-4 sm:space-y-8 sm:px-5 sm:py-6 md:px-6 md:py-8 lg:px-8"
        >
          {/* Brand */}
          <section className="space-y-5">
            <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
              Brand
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-name">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Oryx Spa"
                  className={`${inputClass} ${fieldErrors.name ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.name} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-tagline">
                  Tagline
                </label>
                <input
                  id="company-tagline"
                  value={form.tagline}
                  onChange={(e) => update("tagline", e.target.value)}
                  placeholder="e.g. Luxury wellness in the heart of Doha"
                  className={`${inputClass} ${fieldErrors.tagline ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.tagline} />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-5">
            <h3 className="text-primary-dark flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <Phone className="h-4 w-4" />
              Contact details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="company-email">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="company-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="hello@oryxspa.com"
                  className={`${inputClass} ${fieldErrors.email ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-phone">
                  Phone <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                  id="company-phone"
                  value={form.phone}
                  onChange={(phone) => update("phone", phone)}
                  hasError={Boolean(fieldErrors.phone)}
                  placeholder="4000 0000"
                  className="rounded-xl"
                />
                <FieldError message={fieldErrors.phone} />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-whatsapp">
                  <span className="inline-flex items-center gap-1.5">
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp number <span className="text-red-500">*</span>
                  </span>
                </label>
                <PhoneInput
                  id="company-whatsapp"
                  value={form.whatsapp}
                  onChange={(whatsapp) => update("whatsapp", whatsapp)}
                  hasError={Boolean(fieldErrors.whatsapp)}
                  placeholder="5555 1234"
                  className="rounded-xl"
                />
                <FieldError message={fieldErrors.whatsapp} />
                <p className="text-text-secondary mt-1.5 text-xs">
                  Used to redirect booking messages. Include country code.
                </p>
                {whatsappPreview && (
                  <a
                    href={whatsappPreview}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary mt-2 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    Preview WhatsApp link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
              <div>
                <label className={labelClass} htmlFor="company-website">
                  <span className="inline-flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> Website
                  </span>
                </label>
                <input
                  id="company-website"
                  type="url"
                  value={form.website}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://www.oryxspa.com"
                  className={`${inputClass} ${fieldErrors.website ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.website} />
              </div>
            </div>
          </section>

          {/* Gym membership discount */}
          <section className="space-y-5">
            <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
              Gym membership discount
            </h3>
            <p className="text-text-secondary text-sm">
              Percentage off spa services when a gym membership ID is entered on
              a booking (same franchise). Max 100%.
            </p>
            <div className="max-w-xs">
              <label className={labelClass} htmlFor="gym-discount">
                Discount percentage (%)
              </label>
              <input
                id="gym-discount"
                type="number"
                min={0}
                max={100}
                step={1}
                value={form.gymMembershipDiscountPercent}
                onChange={(e) => {
                  const raw = e.target.value;
                  const parsed = raw === "" ? 0 : Number(raw);
                  update(
                    "gymMembershipDiscountPercent",
                    Number.isFinite(parsed)
                      ? Math.min(100, Math.max(0, parsed))
                      : 0
                  );
                }}
                className={`${inputClass} ${fieldErrors.gymMembershipDiscountPercent ? "border-red-400" : ""}`}
              />
              <FieldError message={fieldErrors.gymMembershipDiscountPercent} />
            </div>
          </section>

          {/* Social media */}
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-primary-dark flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
                <Share2 className="h-4 w-4" />
                Social media links
              </h3>
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
                  No social links yet. Add Facebook, Instagram, and other
                  profiles.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {form.socialLinks.map((link) => (
                  <div
                    key={link.id}
                    className="border-primary/10 grid grid-cols-1 gap-3 rounded-2xl border bg-gray-50/50 p-3 sm:grid-cols-[180px_1fr_auto] sm:items-start sm:p-4"
                  >
                    <div>
                      <label className={labelClass}>Platform</label>
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
                    </div>
                    <div>
                      <label className={labelClass}>Profile URL</label>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) =>
                          updateSocialLink(link.id, { url: e.target.value })
                        }
                        placeholder="https://instagram.com/oryxspa"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex justify-end sm:pt-7">
                      <button
                        type="button"
                        onClick={() => removeSocialLink(link.id)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 text-red-500 transition-colors hover:bg-red-50"
                        title="Remove link"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <FieldError message={fieldErrors.socialLinks} />
          </section>

          {/* Location */}
          <section className="space-y-5">
            <h3 className="text-primary-dark flex items-center gap-2 text-sm font-bold tracking-wider uppercase">
              <MapPin className="h-4 w-4" />
              Location details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-address1">
                  Address line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-address1"
                  value={form.addressLine1}
                  onChange={(e) => update("addressLine1", e.target.value)}
                  placeholder="Building, street"
                  className={`${inputClass} ${fieldErrors.addressLine1 ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.addressLine1} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-address2">
                  Address line 2
                </label>
                <input
                  id="company-address2"
                  value={form.addressLine2}
                  onChange={(e) => update("addressLine2", e.target.value)}
                  placeholder="Floor, landmark (optional)"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-city">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-city"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Doha"
                  className={`${inputClass} ${fieldErrors.city ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.city} />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-state">
                  State / Area
                </label>
                <input
                  id="company-state"
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  placeholder="West Bay"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-country">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  id="company-country"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="Qatar"
                  className={`${inputClass} ${fieldErrors.country ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.country} />
              </div>
              <div>
                <label className={labelClass} htmlFor="company-postal">
                  Postal code
                </label>
                <input
                  id="company-postal"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  placeholder="00000"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Map */}
          <section className="space-y-5">
            <h3 className="text-primary-dark text-sm font-bold tracking-wider uppercase">
              Map details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-map-url">
                  Google Maps link
                </label>
                <input
                  id="company-map-url"
                  type="url"
                  value={form.mapUrl}
                  onChange={(e) => update("mapUrl", e.target.value)}
                  placeholder="https://maps.google.com/..."
                  className={`${inputClass} ${fieldErrors.mapUrl ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.mapUrl} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor="company-map-embed">
                  Map embed URL
                </label>
                <input
                  id="company-map-embed"
                  type="url"
                  value={form.mapEmbedUrl}
                  onChange={(e) => update("mapEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?..."
                  className={`${inputClass} ${fieldErrors.mapEmbedUrl ? "border-red-400" : ""}`}
                />
                <FieldError message={fieldErrors.mapEmbedUrl} />
                <p className="text-text-secondary mt-1.5 text-xs">
                  Paste the iframe src from Google Maps → Share → Embed a map.
                </p>
              </div>
            </div>

            {form.mapEmbedUrl && !fieldErrors.mapEmbedUrl && (
              <div className="border-primary/10 overflow-hidden rounded-3xl border">
                <iframe
                  title="Company location map"
                  src={form.mapEmbedUrl}
                  className="h-56 w-full sm:h-72 md:h-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            )}
          </section>

          <div className="border-primary/10 hidden flex-col-reverse gap-3 border-t pt-6 sm:flex sm:flex-row sm:justify-end">
            {isDirty && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={saving}
                className="rounded-full border border-gray-200 px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                Discard changes
              </button>
            )}
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-sm hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : exists ? "Save changes" : "Create profile"}
            </button>
          </div>
        </form>

        {/* Sticky mobile save bar */}
        <div className="border-primary/10 shrink-0 border-t bg-white p-3 sm:hidden">
          <div className="flex gap-2">
            {isDirty && (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={saving}
                className="h-11 flex-1 rounded-full border border-gray-200 text-sm font-medium text-gray-600 disabled:opacity-50"
              >
                Discard
              </button>
            )}
            <button
              type="submit"
              form="company-form"
              disabled={saving || !isDirty}
              className="bg-primary flex h-11 min-w-0 flex-[1.4] items-center justify-center gap-2 rounded-full text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saving ? "Saving…" : exists ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </div>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="border-primary/10 w-full max-w-sm rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6">
            <h3 className="text-primary-dark font-serif text-lg font-bold">
              Discard changes?
            </h3>
            <p className="text-text-secondary mt-2 text-sm">
              Unsaved edits will be lost. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="h-11 flex-1 rounded-full bg-gray-50 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="h-11 flex-1 rounded-full bg-red-500 text-sm font-semibold text-white hover:bg-red-600"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
