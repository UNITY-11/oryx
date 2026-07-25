"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStaff } from "@/features/staff/api/use-staff";
import { TopHeader } from "@/shared/ui/top-header";
import { Suspense } from "react";
import { ArrowLeft, Loader2, Save, User, Briefcase, Phone, Mail, DollarSign, Calendar, ChevronDown } from "lucide-react";
import Link from "next/link";

import { Staff } from "@/features/staff/types";

export default function NewStaffPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Staff, "id">>({
    name: "",
    role: "",
    phone: "",
    email: "",
    baseSalary: 0,
    status: "Active",
    joinedDate: new Date().toISOString().split("T")[0] || "",
  });

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.role.trim()) return;
    setSaving(true);
    try {
      const newStaff = await createStaff(formData);
      router.push(`/staff/${newStaff.id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col bg-transparent">
      <Suspense fallback={<div className="h-20" />}>
        <TopHeader />
      </Suspense>
      
      {/* Header Profile Section */}
      <div className="px-1 md:px-2 pt-4 pb-0 shrink-0">
        <header className="w-full bg-white border border-primary/10 rounded-3xl shadow-sm px-6 py-4 shrink-0 z-30">
        <div className="w-full flex items-center gap-6">
          <Link
            href="/staff"
            className="text-text-secondary hover:bg-primary/5 flex h-10 w-10 items-center justify-center rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-serif font-bold text-primary">
              Register New Staff
            </h1>
            <p className="text-text-secondary text-sm font-medium mt-1">
              Add a new employee to the salon system
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!formData.name.trim() || !formData.role.trim() || saving}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Register Staff
          </button>
        </div>
        </header>
      </div>

      <div className="px-1 md:px-2 pt-4 pb-8">
        <div className="w-full">
          
          <div className="bg-white rounded-[2rem] border border-primary/10 shadow-sm p-5 md:p-6 mb-8 mt-2">
            <h2 className="text-lg font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif">1</span>
              Personal Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="e.g. Sarah Williams"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Email <span className="text-gray-400 font-normal normal-case">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="sarah@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="+974 5555 1234"
                  />
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent mb-6"></div>

            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif">2</span>
              Employment Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* Role */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Job Title</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Briefcase className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                    placeholder="e.g. Senior Hairstylist"
                  />
                </div>
              </div>

              {/* Joined Date */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Joined Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, joinedDate: e.target.value }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Base Salary */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Monthly Salary</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <DollarSign className="w-5 h-5 text-primary/40" />
                  </div>
                  <input
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white border border-primary/10 rounded-2xl pl-11 pr-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-text-secondary mb-2 block text-xs font-bold tracking-widest uppercase">Account Status</label>
                <div className="relative">
                  <div 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border border-primary/10 rounded-2xl px-4 py-2.5 text-text-primary outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all font-medium cursor-pointer flex items-center justify-between"
                  >
                    <span>{formData.status === "Active" ? "Active Employee" : "Inactive"}</span>
                    <ChevronDown className={`w-5 h-5 text-primary/40 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </div>
                  
                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-2xl shadow-lg z-20 overflow-hidden py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status: "Active" });
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${formData.status === "Active" ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-gray-50"}`}
                        >
                          Active Employee
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, status: "Inactive" });
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${formData.status === "Inactive" ? "bg-primary/10 text-primary" : "text-text-primary hover:bg-gray-50"}`}
                        >
                          Inactive
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            
            
          </div>
        </div>
      </div>
    </div>
  );
}
