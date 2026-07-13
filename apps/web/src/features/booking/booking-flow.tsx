"use client";

import { useState } from "react";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { useCartStore, useUserStore } from "@/shared/store";
import { ChevronRight, Plus, ClipboardList, Clock, Calendar as CalendarIcon, CheckCircle2, X, ChevronDown, ChevronUp, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CartItem, Item, ItemVariant } from "@/shared/types";

function CartItemCard({ cartItem, setItemToDelete, removeItem, addItem }: { 
  cartItem: CartItem, 
  setItemToDelete: (id: string) => void,
  removeItem: (id: string) => void,
  addItem: (item: Item, variant?: ItemVariant, addons?: ItemVariant[]) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-surface rounded-soft shadow-sm border border-primary/5 overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-primary/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
            <img src={cartItem.item.imageUrl} alt={cartItem.item.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-medium text-text-primary text-[15px]">{cartItem.item.name}</h4>
            <span className="font-semibold text-primary mt-1 block">QAR {cartItem.totalPrice}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      <div 
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 border-t border-primary/5 pt-3 bg-gray-50/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-text-secondary uppercase">Details</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setItemToDelete(cartItem.id);
                }} 
                className="text-xs font-medium text-text-secondary hover:text-primary transition-colors"
              >
                Remove Service
              </button>
            </div>
            {cartItem.selectedVariant && (
              <div className="mb-2">
                <p className="text-xs font-medium text-text-secondary uppercase mb-1">Duration / Variant:</p>
                <p className="text-sm text-text-primary">{cartItem.selectedVariant.name}</p>
              </div>
            )}
            
            {cartItem.selectedAddons && cartItem.selectedAddons.length > 0 && (
              <div className="space-y-1 mt-3">
                <p className="text-xs font-medium text-text-secondary uppercase mb-1">Add-ons:</p>
                {cartItem.selectedAddons.map(addon => (
                  <div key={addon.id} className="flex items-center justify-between text-sm text-text-secondary bg-white p-2 rounded border border-gray-100">
                    <span>+ {addon.name}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">QAR {addon.price}</span>
                      <button 
                        onClick={() => {
                          const newAddons = cartItem.selectedAddons?.filter(a => a.id !== addon.id);
                          removeItem(cartItem.id);
                          addItem(cartItem.item, cartItem.selectedVariant, newAddons);
                        }}
                        className="text-text-secondary hover:text-primary hover:bg-primary/10 p-1 rounded-full transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4">
              <Link 
                href={`/service/${cartItem.item.id}`}
                className="text-xs font-medium text-primary flex items-center hover:underline"
              >
                <Plus className="w-3 h-3 mr-1" /> Add more addons
              </Link>
            </div>
            
            {!cartItem.selectedVariant && (!cartItem.selectedAddons || cartItem.selectedAddons.length === 0) && (
              <p className="text-sm text-text-secondary italic mt-3">No additional options selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BookingFlow() {
  const router = useRouter();
  const [step, setStep] = useState<"services" | "time" | "auth" | "success">("services");
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Stores
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  // Time slot matrix state
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // OTP Auth state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");

  const services = ALL_MOCK_ITEMS.filter(i => !i.isProduct);

  // Calendar Helpers
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const today = new Date();
  const isCurrentMonth = currentMonth.getFullYear() === today.getFullYear() && currentMonth.getMonth() === today.getMonth();

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  // Time slots generator based on date
  const generateTimeSlots = (date: Date | null) => {
    if (!date) return [];
    
    const day = date.getDate();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const allSlots = [
      "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
      "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
      "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
    ];

    if (isWeekend) {
      return allSlots.filter((_, i) => i % 2 === 0);
    } else if (day % 3 === 0) {
      return allSlots.slice(0, 10);
    } else if (day % 3 === 1) {
      return allSlots.slice(10, 20);
    } else {
      return allSlots;
    }
  };

  const generateBookedSlots = (date: Date | null, slots: string[]) => {
    if (!date) return [];
    const day = date.getDate();
    return slots.filter((_, i) => (i + day) % 4 === 0);
  };

  const dynamicTimeSlots = generateTimeSlots(selectedDate);
  const dynamicBookedSlots = generateBookedSlots(selectedDate, dynamicTimeSlots);

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

  const handleBack = () => {
    if (step === "success") {
      router.back();
    } else if (step === "auth") {
      setStep("time");
    } else if (step === "time") {
      setStep("services");
    } else {
      router.back();
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-[#faf6f3]">
      {step !== "success" && (
        <>
          <div className={`fixed top-0 w-full max-w-md mx-auto left-0 right-0 px-6 pt-6 pb-4 flex items-center justify-center z-40 ${step === "auth" ? "bg-[#ddbdae]" : "bg-[#faf6f3]"}`}>
            <button 
              onClick={handleBack} 
              className={`absolute left-6 p-2 flex items-center justify-center rounded-full transition-colors ${step === "auth" ? "text-white hover:bg-white/20" : "text-text-secondary hover:bg-black/5"}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className={`font-serif text-3xl font-medium text-center ${step === "auth" ? "text-white" : "text-primary-dark"}`}>Book Session</h1>
          </div>
          {/* Spacer to push content below fixed header */}
          <div className="h-[76px] w-full shrink-0" />
        </>
      )}
      
      {/* 1. CART SUMMARY */}
      {step === "services" && (
        <div className="flex-1 overflow-y-auto pb-32">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center space-y-6 pt-20">
              <ClipboardList className="w-16 h-16 text-primary/20" />
              <div>
                <h3 className="font-serif text-2xl text-primary-dark mb-2">Your booking is empty</h3>
                <p className="text-text-secondary text-sm">Explore our services and add them to your booking.</p>
              </div>
              <Link href="/services" className="bg-primary text-surface px-8 py-3 rounded-full font-medium">
                Explore Services
              </Link>
            </div>
          ) : (
            <div className="flex flex-col min-h-full">
              {/* Tabs */}
              <div className="px-6 mb-6">
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                  {Array.from(new Set(cartItems.map(i => i.item.category))).map((category, idx, arr) => {
                    // For simplicity in this demo without adding more state, we just show all groups sequentially 
                    // or we could build a tab state. Let's just render all selected categories as headers.
                    return null;
                  })}
                </div>
                
                <h2 className="font-serif text-2xl text-primary-dark mb-4 mt-2">Your Selected Services</h2>
                
                {/* Grouped Items */}
                <div className="space-y-6">
                  {Array.from(new Set(cartItems.map(i => i.item.category))).map(category => (
                    <div key={category} className="space-y-3">
                      <h3 className="font-medium text-lg text-primary border-b border-primary/10 pb-2">{category}</h3>
                      {cartItems.filter(i => i.item.category === category).map(cartItem => (
                        <CartItemCard 
                          key={cartItem.id} 
                          cartItem={cartItem} 
                          setItemToDelete={setItemToDelete} 
                          removeItem={removeItem}
                          addItem={addItem}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add more & Billing */}
              <div className="mt-auto px-6 pt-4 pb-8 space-y-6">
                
                <Link 
                  href="/services" 
                  className="w-full py-3.5 rounded-xl border-2 border-primary/20 text-primary font-medium flex items-center justify-center transition-colors hover:bg-primary/5 bg-transparent"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add More Services
                </Link>

                <div className="bg-primary/5 rounded-soft p-5 space-y-3">
                  <h3 className="font-serif text-lg text-primary-dark mb-4">Billing Details</h3>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>QAR {total}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Taxes & Fees</span>
                    <span>QAR 0.00</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg text-text-primary pt-3 border-t border-primary/10">
                    <span>Total</span>
                    <span>QAR {total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. TIME SELECTION */}
      {step === "time" && (
        <div className="flex-1 overflow-y-auto px-6 pb-32 space-y-8 mt-4">
          
          {/* Calendar Header */}
          <div className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-primary/10">
            <div className="flex justify-between items-center p-5 bg-primary/5 border-b border-primary/10">
              <h3 className="font-serif text-lg text-primary-dark font-semibold capitalize">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex space-x-2">
                <button 
                  onClick={handlePrevMonth} 
                  disabled={isCurrentMonth}
                  className="p-2 rounded-full bg-white shadow-sm border border-primary/10 text-primary hover:bg-primary/5 disabled:opacity-40 disabled:hover:bg-white disabled:shadow-none transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleNextMonth} 
                  className="p-2 rounded-full bg-white shadow-sm border border-primary/10 text-primary hover:bg-primary/5 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-text-secondary py-1">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {blanks.map(b => (
                <div key={`blank-${b}`} className="h-10"></div>
              ))}
              
              {days.map(d => {
                const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), d);
                const todayMidnight = new Date();
                todayMidnight.setHours(0, 0, 0, 0);
                
                const isPast = dateObj < todayMidnight;
                const isSelected = selectedDate && dateObj.toDateString() === selectedDate.toDateString();
                const isToday = dateObj.toDateString() === today.toDateString();

                return (
                  <button
                    key={d}
                    disabled={isPast}
                    onClick={() => {
                      setSelectedDate(dateObj);
                      setSelectedTime(null);
                    }}
                    className={`
                      h-10 w-full rounded-full flex items-center justify-center text-sm transition-all
                      ${isPast ? "text-gray-300 cursor-not-allowed" : "hover:bg-primary/10"}
                      ${isSelected ? "bg-primary text-surface font-medium hover:bg-primary shadow-md" : ""}
                      ${isToday && !isSelected ? "border border-primary/30 text-primary font-medium" : ""}
                      ${!isPast && !isSelected && !isToday ? "text-text-primary" : ""}
                    `}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

          {/* Time Slots */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg text-primary-dark">Available Times</h3>
              {selectedDate && (
                <span className="text-sm font-medium text-text-secondary">
                  {selectedDate.toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            
            {dynamicTimeSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {dynamicTimeSlots.map(time => {
                  const isBooked = dynamicBookedSlots.includes(time);
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(time)}
                      className={`
                        py-2.5 rounded-soft text-sm font-medium border transition-colors
                        ${isBooked ? "opacity-40 bg-gray-100 border-transparent text-gray-400" : 
                          isSelected ? "bg-primary border-primary text-surface shadow-md" : 
                          "bg-surface border-primary/20 text-text-primary hover:border-primary hover:shadow-sm"}
                      `}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary text-sm">
                Please select a date to see available times.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. AUTH / OTP */}
      {step === "auth" && (
        <div className="relative w-full h-[calc(100dvh-11rem)] bg-[#fbf6f0] flex items-center justify-center">
          {/* Top Pink Banner */}
          <div className="absolute top-0 left-0 right-0 h-[25%] bg-[#ddbdae] rounded-b-[24px] z-0"></div>

          <div className="w-[calc(100%-2.5rem)] max-w-[420px] bg-white rounded-[2.5rem] shadow-xl relative z-10 p-8 pb-10">
            
            {/* Heading */}
            <h3 className="font-serif text-2xl text-primary-dark text-center mb-6 mt-2">Your Details</h3>

            <div className="space-y-6">
              
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-[#9a8276] uppercase mb-1.5 block tracking-wider">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full bg-transparent border border-[#ddbdae] rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-primary px-4 py-3 text-sm placeholder:text-gray-300"
                />
              </div>
              
              {/* Mobile Number */}
              <div>
                <label className="text-xs font-bold text-[#9a8276] uppercase mb-1.5 block tracking-wider">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+974 1234 5678"
                  className="w-full bg-transparent border border-[#ddbdae] rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-primary px-4 py-3 text-sm placeholder:text-gray-300"
                />
              </div>
              
              {/* Receive Updates Via */}
              <div className="pt-2">
                <label className="text-xs font-bold text-[#9a8276] uppercase mb-3 block text-center tracking-wider">Receive Updates Via</label>
                <div className="flex p-1 rounded-xl bg-transparent border border-[#ddbdae]">
                  <button 
                    type="button"
                    onClick={() => setChannel("WhatsApp")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${channel === "WhatsApp" ? "bg-[#ddbdae] text-white shadow-sm" : "text-[#9a8276] hover:bg-[#fbf6f0]"}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${channel === "SMS" ? "bg-[#ddbdae] text-white shadow-sm" : "text-[#9a8276] hover:bg-[#fbf6f0]"}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              
              {/* Verify & Confirm */}
              <div className="pt-6">
                <button type="submit" className="w-full py-3.5 rounded-xl text-white font-medium shadow-md transition-all hover:opacity-90 bg-[#ddbdae]">
                  Verify & Confirm
                </button>
              </div>
            </div>
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

      {/* CART FLOATING ACTION (Only show if not success/auth and cart is not empty) */}
      {cartItems.length > 0 && (step === "services" || step === "time") && (
        <div className="fixed bottom-[100px] w-full max-w-md mx-auto left-0 right-0 px-6 z-40 animate-in slide-in-from-bottom-5">
          <div className="bg-primary-dark rounded-soft p-4 shadow-spa text-surface flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-sm flex items-center"><ClipboardList className="w-4 h-4 mr-2" /> {cartItems.length} items</span>
              <span className="font-serif text-xl font-bold">QAR {total}</span>
            </div>
            {step === "services" ? (
              <button 
                onClick={() => setStep("time")}
                className="bg-primary text-surface px-6 py-2.5 rounded-full font-medium flex items-center text-sm hover:bg-primary-dark transition-colors border border-surface/20"
              >
                Book the services <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <button 
                disabled={!selectedTime}
                onClick={handleCheckout}
                className="bg-primary text-surface px-6 py-2.5 rounded-full font-medium flex items-center text-sm hover:bg-primary-dark transition-colors border border-surface/20 disabled:opacity-50"
              >
                Checkout <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-6">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm shadow-spa animate-in zoom-in-95">
            <h3 className="font-serif text-xl text-primary-dark mb-2">Remove Service</h3>
            <p className="text-text-secondary text-sm mb-6">Are you sure you want to remove this service from your booking?</p>
            <div className="flex space-x-3">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-full border border-primary/20 text-text-primary font-medium text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (itemToDelete) {
                    removeItem(itemToDelete);
                  }
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-full bg-primary text-surface font-medium text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
