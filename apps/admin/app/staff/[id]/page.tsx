"use client";

import { useState, use } from "react";
import { useStaffDetail, addAttendance } from "@/features/staff/api/use-staff";
import { fetchAttendanceReason } from "@/features/staff/api";
import { TopHeader } from "@/shared/ui/top-header";
import { Suspense } from "react";
import { ArrowLeft, Loader2, Calendar, Clock, CheckCircle2, UserCircle2, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AttendanceRecord } from "@/features/staff/types";

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const { staff, attendance, loading, setAttendance } = useStaffDetail(id, monthString);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // New log modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState<{ date: string; checkIn: string; checkOut: string; status: "Present" | "Absent" | "Half Day"; reason: string }>({ date: "", checkIn: "", checkOut: "", status: "Present", reason: "" });

  const [reasonModal, setReasonModal] = useState<{ open: boolean, loading: boolean, text: string }>({ open: false, loading: false, text: "" });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        Staff not found
      </div>
    );
  }

  const handleLogAttendance = async () => {
    if (!newAttendance.date || !newAttendance.checkIn) return;
    try {
      const added = await addAttendance({
        staffId: staff.id,
        date: newAttendance.date,
        checkIn: newAttendance.checkIn,
        checkOut: newAttendance.checkOut,
        status: newAttendance.status,
        reason: newAttendance.status === "Absent" ? newAttendance.reason : undefined,
      });
      setAttendance([added, ...attendance]);
      setShowAttendanceModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAbsentClick = async (recordId: string) => {
    setReasonModal({ open: true, loading: true, text: "" });
    try {
      const { reason } = await fetchAttendanceReason(recordId);
      setReasonModal({ open: true, loading: false, text: reason || "No reason provided." });
    } catch (err) {
      console.error("Failed to fetch reason", err);
      setReasonModal({ open: true, loading: false, text: "Failed to load reason." });
    }
  };

  // Analytics Calculation
  const totalPresents = attendance.filter(a => a.status === "Present").length;
  const totalAbsents = attendance.filter(a => a.status === "Absent").length;
  const totalHours = attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

  return (
    <div className="flex h-full flex-col bg-transparent">
      <Suspense fallback={<div className="h-20" />}>
        <TopHeader />
      </Suspense>
      
      {/* Header Profile Section */}
      <div className="px-4 md:pl-4 md:pr-8 pt-4 pb-0 shrink-0">
        <header className="w-full bg-white border border-primary/10 rounded-3xl shadow-sm px-6 py-4 lg:px-8 shrink-0 z-30">
        <div className="mx-auto flex max-w-5xl items-center gap-6">
          <Link
            href="/staff"
            className="text-text-secondary hover:bg-primary/5 flex h-10 w-10 items-center justify-center rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
            {staff.imageUrl ? (
              <img src={staff.imageUrl} alt={staff.name} className="h-full w-full object-cover" />
            ) : (
              <UserCircle2 className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-text-primary text-2xl font-bold">{staff.name}</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  staff.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                }`}>
                {staff.status}
              </span>
            </div>
            <p className="text-text-secondary font-medium">{staff.role}</p>
          </div>
          
          <div className="hidden text-right md:block">
            <p className="text-text-secondary text-xs uppercase tracking-wider font-semibold">Monthly Salary</p>
            <p className="text-xl font-bold text-primary">QAR {staff.baseSalary}</p>
          </div>
        </div>
        </header>
      </div>

      <div className="flex-1 p-4 md:p-8 flex flex-col min-h-0 overflow-y-auto">
        <div className="mx-auto max-w-5xl w-full flex flex-col flex-1 min-h-0">
          

            <div className="flex flex-col flex-1 min-h-0 gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-white rounded-3xl p-3 md:p-4 border border-primary/10 shadow-sm flex items-center justify-center gap-4 text-left">
                  <div className="bg-blue-50 text-blue-500 p-2 md:p-3 rounded-full shrink-0">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-sans leading-none">{totalPresents}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Presents</p>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-3 md:p-4 border border-primary/10 shadow-sm flex items-center justify-center gap-4 text-left">
                  <div className="bg-orange-50 text-orange-500 p-2 md:p-3 rounded-full shrink-0">
                    <Calendar className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-sans leading-none">{totalAbsents}</h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Absents</p>
                  </div>
                </div>
                <div className="bg-white rounded-3xl p-3 md:p-4 border border-primary/10 shadow-sm flex items-center justify-center gap-4 text-left">
                  <div className="bg-purple-50 text-purple-500 p-2 md:p-3 rounded-full shrink-0">
                    <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 font-sans leading-none">{totalHours}h</h3>
                    <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Total Work Hours</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden p-4 md:p-6">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <div className="flex items-center gap-4">
                  <h3 className="font-bold text-gray-900 text-lg">Attendance Log</h3>
                  <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-1">
                    <button 
                      onClick={prevMonth} 
                      disabled={currentDate.getFullYear() < new Date(staff.joinedDate).getFullYear() || (currentDate.getFullYear() === new Date(staff.joinedDate).getFullYear() && currentDate.getMonth() <= new Date(staff.joinedDate).getMonth())}
                      className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <span className="px-4 text-sm font-semibold text-primary min-w-[140px] text-center">{monthName}</span>
                    <button 
                      onClick={nextMonth} 
                      disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                      className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-4 mr-4 text-xs font-semibold">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200"></span> Present</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-200"></span> Half Day</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-200"></span> Absent</span>
                  </div>
                  <button 
                    onClick={() => setShowAttendanceModal(true)}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-colors shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Log Day
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-2 lg:gap-3 mb-2 shrink-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 lg:gap-3 flex-1 min-h-0 auto-rows-fr">
                {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-transparent rounded-2xl"></div>
                ))}
                {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                  const d = i + 1;
                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                  const record = attendance.find(a => a.date === dateStr);
                  const isToday = dateStr === new Date().toISOString().split("T")[0];
                  
                  let bgColor = "bg-gray-50 text-gray-400 border-gray-100 border-dashed";
                  if (record?.status === "Present") bgColor = "bg-green-500 text-white border-green-600 shadow-md";
                  if (record?.status === "Absent") bgColor = "bg-red-500 text-white border-red-600 shadow-md";
                  if (record?.status === "Half Day") bgColor = "bg-orange-500 text-white border-orange-600 shadow-md";

                  return (
                    <div 
                      key={d} 
                      onClick={() => { if (record?.status === "Absent") handleAbsentClick(record.id); }}
                      className={`p-1.5 md:p-2 border rounded-xl flex flex-col transition-all min-h-[40px] overflow-hidden ${bgColor} ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''} ${record?.status === "Absent" ? 'cursor-pointer hover:ring-1 hover:ring-red-400' : ''}`}
                    >
                      <span className={`text-sm font-bold ${record ? 'text-white' : 'text-gray-900'} font-sans`}>{d}</span>
                      {record && (
                        <div className={`mt-auto flex flex-col gap-0 text-[10px] md:text-[11px] font-bold tracking-tight leading-tight ${record.status === "Present" || record.status === "Half Day" || record.status === "Absent" ? "text-white/90" : "text-gray-900"} font-sans`}>
                          {record.checkIn && <span className="truncate">IN: {record.checkIn}</span>}
                          {record.checkOut && <span className="truncate">OUT: {record.checkOut}</span>}
                          {record.status === "Absent" && <span className="truncate text-white text-[9px] underline underline-offset-2">Click for Reason</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              </div>
            </div>

        </div>
      </div>

      {/* Modals for Attendance and Leaves would go here - simplified for demonstration */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6">
            <h2 className="text-xl font-bold mb-4">Log Attendance</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Date</label>
                <input type="date" value={newAttendance.date} onChange={e => setNewAttendance({...newAttendance, date: e.target.value})} className="w-full border rounded-xl p-3 mt-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Check In</label>
                  <input type="time" value={newAttendance.checkIn} onChange={e => setNewAttendance({...newAttendance, checkIn: e.target.value})} className="w-full border rounded-xl p-3 mt-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Check Out</label>
                  <input type="time" value={newAttendance.checkOut} onChange={e => setNewAttendance({...newAttendance, checkOut: e.target.value})} className="w-full border rounded-xl p-3 mt-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-gray-500">Status</label>
                <div className="relative">
                  <select value={newAttendance.status} onChange={e => setNewAttendance({...newAttendance, status: e.target.value as any})} className="w-full border rounded-xl p-3 mt-1 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23bca37f%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_auto] bg-[right_16px_center] cursor-pointer hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary shadow-sm bg-white">
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half Day">Half Day</option>
                  </select>
                </div>
              </div>
              {newAttendance.status === "Absent" && (
                <div>
                  <label className="text-xs font-semibold uppercase text-gray-500">Reason for Absence</label>
                  <input type="text" placeholder="Optional" value={newAttendance.reason} onChange={e => setNewAttendance({...newAttendance, reason: e.target.value})} className="w-full border rounded-xl p-3 mt-1 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" />
                </div>
              )}
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setShowAttendanceModal(false)} className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-semibold">Cancel</button>
              <button onClick={handleLogAttendance} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}

      {reasonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Absence Reason</h2>
            {reasonModal.loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-700 text-sm">
                {reasonModal.text}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button onClick={() => setReasonModal({ ...reasonModal, open: false })} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-semibold">Close</button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
