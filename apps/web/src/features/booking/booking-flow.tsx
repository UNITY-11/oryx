"use client";

import { useState } from "react";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { useCartStore, useUserStore } from "@/shared/store";
import { ChevronRight, Plus, Minus, ShoppingBag, Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

export function BookingFlow() {
  const [step, setStep] = useState<"services" | "time" | "auth" | "success">("services");
  
  // Stores
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Time slot matrix state
  const [selectedDate, setSelectedDate] = useState<string>("Today");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // OTP Auth state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");

  const services = ALL_MOCK_ITEMS.filter(i => !i.isProduct);

  const timeSlots = [
    "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM",
  ];
  
  // Mock some as booked
  const bookedSlots = ["11:30 AM", "02:00 PM", "05:30 PM", "06:00 PM"];

  const handleCheckout = () => {
    if (user) {
      setStep("success");
      clearCart();
    } else {
      setStep("auth");
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      setUser({ id: "u1", name, phone, channel });
      setStep("success");
      clearCart();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* 1. SERVICE SELECTION */}
      {step === "services" && (
        <div className="flex-1 overflow-y-auto pb-32">
          <div className="px-6 space-y-4">
            {services.map(item => {
              const inCart = cartItems.find(i => i.item.id === item.id);
              return (
                <div key={item.id} className="bg-surface rounded-soft p-4 shadow-sm flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-text-primary">{item.name}</h3>
                      <p className="text-sm text-text-secondary line-clamp-1 mt-1">{item.description}</p>
                    </div>
                    <span className="font-medium text-primary">${item.price}</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-primary/10 pt-3">
                    <span className="text-xs text-text-secondary flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> {item.duration} min
                    </span>
                    {inCart ? (
                      <div className="flex items-center space-x-3 bg-primary/10 px-3 py-1 rounded-full">
                        <button onClick={() => removeItem(item.id)} className="text-primary"><Minus className="w-4 h-4" /></button>
                        <span className="text-sm font-medium">{inCart.quantity}</span>
                        <button onClick={() => addItem(item)} className="text-primary"><Plus className="w-4 h-4" /></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addItem(item)}
                        className="text-xs font-medium bg-primary text-surface px-4 py-1.5 rounded-full"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. TIME SELECTION */}
      {step === "time" && (
        <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {["Today", "Tomorrow", "Wed, 14", "Thu, 15"].map(day => (
              <button 
                key={day} 
                onClick={() => setSelectedDate(day)}
                className={`flex-none px-6 py-2 rounded-full text-sm font-medium transition-colors ${selectedDate === day ? "bg-primary text-surface" : "bg-surface text-text-secondary border border-primary/20"}`}
              >
                {day}
              </button>
            ))}
          </div>

          <div>
            <h3 className="font-serif text-lg mb-4 text-primary-dark">Select Time</h3>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map(time => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    className={`
                      py-2 rounded-soft text-sm font-medium border transition-colors
                      ${isBooked ? "opacity-40 bg-gray-100 border-transparent text-gray-400" : 
                        isSelected ? "bg-primary border-primary text-surface" : 
                        "bg-surface border-primary/20 text-text-primary hover:border-primary"}
                    `}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. AUTH / OTP */}
      {step === "auth" && (
        <div className="flex-1 overflow-y-auto px-6 pb-32 flex flex-col justify-center">
          <div className="bg-surface p-6 rounded-soft shadow-spa space-y-6">
            <h3 className="font-serif text-2xl text-primary-dark text-center">Your Details</h3>
            <p className="text-sm text-text-secondary text-center">Please provide your details to confirm the booking.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-background border border-primary/20 rounded-soft px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-background border border-primary/20 rounded-soft px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase mb-2 block">Receive Updates Via</label>
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={() => setChannel("WhatsApp")}
                    className={`flex-1 py-2 rounded-soft text-sm font-medium border ${channel === "WhatsApp" ? "bg-primary text-surface border-primary" : "bg-transparent text-text-secondary border-primary/20"}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`flex-1 py-2 rounded-soft text-sm font-medium border ${channel === "SMS" ? "bg-primary text-surface border-primary" : "bg-transparent text-text-secondary border-primary/20"}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded-soft bg-primary text-surface font-medium mt-4">
                Verify & Confirm
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SUCCESS */}
      {step === "success" && (
        <div className="flex-1 px-6 flex flex-col items-center justify-center space-y-4 text-center">
          <CheckCircle2 className="w-20 h-20 text-primary" />
          <h2 className="font-serif text-3xl text-primary-dark">Booking Confirmed!</h2>
          <p className="text-text-secondary">Your appointment has been successfully scheduled. We have sent the details via {channel}.</p>
          <button onClick={() => setStep("services")} className="mt-8 bg-surface border border-primary text-primary px-8 py-3 rounded-soft font-medium">
            Book Another
          </button>
        </div>
      )}

      {/* CART FLOATING ACTION (Only show if not success/auth) */}
      {cartItems.length > 0 && (step === "services" || step === "time") && (
        <div className="absolute bottom-6 left-6 right-6 bg-primary-dark rounded-soft p-4 shadow-spa text-surface flex items-center justify-between z-10 animate-in slide-in-from-bottom-5">
          <div className="flex flex-col">
            <span className="font-medium text-sm flex items-center"><ShoppingBag className="w-4 h-4 mr-2" /> {cartItems.length} items</span>
            <span className="font-serif text-xl font-bold">${total}</span>
          </div>
          {step === "services" ? (
            <button 
              onClick={() => setStep("time")}
              className="bg-surface text-primary-dark px-6 py-2 rounded-full font-medium flex items-center text-sm"
            >
              Select Time <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          ) : (
            <button 
              disabled={!selectedTime}
              onClick={handleCheckout}
              className="bg-surface text-primary-dark px-6 py-2 rounded-full font-medium flex items-center text-sm disabled:opacity-50"
            >
              Checkout <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
