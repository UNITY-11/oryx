"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Calendar, Clock, User,
  CheckCircle2, ChevronRight, Check, Edit3, Play, X
} from "lucide-react";
import { MOCK_BOOKINGS, Booking, BookingStatus, BookingService } from "../../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../../src/features/services/mock-data";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const original = MOCK_BOOKINGS.find((b) => b.id === id) || {
    id,
    customerName: "Unknown Customer",
    phone: "+974 0000 0000",
    services: [] as BookingService[],
    date: new Date().toISOString().split("T")[0] || new Date().toISOString().substring(0, 10),
    time: "10:00",
    status: "Pending" as BookingStatus,
    amount: 0,
  };

  const [booking, setBooking] = useState<Booking>(original);
  const [savedBooking, setSavedBooking] = useState<Booking>(original);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);

  // POS State (service editor)
  const [posMode, setPosMode] = useState<"services" | "addons">("services");
  const [activeServiceIndex, setActiveServiceIndex] = useState<number | null>(null);

  const activeService = activeServiceIndex !== null ? booking.services[activeServiceIndex] : null;
  const currentServiceObject = useMemo(() => {
    return activeService ? REAL_SERVICES.find((s) => s.name === activeService.name) : null;
  }, [activeService]);

  const isCompleted = booking.status === "Completed" || booking.status === "Cancelled";
  const canStart = booking.status === "Pending" || booking.status === "Confirmed";

  // Deep compare to detect changes
  const hasChanges = JSON.stringify(booking) !== JSON.stringify(savedBooking);

  const update = <K extends keyof Booking>(key: K, value: Booking[K]) =>
    setBooking((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    setSavedBooking(booking);
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleStartSession = () => {
    update("status", "Started");
  };

  const toggleService = (serviceId: string) => {
    const serviceObj = REAL_SERVICES.find((s) => s.id === serviceId);
    if (!serviceObj) return;

    setBooking((prev) => {
      const existingIndex = prev.services.findIndex((s) => s.name === serviceObj.name);

      if (existingIndex >= 0) {
        const removedService = prev.services[existingIndex]!;
        const basePrice = serviceObj.pricingTiers?.[0]?.price || 0;
        const addonsPrice = removedService.addons.reduce((sum, aName) => {
          const a = serviceObj.addons.find((ad) => ad.name === aName);
          return sum + (a?.price || 0);
        }, 0);

        const newServices = [...prev.services];
        newServices.splice(existingIndex, 1);

        if (activeServiceIndex === existingIndex) {
          setPosMode("services");
          setActiveServiceIndex(null);
        } else if (activeServiceIndex !== null && activeServiceIndex > existingIndex) {
          setActiveServiceIndex(activeServiceIndex - 1);
        }

        return { ...prev, services: newServices, amount: prev.amount - basePrice - addonsPrice };
      } else {
        const basePrice = serviceObj.pricingTiers?.[0]?.price || 0;
        return {
          ...prev,
          services: [...prev.services, { name: serviceObj.name, addons: [] }],
          amount: prev.amount + basePrice,
        };
      }
    });
  };

  const configureAddonsFor = (index: number) => {
    setActiveServiceIndex(index);
    setPosMode("addons");
  };

  const toggleAddon = (addonName: string, addonPrice: number) => {
    if (activeServiceIndex === null) return;

    setBooking((prev) => {
      const newServices = [...prev.services];
      const service: BookingService = { ...newServices[activeServiceIndex]! };
      const hasAddon = service.addons?.includes(addonName) ?? false;

      service.addons = hasAddon
        ? (service.addons || []).filter((a) => a !== addonName)
        : [...(service.addons || []), addonName];

      newServices[activeServiceIndex] = service;
      return { ...prev, services: newServices, amount: prev.amount + (hasAddon ? -addonPrice : addonPrice) };
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header ── */}
      <div className="shrink-0 pt-4 pb-4">
        <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 z-30">
          {/* Left: back arrow + title */}
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => {
                if (isEditing) { setIsEditing(false); setBooking(savedBooking); }
                else router.back();
              }}
              className="w-10 h-10 rounded-2xl bg-[#fcf4f0] border border-primary/10 flex items-center justify-center text-primary hover:bg-primary/10 hover:-translate-x-0.5 transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="font-serif text-2xl font-medium text-primary-dark leading-tight">
                {booking.customerName}
              </h1>
              <p className="text-xs text-text-secondary font-mono uppercase tracking-wider">{booking.id}</p>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {!isCompleted && !isEditing && canStart && (
              <button
                onClick={handleStartSession}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-white hover:bg-primary-dark transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Session
              </button>
            )}

            {!isCompleted && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
            )}

            {isEditing && (
              <>
                <button
                  onClick={() => { setIsEditing(false); setBooking(savedBooking); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold border border-primary/30 text-text-secondary hover:bg-primary/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Discard
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-sm transition-all ${
                    saved
                      ? "bg-green-500 text-white"
                      : hasChanges
                      ? "bg-primary text-white hover:opacity-90"
                      : "bg-primary/20 text-primary/40 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4" />
                  {saved ? "Saved!" : "Save Changes"}
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* ── VIEW / EDIT DETAILS ── */}
        {!isEditing && (
          <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm p-6 md:p-10 overflow-y-auto h-full scrollbar-hide">
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Status badge */}
              <div className="flex items-center gap-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  booking.status === "Confirmed"  ? "bg-primary/20 border-primary text-primary-dark" :
                  booking.status === "Pending"    ? "bg-primary/5 border-primary/40 text-primary-dark border-dashed" :
                  booking.status === "Started"    ? "bg-blue-500 border-blue-600 text-white" :
                  booking.status === "Completed"  ? "bg-primary border-primary-dark text-white" :
                                                    "bg-white border-primary/20 text-text-secondary opacity-70"
                }`}>
                  {booking.status}
                </span>
                {isCompleted && (
                  <span className="text-xs text-text-secondary italic">This session is closed and cannot be edited.</span>
                )}
              </div>

              {/* Customer & Schedule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#fcf4f0] border border-primary/10 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Customer</h3>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white text-primary flex items-center justify-center text-2xl font-serif shrink-0 border border-primary/10">
                      {booking.customerName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-primary-dark">{booking.customerName}</h3>
                      <p className="text-text-secondary mt-1">{booking.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-primary/10 rounded-3xl p-6 shadow-sm flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary-dark">{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary-dark">{booking.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-text-secondary">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary-dark">{booking.services.length} Service(s)</span>
                  </div>
                </div>
              </div>

              {/* Services */}
              <div className="bg-white border border-primary/10 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-6">Session Services</h3>
                <div className="space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary italic bg-[#fcf4f0] rounded-2xl border border-primary/5">
                      No services selected.
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = REAL_SERVICES.find((r) => r.name === svc.name);
                      const baseP = matchedObj?.pricingTiers?.[0]?.price || 0;
                      return (
                        <div key={idx} className="bg-[#fcf4f0] rounded-2xl p-5 border border-primary/10">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-lg font-semibold text-primary-dark">{svc.name}</span>
                            <span className="text-lg font-semibold text-primary-dark">QAR {baseP}</span>
                          </div>
                          {svc.addons.length > 0 && (
                            <div className="space-y-2 mt-3 pt-3 border-t border-primary/10">
                              {svc.addons.map((addon, aIdx) => {
                                const matchedAddon = matchedObj?.addons.find((a) => a.name === addon);
                                return (
                                  <div key={aIdx} className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary flex items-center gap-2">
                                      <ChevronRight className="w-4 h-4 text-primary/40" /> {addon}
                                    </span>
                                    <span className="text-text-secondary">{matchedAddon ? `+ QAR ${matchedAddon.price}` : "+"}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-primary/10 flex justify-between items-center">
                  <span className="text-lg font-bold text-text-secondary">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-dark">QAR {booking.amount}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── EDIT MODE ── */}
        {isEditing && (
          <div className="flex h-full w-full gap-4">

            {/* LEFT: Service Catalog / Add-ons */}
            <div className="flex-1 bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-y-auto scrollbar-hide p-6 md:p-10">

              {posMode === "services" && (
                <div className="animate-in fade-in duration-200">
                  <div className="mb-8">
                    <h2 className="text-2xl font-serif text-primary-dark mb-2">Edit Session</h2>
                    <p className="text-text-secondary text-sm">Update date, time, status, and services.</p>
                  </div>

                  {/* Date / Time / Status */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-6 bg-[#fcf4f0] rounded-2xl border border-primary/10">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                      </label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-white focus:outline-none focus:border-primary text-primary-dark font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time
                      </label>
                      <input
                        type="time"
                        value={booking.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-white focus:outline-none focus:border-primary text-primary-dark font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1">Status</label>
                      <select
                        value={booking.status}
                        onChange={(e) => update("status", e.target.value as BookingStatus)}
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-white focus:outline-none focus:border-primary text-primary-dark font-medium text-sm"
                      >
                      <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Started">Started</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Service catalog */}
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Service Catalog</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {REAL_SERVICES.map((service) => {
                      const isSelected = booking.services.some((s) => s.name === service.name);
                      return (
                        <div
                          key={service.id}
                          onClick={() => toggleService(service.id)}
                          className={`rounded-2xl border transition-all cursor-pointer group flex flex-row items-center overflow-hidden h-28 ${
                            isSelected
                              ? "border-primary ring-2 ring-primary bg-primary/5"
                              : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-md"
                          }`}
                        >
                          <div className="w-28 h-full bg-primary/10 shrink-0 relative overflow-hidden">
                            {service.image ? (
                              <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-primary/40 bg-primary/5 font-serif text-sm opacity-50">Oryx</div>
                            )}
                            <div className={`absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[1px] transition-opacity ${isSelected ? "opacity-100" : "opacity-0"}`}>
                              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary shadow-sm">
                                <CheckCircle2 className="w-5 h-5" />
                              </div>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-center">
                            <div className="inline-block bg-primary/10 px-2 py-0.5 rounded text-[10px] font-bold text-primary mb-1 w-max">
                              {service.category || "Service"}
                            </div>
                            <h3 className="font-bold text-base text-primary-dark leading-tight">{service.name}</h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {posMode === "addons" && currentServiceObject && activeService && (
                <div className="animate-in fade-in duration-200">
                  <button
                    onClick={() => { setPosMode("services"); setActiveServiceIndex(null); }}
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-8 hover:opacity-80 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Catalog
                  </button>

                  <div className="mb-8 pb-8 border-b border-primary/10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 shrink-0 border border-primary/20">
                      {currentServiceObject.image ? (
                        <img src={currentServiceObject.image} alt={currentServiceObject.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40 font-serif text-xs">Oryx</div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif text-primary-dark mb-2">{currentServiceObject.name}</h2>
                      <p className="text-text-secondary text-sm">Enhance this service with premium add-ons.</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Available Add-ons</h3>
                  {currentServiceObject.addons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {currentServiceObject.addons.map((addon) => {
                        const isSelected = activeService.addons.includes(addon.name);
                        return (
                          <div
                            key={addon.id}
                            onClick={() => toggleAddon(addon.name, addon.price)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected
                                ? "border-primary bg-primary text-white shadow-md ring-1 ring-primary"
                                : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-sm"
                            }`}
                          >
                            <div>
                              <h4 className={`font-semibold text-sm ${isSelected ? "text-white" : "text-primary-dark"}`}>{addon.name}</h4>
                              <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-primary"}`}>+ QAR {addon.price}</span>
                            </div>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? "border-white bg-white/20" : "border-primary/20"}`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center border border-primary/10 border-dashed rounded-2xl bg-primary/5">
                      <p className="text-primary-dark font-medium">No Add-ons Available</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT: Cart Summary */}
            <div className="w-full lg:w-[340px] xl:w-[380px] bg-white rounded-[32px] border border-primary/10 flex flex-col shrink-0 overflow-y-auto scrollbar-hide shadow-sm">
              <div className="p-6 space-y-6 flex flex-col h-full">
                <div>
                  <h1 className="text-2xl font-serif text-primary-dark mb-1">Session Cart</h1>
                  <p className="text-text-secondary text-xs">Services added to this booking.</p>
                </div>

                <div className="flex-1 space-y-4">
                  {booking.services.length === 0 ? (
                    <div className="text-center py-8 text-text-secondary text-sm italic border border-primary/10 border-dashed rounded-2xl bg-[#fcf4f0]/50">
                      Cart is empty
                    </div>
                  ) : (
                    booking.services.map((svc, idx) => {
                      const matchedObj = REAL_SERVICES.find((r) => r.name === svc.name);
                      const baseP = matchedObj?.pricingTiers?.[0]?.price || 0;
                      const isActive = activeServiceIndex === idx;

                      return (
                        <div
                          key={idx}
                          className={`bg-[#fcf4f0] border rounded-2xl p-4 transition-all ${isActive ? "border-primary ring-1 ring-primary shadow-sm" : "border-primary/10 hover:border-primary/30"}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-primary-dark text-sm pr-2">{svc.name}</span>
                            <span className="font-semibold text-primary-dark text-sm shrink-0">QAR {baseP}</span>
                          </div>
                          {svc.addons.length > 0 ? (
                            <div className="space-y-1.5 mt-2 pt-2 border-t border-primary/10">
                              {svc.addons.map((addon, aIdx) => {
                                const matchedAddon = matchedObj?.addons.find((a) => a.name === addon);
                                return (
                                  <div key={aIdx} className="flex justify-between items-center text-xs">
                                    <span className="text-text-secondary flex items-center gap-1.5">
                                      <ChevronRight className="w-3 h-3 text-primary/40" /> {addon}
                                    </span>
                                    <span className="text-text-secondary">{matchedAddon ? `+ QAR ${matchedAddon.price}` : "+"}</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-[10px] text-text-secondary italic mt-1">No add-ons</div>
                          )}
                          <div className="mt-4 pt-3 border-t border-primary/10 flex justify-end gap-2">
                            <button
                              onClick={() => configureAddonsFor(idx)}
                              className={`text-[10px] px-3 py-1.5 rounded-full font-bold uppercase tracking-wider transition-colors ${
                                isActive ? "bg-primary text-white" : "bg-white border border-primary/20 text-primary hover:bg-primary/5"
                              }`}
                            >
                              {isActive ? "Configuring" : "Edit Add-ons"}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="bg-primary-dark text-white rounded-2xl p-6 shadow-md mt-auto shrink-0">
                  <div className="flex justify-between items-center mb-2 opacity-80 text-sm">
                    <span>Subtotal</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
