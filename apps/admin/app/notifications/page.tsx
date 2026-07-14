"use client";

import { useState } from "react";
import { Bell, Calendar, Package, Info, Check, Phone, MessageSquare, MessageCircle, Mail, Clock, User, CalendarCheck, ArrowRight } from "lucide-react";
import { MOCK_NOTIFICATIONS, Notification, NotificationType, BookingPayload } from "../../src/features/notifications/mock-data";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationType | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(notifications[0]?.id || null);

  const filtered = notifications.filter((n) => filter === "All" || n.type === filter);
  const unreadCount = notifications.filter(n => n.status === "Unread").length;
  
  const selectedNotif = notifications.find(n => n.id === selectedId) || null;

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, status: "Read" })));
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "Read" } : n));
  
  const handleSelect = (id: string) => {
    setSelectedId(id);
    markAsRead(id);
  };

  const confirmBooking = (id: string) => {
    setNotifications(prev => prev.map(n => {
      if (n.id === id && n.bookingData) {
        return { ...n, bookingData: { ...n.bookingData, status: "Confirmed" } };
      }
      return n;
    }));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "Booking": return <Calendar className="w-5 h-5" />;
      case "Stock": return <Package className="w-5 h-5" />;
      case "System": return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex h-full bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden">
      
      {/* LEFT PANE - List */}
      <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 border-r border-gray-200 flex flex-col bg-white">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif text-gray-900">Inbox</h1>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-40"
            >
              <Check className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {["All", "Booking", "Stock", "System"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as NotificationType | "All")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  filter === type
                    ? "bg-gray-900 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto scrollbar-hide divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-10 h-10 text-gray-300 mb-4" />
              <p className="text-sm font-medium text-gray-900">You're all caught up</p>
            </div>
          ) : (
            filtered.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleSelect(notification.id)}
                className={`flex gap-4 p-5 cursor-pointer transition-all duration-300 relative ${
                  selectedId === notification.id
                    ? "bg-gray-50/80 shadow-[inset_4px_0_0_0_#111827]"
                    : notification.status === "Unread"
                    ? "bg-white hover:bg-gray-50"
                    : "hover:bg-gray-50/50 opacity-70"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  notification.type === 'Booking' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  notification.type === 'Stock' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                  'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm truncate pr-2 ${notification.status === "Unread" ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-semibold whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${notification.status === "Unread" ? "text-gray-600 font-medium" : "text-gray-500"}`}>
                    {notification.message}
                  </p>
                </div>
                
                {notification.status === "Unread" && selectedId !== notification.id && (
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT PANE - Details */}
      <div className="flex-1 hidden md:flex flex-col bg-white overflow-hidden relative">
        {selectedNotif ? (
          <div className="flex-1 overflow-auto scrollbar-hide flex flex-col">
            
            {/* Detail Header */}
            <div className="p-10 border-b border-gray-100 bg-white flex items-start gap-5">
              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border ${
                selectedNotif.type === 'Booking' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                selectedNotif.type === 'Stock' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                'bg-gray-50 border-gray-200 text-gray-600'
              }`}>
                {getIcon(selectedNotif.type)}
              </div>
              <div className="flex-1">
                <span className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-3 ${
                  selectedNotif.type === 'Booking' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  selectedNotif.type === 'Stock' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                  'bg-gray-50 border-gray-200 text-gray-600'
                }`}>
                  {selectedNotif.type}
                </span>
                <h2 className="text-3xl font-serif text-gray-900 mb-2">{selectedNotif.title}</h2>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" /> Received {selectedNotif.timestamp}
                </p>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-10 flex-1">
              
              <p className="text-lg text-gray-700 leading-relaxed mb-10 max-w-3xl">
                {selectedNotif.message}
              </p>

              {/* BOOKING SPECIFIC UI */}
              {selectedNotif.type === "Booking" && selectedNotif.bookingData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
                  
                  {/* Customer Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Customer Details</h4>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-lg font-serif">
                        {selectedNotif.bookingData.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">{selectedNotif.bookingData.customerName}</p>
                        <p className="text-gray-500 text-sm">{selectedNotif.bookingData.customerPhone}</p>
                      </div>
                    </div>
                    
                    {/* Contact Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 p-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 text-gray-700 rounded-2xl transition-all flex justify-center items-center" title="Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 text-gray-700 rounded-2xl transition-all flex justify-center items-center" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-green-50 border border-green-100 hover:bg-green-100 hover:border-green-200 text-green-600 rounded-2xl transition-all flex justify-center items-center" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-gray-50 border border-gray-100 hover:bg-gray-100 hover:border-gray-200 text-gray-700 rounded-2xl transition-all flex justify-center items-center" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Session Card */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Session Details</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        selectedNotif.bookingData.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                        selectedNotif.bookingData.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {selectedNotif.bookingData.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedNotif.bookingData.serviceName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <CalendarCheck className="w-4 h-4 shrink-0" />
                          <span className="truncate">{selectedNotif.bookingData.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>{selectedNotif.bookingData.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm col-span-2">
                          <User className="w-4 h-4 shrink-0" />
                          <span>Staff: {selectedNotif.bookingData.staffName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Actions */}
                    {selectedNotif.bookingData.status === "Pending" && (
                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
                        <button 
                          onClick={() => confirmBooking(selectedNotif.id)}
                          className="flex-1 bg-gray-900 text-white py-3 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                        >
                          Confirm Booking
                        </button>
                        <button className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                  
                </div>
              )}

              {/* DEFAULT ACTION */}
              {selectedNotif.type !== "Booking" && selectedNotif.actionUrl && (
                <Link
                  href={selectedNotif.actionUrl}
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                  Manage {selectedNotif.type} <ArrowRight className="w-4 h-4" />
                </Link>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center bg-gray-50/50">
            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-serif text-gray-900 mb-2">Select a notification</h3>
            <p className="text-sm text-gray-500 max-w-xs">Choose an item from the inbox to view its details here.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
