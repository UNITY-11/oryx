"use client";

import { useState } from "react";
import { Bell, Calendar, Package, Info, Check, ArrowRight, Circle } from "lucide-react";
import Link from "next/link";
import { MOCK_NOTIFICATIONS, Notification, NotificationType } from "../../src/features/notifications/mock-data";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<NotificationType | "All">("All");

  const filtered = notifications.filter((n) => filter === "All" || n.type === filter);
  const unreadCount = notifications.filter(n => n.status === "Unread").length;

  const markAllAsRead = () => setNotifications(prev => prev.map(n => ({ ...n, status: "Read" })));
  const markAsRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "Read" } : n));

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "Booking": return <Calendar className="w-5 h-5" />;
      case "Stock": return <Package className="w-5 h-5" />;
      case "System": return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden">
      
      {/* Header Area */}
      <div className="px-8 py-8 border-b border-primary/10 bg-[#fdfaf8]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-serif text-primary-dark mb-2">Notifications</h1>
            <p className="text-text-secondary text-sm">You have {unreadCount} unread messages</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center p-1 bg-white border border-primary/20 rounded-full shadow-sm">
              {["All", "Booking", "Stock", "System"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type as NotificationType | "All")}
                  className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-colors ${
                    filter === type
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-colors disabled:opacity-40"
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-auto scrollbar-hide">
        <div className="max-w-5xl mx-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
              <Bell className="w-12 h-12 text-primary/20 mb-4" />
              <p className="text-lg font-serif text-primary-dark">You're all caught up</p>
              <p className="text-sm text-text-secondary mt-1">No notifications match your current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/10">
              {filtered.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => { if (notification.status === "Unread") markAsRead(notification.id); }}
                  className={`group flex items-start sm:items-center gap-6 p-6 sm:px-8 transition-colors cursor-pointer ${
                    notification.status === "Unread" 
                      ? "bg-white hover:bg-[#fcf4f0]" 
                      : "bg-[#fdfaf8] opacity-80 hover:bg-[#fcf4f0]/50"
                  }`}
                >
                  
                  {/* Status & Icon */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-3 h-3 flex items-center justify-center">
                      {notification.status === "Unread" ? (
                        <Circle className="w-2.5 h-2.5 fill-primary text-primary" />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                      )}
                    </div>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                      notification.type === 'Booking' ? 'bg-[#c8a99c]' :
                      notification.type === 'Stock' ? 'bg-[#d6bba7]' :
                      'bg-[#e3d1c4]'
                    }`}>
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1">
                      <h3 className={`text-base font-medium ${notification.status === "Unread" ? "text-primary-dark" : "text-primary-dark/80"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-text-secondary whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
                      {notification.message}
                    </p>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                    {notification.actionUrl && (
                      <Link 
                        href={notification.actionUrl}
                        className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
