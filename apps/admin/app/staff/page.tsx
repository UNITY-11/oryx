"use client";

import { useStaff, addAttendance } from "@/features/staff/api/use-staff";
import { UserCircle2, Loader2, Check, X, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { TopHeader } from "@/shared/ui/top-header";
import { Staff, AttendanceRecord } from "@/features/staff/types";

function StaffList() {
  const { staffList, loading } = useStaff();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const filteredStaff = staffList.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [modalState, setModalState] = useState<{
    open: boolean;
    staffId: string | null;
    type: "Present" | "Exit" | "Absent" | null;
    timeMode: "Now" | "Custom";
    customTime: string;
    reason: string;
  }>({ open: false, staffId: null, type: null, timeMode: "Now", customTime: "", reason: "" });

  const handleActionConfirm = async () => {
    if (!modalState.staffId || !modalState.type) return;
    if (modalState.type === "Absent" && !modalState.reason.trim()) {
      alert("Please provide a reason for absence.");
      return;
    }
    
    setActionLoading(modalState.staffId + modalState.type);
    setModalState(prev => ({ ...prev, open: false }));
    try {
      const today = new Date().toISOString().split("T")[0] as string;
      const timeToLog = modalState.timeMode === "Now" 
        ? new Date().toTimeString().slice(0, 5)
        : modalState.customTime;
        
      if (modalState.type === "Present") {
        await addAttendance({
          staffId: modalState.staffId,
          date: today,
          checkIn: timeToLog,
          status: "Present",
        });
      } else if (modalState.type === "Exit") {
        await addAttendance({
          staffId: modalState.staffId,
          date: today,
          checkOut: timeToLog,
          status: "Present",
        });
      } else if (modalState.type === "Absent") {
        await addAttendance({
          staffId: modalState.staffId,
          date: today,
          status: "Absent",
          reason: modalState.reason.trim(),
        });
      }
      alert(`Action '${modalState.type}' logged successfully!`);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to log action.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto px-1 md:px-2 pt-4">
        <div className="w-full">

          {loading ? (
            <div className="flex py-20 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 pb-6">
              {filteredStaff.length === 0 ? (
                <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-3xl border border-primary/10 flex flex-col items-center justify-center gap-2">
                  <UserCircle2 className="w-12 h-12 text-gray-300" />
                  <p className="font-medium text-lg">No staff members found</p>
                </div>
              ) : (
                filteredStaff.map((staff) => (
                  <Link 
                    href={`/staff/${staff.id}`} 
                    key={staff.id} 
                    className="group relative bg-white rounded-[2rem] border border-primary/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                      <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/5 border-4 border-white ring-4 ring-primary/5 shadow-sm overflow-hidden mb-5">
                        {staff.imageUrl ? (
                          <img src={staff.imageUrl} alt={staff.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 className="h-10 w-10 text-primary/40" />
                        )}
                      </div>
                      <h3 className="text-text-primary font-serif font-bold text-xl mb-1 group-hover:text-primary transition-colors">{staff.name}</h3>
                      <p className="text-primary/60 text-xs font-bold uppercase tracking-widest mb-6">{staff.role}</p>

                      <div 
                        className="mt-auto w-full flex items-center justify-center gap-2 pt-5 border-t border-gray-50"
                        onClick={(e) => e.preventDefault()} // Prevent clicking actions from navigating
                      >
                        {!staff.todayAttendance && (
                          <>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalState({ open: true, staffId: staff.id, type: "Present", timeMode: "Now", customTime: new Date().toTimeString().slice(0, 5), reason: "" })}}
                              disabled={actionLoading !== null}
                              className="flex-1 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-semibold transition-all flex justify-center items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg"
                              title="Check In"
                            >
                              {actionLoading === staff.id + "Present" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Check In
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalState({ open: true, staffId: staff.id, type: "Absent", timeMode: "Now", customTime: "", reason: "" })}}
                              disabled={actionLoading !== null}
                              className="flex-1 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-semibold transition-all flex justify-center items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg"
                              title="Mark Absent"
                            >
                              {actionLoading === staff.id + "Absent" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />} Absent
                            </button>
                          </>
                        )}

                        {staff.todayAttendance?.status === "Present" && !staff.todayAttendance?.checkOut && (
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalState({ open: true, staffId: staff.id, type: "Exit", timeMode: "Now", customTime: new Date().toTimeString().slice(0, 5), reason: "" })}}
                            disabled={actionLoading !== null}
                            className="w-full py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-semibold transition-all flex justify-center items-center gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg"
                            title="Check Out"
                          >
                            {actionLoading === staff.id + "Exit" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />} Check Out
                          </button>
                        )}

                        {(staff.todayAttendance?.status === "Absent" || (staff.todayAttendance?.status === "Present" && staff.todayAttendance?.checkOut)) && (
                          <span className="w-full py-2.5 text-center text-xs font-bold tracking-wide text-white bg-primary rounded-xl shadow-md shadow-primary/20">
                            Done for today
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {modalState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl border border-white/20">
            <h3 className="text-2xl font-serif text-primary mb-6 text-center">
              {modalState.type === "Present" ? "Check In" : modalState.type === "Exit" ? "Check Out" : "Mark Absent"}
            </h3>
            
            <div className="space-y-6">
              {modalState.type === "Absent" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-primary/60 text-xs uppercase tracking-widest font-semibold mb-3 block text-center">
                    Reason for Absence
                  </label>
                  <textarea
                    value={modalState.reason}
                    onChange={(e) => setModalState(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="E.g., Sick leave, Personal emergency..."
                    className="w-full p-4 bg-gray-50 border border-primary/10 rounded-2xl text-sm font-medium text-text-primary outline-none focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all min-h-[100px] resize-none"
                  />
                </div>
              ) : (
                <>
                  <div className="flex p-1.5 bg-gray-100/80 rounded-2xl">
                    <button 
                      onClick={() => setModalState(prev => ({ ...prev, timeMode: "Now" }))}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${modalState.timeMode === "Now" ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      Now
                    </button>
                    <button 
                      onClick={() => setModalState(prev => ({ ...prev, timeMode: "Custom" }))}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl transition-all ${modalState.timeMode === "Custom" ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"}`}
                    >
                      Custom Time
                    </button>
                  </div>

                  {modalState.timeMode === "Custom" && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                      <label className="text-primary/60 text-xs uppercase tracking-widest font-semibold mb-3 block text-center">
                        Select Time
                      </label>
                      <div className="relative max-w-[220px] mx-auto">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 text-primary/40" />
                        </div>
                        <input
                          type="time"
                          value={modalState.customTime}
                          onChange={(e) => setModalState(prev => ({ ...prev, customTime: e.target.value }))}
                          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-primary/10 rounded-2xl text-xl font-medium text-text-primary outline-none focus:bg-white focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all text-center tracking-wider"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <button 
                onClick={() => setModalState(prev => ({ ...prev, open: false }))}
                className="flex-1 py-3.5 text-sm font-semibold text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleActionConfirm}
                className="flex-1 py-3.5 text-sm font-semibold text-white bg-primary hover:opacity-90 rounded-full shadow-lg shadow-primary/20 transition-all"
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
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <StaffList />
    </Suspense>
  );
}
