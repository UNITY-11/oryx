"use client";

import { useState } from "react";
import { X, Calendar, Plus, Clock } from "lucide-react";
import { MOCK_SERVICES } from "./mock-data";

export function AddBookingModal({ isOpen, onClose, onAddBooking }: { isOpen: boolean, onClose: () => void, onAddBooking: (booking: any) => void }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (!isOpen) return null;

  const selectedService = MOCK_SERVICES.find(s => s.id === selectedServiceId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    const addons = selectedService.addons.filter(a => selectedAddons.includes(a.id));
    const amount = selectedService.price + addons.reduce((sum, a) => sum + a.price, 0);

    const newBooking = {
      id: `B-${Math.floor(Math.random() * 9000) + 1000}`,
      customerName,
      phone,
      service: selectedService.name,
      addons: addons.map(a => a.name),
      date: date || new Date().toISOString().split('T')[0],
      time: time || "10:00",
      status: "Confirmed",
      amount
    };

    onAddBooking(newBooking);
    onClose();
    
    // Reset
    setCustomerName("");
    setPhone("");
    setSelectedServiceId("");
    setSelectedAddons([]);
    setDate("");
    setTime("");
  };

  const handleAddonToggle = (addonId: string) => {
    if (selectedAddons.includes(addonId)) {
      setSelectedAddons(selectedAddons.filter(id => id !== addonId));
    } else {
      setSelectedAddons([...selectedAddons, addonId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-xl rounded-[32px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-primary/10">
          <h2 className="font-serif text-2xl text-primary-dark">New Walk-in Booking</h2>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors text-text-secondary">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto scrollbar-hide flex-1">
          <form id="add-booking-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Client Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Customer Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white transition-colors" placeholder="e.g. Sarah Smith" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Phone Number</label>
                  <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white transition-colors" placeholder="+974 5555 0000" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Service Selection</h3>
              <div>
                <label className="block text-sm font-medium text-primary-dark mb-1">Primary Service</label>
                <select required value={selectedServiceId} onChange={e => { setSelectedServiceId(e.target.value); setSelectedAddons([]); }} className="w-full px-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white transition-colors">
                  <option value="">Select a service...</option>
                  {MOCK_SERVICES.map(s => (
                    <option key={s.id} value={s.id}>{s.name} - QAR {s.price}</option>
                  ))}
                </select>
              </div>

              {selectedService && selectedService.addons.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-2">Enhance with Add-ons</label>
                  <div className="space-y-2">
                    {selectedService.addons.map(addon => (
                      <label key={addon.id} className="flex items-center space-x-3 p-3 border border-primary/10 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={() => handleAddonToggle(addon.id)} className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary" />
                        <div className="flex-1 flex justify-between">
                          <span className="font-medium text-primary-dark">{addon.name}</span>
                          <span className="text-text-secondary">+ QAR {addon.price}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wider">Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                    <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary-dark mb-1">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                    <input required type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-primary/10 rounded-2xl focus:outline-none focus:border-primary/30 focus:bg-white transition-colors" />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 md:p-8 border-t border-primary/10 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary">Total Estimated Amount</p>
            <p className="font-serif text-2xl text-primary-dark">
              QAR {selectedService ? selectedService.price + selectedService.addons.filter(a => selectedAddons.includes(a.id)).reduce((s, a) => s + a.price, 0) : '0'}
            </p>
          </div>
          <button form="add-booking-form" type="submit" className="bg-primary text-white px-8 py-3 rounded-full font-medium shadow-sm hover:opacity-90 transition-opacity flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Confirm Booking</span>
          </button>
        </div>

      </div>
    </div>
  );
}
