"use client";

import { useState } from "react";
import { ALL_MOCK_ITEMS } from "@/features/catalog/mock-data";
import { useCartStore, useUserStore } from "@/shared/store";
import { ChevronRight, Plus, ClipboardList, Clock, Calendar as CalendarIcon, CheckCircle2, X, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
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

      {/* CART FLOATING ACTION (Only show if not success/auth and cart is not empty) */}
      {cartItems.length > 0 && (step === "services" || step === "time") && (
        <div className="absolute bottom-6 left-6 right-6 bg-primary-dark rounded-soft p-4 shadow-spa text-surface flex items-center justify-between z-10 animate-in slide-in-from-bottom-5">
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
