"use client";

import { useStaff, addAttendance } from "@/features/staff/api/use-staff";
import { ActionPinModal } from "@/shared/ui/action-pin-modal";
import { UserCircle2, Loader2, Check, X, Clock, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { TopHeader } from "@/shared/ui/top-header";
import { Staff, AttendanceRecord } from "@/features/staff/types";

function TimePicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [h = 0, m = 0] = value ? value.split(':').map(Number) : [new Date().getHours(), new Date().getMinutes()];
  const isPM = h >= 12;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  
  const handleHourChange = (delta: number) => {
    let newH = h + delta;
    if (newH < 0) newH += 24;
    if (newH >= 24) newH -= 24;
    onChange(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
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
    onChange(`${newH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`);
  };

  const toggleAmPm = () => {
    let newH = (h + 12) % 24;
    onChange(`${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
  };

  return (
    <div className="flex items-center justify-center gap-3 select-none">
      <div className="flex flex-col items-center gap-1">
        <button type="button" onClick={() => handleHourChange(1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronUp className="w-6 h-6" /></button>
        <div className="w-16 h-16 bg-gray-50 border border-primary/10 rounded-2xl flex items-center justify-center text-2xl font-medium text-text-primary shadow-sm">
          {hour12.toString().padStart(2, '0')}
        </div>
        <button type="button" onClick={() => handleHourChange(-1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronDown className="w-6 h-6" /></button>
      </div>

      <span className="text-2xl font-bold text-gray-300 pb-2">:</span>

      <div className="flex flex-col items-center gap-1">
        <button type="button" onClick={() => handleMinuteChange(1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronUp className="w-6 h-6" /></button>
        <div className="w-16 h-16 bg-gray-50 border border-primary/10 rounded-2xl flex items-center justify-center text-2xl font-medium text-text-primary shadow-sm">
          {m.toString().padStart(2, '0')}
        </div>
        <button type="button" onClick={() => handleMinuteChange(-1)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronDown className="w-6 h-6" /></button>
      </div>

      <div className="flex flex-col items-center gap-1 ml-2">
        <button type="button" onClick={toggleAmPm} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronUp className="w-6 h-6" /></button>
        <div className="w-16 h-16 bg-gray-50 border border-primary/10 rounded-2xl flex items-center justify-center text-xl font-bold text-primary shadow-sm">
          {isPM ? 'PM' : 'AM'}
        </div>
        <button type="button" onClick={toggleAmPm} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 hover:text-primary transition-colors"><ChevronDown className="w-6 h-6" /></button>
      </div>
    </div>
  );
}

function calculateTotalHours(checkIn: string, checkOut: string): string {
  const [inH = 0, inM = 0] = checkIn.split(':').map(Number);
  const [outH = 0, outM = 0] = checkOut.split(':').map(Number);
  
  let diff = (outH * 60 + outM) - (inH * 60 + inM);
  if (diff < 0) {
    diff += 24 * 60; // Handle overnight shifts
  }
  
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}


function StaffList() {
  const { staffList, loading } = useStaff();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);

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
    
    const staffId = modalState.staffId;
    const actionType = modalState.type;
    
    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      setActionLoading(staffId + actionType);
      setModalState(prev => ({ ...prev, open: false }));
      try {
        const today = new Date().toISOString().split("T")[0] as string;
        const timeToLog = modalState.customTime || new Date().toTimeString().slice(0, 5);
          
        if (actionType === "Present") {
          await addAttendance({
            staffId: staffId,
            date: today,
            checkIn: timeToLog,
            status: "Present",
          });
        } else if (actionType === "Exit") {
          await addAttendance({
            staffId: staffId,
            date: today,
            checkOut: timeToLog,
            status: "Present",
          });
        } else if (actionType === "Absent") {
          await addAttendance({
            staffId: staffId,
            date: today,
            status: "Absent",
            reason: modalState.reason.trim(),
          });
        }
        alert(`Action '${actionType}' logged successfully!`);
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert("Failed to log action.");
      } finally {
        setActionLoading(null);
      }
    });
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
                    className="group relative bg-white rounded-[2rem] border border-primary/10 transition-all duration-300 overflow-hidden flex flex-col"
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
                              className="flex-1 py-2.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 border border-green-200/50 text-xs font-bold transition-all flex justify-center items-center gap-1.5 shadow-sm"
                              title="Check In"
                            >
                              {actionLoading === staff.id + "Present" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-4 h-4" />} Check In
                            </button>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalState({ open: true, staffId: staff.id, type: "Absent", timeMode: "Now", customTime: "", reason: "" })}}
                              disabled={actionLoading !== null}
                              className="flex-1 py-2.5 rounded-xl bg-primary/5 text-primary-dark hover:bg-primary/10 border border-primary/10 text-xs font-bold transition-all flex justify-center items-center gap-1.5 shadow-sm"
                              title="Mark Absent"
                            >
                              {actionLoading === staff.id + "Absent" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-4 h-4" />} Absent
                            </button>
                          </>
                        )}

                        {staff.todayAttendance?.status === "Present" && !staff.todayAttendance?.checkOut && (
                          <div className="flex flex-col items-center gap-1.5 w-full">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              IN: <span className="text-black">{staff.todayAttendance.checkIn}</span>
                            </span>
                            <button 
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setModalState({ open: true, staffId: staff.id, type: "Exit", timeMode: "Now", customTime: new Date().toTimeString().slice(0, 5), reason: "" })}}
                              disabled={actionLoading !== null}
                              className="w-full py-2.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/50 text-xs font-bold transition-all flex justify-center items-center gap-1.5 shadow-sm mt-1"
                              title="Check Out"
                            >
                              {actionLoading === staff.id + "Exit" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-4 h-4" />} Check Out
                            </button>
                          </div>
                        )}

                        {(staff.todayAttendance?.status === "Absent" || (staff.todayAttendance?.status === "Present" && staff.todayAttendance?.checkOut) || staff.todayAttendance?.status === "Half Day") && (
                          <div className="flex flex-col items-center gap-1 w-full pb-1">
                            <span className={`text-xs font-bold flex items-center gap-1.5 ${
                              staff.todayAttendance.status === "Present" ? "text-green-600" : 
                              staff.todayAttendance.status === "Half Day" ? "text-orange-600" : 
                              "text-red-600"
                            }`}>
                              {staff.todayAttendance.status === "Present" ? <Check className="w-3.5 h-3.5" /> : staff.todayAttendance.status === "Half Day" ? <Clock className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                              {staff.todayAttendance.status}
                            </span>
                            {(staff.todayAttendance.checkIn || staff.todayAttendance.checkOut) && (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[10px] font-bold text-black tracking-wide flex items-center justify-center gap-2 mt-0.5">
                                  {staff.todayAttendance.checkIn && <span>IN: {staff.todayAttendance.checkIn}</span>}
                                  {staff.todayAttendance.checkIn && staff.todayAttendance.checkOut && <span>•</span>}
                                  {staff.todayAttendance.checkOut && <span>OUT: {staff.todayAttendance.checkOut}</span>}
                                </span>
                                {staff.todayAttendance.checkIn && staff.todayAttendance.checkOut && (
                                  <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full mt-1">
                                    Total: {calculateTotalHours(staff.todayAttendance.checkIn, staff.todayAttendance.checkOut)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
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
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <label className="text-primary/60 text-xs uppercase tracking-widest font-semibold mb-3 block text-center">
                    Select Time
                  </label>
                  <div className="mx-auto w-full pt-4">
                    <TimePicker 
                      value={modalState.customTime} 
                      onChange={(val) => setModalState(prev => ({ ...prev, customTime: val }))} 
                    />
                  </div>
                </div>
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
      {/* Action PIN Verification Modal */}
      {actionToConfirm && (
        <ActionPinModal 
          onSuccess={actionToConfirm} 
          onCancel={() => setActionToConfirm(null)} 
        />
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
