"use client";

import { useState, use } from "react";
import { useStaffDetail, addAttendance, updateStaff } from "@/features/staff/api/use-staff";
import { fetchAttendanceReason } from "@/features/staff/api";
import { ActionPinModal } from "@/shared/ui/action-pin-modal";
import { ArrowLeft, Loader2, Calendar, Clock, CheckCircle2, UserCircle2, Plus, ChevronLeft, ChevronRight, Edit2, Save, X, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AttendanceRecord } from "@/features/staff/types";

export default function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const monthString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  
  const { staff, attendance, loading, setAttendance, setStaff } = useStaffDetail(id, monthString);

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // New log modal state
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState<{ date: string; checkIn: string; checkOut: string; status: "Present" | "Absent" | "Half Day"; reason: string }>({ date: "", checkIn: "", checkOut: "", status: "Present", reason: "" });
  
  // Edit Staff State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", role: "", email: "", phone: "", baseSalary: 0, status: "Active" as any });
  const [isSaving, setIsSaving] = useState(false);

  const [actionToConfirm, setActionToConfirm] = useState<(() => void) | null>(null);

  if (loading) {
    return (
      <div className="flex h-full flex-col space-y-6">
        <div className="border-primary/10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[32px] border bg-white shadow-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex h-full flex-col space-y-6">
        <div className="border-primary/10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[32px] border bg-white shadow-sm text-gray-500">
          Staff not found
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    setEditForm({
      name: staff.name,
      role: staff.role,
      email: staff.email || "",
      phone: staff.phone || "",
      baseSalary: staff.baseSalary,
      status: staff.status,
    });
    setIsEditing(true);
  };

  const handleUpdateStaff = async () => {
    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      setIsSaving(true);
      try {
        const updated = await updateStaff(staff.id, editForm);
        setStaff(updated);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    });
  };

  const handleLogAttendance = async () => {
    if (!newAttendance.date) return;
    if (newAttendance.status !== "Absent" && !newAttendance.checkIn) return;
    
    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      try {
        const added = await addAttendance({
          staffId: staff.id,
          date: newAttendance.date,
          checkIn: newAttendance.status !== "Absent" ? newAttendance.checkIn : undefined,
          checkOut: newAttendance.status !== "Absent" ? newAttendance.checkOut : undefined,
          status: newAttendance.status,
          reason: newAttendance.status === "Absent" ? newAttendance.reason : undefined,
        });
        setAttendance((prev) => {
          const filtered = prev.filter((a) => a.date !== newAttendance.date);
          const newRecord = { 
            ...added, 
            checkIn: newAttendance.status !== "Absent" ? added.checkIn : undefined,
            checkOut: newAttendance.status !== "Absent" ? added.checkOut : undefined 
          };
          return [newRecord, ...filtered];
        });
        setShowAttendanceModal(false);
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteAttendance = async () => {
    setActionToConfirm(() => async () => {
      setActionToConfirm(null);
      try {
        const res = await fetch(`/api/staff/${staff.id}/attendance?date=${newAttendance.date}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete attendance");
        
        setAttendance(prev => prev.filter(a => a.date !== newAttendance.date));
        setShowAttendanceModal(false);
      } catch (err) {
        console.error("Error deleting attendance", err);
      }
    });
  };

  const handleDayClick = async (dateStr: string, record: AttendanceRecord | undefined) => {
    const todayStr = new Date().toISOString().split("T")[0] as string;
    const isFuture = dateStr > todayStr;
    
    if (record) {
      setNewAttendance({
        date: dateStr,
        checkIn: record.checkIn || "",
        checkOut: record.checkOut || "",
        status: isFuture ? "Absent" : (record.status as "Present" | "Absent" | "Half Day"),
        reason: "", // Will fetch below if absent
      });
      setShowAttendanceModal(true);

      if (record.status === "Absent") {
        try {
          const { reason } = await fetchAttendanceReason(record.id);
          setNewAttendance(prev => prev.date === dateStr ? { ...prev, reason: reason || "" } : prev);
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
        reason: "" 
      });
      setShowAttendanceModal(true);
    }
  };

  // Analytics Calculation
  const totalPresents = attendance.filter(a => a.status === "Present").length;
  const totalAbsents = attendance.filter(a => a.status === "Absent").length;
  const totalHours = attendance.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);

  return (
    <div className="flex h-full flex-col pt-2 lg:pt-4">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm">
        
        {/* Header Bar within the rounded box */}
        <div className="border-primary/10 flex shrink-0 flex-col items-center justify-between gap-4 border-b p-4 md:flex-row md:p-6">
          <div className="flex items-center gap-4 w-full">
            <Link
              href="/staff"
              className="bg-primary/5 border border-primary/10 hover:bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full transition-colors shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-primary" />
            </Link>
            <h1 className="text-2xl font-bold font-serif text-primary-dark">Staff Dashboard</h1>
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex-1 p-4 md:p-6 flex flex-col min-h-0 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0 h-full">
            
            {/* Left Column: Staff Profile */}
            <div className="col-span-1 flex flex-col min-h-0 lg:border-r lg:border-primary/10 lg:pr-8">
              <div className="flex flex-col gap-6 sticky top-0">
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/5 border-4 border-white shadow-sm overflow-hidden">
                    {staff.imageUrl ? (
                      <img src={staff.imageUrl} alt={staff.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle2 className="h-12 w-12 text-primary/40" />
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-bold text-primary-dark">{staff.name}</h2>
                    <p className="text-sm font-semibold text-primary">{staff.role}</p>
                    <div className="mt-3">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        staff.status === "Active" ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary-dark"
                      }`}>
                        {staff.status}
                      </span>
                    </div>
                  </div>
                </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                      <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-semibold text-primary-dark truncate">{staff.email || "—"}</p>
                    </div>
                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                      <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mb-1">Phone</p>
                      <p className="text-sm font-semibold text-primary-dark">{staff.phone || "—"}</p>
                    </div>
                    <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                      <p className="text-[10px] font-bold text-primary/80 uppercase tracking-wider mb-1">Monthly Salary</p>
                      <p className="text-lg font-bold text-primary">QAR {staff.baseSalary}</p>
                    </div>
                    
                    <button 
                      onClick={handleEditClick}
                      className="mt-4 w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Edit2 className="w-4 h-4" /> Edit Details
                    </button>
                  </div>
              </div>
            </div>
            
            {/* Right Column: Attendance */}
            <div className="col-span-1 lg:col-span-2 flex flex-col min-h-0 gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4 text-left">
                  <div className="bg-green-100 text-green-600 p-3 rounded-full shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-dark font-sans leading-none">{totalPresents}</h3>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mt-1">Total Presents</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4 text-left">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-full shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-dark font-sans leading-none">{totalAbsents}</h3>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mt-1">Total Absents</p>
                  </div>
                </div>
                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4 text-left">
                  <div className="bg-primary/10 text-primary p-3 rounded-full shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-primary-dark font-sans leading-none">{totalHours}h</h3>
                    <p className="text-[10px] font-bold text-primary/70 uppercase tracking-wider mt-1">Total Work Hours</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1 min-h-0 overflow-hidden pt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                    <h3 className="font-bold text-primary-dark text-lg">Attendance</h3>
                    <div className="flex items-center bg-primary/5 rounded-full border border-primary/10 p-1">
                      <button 
                        onClick={prevMonth} 
                        disabled={currentDate.getFullYear() < new Date(staff.joinedDate).getFullYear() || (currentDate.getFullYear() === new Date(staff.joinedDate).getFullYear() && currentDate.getMonth() <= new Date(staff.joinedDate).getMonth())}
                        className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronLeft className="w-5 h-5 text-primary/70" />
                      </button>
                      <span className="px-4 text-sm font-semibold text-primary min-w-[130px] text-center">{monthName}</span>
                      <button 
                        onClick={nextMonth} 
                        disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
                        className="p-1 hover:bg-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ChevronRight className="w-5 h-5 text-primary/70" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="hidden sm:flex items-center gap-3 text-xs font-semibold mr-2">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> Present</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span> Half Day</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Absent</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1 min-h-0 auto-rows-fr pb-4">
                  {Array.from({ length: getFirstDayOfMonth(currentDate) }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-transparent rounded-xl"></div>
                  ))}
                  {Array.from({ length: getDaysInMonth(currentDate) }).map((_, i) => {
                    const d = i + 1;
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const record = attendance.find(a => a.date === dateStr);
                    const isToday = dateStr === new Date().toISOString().split("T")[0];
                    
                    let bgColor = "bg-primary/5 text-primary-dark border-primary/10 hover:border-primary/40 hover:bg-primary/10";
                    if (record?.status === "Present") bgColor = "bg-green-500 text-white border-green-600 shadow-sm hover:bg-green-600";
                    if (record?.status === "Absent") bgColor = "bg-red-500 text-white border-red-600 shadow-sm hover:bg-red-600";
                    if (record?.status === "Half Day") bgColor = "bg-orange-500 text-white border-orange-600 shadow-sm hover:bg-orange-600";

                    return (
                      <div 
                        key={d} 
                        onClick={() => handleDayClick(dateStr, record)}
                        className={`p-1 sm:p-2 border rounded-xl flex flex-col transition-colors min-h-[50px] overflow-hidden ${bgColor} ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''} cursor-pointer`}
                      >
                        <span className={`text-xs sm:text-sm font-bold ${record ? 'text-white' : 'text-primary'} font-sans`}>{d}</span>
                        {record && (
                          <div className={`mt-auto flex flex-col gap-0 text-[9px] sm:text-[10px] font-bold tracking-tight leading-tight ${record.status === "Present" || record.status === "Half Day" || record.status === "Absent" ? "text-white/90" : "text-primary-dark"} font-sans`}>
                            {record.status !== "Absent" && record.checkIn && <span className="truncate">IN: {record.checkIn}</span>}
                            {record.status !== "Absent" && record.checkOut && <span className="truncate">OUT: {record.checkOut}</span>}
                            {record.status === "Absent" && <span className="truncate text-white text-[9px] underline underline-offset-1 mt-0.5 opacity-80">View Details</span>}
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
      </div>

      {/* Log Attendance Modal */}
      {showAttendanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-serif mb-4">Log Attendance for {newAttendance.date}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">Status</label>
                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                  {(["Present", "Half Day", "Absent"] as const).map((status) => {
                    const isFuture = newAttendance.date > (new Date().toISOString().split("T")[0] as string);
                    if (isFuture && status !== "Absent") return null;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setNewAttendance({...newAttendance, status})}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          newAttendance.status === status
                            ? status === "Present" ? "bg-green-500 text-white shadow-md"
                            : status === "Half Day" ? "bg-orange-500 text-white shadow-md"
                            : "bg-red-500 text-white shadow-md"
                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/50"
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${newAttendance.status === status ? 'bg-white' : status === 'Present' ? 'bg-green-400' : status === 'Half Day' ? 'bg-orange-400' : 'bg-red-400'}`}></div>
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {newAttendance.status !== "Absent" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Check In</label>
                    <input type="time" value={newAttendance.checkIn} onChange={e => setNewAttendance({...newAttendance, checkIn: e.target.value})} className="w-full border rounded-xl p-3 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm font-semibold text-gray-900 bg-white" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Check Out</label>
                    <input type="time" value={newAttendance.checkOut} onChange={e => setNewAttendance({...newAttendance, checkOut: e.target.value})} className="w-full border rounded-xl p-3 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm font-semibold text-gray-900 bg-white" />
                  </div>
                </div>
              )}

              {newAttendance.status === "Absent" && (
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Reason for Absence</label>
                  <input type="text" placeholder="Optional" value={newAttendance.reason} onChange={e => setNewAttendance({...newAttendance, reason: e.target.value})} className="w-full border rounded-xl p-3 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-sm font-semibold text-gray-900 bg-white" />
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-between items-center gap-3">
              {attendance.some(a => a.date === newAttendance.date) ? (
                <button onClick={handleDeleteAttendance} className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-semibold transition-colors mr-auto">Remove</button>
              ) : <div></div>}
              <div className="flex gap-3">
                <button onClick={() => setShowAttendanceModal(false)} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button onClick={handleLogAttendance} className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl">
            <h2 className="text-xl font-bold font-serif mb-6">Edit Staff Details</h2>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Full Name</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Role</label>
                  <input type="text" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                  <div className="relative">
                    <select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as any})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold appearance-none cursor-pointer focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23bca37f%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[length:12px_auto] bg-[right_16px_center]">
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Phone</label>
                  <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Salary (QAR)</label>
                  <input type="number" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: Number(e.target.value)})} className="w-full border border-gray-200 rounded-xl p-3 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-gray-50" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button 
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStaff}
                disabled={isSaving}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-sm font-semibold transition-colors shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Changes
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
