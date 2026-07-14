"use client";

import { useState } from "react";
import { Bell, Calendar, Package, AlertCircle, Info, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MOCK_NOTIFICATIONS, Notification, NotificationType } from "../../src/features/notifications/mock-data";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationType | "All">("All");

  const filtered = notifications.filter((n) => filter === "All" || n.type === filter);
  
  const unreadCount = notifications.filter(n => n.status === "Unread").length;

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, status: "Read" })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "Read" } : n));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "Booking": return <Calendar className="w-5 h-5 text-blue-500" />;
      case "Stock": return <Package className="w-5 h-5 text-amber-500" />;
      case "System": return <Info className="w-5 h-5 text-slate-500" />;
      default: return <Bell className="w-5 h-5 text-primary" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch (type) {
      case "Booking": return "bg-blue-50 border-blue-100";
      case "Stock": return "bg-amber-50 border-amber-100";
      case "System": return "bg-slate-50 border-slate-100";
      default: return "bg-primary/5 border-primary/10";
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="bg-white/80 backdrop-blur-3xl rounded-[32px] border border-primary/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Top Bar */}
        <div className="px-6 md:px-10 py-6 border-b border-primary/10 flex flex-col sm:flex-row gap-6 justify-between items-center shrink-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0 w-full sm:w-auto">
            {["All", "Booking", "Stock", "System"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as NotificationType | "All")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  filter === type
                    ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                    : "bg-white text-text-secondary hover:bg-primary/5 hover:text-primary-dark"
                }`}
              >
                {type} {type === "All" && unreadCount > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${filter === type ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap group"
          >
            <span className="relative flex h-3 w-3 items-center justify-center">
              {unreadCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>}
              <Check className="relative inline-flex rounded-full w-3 h-3" />
            </span>
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-10 relative">
          
          <div className="max-w-3xl mx-auto space-y-5 relative z-10">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                  <Bell className="w-10 h-10 text-primary/30" />
                </div>
                <h3 className="text-xl font-serif text-primary-dark mb-2">All caught up!</h3>
                <p className="text-sm text-text-secondary max-w-xs">You have no new notifications at the moment. Relax and enjoy the peace.</p>
              </div>
            ) : (
              filtered.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => { if (notification.status === "Unread") markAsRead(notification.id); }}
                  className={`group relative flex gap-5 p-6 rounded-3xl transition-all duration-500 cursor-pointer ${
                    notification.status === "Unread" 
                      ? "bg-white border border-primary/10 shadow-[0_4px_20px_rgba(200,169,156,0.15)] hover:shadow-[0_8px_30px_rgba(200,169,156,0.25)] hover:-translate-y-1" 
                      : "bg-white/40 border border-transparent hover:bg-white hover:border-primary/5 hover:shadow-sm"
                  }`}
                >
                  {/* Unread Glow Indicator */}
                  {notification.status === "Unread" && (
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-1 h-12 rounded-r-full bg-primary shadow-[0_0_10px_rgba(200,169,156,0.8)]" />
                  )}

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                      <h3 className={`font-serif text-lg leading-tight ${notification.status === "Unread" ? "text-primary-dark font-medium" : "text-primary-dark/70"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-full w-fit">
                        {notification.timestamp}
                      </span>
                    </div>
                    
                    <p className={`text-sm leading-relaxed mb-4 ${notification.status === "Unread" ? "text-text-secondary" : "text-text-secondary/70"}`}>
                      {notification.message}
                    </p>

                    {notification.actionUrl && (
                      <Link 
                        href={notification.actionUrl}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-dark transition-colors w-fit group-hover:translate-x-1 duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details 
                        <span className="bg-primary/10 p-1 rounded-full group-hover:bg-primary group-hover:text-white transition-colors">
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
