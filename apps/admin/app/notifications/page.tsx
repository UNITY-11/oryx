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
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        
        {/* Top Bar */}
        <div className="p-4 md:p-6 border-b border-primary/10 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0 bg-[#fcf4f0]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0 w-full sm:w-auto">
            {["All", "Booking", "Stock", "System"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type as NotificationType | "All")}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  filter === type
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-white text-text-secondary border-primary/10 hover:bg-primary/5"
                }`}
              >
                {type} {type === "All" && unreadCount > 0 && <span className="ml-1 bg-white text-primary px-1.5 rounded-full text-[10px]">{unreadCount}</span>}
              </button>
            ))}
          </div>

          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80 transition-opacity disabled:opacity-40 whitespace-nowrap"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-auto scrollbar-hide flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-text-secondary">
                <Bell className="w-10 h-10 mb-3 text-primary/20" />
                <p>No notifications found.</p>
              </div>
            ) : (
              filtered.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => { if (notification.status === "Unread") markAsRead(notification.id); }}
                  className={`relative flex gap-4 p-5 rounded-2xl border transition-all ${
                    notification.status === "Unread" 
                      ? "bg-white border-primary/20 shadow-sm" 
                      : "bg-primary/5 border-transparent opacity-70"
                  }`}
                >
                  {/* Unread dot */}
                  {notification.status === "Unread" && (
                    <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary" />
                  )}

                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${getIconBg(notification.type)}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-semibold ${notification.status === "Unread" ? "text-primary-dark" : "text-text-secondary"}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-text-secondary">• {notification.timestamp}</span>
                    </div>
                    
                    <p className={`text-sm mb-3 ${notification.status === "Unread" ? "text-text-secondary" : "text-text-secondary/80"}`}>
                      {notification.message}
                    </p>

                    {notification.actionUrl && (
                      <Link 
                        href={notification.actionUrl}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        View Details <ArrowRight className="w-3 h-3" />
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
