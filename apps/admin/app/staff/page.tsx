"use client";

import { Suspense, useCallback, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { addAttendance, useStaff } from "@/features/staff/api/use-staff";
import { ListPagination, usePagination } from "@/shared/ui/list-pagination";
import { Toast, type ToastState } from "@/shared/ui/toast";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Plus,
  UserCircle2,
  X,
} from "lucide-react";

function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [h = 0, m = 0] = value
    ? value.split(":").map(Number)
    : [new Date().getHours(), new Date().getMinutes()];
  const isPM = h >= 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;

  const handleHourChange = (delta: number) => {
    let newH = h + delta;
    if (newH < 0) newH += 24;
    if (newH >= 24) newH -= 24;
    onChange(
      `${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  };

  const handleMinuteChange = (delta: number) => {
    let newM = m + delta;
    let newH = h;
    if (newM < 0) {
      newM = 59;
      newH -= 1;
    }
    if (newM >= 60) {
      newM = 0;
      newH += 1;
    }
    if (newH < 0) newH += 24;
    if (newH >= 24) newH -= 24;
    onChange(
      `${newH.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`
    );
  };

  const toggleAmPm = () => {
    const newH = (h + 12) % 24;
    onChange(
      `${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 select-none sm:gap-3">
      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => handleHourChange(1)}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="text-text-primary border-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gray-50 text-xl font-medium shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
          {hour12.toString().padStart(2, "0")}
        </div>
        <button
          type="button"
          onClick={() => handleHourChange(-1)}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <span className="pb-2 text-2xl font-bold text-gray-300">:</span>

      <div className="flex flex-col items-center gap-1">
        <button
          type="button"
          onClick={() => handleMinuteChange(1)}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="text-text-primary border-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gray-50 text-xl font-medium shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
          {m.toString().padStart(2, "0")}
        </div>
        <button
          type="button"
          onClick={() => handleMinuteChange(-1)}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <div className="ml-1 flex flex-col items-center gap-1 sm:ml-2">
        <button
          type="button"
          onClick={toggleAmPm}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronUp className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <div className="text-primary border-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl border bg-gray-50 text-lg font-bold shadow-sm sm:h-16 sm:w-16 sm:text-xl">
          {isPM ? "PM" : "AM"}
        </div>
        <button
          type="button"
          onClick={toggleAmPm}
          className="hover:text-primary rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100"
        >
          <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
    </div>
  );
}

function calculateTotalHours(checkIn: string, checkOut: string): string {
  const [inH = 0, inM = 0] = checkIn.split(":").map(Number);
  const [outH = 0, outM = 0] = checkOut.split(":").map(Number);

  let diff = outH * 60 + outM - (inH * 60 + inM);
  if (diff < 0) diff += 24 * 60;

  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

function formatTimeLabel(time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const isPM = h >= 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;
}

function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

function StaffList() {
  const { staffList, loading, error, refresh } = useStaff();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [modalState, setModalState] = useState<{
    open: boolean;
    staffId: string | null;
    staffName: string;
    type: "Present" | "Exit" | "Absent" | null;
    editTime: boolean;
    customTime: string;
    reason: string;
  }>({
    open: false,
    staffId: null,
    staffName: "",
    type: null,
    editTime: false,
    customTime: "",
    reason: "",
  });

  const filteredStaff = staffList.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.phone ?? "").includes(searchTerm)
  );
  const {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    from,
    to,
    hasPrev,
    hasNext,
  } = usePagination(filteredStaff, 20, searchTerm);

  const openModal = (
    staffId: string,
    staffName: string,
    type: "Present" | "Exit" | "Absent"
  ) => {
    setModalState({
      open: true,
      staffId,
      staffName,
      type,
      editTime: false,
      customTime: nowTime(),
      reason: "",
    });
  };

  const handleConfirm = async () => {
    if (!modalState.staffId || !modalState.type) return;
    if (modalState.type === "Absent" && !modalState.reason.trim()) {
      setToast({
        type: "error",
        message: "Please provide a reason for absence.",
      });
      return;
    }

    const staffId = modalState.staffId;
    const actionType = modalState.type;
    const timeToLog = modalState.editTime ? modalState.customTime : nowTime();

    setActionLoading(staffId + actionType);
    setModalState((prev) => ({ ...prev, open: false }));

    try {
      const today = new Date().toISOString().split("T")[0] as string;

      if (actionType === "Present") {
        await addAttendance({
          staffId,
          date: today,
          checkIn: timeToLog,
          status: "Present",
        });
        setToast({
          type: "success",
          message: `Checked in ${modalState.staffName} at ${formatTimeLabel(timeToLog)}`,
        });
      } else if (actionType === "Exit") {
        await addAttendance({
          staffId,
          date: today,
          checkOut: timeToLog,
          status: "Present",
        });
        setToast({
          type: "success",
          message: `Checked out ${modalState.staffName} at ${formatTimeLabel(timeToLog)}`,
        });
      } else {
        await addAttendance({
          staffId,
          date: today,
          status: "Absent",
          reason: modalState.reason.trim(),
        });
        setToast({
          type: "success",
          message: `Marked ${modalState.staffName} absent`,
        });
      }

      await refresh();
    } catch (err) {
      console.error(err);
      setToast({
        type: "error",
        message: "Failed to save attendance. Try again.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Toast toast={toast} onClose={closeToast} />

      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto pt-2 sm:pt-4">
        {loading ? (
          <div className="text-text-secondary flex h-56 flex-col items-center justify-center px-4 text-center">
            <Loader2 className="text-primary mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Loading staff...</p>
          </div>
        ) : error ? (
          <div className="border-primary/10 flex h-56 flex-col items-center justify-center rounded-2xl border bg-white px-4 text-center shadow-sm sm:rounded-3xl">
            <AlertCircle className="mb-3 h-8 w-8 text-red-500" />
            <p className="text-primary-dark text-sm font-semibold">
              Couldn’t load staff
            </p>
            <p className="text-text-secondary mt-1 max-w-sm text-xs">{error}</p>
            <button
              type="button"
              onClick={refresh}
              className="bg-primary mt-4 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
            >
              Try again
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="border-primary/15 flex h-56 flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-4 text-center sm:rounded-3xl">
            <UserCircle2 className="text-primary/30 mb-3 h-12 w-12" />
            <p className="text-primary-dark text-sm font-semibold">
              {searchTerm ? "No matching staff" : "No staff members yet"}
            </p>
            <p className="text-text-secondary mt-1 max-w-sm text-xs">
              {searchTerm
                ? "Try a different search term."
                : "Register your first employee to track attendance."}
            </p>
            {!searchTerm && (
              <Link
                href="/staff/new"
                className="bg-primary mt-4 inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Staff
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 sm:gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedItems.map((staff) => (
              <div
                key={staff.id}
                className="border-primary/10 group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all sm:rounded-[2rem]"
              >
                <Link
                  href={`/staff/${staff.id}`}
                  className="flex flex-1 flex-col items-center p-4 text-center sm:p-6"
                >
                  <div className="border-primary/5 ring-primary/5 bg-primary/5 mb-4 flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white shadow-sm ring-4 sm:mb-5 sm:h-24 sm:w-24">
                    {staff.imageUrl ? (
                      <img
                        src={staff.imageUrl}
                        alt={staff.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserCircle2 className="text-primary/40 h-10 w-10" />
                    )}
                  </div>
                  <h3 className="text-text-primary group-hover:text-primary mb-1 font-serif text-lg font-bold transition-colors sm:text-xl">
                    {staff.name}
                  </h3>
                  <p className="text-primary/60 text-[10px] font-bold tracking-widest uppercase sm:text-xs">
                    {staff.role}
                  </p>
                  <span
                    className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      staff.status === "Active"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {staff.status}
                  </span>
                </Link>

                <div className="flex items-center justify-center gap-2 border-t border-gray-50 px-4 pt-4 pb-4 sm:px-6 sm:pt-5 sm:pb-6">
                  {!staff.todayAttendance && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          openModal(staff.id, staff.name, "Present")
                        }
                        disabled={actionLoading !== null}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-200/50 bg-green-50 py-2.5 text-xs font-bold text-green-700 shadow-sm transition-all hover:bg-green-100 disabled:opacity-50"
                      >
                        {actionLoading === staff.id + "Present" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Check In
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openModal(staff.id, staff.name, "Absent")
                        }
                        disabled={actionLoading !== null}
                        className="border-primary/10 bg-primary/5 text-primary-dark hover:bg-primary/10 flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2.5 text-xs font-bold shadow-sm transition-all disabled:opacity-50"
                      >
                        {actionLoading === staff.id + "Absent" ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Absent
                      </button>
                    </>
                  )}

                  {staff.todayAttendance?.status === "Present" &&
                    !staff.todayAttendance?.checkOut && (
                      <div className="flex w-full flex-col items-center gap-1.5">
                        <span className="flex items-center justify-center gap-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          IN:{" "}
                          <span className="text-black">
                            {staff.todayAttendance.checkIn}
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            openModal(staff.id, staff.name, "Exit")
                          }
                          disabled={actionLoading !== null}
                          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-orange-200/50 bg-orange-50 py-2.5 text-xs font-bold text-orange-700 shadow-sm transition-all hover:bg-orange-100 disabled:opacity-50"
                        >
                          {actionLoading === staff.id + "Exit" ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          Check Out
                        </button>
                      </div>
                    )}

                  {(staff.todayAttendance?.status === "Absent" ||
                    (staff.todayAttendance?.status === "Present" &&
                      staff.todayAttendance?.checkOut) ||
                    staff.todayAttendance?.status === "Half Day") && (
                    <div className="flex w-full flex-col items-center gap-1 pb-1">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-bold ${
                          staff.todayAttendance.status === "Present"
                            ? "text-green-600"
                            : staff.todayAttendance.status === "Half Day"
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                      >
                        {staff.todayAttendance.status === "Present" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : staff.todayAttendance.status === "Half Day" ? (
                          <Clock className="h-3.5 w-3.5" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        {staff.todayAttendance.status}
                      </span>
                      {(staff.todayAttendance.checkIn ||
                        staff.todayAttendance.checkOut) && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="mt-0.5 flex items-center justify-center gap-2 text-[10px] font-bold tracking-wide text-black">
                            {staff.todayAttendance.checkIn && (
                              <span>IN: {staff.todayAttendance.checkIn}</span>
                            )}
                            {staff.todayAttendance.checkIn &&
                              staff.todayAttendance.checkOut && <span>•</span>}
                            {staff.todayAttendance.checkOut && (
                              <span>OUT: {staff.todayAttendance.checkOut}</span>
                            )}
                          </span>
                          {staff.todayAttendance.checkIn &&
                            staff.todayAttendance.checkOut && (
                              <span className="bg-primary/5 text-primary mt-1 rounded-full px-2.5 py-1 text-xs font-bold">
                                Total:{" "}
                                {calculateTotalHours(
                                  staff.todayAttendance.checkIn,
                                  staff.todayAttendance.checkOut
                                )}
                              </span>
                            )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && totalItems > 0 && (
          <div className="border-primary/10 mb-4 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <ListPagination
              page={page}
              totalPages={totalPages}
              totalItems={totalItems}
              from={from}
              to={to}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:px-4">
          <div className="border-primary/10 w-full max-w-sm rounded-t-[28px] border bg-white p-5 shadow-2xl sm:rounded-[2rem] sm:p-8">
            <h3 className="text-primary mb-2 text-center font-serif text-xl sm:text-2xl">
              {modalState.type === "Present"
                ? "Check In"
                : modalState.type === "Exit"
                  ? "Check Out"
                  : "Mark Absent"}
            </h3>
            <p className="text-text-secondary mb-5 text-center text-sm sm:mb-6">
              {modalState.staffName}
            </p>

            <div className="space-y-5">
              {modalState.type === "Absent" ? (
                <div>
                  <label className="text-primary/60 mb-3 block text-center text-xs font-semibold tracking-widest uppercase">
                    Reason for Absence *
                  </label>
                  <textarea
                    value={modalState.reason}
                    onChange={(e) =>
                      setModalState((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    placeholder="E.g., Sick leave, Personal emergency..."
                    className="border-primary/10 text-text-primary focus:border-primary/40 focus:ring-primary/10 min-h-[100px] w-full resize-none rounded-2xl border bg-gray-50 p-4 text-sm font-medium transition-all outline-none focus:bg-white focus:ring-4"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-center">
                  {!modalState.editTime ? (
                    <>
                      <p className="text-primary/60 mb-3 text-xs font-semibold tracking-widest uppercase">
                        Time
                      </p>
                      <p className="text-text-primary mb-4 font-serif text-3xl">
                        {formatTimeLabel(modalState.customTime || nowTime())}
                      </p>
                      <p className="text-text-secondary mb-4 text-sm">
                        Using current time
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          setModalState((prev) => ({
                            ...prev,
                            editTime: true,
                            customTime: prev.customTime || nowTime(),
                          }))
                        }
                        className="text-primary text-sm font-semibold hover:underline"
                      >
                        Edit time
                      </button>
                    </>
                  ) : (
                    <>
                      <label className="text-primary/60 mb-3 block text-xs font-semibold tracking-widest uppercase">
                        Custom Time
                      </label>
                      <div className="pt-2">
                        <TimePicker
                          value={modalState.customTime}
                          onChange={(val) =>
                            setModalState((prev) => ({
                              ...prev,
                              customTime: val,
                            }))
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setModalState((prev) => ({
                            ...prev,
                            editTime: false,
                            customTime: nowTime(),
                          }))
                        }
                        className="text-primary mt-4 text-sm font-semibold hover:underline"
                      >
                        Use current time
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-2.5 sm:mt-8 sm:gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalState((prev) => ({ ...prev, open: false }))
                }
                disabled={actionLoading !== null}
                className="text-text-secondary h-11 flex-1 rounded-full bg-gray-50 text-sm font-semibold transition-colors hover:bg-gray-100 disabled:opacity-50 sm:h-auto sm:py-3.5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={actionLoading !== null}
                className="bg-primary shadow-primary/20 h-11 flex-1 rounded-full text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-50 sm:h-auto sm:py-3.5"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StaffPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
        </div>
      }
    >
      <StaffList />
    </Suspense>
  );
}
