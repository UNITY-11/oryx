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
    <div className="flex h-full bg-white rounded-[32px] border border-primary/20 shadow-sm overflow-hidden">
      
      {/* LEFT PANE - List */}
      <div className="w-full md:w-[400px] lg:w-[450px] shrink-0 border-r border-primary/20 flex flex-col bg-white">
        
        {/* Header */}
        <div className="p-6 border-b border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-serif text-primary-dark">Inbox</h1>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-primary transition-colors disabled:opacity-40"
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
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-white text-primary/60 border border-primary/20 hover:border-primary/40 hover:text-primary"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto scrollbar-hide divide-y divide-primary/10">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <Bell className="w-10 h-10 text-primary/20 mb-4" />
              <p className="text-sm font-medium text-primary-dark">You're all caught up</p>
            </div>
          ) : (
            filtered.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleSelect(notification.id)}
                className={`flex gap-4 p-5 cursor-pointer transition-all duration-300 relative ${
                  selectedId === notification.id
                    ? "bg-primary/5 shadow-[inset_4px_0_0_0_rgba(200,169,156,1)]"
                    : notification.status === "Unread"
                    ? "bg-white hover:bg-primary/5"
                    : "hover:bg-primary/5 opacity-70"
                }`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-white border-primary/20 text-primary">
                  {getIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`text-sm truncate pr-2 ${notification.status === "Unread" ? "font-bold text-primary-dark" : "font-medium text-primary-dark/80"}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-primary/60 font-semibold whitespace-nowrap">
                      {notification.timestamp}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${notification.status === "Unread" ? "text-text-secondary font-medium" : "text-text-secondary/70"}`}>
                    {notification.message}
                  </p>
                </div>
                
                {notification.status === "Unread" && selectedId !== notification.id && (
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
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
            <div className="p-10 border-b border-primary/10 bg-white flex items-start gap-5">
              <div className="w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 border bg-white border-primary/20 text-primary">
                {getIcon(selectedNotif.type)}
              </div>
              <div className="flex-1">
                <span className="inline-block px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-3 bg-white border-primary/20 text-primary">
                  {selectedNotif.type}
                </span>
                <h2 className="text-3xl font-serif text-primary-dark mb-2">{selectedNotif.title}</h2>
                <p className="text-text-secondary/70 text-sm flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-primary/60" /> Received {selectedNotif.timestamp}
                </p>
              </div>
            </div>

            {/* Detail Body */}
            <div className="p-10 flex-1">
              
              <p className="text-lg text-primary-dark/80 leading-relaxed mb-10 max-w-3xl">
                {selectedNotif.message}
              </p>

              {/* BOOKING SPECIFIC UI */}
              {selectedNotif.type === "Booking" && selectedNotif.bookingData && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-4xl">
                  
                  {/* Customer Card */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/20 shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary/60 mb-5">Customer Details</h4>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary-dark flex items-center justify-center text-lg font-serif">
                        {selectedNotif.bookingData.customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-primary-dark text-lg">{selectedNotif.bookingData.customerName}</p>
                        <p className="text-text-secondary text-sm">{selectedNotif.bookingData.customerPhone}</p>
                      </div>
                    </div>
                    
                    {/* Contact Actions */}
                    <div className="flex items-center gap-2">
                      <button className="flex-1 p-3 bg-white border border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary rounded-2xl transition-all flex justify-center items-center" title="Call">
                        <Phone className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-white border border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary rounded-2xl transition-all flex justify-center items-center" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-primary/10 border border-primary/20 hover:bg-primary/20 hover:border-primary/40 text-primary rounded-2xl transition-all flex justify-center items-center" title="WhatsApp">
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button className="flex-1 p-3 bg-white border border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary rounded-2xl transition-all flex justify-center items-center" title="Email">
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Session Card */}
                  <div className="bg-white rounded-3xl p-6 border border-primary/20 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary/60">Session Details</h4>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                        selectedNotif.bookingData.status === 'Confirmed' ? 'bg-primary/10 text-primary border border-primary/20' :
                        selectedNotif.bookingData.status === 'Cancelled' ? 'bg-white text-text-secondary border border-primary/20' :
                        'bg-white text-primary-dark border border-primary/20'
                      }`}>
                        {selectedNotif.bookingData.status}
                      </span>
                    </div>
                    
                    <div className="space-y-4 flex-1">
                      <div>
                        <p className="text-sm font-semibold text-primary-dark">{selectedNotif.bookingData.serviceName}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <CalendarCheck className="w-4 h-4 shrink-0 text-primary/60" />
                          <span className="truncate">{selectedNotif.bookingData.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-sm">
                          <Clock className="w-4 h-4 shrink-0 text-primary/60" />
                          <span>{selectedNotif.bookingData.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary text-sm col-span-2">
                          <User className="w-4 h-4 shrink-0 text-primary/60" />
                          <span>Staff: {selectedNotif.bookingData.staffName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Booking Actions */}
                    {selectedNotif.bookingData.status === "Pending" && (
                      <div className="flex gap-3 mt-6 pt-6 border-t border-primary/10">
                        <button 
                          onClick={() => confirmBooking(selectedNotif.id)}
                          className="flex-1 bg-primary text-white py-3 rounded-2xl text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                        >
                          Confirm Booking
                        </button>
                        <button className="px-6 py-3 bg-white text-primary border border-primary/30 rounded-2xl text-sm font-semibold hover:bg-primary/5 transition-colors">
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
                  className="inline-flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all"
                >
                  Manage {selectedNotif.type} <ArrowRight className="w-4 h-4" />
                </Link>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center bg-primary/5">
            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-sm border border-primary/10 flex items-center justify-center mb-6">
              <Bell className="w-10 h-10 text-primary/30" />
            </div>
            <h3 className="text-xl font-serif text-primary-dark mb-2">Select a notification</h3>
            <p className="text-sm text-text-secondary max-w-xs">Choose an item from the inbox to view its details here.</p>
          </div>
        )}
      </div>
      
    </div>
  );
}
