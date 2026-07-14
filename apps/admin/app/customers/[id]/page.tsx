"use client";

import { useState, useRef, useEffect, use } from "react";
import { ArrowLeft, Upload, Save, UserCircle2, ChevronDown, Check, Phone, Mail, MessageSquare, Calendar, Plus, MessageCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_CUSTOMERS, Customer, CustomerTier } from "../../../src/features/customers/mock-data";
import { MOCK_SERVICES, Service, PricingTier, Addon } from "../../../src/features/services/mock-data";

const TIERS: CustomerTier[] = ["Bronze", "Silver", "Gold", "Platinum"];

function TierDropdown({ value, onChange }: { value: CustomerTier; onChange: (v: CustomerTier) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const handleScroll = () => setOpen(false);
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border border-primary/40 bg-transparent hover:border-primary focus:outline-none focus:border-primary text-primary-dark text-sm transition-colors"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-primary/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-primary/10 rounded-2xl shadow-xl z-20 overflow-hidden">
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onChange(tier); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left hover:bg-primary/5 transition-colors ${tier === value ? "text-primary font-medium" : "text-primary-dark"}`}
            >
              <span>{tier}</span>
              {tier === value && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const original = MOCK_CUSTOMERS.find((c) => c.id === id) ?? null;
  const [customer, setCustomer] = useState<Customer | null>(original ? { ...original } : null);
  const [saved, setSaved] = useState(false);

  // Sessions State
  const [sessions, setSessions] = useState([
    { id: "ses-1", date: "2026-07-10", service: "Signature Massage", staff: "Maria", status: "Completed", price: 450 },
    { id: "ses-2", date: "2026-06-25", service: "Hydrating Facial", staff: "Sarah", status: "Completed", price: 300 },
    { id: "ses-3", date: "2026-07-20", service: "Deep Tissue Massage", staff: "Maria", status: "Upcoming", price: 500 },
  ]);

  // Booking Modal State
  const [showBooking, setShowBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  
  // Booking Form fields
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingStaff, setBookingStaff] = useState("");

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-text-secondary">
        <p className="text-lg mb-4">Customer not found.</p>
        <button onClick={() => router.push("/customers")} className="text-primary underline text-sm">
          Back to Customers
        </button>
      </div>
    );
  }

  const update = <K extends keyof Customer>(key: K, value: Customer[K]) =>
    setCustomer((prev) => prev ? { ...prev, [key]: value } : prev);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => update("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Booking Handlers
  const handleServiceSelect = (svc: Service, tier: PricingTier) => {
    setSelectedService(svc);
    setSelectedTier(tier);
    setSelectedAddons([]);
    if (svc.addons.length > 0) {
      setBookingStep(2);
    } else {
      setBookingStep(3);
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.find(a => a.id === addon.id) ? prev.filter(a => a.id !== addon.id) : [...prev, addon]
    );
  };

  const finalizeBooking = () => {
    if (!selectedService || !selectedTier || !bookingDate || !bookingTime || !bookingStaff) return;
    
    const totalPrice = selectedTier.price + selectedAddons.reduce((acc, curr) => acc + curr.price, 0);
    
    const newSession = {
      id: `ses-${Date.now()}`,
      date: bookingDate,
      service: selectedService.name,
      staff: bookingStaff,
      status: "Upcoming",
      price: totalPrice,
    };
    
    setSessions(prev => [newSession, ...prev]);
    setShowBooking(false);
    
    // Reset state
    setBookingStep(1);
    setSelectedService(null);
    setSelectedTier(null);
    setSelectedAddons([]);
    setBookingDate("");
    setBookingTime("");
    setBookingStaff("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Top Bar */}
        <div className="px-6 md:px-8 py-5 border-b border-primary/10 flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push("/customers")}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-dark transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Customers
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => update("status", customer.status === "Active" ? "Inactive" : "Active")}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                customer.status === "Active"
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              }`}
            >
              {customer.status}
            </button>

            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all ${
                saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
              }`}
            >
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-12">
            
            {/* Top Grid: Avatar (Left) + Form Details (Right) */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* LEFT — Avatar */}
              <div className="flex flex-col gap-4 items-center lg:w-48 shrink-0">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-40 h-40 cursor-pointer rounded-full overflow-hidden border-4 border-white shadow-md bg-primary/5 group"
                >
                  {customer.avatar ? (
                    <>
                      <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                      <span className="text-4xl font-serif">{getInitials(customer.name)}</span>
                      <div className="absolute inset-0 bg-primary-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center flex-col gap-2">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                
                <div className="flex gap-2 w-full mt-2 justify-center">
                  <button className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-colors flex-1 flex justify-center items-center" title="Call">
                    <Phone className="w-4 h-4" />
                  </button>
                  <button className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-colors flex-1 flex justify-center items-center" title="Message">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="p-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] rounded-full transition-colors flex-1 flex justify-center items-center" title="WhatsApp">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-3 bg-primary/5 hover:bg-primary/10 text-primary rounded-full transition-colors flex-1 flex justify-center items-center" title="Email">
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-center w-full mt-2 space-y-1">
                  <p className="text-xs text-text-secondary uppercase tracking-wider font-semibold">Total Spent</p>
                  <p className="text-lg font-bold text-primary-dark">QAR {customer.totalSpent}</p>
                </div>
              </div>

              {/* RIGHT — Details */}
              <div className="flex-1 space-y-6 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Full Name</label>
                    <input
                      value={customer.name}
                      onChange={(e) => update("name", e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Tier</label>
                    <TierDropdown value={customer.tier} onChange={(v) => update("tier", v)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Email Address</label>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => update("email", e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Sessions History FULL WIDTH */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-primary-dark uppercase tracking-wider">Sessions History</h3>
                <button 
                  onClick={() => setShowBooking(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-white bg-primary hover:opacity-90 px-4 py-2 rounded-full transition-opacity shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Session
                </button>
              </div>
              
              <div className="rounded-2xl border border-primary/10 overflow-hidden">
                <div className="grid grid-cols-[120px_1fr_150px_120px_100px] bg-[#fcf4f0] text-[10px] uppercase tracking-wider text-text-secondary px-6 py-4 border-b border-primary/10">
                  <span>Date</span>
                  <span>Service</span>
                  <span>Staff</span>
                  <span>Status</span>
                  <span className="text-right">Price</span>
                </div>
                <div className="divide-y divide-primary/5 bg-white">
                  {sessions.length === 0 ? (
                    <div className="p-8 text-center text-text-secondary text-sm">No sessions found for this customer.</div>
                  ) : (
                    sessions.map((session) => (
                      <div key={session.id} className="grid grid-cols-[120px_1fr_150px_120px_100px] items-center px-6 py-4 text-sm hover:bg-primary/5 transition-colors">
                        <span className="text-text-secondary font-medium">{session.date}</span>
                        <span className="font-semibold text-primary-dark">{session.service}</span>
                        <span className="text-text-secondary">{session.staff}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border inline-block text-center self-start w-fit
                          ${session.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 
                            'bg-amber-50 text-amber-600 border-amber-200'}
                        `}>
                          {session.status}
                        </span>
                        <span className="text-right font-bold text-primary-dark">QAR {session.price}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Add Session Booking Overlay Modal */}
      {showBooking && (
        <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 md:p-8">
          <div className="bg-white w-full max-w-2xl max-h-full rounded-[32px] shadow-2xl flex flex-col overflow-hidden border border-primary/10">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-primary/10 flex items-center justify-between bg-[#fcf4f0]">
              <div>
                <h2 className="text-lg font-serif font-medium text-primary-dark">Add New Session</h2>
                <p className="text-xs text-text-secondary">Booking for {customer.name}</p>
              </div>
              <button onClick={() => setShowBooking(false)} className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-6 scrollbar-hide">
              
              {bookingStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary-dark uppercase tracking-wider mb-4">Step 1: Select Service & Tier</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {MOCK_SERVICES.filter(s => s.status === "Active").map(svc => (
                      <div key={svc.id} className="border border-primary/20 rounded-2xl p-4 space-y-3">
                        <div className="font-medium text-primary-dark">{svc.name}</div>
                        <div className="flex flex-wrap gap-2">
                          {svc.pricingTiers.map(tier => (
                            <button
                              key={tier.id}
                              onClick={() => handleServiceSelect(svc, tier)}
                              className="px-4 py-2 text-sm border border-primary/20 rounded-xl hover:border-primary hover:bg-primary/5 transition-colors text-left"
                            >
                              <div className="font-semibold text-primary">{tier.label}</div>
                              <div className="text-xs text-text-secondary">QAR {tier.price}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {bookingStep === 2 && selectedService && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary-dark uppercase tracking-wider mb-4">Step 2: Select Add-ons</h3>
                  <div className="space-y-3">
                    {selectedService.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      return (
                        <button
                          key={addon.id}
                          onClick={() => toggleAddon(addon)}
                          className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-colors ${
                            isSelected ? "border-primary bg-primary/5" : "border-primary/20 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-primary/30'}`}>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="font-medium text-primary-dark text-sm">{addon.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-primary">+ QAR {addon.price}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={() => setBookingStep(3)}
                      className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {bookingStep === 3 && selectedService && selectedTier && (
                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-primary-dark uppercase tracking-wider mb-2">Step 3: Finalize Booking</h3>
                  
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <div className="font-semibold text-primary-dark">{selectedService.name} - {selectedTier.label}</div>
                    {selectedAddons.length > 0 && (
                      <div className="text-xs text-text-secondary mt-1">
                        + {selectedAddons.map(a => a.name).join(", ")}
                      </div>
                    )}
                    <div className="mt-3 text-lg font-bold text-primary">
                      Total: QAR {selectedTier.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Date</label>
                      <input 
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Time</label>
                      <input 
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Staff Member</label>
                    <select
                      value={bookingStaff}
                      onChange={(e) => setBookingStaff(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark text-sm appearance-none"
                    >
                      <option value="">Select Staff...</option>
                      <option value="Maria">Maria</option>
                      <option value="Sarah">Sarah</option>
                      <option value="Elena">Elena</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={() => setBookingStep(selectedService.addons.length > 0 ? 2 : 1)}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      Back
                    </button>
                    <button 
                      onClick={finalizeBooking}
                      disabled={!bookingDate || !bookingTime || !bookingStaff}
                      className="bg-primary text-white px-8 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
