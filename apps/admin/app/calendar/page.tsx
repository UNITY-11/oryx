"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";

const START_HOUR = 8;
const END_HOUR = 20; // 8:00 PM
const HOUR_WIDTH = 240; // px per hour to give horizontal space
const ROW_HEIGHT = 90; // px per booking row

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-14T00:00:00"));
  const router = useRouter();

  const formattedDate = currentDate.toISOString().split('T')[0];
  
  // Filter bookings for the selected date, excluding cancelled ones
  // Sort them by time so they can be processed left-to-right
  const rawBookings = MOCK_BOOKINGS
    .filter(b => b.date === formattedDate && b.status !== 'Cancelled')
    .sort((a, b) => a.time.localeCompare(b.time));

  // Calculate lanes to pack bookings efficiently towards the top
  const laneEndTimes: number[] = [];
  const todaysBookings = rawBookings.map(booking => {
    const [h, m] = booking.time.split(':').map(Number);
    const startMinutes = h * 60 + m;
    const endMinutes = startMinutes + 60; // Assume 60 mins duration

    // Find first available lane (where previous booking ended before this starts)
    let laneIndex = laneEndTimes.findIndex(endTime => endTime <= startMinutes);
    if (laneIndex === -1) {
      laneIndex = laneEndTimes.length; // create new lane
      laneEndTimes.push(endMinutes);
    } else {
      laneEndTimes[laneIndex] = endMinutes; // update existing lane
    }

    return { ...booking, laneIndex };
  });

  const goToPreviousDay = () => {
    const prev = new Date(currentDate);
    prev.setDate(prev.getDate() - 1);
    setCurrentDate(prev);
  };

  const goToNextDay = () => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  };

  const goToToday = () => {
    setCurrentDate(new Date("2026-07-14T00:00:00"));
  };

  // Generate hour slots
  const hours = [];
  for (let i = START_HOUR; i <= END_HOUR; i++) {
    const label = i === 12 ? "12 PM" : i > 12 ? `${i - 12} PM` : `${i} AM`;
    hours.push({ value: i, label });
  }

  // Calculate position and width of a booking
  // We assume 60 minutes duration by default
  const getBookingStyle = (time: string, index: number) => {
    const [h, m] = time.split(':').map(Number);
    
    const normalizedH = Math.max(START_HOUR, Math.min(h, END_HOUR));
    
    const leftPx = ((normalizedH - START_HOUR) + (m / 60)) * HOUR_WIDTH;
    const widthPx = HOUR_WIDTH; // 60 minutes
    const topPx = index * ROW_HEIGHT + 24; // offset from top header

    return {
      left: `${leftPx}px`,
      width: `${widthPx}px`,
      top: `${topPx}px`,
      height: `${ROW_HEIGHT - 12}px`, // gap between rows
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-primary/20 border-primary text-primary-dark shadow-sm';
      case 'Pending': return 'bg-primary/5 border-primary/40 text-primary-dark border-dashed';
      case 'Completed': return 'bg-primary border-primary-dark text-white';
      case 'Cancelled': return 'bg-white border-primary/20 text-text-secondary opacity-70';
      default: return 'bg-white border-primary/20 text-primary-dark';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Header Bar */}
      <div className="bg-white rounded-t-[32px] border-b border-primary/10 shadow-sm flex items-center justify-between px-8 py-5 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-serif text-primary-dark">Schedule</h1>
            <p className="text-sm text-text-secondary">Timeline overview of appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#fcf4f0] rounded-xl p-1 border border-primary/10">
            <button 
              onClick={goToPreviousDay}
              className="p-2 hover:bg-white rounded-lg transition-colors text-primary-dark hover:shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={goToToday}
              className="px-4 py-2 hover:bg-white rounded-lg transition-colors font-semibold text-sm text-primary-dark"
            >
              Today
            </button>
            <button 
              onClick={goToNextDay}
              className="p-2 hover:bg-white rounded-lg transition-colors text-primary-dark hover:shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="text-lg font-bold text-primary-dark w-48 text-right">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="bg-white flex-1 overflow-auto rounded-b-[32px] border border-t-0 border-primary/10 shadow-sm relative">
        <div 
          className="relative min-h-[400px]"
          style={{ width: `${(END_HOUR - START_HOUR + 1) * HOUR_WIDTH}px`, height: `${Math.max(400, Math.max(1, laneEndTimes.length) * ROW_HEIGHT + 64)}px` }}
        >
          
          {/* Top Time Header (Sticky) */}
          <div className="sticky top-0 z-20 flex bg-white/95 backdrop-blur-sm border-b border-primary/10 h-12">
            {hours.map((hour) => (
              <div 
                key={hour.value} 
                className="shrink-0 border-l border-primary/10 first:border-l-0 relative"
                style={{ width: `${HOUR_WIDTH}px` }}
              >
                <span className="absolute left-3 top-3 text-xs font-semibold text-text-secondary">
                  {hour.label}
                </span>
              </div>
            ))}
          </div>

          {/* Vertical Grid Lines */}
          <div className="absolute inset-0 top-12 pointer-events-none flex z-0">
            {hours.map((hour) => (
              <div 
                key={`grid-${hour.value}`} 
                className="shrink-0 border-l border-primary/20 h-full"
                style={{ width: `${HOUR_WIDTH}px` }}
              />
            ))}
          </div>

          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 top-12 pointer-events-none z-0">
            {Array.from({ length: Math.max(8, laneEndTimes.length + 2) }).map((_, i) => (
              <div 
                key={`h-grid-${i}`} 
                className="w-full border-t border-primary/20 absolute"
                style={{ top: `${(i + 1) * ROW_HEIGHT}px` }}
              />
            ))}
          </div>

          {/* Current Time Indicator (Mocked for 2:15 PM) */}
          {formattedDate === "2026-07-14" && (
            <div 
              className="absolute top-12 bottom-0 border-l-2 border-red-400 z-10 pointer-events-none"
              style={{ left: `${((14 - START_HOUR) + (15 / 60)) * HOUR_WIDTH}px` }}
            >
              <div className="absolute -left-1.5 -top-1 w-3 h-3 rounded-full bg-red-400" />
            </div>
          )}

          {/* Bookings Area */}
          <div className="absolute inset-0 top-12">
            {todaysBookings.map((booking) => (
              <div
                key={booking.id}
                onClick={() => router.push(`/bookings/${booking.id}`)}
                className={`absolute rounded-xl border p-3 cursor-pointer transition-all hover:brightness-95 hover:shadow-md flex flex-col justify-between ${getStatusColor(booking.status)}`}
                style={getBookingStyle(booking.time, booking.laneIndex)}
              >
                <div className="flex items-start justify-between">
                  <div className="truncate pr-2">
                    <div className="font-bold text-sm truncate">{booking.customerName}</div>
                    <div className="text-xs font-medium opacity-80 truncate">{booking.service}</div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-md bg-white/50 text-[10px] font-bold uppercase tracking-wider">
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] opacity-75 mt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {booking.time} (1h)
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {booking.id}
                  </div>
                </div>
              </div>
            ))}

            {todaysBookings.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-text-secondary">
                No bookings scheduled for this date.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
