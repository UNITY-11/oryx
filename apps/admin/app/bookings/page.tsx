"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Search, Plus, Filter, ArrowUpDown } from "lucide-react";
import { MOCK_BOOKINGS, BookingStatus, Booking } from "../../src/features/bookings/mock-data";
import { AddBookingModal } from "../../src/features/bookings/add-booking-modal";

function BookingsContent() {
  const [bookings, setBookings] = useState<Booking[]>(MOCK_BOOKINGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(false);
    }
  }, [searchParams]);
  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">("All");
  const [sortField, setSortField] = useState<"id" | "date" | "amount" | "customerName">("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Handlers
  const handleAddBooking = (newBooking: Booking) => {
    setBookings([newBooking, ...bookings]);
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Derived State
  const filteredAndSortedBookings = bookings
    .filter(b => statusFilter === "All" || b.status === statusFilter)
    .filter(b => 
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === "date") {
        // Compare date + time
        const dateA = new Date(`${a.date}T${a.time}`).getTime();
        const dateB = new Date(`${b.date}T${b.time}`).getTime();
        comparison = dateA - dateB;
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortField === "customerName") {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === "id") {
        comparison = a.id.localeCompare(b.id);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-8">
      {/* Header Area */}

      {/* Combined Table and Filters */}
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col md:flex-row gap-4 justify-between items-center z-10 shrink-0">
          <div className="relative w-full md:w-96 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
            <input 
              type="text" 
              placeholder="Search by customer or ID..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-transparent border border-primary rounded-full focus:outline-none focus:ring-1 focus:ring-primary transition-colors text-primary-dark placeholder:text-primary/70"
            />
          </div>

        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
          <div className="flex items-center text-text-secondary px-2">
            <Filter className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          {["All", "Confirmed", "Pending", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                statusFilter === status 
                  ? 'bg-primary text-white border-primary shadow-sm' 
                  : 'bg-white text-text-secondary border-primary/10 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        </div>

        {/* Data Table */}
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead className="sticky top-0 bg-[#fcf4f0] z-10">
              <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 font-medium pl-6 md:pl-8 cursor-pointer group" onClick={() => toggleSort('id')}>
                  <div className="flex items-center">
                    ID
                    <ArrowUpDown className={`w-3 h-3 ml-1 transition-opacity ${sortField === 'id' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th className="py-4 font-medium cursor-pointer group" onClick={() => toggleSort('customerName')}>
                  <div className="flex items-center">
                    Customer
                    <ArrowUpDown className={`w-3 h-3 ml-1 transition-opacity ${sortField === 'customerName' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th className="py-4 font-medium">Service & Add-ons</th>
                <th className="py-4 font-medium cursor-pointer group" onClick={() => toggleSort('date')}>
                  <div className="flex items-center">
                    Date & Time
                    <ArrowUpDown className={`w-3 h-3 ml-1 transition-opacity ${sortField === 'date' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
                <th className="py-4 font-medium">Status</th>
                <th className="py-4 font-medium text-right cursor-pointer group pr-6 md:pr-8" onClick={() => toggleSort('amount')}>
                  <div className="flex items-center justify-end">
                    Amount
                    <ArrowUpDown className={`w-3 h-3 ml-1 transition-opacity ${sortField === 'amount' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredAndSortedBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-secondary">
                    No bookings found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredAndSortedBookings.map((booking) => (
                  <tr key={booking.id} onClick={() => router.push(`/bookings/${booking.id}`)} className="hover:bg-primary/5 transition-colors group cursor-pointer">
                    <td className="py-5 font-mono text-xs text-text-secondary pl-6 md:pl-8">{booking.id}</td>
                    <td className="py-5">
                      <p className="font-medium text-primary-dark">{booking.customerName}</p>
                      <p className="text-sm text-text-secondary mt-0.5">{booking.phone}</p>
                    </td>
                    <td className="py-5">
                      <p className="font-medium text-text-primary">{booking.service}</p>
                      {booking.addons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {booking.addons.map((addon, idx) => (
                            <span key={idx} className="inline-block px-2 py-0.5 bg-gray-100 text-text-secondary text-[10px] uppercase tracking-wider rounded-md">
                              + {addon}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-5 text-text-secondary">
                      <p className="font-medium">{new Date(booking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                      <p className="text-sm mt-0.5">{booking.time}</p>
                    </td>
                    <td className="py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                        booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                        booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                        booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-5 text-right font-medium text-primary-dark pr-6 md:pr-8">
                      QAR {booking.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddBookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddBooking={handleAddBooking} 
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading bookings...</div>}>
      <BookingsContent />
    </Suspense>
  );
}
