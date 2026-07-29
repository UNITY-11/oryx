"use client";

import { use, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchAttendanceReason } from "@/features/staff/api";
import {
  addAttendance,
  updateStaff,
  useStaffDetail,
} from "@/features/staff/api/use-staff";
import { AttendanceRecord } from "@/features/staff/types";
import {
  hasAttendanceErrors,
  hasStaffFieldErrors,
  validateAttendanceLog,
  validateStaff,
  type StaffFieldErrors,
} from "@/features/staff/validation";
import { formSnapshot, isFormDirty } from "@/shared/lib/form-dirty";
import { ActionPinModal } from "@/shared/ui/action-pin-modal";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Loader2,
  UserCircle2,
} from "lucide-react";

export default function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(new Date());
  const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;

  const { staff, attendance, loading, error, reload, setAttendance, setStaff } =
    useStaffDetail(id, monthString);

  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  const monthName = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceErrors, setAttendanceErrors] = useState<
    Partial<
      Record<"date" | "checkIn" | "checkOut" | "reason" | "status", string>
    >
  >({});
  const [newAttendance, setNewAttendance] = useState<{
    date: string;
    checkIn: string;
    checkOut: string;
    status: "Present" | "Absent" | "Half Day";
    reason: string;
  }>({
    date: "",
    checkIn: "",
    checkOut: "",
    status: "Present",
    reason: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    baseSalary: 0,
    status: "Active" as "Active" | "Inactive",
    joinedDate: "",
  });
  const [editFormSnapshot, setEditFormSnapshot] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<StaffFieldErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(
    null
  );
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);

  const isEditDirty = useMemo(
    () => isFormDirty(editForm, editFormSnapshot),
    [editForm, editFormSnapshot]
  );

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 text-center">
        <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
        <p className="text-text-secondary text-sm">Loading staff details...</p>
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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={reload}
            className="border-primary text-primary hover:bg-primary/5 rounded-full border px-5 py-2.5 text-sm font-semibold"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => router.push("/staff")}
            className="bg-primary rounded-full px-5 py-2.5 text-sm font-semibold text-white"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    const form = {
      name: staff.name,
      role: staff.role,
      email: staff.email || "",
      phone: staff.phone || "",
      baseSalary: staff.baseSalary,
      status: staff.status,
      joinedDate: staff.joinedDate,
    };
    setEditForm(form);
    setEditFormSnapshot(formSnapshot(form));
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleUpdateStaff = async () => {
    if (!isEditDirty) return;
    const errors = validateStaff(editForm);
    if (hasStaffFieldErrors(errors)) {
      setFieldErrors(errors);
      setToast({ type: "error", message: "Please fix the highlighted fields" });
      return;
    }

    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      setIsSaving(true);
      try {
        const updated = await updateStaff(staff.id, {
          ...editForm,
          name: editForm.name.trim(),
          role: editForm.role.trim(),
          phone: editForm.phone.trim(),
          email: editForm.email.trim() || undefined,
        });
        setStaff(updated);
        setIsEditing(false);
        setToast({ type: "success", message: "Staff details updated" });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err instanceof Error ? err.message : "Failed to update staff",
        });
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleLogAttendance = async () => {
    const errors = validateAttendanceLog(newAttendance);
    if (hasAttendanceErrors(errors)) {
      setAttendanceErrors(errors);
      setToast({ type: "error", message: "Please fix attendance fields" });
      return;
    }

    setSavingAttendance(true);
    try {
      const added = await addAttendance({
        staffId: staff.id,
        date: newAttendance.date,
        checkIn:
          newAttendance.status !== "Absent" ? newAttendance.checkIn : undefined,
        checkOut:
          newAttendance.status !== "Absent"
            ? newAttendance.checkOut
            : undefined,
        status: newAttendance.status,
        reason:
          newAttendance.status === "Absent"
            ? newAttendance.reason.trim()
            : undefined,
      });
      setAttendance((prev) => {
        const filtered = prev.filter((a) => a.date !== newAttendance.date);
        const newRecord = {
          ...added,
          checkIn:
            newAttendance.status !== "Absent" ? added.checkIn : undefined,
          checkOut:
            newAttendance.status !== "Absent" ? added.checkOut : undefined,
        };
        return [newRecord, ...filtered];
      });
      setShowAttendanceModal(false);
      setAttendanceErrors({});
      setToast({ type: "success", message: "Attendance saved" });
    } catch (err) {
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to save attendance",
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleDeleteAttendance = async () => {
    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      setSavingAttendance(true);
      try {
        const res = await fetch(
          `/api/staff/${staff.id}/attendance?date=${newAttendance.date}`,
          { method: "DELETE" }
        );
        if (!res.ok) throw new Error("Failed to delete attendance");

        setAttendance((prev) =>
          prev.filter((a) => a.date !== newAttendance.date)
        );
        setShowAttendanceModal(false);
        setToast({ type: "success", message: "Attendance removed" });
      } catch (err) {
        setToast({
          type: "error",
          message:
            err instanceof Error ? err.message : "Failed to delete attendance",
        });
      } finally {
        setSavingAttendance(false);
      }
    });
  };

  const handleDayClick = async (
    dateStr: string,
    record: AttendanceRecord | undefined
  ) => {
    const todayStr = new Date().toISOString().split("T")[0] as string;
    const isFuture = dateStr > todayStr;
    setAttendanceErrors({});

    if (record) {
      setNewAttendance({
        date: dateStr,
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        status: isFuture
          ? "Absent"
          : (record.status as "Present" | "Absent" | "Half Day"),
        reason: "",
      });
      setShowAttendanceModal(true);

      if (record.status === "Absent") {
        try {
          const { reason } = await fetchAttendanceReason(record.id);
          setNewAttendance((prev) =>
            prev.date === dateStr ? { ...prev, reason: reason || "" } : prev
          );
        } catch (err) {
          console.error("Failed to fetch reason", err);
        }
      }
    } else {
      setNewAttendance({
        date: dateStr,
        checkIn: "",
        checkOut: "",
        status: isFuture ? "Absent" : "Present",
        reason: "",
      });
      setShowAttendanceModal(true);
    }
  };

  const totalPresents = attendance.filter((a) => a.status === "Present").length;
  const totalAbsents = attendance.filter((a) => a.status === "Absent").length;
  const totalHours = attendance.reduce(
    (acc, curr) => acc + (curr.totalHours || 0),
    0
  );

  const joinedDate = new Date(staff.joinedDate);
  const canGoPrev =
    currentDate.getFullYear() > joinedDate.getFullYear() ||
    (currentDate.getFullYear() === joinedDate.getFullYear() &&
      currentDate.getMonth() > joinedDate.getMonth());
  const canGoNext = !(
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear()
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-2 sm:pt-4">
      <Toast toast={toast} onClose={closeToast} />

      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
        <div className="border-primary/10 flex shrink-0 items-center gap-2 border-b p-3 sm:gap-3 sm:p-4 md:p-6">
          <MobileMenuButton className="-ml-0" />
          <Link
            href="/staff"
            className="bg-primary/5 border-primary/10 hover:bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="text-primary h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-primary-dark truncate font-serif text-lg font-bold sm:text-2xl">
              {staff.name}
            </h1>
            <p className="text-text-secondary truncate text-[11px] sm:text-sm">
              {staff.role}
            </p>
          </div>
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          <div className="grid min-h-0 grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Profile */}
            <div className="border-primary/10 col-span-1 flex flex-col lg:border-r lg:pr-8">
              <div className="flex flex-col gap-5 sm:gap-6">
                <div className="flex flex-col items-center gap-3 text-center sm:gap-4">
                  <div className="border-primary/5 bg-primary/5 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-sm sm:h-24 sm:w-24">
                    {staff.imageUrl ? (
                      <img
                        src={staff.imageUrl}
                        alt={staff.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="text-primary/40 h-12 w-12" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-primary-dark text-lg font-bold sm:text-xl">
                      {staff.name}
                    </h2>
                    <p className="text-primary text-sm font-semibold">
                      {staff.role}
                    </p>
                    <div className="mt-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase ${
                          staff.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-primary/10 text-primary-dark"
                        }`}
                      >
                        {staff.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="border-primary/10 bg-primary/5 rounded-2xl border p-3.5 sm:p-4">
                    <p className="text-primary/70 mb-1 text-[10px] font-bold tracking-wider uppercase">
                      Email
                    </p>
                    <p className="text-primary-dark truncate text-sm font-semibold">
                      {staff.email || "—"}
                    </p>
                  </div>
                  <div className="border-primary/10 bg-primary/5 rounded-2xl border p-3.5 sm:p-4">
                    <p className="text-primary/70 mb-1 text-[10px] font-bold tracking-wider uppercase">
                      Phone
                    </p>
                    <p className="text-primary-dark text-sm font-semibold">
                      {staff.phone || "—"}
                    </p>
                  </div>
                  <div className="border-primary/20 bg-primary/10 rounded-2xl border p-3.5 sm:p-4">
                    <p className="text-primary/80 mb-1 text-[10px] font-bold tracking-wider uppercase">
                      Monthly Salary
                    </p>
                    <p className="text-primary text-lg font-bold">
                      QAR {staff.baseSalary}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleEditClick}
                    className="bg-primary hover:bg-primary-dark mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-md transition-colors"
                  >
                    <Edit2 className="h-4 w-4" /> Edit Details
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance */}
            <div className="col-span-1 flex min-h-0 flex-col gap-4 sm:gap-6 lg:col-span-2">
              <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                {[
                  {
                    icon: CheckCircle2,
                    value: totalPresents,
                    label: "Total Presents",
                    iconClass: "bg-green-100 text-green-600",
                  },
                  {
                    icon: Calendar,
                    value: totalAbsents,
                    label: "Total Absents",
                    iconClass: "bg-orange-100 text-orange-600",
                  },
                  {
                    icon: Clock,
                    value: `${totalHours}h`,
                    label: "Total Work Hours",
                    iconClass: "bg-primary/10 text-primary",
                  },
                ].map(({ icon: Icon, value, label, iconClass }) => (
                  <div
                    key={label}
                    className="border-primary/10 bg-primary/5 flex items-center gap-3 rounded-2xl border p-3.5 text-left sm:gap-4 sm:p-4"
                  >
                    <div
                      className={`shrink-0 rounded-full p-2.5 sm:p-3 ${iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-primary-dark text-xl leading-none font-bold sm:text-2xl">
                        {value}
                      </h3>
                      <p className="text-primary/70 mt-1 text-[10px] font-bold tracking-wider uppercase">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-1 sm:pt-2">
                <div className="mb-4 flex shrink-0 flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex w-full items-center justify-between gap-3 sm:w-auto">
                    <h3 className="text-primary-dark text-base font-bold sm:text-lg">
                      Attendance
                    </h3>
                    <div className="border-primary/10 bg-primary/5 flex items-center rounded-full border p-1">
                      <button
                        type="button"
                        onClick={prevMonth}
                        disabled={!canGoPrev}
                        className="rounded-full p-1 transition-colors hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="text-primary/70 h-5 w-5" />
                      </button>
                      <span className="text-primary min-w-[120px] px-3 text-center text-xs font-semibold sm:min-w-[130px] sm:px-4 sm:text-sm">
                        {monthName}
                      </span>
                      <button
                        type="button"
                        onClick={nextMonth}
                        disabled={!canGoNext}
                        className="rounded-full p-1 transition-colors hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="text-primary/70 h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="hidden items-center gap-3 text-xs font-semibold sm:flex">
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-green-400" />{" "}
                      Present
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />{" "}
                      Half Day
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />{" "}
                      Absent
                    </span>
                  </div>
                </div>

                <div className="mb-2 grid shrink-0 grid-cols-7 gap-1 sm:gap-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-[10px] font-bold tracking-wider text-gray-500 uppercase sm:text-xs"
                    >
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 pb-4 sm:gap-2">
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map(
                    (_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="rounded-xl bg-transparent"
                      />
                    )
                  )}
                  {Array.from({ length: getDaysInMonth(currentDate) }).map(
                    (_, i) => {
                      const d = i + 1;
                      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                      const record = attendance.find((a) => a.date === dateStr);
                      const isToday =
                        dateStr === new Date().toISOString().split("T")[0];

                      let bgColor =
                        "bg-primary/5 text-primary-dark border-primary/10 hover:border-primary/40 hover:bg-primary/10";
                      if (record?.status === "Present")
                        bgColor =
                          "bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600";
                      if (record?.status === "Absent")
                        bgColor =
                          "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600";
                      if (record?.status === "Half Day")
                        bgColor =
                          "bg-orange-500 text-white border-orange-600 shadow-sm hover:bg-orange-600";

                      return (
                        <button
                          type="button"
                          key={d}
                          onClick={() => handleDayClick(dateStr, record)}
                          className={`flex min-h-[44px] flex-col overflow-hidden rounded-lg border p-1 transition-colors sm:min-h-[50px] sm:rounded-xl sm:p-2 ${bgColor} ${isToday ? "ring-primary ring-2 ring-offset-1 sm:ring-offset-2" : ""}`}
                        >
                          <span
                            className={`text-left text-xs font-bold sm:text-sm ${record ? "text-white" : "text-primary"}`}
                          >
                            {d}
                          </span>
                          {record && (
                            <div
                              className={`mt-auto flex flex-col gap-0 text-[8px] leading-tight font-bold tracking-tight sm:text-[10px] ${
                                record.status === "Present" ||
                                record.status === "Half Day" ||
                                record.status === "Absent"
                                  ? "text-white/90"
                                  : "text-primary-dark"
                              }`}
                            >
                              {record.status !== "Absent" && record.checkIn && (
                                <span className="truncate">
                                  IN: {record.checkIn}
                                </span>
                              )}
                              {record.status !== "Absent" &&
                                record.checkOut && (
                                  <span className="truncate">
                                    OUT: {record.checkOut}
                                  </span>
                                )}
                              {record.status === "Absent" && (
                                <span className="mt-0.5 truncate text-[8px] text-white underline underline-offset-1 opacity-80 sm:text-[9px]">
                                  Details
                                </span>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-[28px] bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6">
            <h2 className="mb-4 font-serif text-lg font-bold sm:text-xl">
              Log Attendance · {newAttendance.date}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Status
                </label>
                <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1">
                  {(["Present", "Half Day", "Absent"] as const).map(
                    (status) => {
                      const isFuture =
                        newAttendance.date >
                        (new Date().toISOString().split("T")[0] as string);
                      if (isFuture && status !== "Absent") return null;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setNewAttendance({ ...newAttendance, status });
                            setAttendanceErrors({});
                          }}
                          className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-bold transition-all sm:px-3 sm:text-xs ${
                            newAttendance.status === status
                              ? status === "Present"
                                ? "bg-green-500 text-white shadow-md"
                                : status === "Half Day"
                                  ? "bg-orange-500 text-white shadow-md"
                                  : "bg-red-500 text-white shadow-md"
                              : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
                          }`}
                        >
                          {status}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {newAttendance.status !== "Absent" && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                      Check In *
                    </label>
                    <input
                      type="time"
                      value={newAttendance.checkIn}
                      onChange={(e) => {
                        setNewAttendance({
                          ...newAttendance,
                          checkIn: e.target.value,
                        });
                        setAttendanceErrors((prev) => {
                          const next = { ...prev };
                          delete next.checkIn;
                          return next;
                        });
                      }}
                      className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-white p-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors outline-none focus:ring-1 ${attendanceErrors.checkIn ? "border-red-400" : ""}`}
                    />
                    {attendanceErrors.checkIn && (
                      <p className="mt-1 text-xs font-medium text-red-500">
                        {attendanceErrors.checkIn}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                      Check Out
                    </label>
                    <input
                      type="time"
                      value={newAttendance.checkOut}
                      onChange={(e) =>
                        setNewAttendance({
                          ...newAttendance,
                          checkOut: e.target.value,
                        })
                      }
                      className="focus:border-primary focus:ring-primary w-full rounded-xl border bg-white p-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors outline-none focus:ring-1"
                    />
                  </div>
                </div>
              )}

              {newAttendance.status === "Absent" && (
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Reason for Absence *
                  </label>
                  <input
                    type="text"
                    placeholder="Required"
                    value={newAttendance.reason}
                    onChange={(e) => {
                      setNewAttendance({
                        ...newAttendance,
                        reason: e.target.value,
                      });
                      setAttendanceErrors((prev) => {
                        const next = { ...prev };
                        delete next.reason;
                        return next;
                      });
                    }}
                    className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-white p-3 text-sm font-semibold text-gray-900 shadow-sm transition-colors outline-none focus:ring-1 ${attendanceErrors.reason ? "border-red-400" : ""}`}
                  />
                  {attendanceErrors.reason && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {attendanceErrors.reason}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="mt-6 flex items-center justify-between gap-2">
              {attendance.some((a) => a.date === newAttendance.date) ? (
                <button
                  type="button"
                  onClick={handleDeleteAttendance}
                  disabled={savingAttendance}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                >
                  Remove
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAttendanceModal(false)}
                  disabled={savingAttendance}
                  className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-gray-200 disabled:opacity-50 sm:px-5"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogAttendance}
                  disabled={savingAttendance}
                  className="bg-primary hover:bg-primary-dark flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-50 sm:px-5"
                >
                  {savingAttendance && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="scrollbar-hide max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 shadow-xl sm:rounded-3xl sm:p-6">
            <h2 className="mb-5 font-serif text-lg font-bold sm:mb-6 sm:text-xl">
              Edit Staff Details
            </h2>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => {
                    setEditForm({ ...editForm, name: e.target.value });
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.name;
                      return next;
                    });
                  }}
                  className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1 ${fieldErrors.name ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Role *
                  </label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => {
                      setEditForm({ ...editForm, role: e.target.value });
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.role;
                        return next;
                      });
                    }}
                    className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1 ${fieldErrors.role ? "border-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.role && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {fieldErrors.role}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value as "Active" | "Inactive",
                      })
                    }
                    className="focus:border-primary focus:ring-primary w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => {
                    setEditForm({ ...editForm, email: e.target.value });
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.email;
                      return next;
                    });
                  }}
                  className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1 ${fieldErrors.email ? "border-red-400" : "border-gray-200"}`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => {
                      setEditForm({ ...editForm, phone: e.target.value });
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.phone;
                        return next;
                      });
                    }}
                    className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1 ${fieldErrors.phone ? "border-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.phone && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                    Salary (QAR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editForm.baseSalary}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        baseSalary: Math.max(0, Number(e.target.value) || 0),
                      });
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.baseSalary;
                        return next;
                      });
                    }}
                    className={`focus:border-primary focus:ring-primary w-full rounded-xl border bg-gray-50 p-3 text-sm font-semibold transition-colors outline-none focus:ring-1 ${fieldErrors.baseSalary ? "border-red-400" : "border-gray-200"}`}
                  />
                  {fieldErrors.baseSalary && (
                    <p className="mt-1 text-xs font-medium text-red-500">
                      {fieldErrors.baseSalary}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2 sm:mt-8 sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="h-11 flex-1 rounded-xl bg-gray-100 px-5 text-sm font-semibold transition-colors hover:bg-gray-200 disabled:opacity-50 sm:h-auto sm:flex-none sm:py-2.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStaff}
                disabled={isSaving || !isEditDirty}
                className="bg-primary hover:bg-primary-dark flex h-11 flex-1 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-colors disabled:opacity-50 sm:h-auto sm:flex-none sm:py-2.5"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Save
                Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {actionToConfirm && (
        <ActionPinModal
          onSuccess={actionToConfirm}
          onCancel={() => setActionToConfirm(null)}
        />
      )}
    </div>
  );
}
