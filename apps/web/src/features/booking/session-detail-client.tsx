"use client";

import { useState, useEffect } from "react";

import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin, Receipt, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/shared/store";

interface SessionDetailClientProps {
  id: string;
}

export function SessionDetailClient({ id }: SessionDetailClientProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const removeBooking = useBookingStore(state => state.removeBooking);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const booking = useBookingStore(state => state.bookings.find(b => b.id === id));
  
  if (!isMounted) {
    return <div className="flex-1 bg-[#faf6f3]" />;
  }
  
  // If we can't find it, we'll fall back gracefully
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 bg-[#faf6f3]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="font-serif text-2xl text-primary-dark">Session not found</h2>
        <button onClick={() => router.back()} className="mt-6 text-primary hover:underline">
          Go back to Profile
        </button>
      </div>
    );
  }

  const isCompleted = booking.status === "completed"; 
  const statusColor = isCompleted ? "bg-gray-100 text-gray-500" : "bg-primary/10 text-primary";
  const statusText = isCompleted ? "Completed" : "Upcoming";
  const sessionDate = booking.date;
  const sessionTime = booking.time;
  
  const primaryItem = booking.cartItems[0]?.item;
  const addons = booking.cartItems.flatMap(c => c.selectedAddons || []);
  const subtotal = booking.totalPrice;

  if (!primaryItem) return null;

  return (
    <div className="min-h-screen bg-[#faf6f3]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 w-full bg-white px-6 pt-6 pb-4 flex items-center justify-between z-50 border-b border-primary/10">
        <div className="flex items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-black/5 text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="font-serif text-2xl font-medium text-primary-dark ml-2">Session Details</h1>
        </div>
        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${statusColor}`}>
          {statusText}
        </span>
      </div>

      <div className="px-6 pt-[90px] pb-8">
        {/* Ticket Card */}
        <div className="bg-white rounded-[32px] shadow-sm border border-primary/10 overflow-hidden relative">
          
          {/* Top Section - Service Info */}
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0">
                <img src={primaryItem.imageUrl} alt={primaryItem.name} className="w-full h-full object-cover" />
              </div>
              <div className="text-right">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-1">Booking Ref</p>
                <p className="font-medium text-text-primary text-sm">{booking.bookingRef}</p>
              </div>
            </div>

            <h2 className="font-serif text-2xl text-primary-dark leading-tight mb-4">{booking.cartItems.length > 1 ? `${primaryItem.name} + ${booking.cartItems.length - 1} more` : primaryItem.name}</h2>
            
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl">
              <div>
                <p className="flex items-center text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1"><CalendarIcon className="w-3.5 h-3.5 mr-1.5" /> Date</p>
                <p className="font-medium text-sm text-text-primary">{sessionDate}</p>
              </div>
              <div>
                <p className="flex items-center text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1"><Clock className="w-3.5 h-3.5 mr-1.5" /> Time</p>
                <p className="font-medium text-sm text-text-primary">{sessionTime} (60 min)</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-start text-sm">
              <MapPin className="w-4 h-4 text-[#E5C37A] mr-3 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-text-primary">ORYX Spa & Salon Main Branch</p>
                <p className="text-text-secondary text-xs mt-0.5">West Bay, Doha, Qatar</p>
              </div>
            </div>
          </div>

          {/* Ticket Divider */}
          <div className="relative flex justify-between items-center px-4">
            <div className="w-4 h-4 bg-[#faf6f3] rounded-full absolute left-[-8px]"></div>
            <div className="w-full border-t-2 border-dashed border-gray-200"></div>
            <div className="w-4 h-4 bg-[#faf6f3] rounded-full absolute right-[-8px]"></div>
          </div>

          {/* Bottom Section - Receipt */}
          <div className="p-6 bg-gray-50/50">
            <h3 className="font-serif text-lg text-primary-dark mb-4 flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-text-secondary" /> Payment Summary
            </h3>
            
            <div className="space-y-3 mb-4 text-sm">
              {booking.cartItems.map((cartItem, idx) => (
                <div key={`item-${idx}`} className="flex justify-between items-start">
                  <div>
                    <span className="text-text-primary font-medium">1x {cartItem.item.name}</span>
                    {cartItem.selectedVariant && <span className="block text-xs text-text-secondary mt-0.5">{cartItem.selectedVariant.name}</span>}
                  </div>
                  <span className="text-text-primary">QAR {cartItem.item.price + (cartItem.selectedVariant?.price || 0)}</span>
                </div>
              ))}
              
              {addons.map((addon, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span className="text-text-primary font-medium">1x {addon.name}</span>
                    <span className="block text-[10px] text-text-secondary mt-0.5 uppercase tracking-wide">Add-on</span>
                  </div>
                  <span className="text-text-primary">QAR {addon.price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>QAR {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>QAR 0.00</span>
              </div>
            </div>
            
            <div className="flex justify-between font-medium text-lg text-primary-dark mt-4 pt-4 border-t border-gray-200">
              <span>Total Paid</span>
              <span>QAR {subtotal}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-3">
          {isCompleted ? (
            <>
              <button className="w-full py-4 rounded-2xl bg-primary text-white font-medium shadow-md transition-opacity hover:opacity-90">
                Book Again
              </button>
              <button className="w-full py-4 rounded-2xl bg-white text-text-primary border border-gray-100 font-medium shadow-sm transition-colors hover:bg-gray-50 flex items-center justify-center">
                <FileText className="w-5 h-5 mr-2 text-text-secondary" /> Download Invoice
              </button>
            </>
          ) : (
            <>
              <button className="w-full py-4 rounded-2xl bg-primary text-white font-medium shadow-md transition-opacity hover:opacity-90">
                Reschedule Session
              </button>
              <button 
                onClick={() => {
                  removeBooking(booking.id);
                  router.back();
                }}
                className="w-full py-4 rounded-2xl bg-white text-text-primary border border-gray-100 font-medium shadow-sm transition-colors hover:bg-gray-50"
              >
                Cancel Booking
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
