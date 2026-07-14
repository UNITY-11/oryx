"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { MOCK_BOOKINGS } from "../../src/features/bookings/mock-data";

const START_HOUR = 8;
const END_HOUR = 20; // 8:00 PM
const HOUR_HEIGHT = 80; // px per hour

export default function CalendarPage() {
  // We'll use 2026-07-14 as the default "today" since the mock data is around this date.
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-14T00:00:00"));
  const router = useRouter();

  const formattedDate = currentDate.toISOString().split('T')[0];
  
  // Filter bookings for the selected date
  const todaysBookings = MOCK_BOOKINGS.filter(b => b.date === formattedDate);

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

  // Calculate position and height of a booking
  // We assume 60 minutes duration by default
  const getBookingStyle = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    
    // If booking starts before our calendar start, clamp to start (or hide, but clamp is better)
    const normalizedH = Math.max(START_HOUR, Math.min(h, END_HOUR));
    
    const topPx = ((normalizedH - START_HOUR) + (m / 60)) * HOUR_HEIGHT;
    const heightPx = HOUR_HEIGHT; // 60 minutes = 1 hour height

    return {
      top: `${topPx}px`,
      height: `${heightPx}px`,
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
            <p className="text-sm text-text-secondary">Daily view of your spa appointments</p>
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

      {/* Timeline View */}
      <div className="bg-white flex-1 overflow-y-auto scrollbar-hide rounded-b-[32px] border border-t-0 border-primary/10 shadow-sm relative">
        <div className="flex min-w-[800px] h-full relative">
          
          {/* Time Gutter */}
          <div className="w-24 shrink-0 border-r border-primary/10 bg-white sticky left-0 z-10 flex flex-col pt-8">
            {hours.map((hour) => (
              <div 
                key={hour.value} 
                className="text-xs font-semibold text-text-secondary/70 text-right pr-4 relative"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {/* The label aligns with the top of the hour block */}
                <span className="relative -top-2.5">{hour.label}</span>
              </div>
            ))}
          </div>

          {/* Grid and Bookings Area */}
          <div className="flex-1 relative pt-8">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 pt-8 pointer-events-none">
              {hours.map((hour) => (
                <div 
                  key={`grid-${hour.value}`} 
                  className="w-full border-t border-primary/5 border-dashed"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                />
              ))}
            </div>

            {/* Vertical Line for current time (Mocked for 2:15 PM) */}
            {formattedDate === "2026-07-14" && (
              <div 
                className="absolute left-0 right-0 border-t-2 border-red-400 z-10 pointer-events-none"
                style={{ top: `${8 + ((14 - START_HOUR) + (15 / 60)) * HOUR_HEIGHT}px` }} // +8px for pt-8 offset
              >
                <div className="absolute -left-1.5 -top-1.5 w-3 h-3 rounded-full bg-red-400" />
              </div>
            )}

            {/* Render Bookings */}
            <div className="absolute inset-0 pt-8 pl-4 pr-4">
              {todaysBookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className={`absolute left-4 right-4 rounded-xl border p-3 cursor-pointer transition-all hover:brightness-95 hover:shadow-md ${getStatusColor(booking.status)}`}
                  style={{
                    ...getBookingStyle(booking.time),
                    // We reduce the height slightly to create a gap between consecutive bookings
                    height: `calc(${HOUR_HEIGHT}px - 4px)`
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm mb-1">{booking.customerName}</div>
                      <div className="text-xs font-medium opacity-80 mb-1">{booking.service}</div>
                      <div className="flex items-center gap-3 text-[10px] opacity-75">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.time} (60m)
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {booking.id}
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/50 text-[10px] font-bold uppercase tracking-wider">
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))}

              {todaysBookings.length === 0 && (
                <div className="h-full flex items-center justify-center text-text-secondary">
                  No bookings scheduled for this date.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
