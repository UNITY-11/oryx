"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  updateStaff,
  useStaffDetail,
  useStaffServiceHistory,
} from "@/features/staff/api/use-staff";
import type { StaffHistoryRange } from "@/features/staff/types";
import {
  hasStaffFieldErrors,
  validateStaff,
  type StaffFieldErrors,
} from "@/features/staff/validation";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { PhoneInput } from "@/shared/ui/phone-input";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Calendar,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";

const RANGE_OPTIONS: { key: StaffHistoryRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
  { key: "year", label: "This year" },
  { key: "custom", label: "Custom" },
];

const inputClass =
  "border-primary/10 focus:border-primary/40 focus:ring-primary/10 w-full rounded-2xl border bg-white py-2.5 px-4 text-sm font-medium outline-none transition-all focus:ring-4";
const labelClass =
  "text-text-secondary mb-1.5 block text-xs font-bold tracking-widest uppercase";

function formatDisplayDate(iso: string) {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m?.[1] || !m[2] || !m[3]) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDisplayTime(time: string) {
  const match24 = time.match(/^(\d{1,2}):(\d{2})$/);
  if (match24?.[1] && match24[2]) {
    let hours = Number(match24[1]);
    const minutes = match24[2];
    const period = hours >= 12 ? "PM" : "AM";
    if (hours === 0) hours = 12;
    else if (hours > 12) hours -= 12;
    return `${hours}:${minutes} ${period}`;
  }
  return time;
}

export default function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { staff, loading, error, reload, setStaff } = useStaffDetail(id);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<StaffFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
    email: "",
    status: "Active" as "Active" | "Inactive",
    joinedDate: "",
    baseSalary: 0,
  });
  const [savedSnapshot, setSavedSnapshot] = useState("");

  const [range, setRange] = useState<StaffHistoryRange>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const history = useStaffServiceHistory(id, range, customFrom, customTo);

  useEffect(() => {
    if (!staff) return;
    const next = {
      name: staff.name,
      role: staff.role,
      phone: staff.phone,
      email: staff.email ?? "",
      status: staff.status,
      joinedDate: staff.joinedDate,
      baseSalary: staff.baseSalary ?? 0,
    };
    setForm(next);
    setSavedSnapshot(formSnapshot(next));
    setEditing(false);
    setFieldErrors({});
  }, [staff]);

  const dirty = editing && isFormDirty(form, savedSnapshot);

  const updateField = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSave = async () => {
    const errors = validateStaff(form);
    if (hasStaffFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }
    setSaving(true);
    try {
      const updated = await updateStaff(id, {
        name: form.name.trim(),
        role: form.role.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        status: form.status,
        joinedDate: form.joinedDate,
        baseSalary: form.baseSalary,
      });
      setStaff(updated);
      setSavedSnapshot(formSnapshot(form));
      setEditing(false);
      setToast({ type: "success", message: "Staff details saved" });
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-text-secondary flex h-full flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading staff…</p>
      </div>
    );
  }

  if (error || !staff) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
        <p className="text-primary-dark mb-1 text-lg font-semibold">
          Staff unavailable
        </p>
        <p className="text-text-secondary mb-5 max-w-sm text-sm">
          {error ?? "This staff member could not be found."}
        </p>
        <button
          type="button"
          onClick={() => router.push("/staff")}
          className="bg-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to Staff
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        {/* Sticky header */}
        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-b px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:py-4 md:px-6 md:py-5">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <button
              type="button"
              onClick={() => router.push("/staff")}
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back to staff"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold sm:h-11 sm:w-11">
              {staff.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-primary-dark truncate font-serif text-base font-medium sm:text-xl">
                {staff.name}
              </h1>
              <p className="text-text-secondary truncate text-[11px] sm:text-xs">
                {staff.role} · {staff.status}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="border-primary text-primary hover:bg-primary/5 rounded-full border px-4 py-2.5 text-sm font-semibold"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setForm({
                      name: staff.name,
                      role: staff.role,
                      phone: staff.phone,
                      email: staff.email ?? "",
                      status: staff.status,
                      joinedDate: staff.joinedDate,
                      baseSalary: staff.baseSalary ?? 0,
                    });
                    setFieldErrors({});
                    setEditing(false);
                  }}
                  className="text-text-secondary hover:bg-primary/5 rounded-full px-4 py-2.5 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving || !dirty}
                  onClick={handleSave}
                  className="bg-primary inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 md:p-6 lg:p-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 sm:gap-8">
            {/* Profile */}
            <section className="space-y-4 sm:space-y-5">
              <h2 className="text-primary-dark font-serif text-lg sm:text-xl">
                Profile details
              </h2>

              {editing ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                  <div className="min-w-0">
                    <label className={labelClass}>Full name</label>
                    <div className="relative">
                      <User className="text-text-secondary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        className={`${inputClass} pl-10 ${fieldErrors.name ? "border-red-400" : ""}`}
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                      />
                    </div>
                    {fieldErrors.name && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass}>Designation</label>
                    <div className="relative">
                      <Briefcase className="text-text-secondary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        className={`${inputClass} pl-10 ${fieldErrors.role ? "border-red-400" : ""}`}
                        value={form.role}
                        onChange={(e) => updateField("role", e.target.value)}
                      />
                    </div>
                    {fieldErrors.role && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {fieldErrors.role}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 sm:col-span-2">
                    <label className={labelClass}>Phone</label>
                    <PhoneInput
                      value={form.phone}
                      onChange={(v) => updateField("phone", v)}
                      hasError={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass}>Email</label>
                    <div className="relative">
                      <Mail className="text-text-secondary absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                      <input
                        type="email"
                        className={`${inputClass} pl-10 ${fieldErrors.email ? "border-red-400" : ""}`}
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass}>Joined date</label>
                    <input
                      type="date"
                      className={`${inputClass} ${fieldErrors.joinedDate ? "border-red-400" : ""}`}
                      value={form.joinedDate}
                      onChange={(e) =>
                        updateField("joinedDate", e.target.value)
                      }
                    />
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass}>Status</label>
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(e) =>
                        updateField(
                          "status",
                          e.target.value as "Active" | "Inactive"
                        )
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="border-primary/10 flex min-w-0 items-start gap-3 rounded-2xl border bg-[#fcf4f0] p-4">
                    <Phone className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
                        Phone
                      </p>
                      <p className="text-primary-dark text-sm font-medium break-all">
                        {staff.phone}
                      </p>
                    </div>
                  </div>
                  <div className="border-primary/10 flex min-w-0 items-start gap-3 rounded-2xl border bg-[#fcf4f0] p-4">
                    <Mail className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
                        Email
                      </p>
                      <p className="text-primary-dark text-sm font-medium break-all">
                        {staff.email?.trim() || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="border-primary/10 flex min-w-0 items-start gap-3 rounded-2xl border bg-[#fcf4f0] p-4">
                    <Briefcase className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
                        Designation
                      </p>
                      <p className="text-primary-dark text-sm font-medium">
                        {staff.role}
                      </p>
                    </div>
                  </div>
                  <div className="border-primary/10 flex min-w-0 items-start gap-3 rounded-2xl border bg-[#fcf4f0] p-4">
                    <Calendar className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <p className="text-text-secondary text-[10px] font-bold tracking-wider uppercase">
                        Joined
                      </p>
                      <p className="text-primary-dark text-sm font-medium">
                        {formatDisplayDate(staff.joinedDate)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <div className="via-primary/10 h-px w-full bg-gradient-to-r from-transparent to-transparent" />

            {/* History */}
            <section className="space-y-4 sm:space-y-5">
              <div className="flex flex-col gap-3 sm:gap-4">
                <h2 className="text-primary-dark font-serif text-lg sm:text-xl">
                  Service history
                </h2>
                <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] sm:flex-wrap sm:overflow-visible [&::-webkit-scrollbar]:hidden">
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setRange(opt.key)}
                      className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                        range === opt.key
                          ? "bg-primary text-white shadow-sm"
                          : "border-primary/10 text-primary hover:bg-primary/5 border bg-[#fcf4f0]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {range === "custom" && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="min-w-0">
                    <label className={labelClass}>From</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                    />
                  </div>
                  <div className="min-w-0">
                    <label className={labelClass}>To</label>
                    <input
                      type="date"
                      className={inputClass}
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {history.loading ? (
                <div className="text-text-secondary flex items-center justify-center gap-2 py-12 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading history…
                </div>
              ) : history.error ? (
                <div className="flex flex-wrap items-center justify-center gap-2 py-10 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{history.error}</span>
                  <button
                    type="button"
                    onClick={history.reload}
                    className="text-primary text-xs font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              ) : history.items.length === 0 ? (
                <p className="text-text-secondary py-12 text-center text-sm">
                  No services found for this period.
                </p>
              ) : (
                <>
                  <div className="space-y-3 md:hidden">
                    {history.items.map((item) => (
                      <div
                        key={item.id}
                        className="border-primary/10 space-y-2.5 rounded-2xl border bg-[#fcf4f0] p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <p className="text-primary-dark truncate text-sm font-semibold">
                              {item.serviceName}
                            </p>
                            {item.options.length > 0 && (
                              <p className="text-text-secondary text-xs">
                                {item.options.join(", ")}
                              </p>
                            )}
                          </div>
                          <span className="bg-primary/10 text-primary shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                            {item.status}
                          </span>
                        </div>
                        <div className="text-text-secondary space-y-1 text-xs">
                          <p>
                            {formatDisplayDate(item.date)} ·{" "}
                            {formatDisplayTime(item.time)}
                          </p>
                          <p className="text-primary-dark truncate font-medium">
                            {item.customerName}
                          </p>
                        </div>
                        <Link
                          href={`/bookings/${item.bookingId}`}
                          className="text-primary inline-block pt-0.5 text-xs font-semibold underline"
                        >
                          {item.bookingCode ?? "View booking"}
                        </Link>
                      </div>
                    ))}
                  </div>

                  <div className="border-primary/10 hidden overflow-hidden rounded-2xl border md:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead>
                          <tr className="text-text-secondary bg-[#fcf4f0] text-[10px] font-bold tracking-wider uppercase">
                            <th className="px-4 py-3 font-bold">Date</th>
                            <th className="px-4 py-3 font-bold">Time</th>
                            <th className="px-4 py-3 font-bold">Service</th>
                            <th className="px-4 py-3 font-bold">Customer</th>
                            <th className="px-4 py-3 font-bold">Status</th>
                            <th className="px-4 py-3 font-bold">Booking</th>
                          </tr>
                        </thead>
                        <tbody>
                          {history.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-primary/5 border-t"
                            >
                              <td className="text-primary-dark px-4 py-3.5 whitespace-nowrap">
                                {formatDisplayDate(item.date)}
                              </td>
                              <td className="text-text-secondary px-4 py-3.5 whitespace-nowrap">
                                {formatDisplayTime(item.time)}
                              </td>
                              <td className="text-primary-dark max-w-[200px] px-4 py-3.5">
                                <p className="truncate font-medium">
                                  {item.serviceName}
                                </p>
                                {item.options.length > 0 && (
                                  <p className="text-text-secondary truncate text-xs">
                                    {item.options.join(", ")}
                                  </p>
                                )}
                              </td>
                              <td className="text-primary-dark max-w-[160px] truncate px-4 py-3.5">
                                {item.customerName}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                                  {item.status}
                                </span>
                              </td>
                              <td className="px-4 py-3.5">
                                <Link
                                  href={`/bookings/${item.bookingId}`}
                                  className="text-primary text-xs font-semibold underline"
                                >
                                  {item.bookingCode ?? "View"}
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
