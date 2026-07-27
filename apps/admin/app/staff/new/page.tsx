"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createStaff } from "@/features/staff/api/use-staff";
import {
  hasStaffFieldErrors,
  validateStaff,
  type StaffFieldErrors,
  type StaffFormData,
} from "@/features/staff/validation";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  ArrowLeft,
  Briefcase,
  Calendar,
  ChevronDown,
  DollarSign,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";

const DEFAULT_FORM: StaffFormData = {
  name: "",
  role: "",
  phone: "",
  email: "",
  baseSalary: 0,
  status: "Active",
  joinedDate: new Date().toISOString().split("T")[0] || "",
};

const inputClass =
  "border-primary/10 focus:border-primary/40 focus:ring-primary/10 w-full rounded-2xl border bg-white py-2.5 pr-4 pl-11 text-sm font-medium outline-none transition-all focus:ring-4 disabled:opacity-60";
const inputErrorClass =
  "border-red-400 focus:border-red-500 focus:ring-red-100";
const labelClass =
  "text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase";
const errorClass = "mt-1.5 text-xs font-medium text-red-500";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className={errorClass}>{message}</p>;
}

export default function NewStaffPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [formData, setFormData] = useState<StaffFormData>(DEFAULT_FORM);
  const [fieldErrors, setFieldErrors] = useState<StaffFieldErrors>({});
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const update = <K extends keyof StaffFormData>(
    key: K,
    value: StaffFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreate = async () => {
    const errors = validateStaff(formData);
    if (hasStaffFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setSaving(true);
    try {
      const newStaff = await createStaff({
        ...formData,
        name: formData.name.trim(),
        role: formData.role.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
      });
      setToast({ type: "success", message: "Staff registered successfully" });
      setTimeout(() => router.push(`/staff/${newStaff.id}`), 800);
    } catch (err) {
      setToast({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to create staff",
      });
      setSaving(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="shrink-0 pb-3 sm:pb-4">
        <header className="border-primary/10 flex w-full flex-col gap-3 rounded-2xl border bg-white px-3 py-3 shadow-sm sm:rounded-3xl sm:px-4 sm:py-4 md:flex-row md:items-center md:justify-between md:gap-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton className="-ml-0" />
            <Link
              href="/staff"
              className="border-primary/10 text-primary hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-primary truncate font-serif text-lg font-bold sm:text-xl md:text-2xl">
                Register New Staff
              </h1>
              <p className="text-text-secondary truncate text-[11px] font-medium sm:text-sm">
                Add a new employee to the salon system
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-bold text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:shrink-0 sm:px-6 sm:py-2.5"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? "Registering…" : "Register Staff"}
          </button>
        </header>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pb-6">
        <div className="border-primary/10 rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[2rem] sm:p-5 md:p-6">
          <h2 className="text-text-primary mb-5 flex items-center gap-3 text-base font-bold sm:mb-6 sm:text-lg">
            <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full font-serif">
              1
            </span>
            Personal Details
          </h2>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div>
              <label className={labelClass}>Full Name *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <User className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="text"
                  disabled={saving}
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={`${inputClass} ${fieldErrors.name ? inputErrorClass : ""}`}
                  placeholder="e.g. Sarah Williams"
                />
              </div>
              <FieldError message={fieldErrors.name} />
            </div>

            <div>
              <label className={labelClass}>
                Email{" "}
                <span className="font-normal text-gray-400 normal-case">
                  (Optional)
                </span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Mail className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="email"
                  disabled={saving}
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`${inputClass} ${fieldErrors.email ? inputErrorClass : ""}`}
                  placeholder="sarah@example.com"
                />
              </div>
              <FieldError message={fieldErrors.email} />
            </div>

            <div>
              <label className={labelClass}>Phone Number *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Phone className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="tel"
                  disabled={saving}
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={`${inputClass} ${fieldErrors.phone ? inputErrorClass : ""}`}
                  placeholder="+974 5555 1234"
                />
              </div>
              <FieldError message={fieldErrors.phone} />
            </div>
          </div>

          <div className="via-primary/10 mb-6 h-px w-full bg-gradient-to-r from-transparent to-transparent" />

          <h2 className="text-text-primary mb-5 flex items-center gap-3 text-base font-bold sm:mb-6 sm:text-lg">
            <span className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full font-serif">
              2
            </span>
            Employment Profile
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <div>
              <label className={labelClass}>Job Title *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Briefcase className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="text"
                  disabled={saving}
                  value={formData.role}
                  onChange={(e) => update("role", e.target.value)}
                  className={`${inputClass} ${fieldErrors.role ? inputErrorClass : ""}`}
                  placeholder="e.g. Senior Hairstylist"
                />
              </div>
              <FieldError message={fieldErrors.role} />
            </div>

            <div>
              <label className={labelClass}>Joined Date *</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <Calendar className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="date"
                  disabled={saving}
                  value={formData.joinedDate}
                  onChange={(e) => update("joinedDate", e.target.value)}
                  className={`${inputClass} ${fieldErrors.joinedDate ? inputErrorClass : ""}`}
                />
              </div>
              <FieldError message={fieldErrors.joinedDate} />
            </div>

            <div>
              <label className={labelClass}>Monthly Salary (QAR)</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                  <DollarSign className="text-primary/40 h-5 w-5" />
                </div>
                <input
                  type="number"
                  min={0}
                  disabled={saving}
                  value={formData.baseSalary}
                  onChange={(e) =>
                    update(
                      "baseSalary",
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className={`${inputClass} ${fieldErrors.baseSalary ? inputErrorClass : ""}`}
                />
              </div>
              <FieldError message={fieldErrors.baseSalary} />
            </div>

            <div>
              <label className={labelClass}>Account Status</label>
              <div className="relative">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`border-primary/10 text-text-primary flex w-full cursor-pointer items-center justify-between rounded-2xl border bg-white px-4 py-2.5 text-sm font-medium transition-all outline-none ${fieldErrors.status ? inputErrorClass : ""}`}
                >
                  <span>
                    {formData.status === "Active"
                      ? "Active Employee"
                      : "Inactive"}
                  </span>
                  <ChevronDown
                    className={`text-primary/40 h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsDropdownOpen(false)}
                    />
                    <div className="border-primary/10 absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-2xl border bg-white py-1 shadow-lg">
                      {(["Active", "Inactive"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            update("status", status);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                            formData.status === status
                              ? "bg-primary/10 text-primary"
                              : "text-text-primary hover:bg-gray-50"
                          }`}
                        >
                          {status === "Active" ? "Active Employee" : "Inactive"}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <FieldError message={fieldErrors.status} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
