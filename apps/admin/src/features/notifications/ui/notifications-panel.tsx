import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  Check,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  RefreshCw,
  Star,
} from "lucide-react";

import { Notification, NotificationType } from "../types";

interface NotificationsPanelProps {
  loading: boolean;
  error: string | null;
  filter: NotificationType | "All" | "Starred";
  setFilter: (f: NotificationType | "All" | "Starred") => void;
  selectedId: string | null;
  filtered: Notification[];
  unreadCount: number;
  selectedNotif: Notification | null;
  markAllAsRead: () => void;
  handleSelect: (id: string) => void;
  confirmBooking: (id: string) => void;
  declineBooking: (id: string) => void;
  toggleStar: (e: React.MouseEvent, id: string) => void;
  onRetry?: () => void;
  onBack?: () => void;
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "Booking":
      return <Calendar className="h-5 w-5" />;
    case "Stock":
      return <Package className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
}

function NotificationDetail({
  selectedNotif,
  toggleStar,
  confirmBooking,
  declineBooking,
  onBack,
}: {
  selectedNotif: Notification;
  toggleStar: (e: React.MouseEvent, id: string) => void;
  confirmBooking: (id: string) => void;
  declineBooking: (id: string) => void;
  onBack?: () => void;
}) {
  return (
    <div className="scrollbar-hide flex flex-1 flex-col overflow-auto">
      <div className="border-primary/10 relative flex items-start gap-3 border-b bg-white p-4 sm:gap-5 sm:p-6 md:p-10">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="border-primary/10 text-primary hover:bg-primary/10 mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-[#fcf4f0] transition-colors md:hidden"
            aria-label="Back to inbox"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => toggleStar(e, selectedNotif.id)}
          className={`absolute top-4 right-4 rounded-full p-2.5 transition-all sm:top-6 sm:right-6 md:top-10 md:right-10 ${
            selectedNotif.isStarred
              ? "bg-amber-50 text-amber-500"
              : "bg-primary/5 text-primary/40 hover:text-primary hover:bg-primary/10"
          }`}
          aria-label={selectedNotif.isStarred ? "Unstar" : "Star"}
        >
          <Star
            className={`h-5 w-5 ${selectedNotif.isStarred ? "fill-amber-400 text-amber-400" : ""}`}
          />
        </button>

        <div className="border-primary/20 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white sm:h-16 sm:w-16 sm:rounded-[1.25rem]">
          {getNotificationIcon(selectedNotif.type)}
        </div>
        <div className="min-w-0 flex-1 pr-12 sm:pr-14 md:pr-12">
          <span className="border-primary/20 text-primary mb-2 inline-block rounded-full border bg-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase sm:mb-3">
            {selectedNotif.type}
          </span>
          <h2 className="text-primary-dark mb-1 font-serif text-xl sm:mb-2 sm:text-2xl md:text-3xl">
            {selectedNotif.title}
          </h2>
          <p className="text-text-secondary/70 flex items-center gap-2 text-xs sm:text-sm">
            <Clock className="text-primary/60 h-3.5 w-3.5 shrink-0" /> Received{" "}
            {selectedNotif.timestamp}
          </p>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 md:p-10">
        <p className="text-primary-dark/80 mb-6 max-w-3xl text-base leading-relaxed sm:mb-10 sm:text-lg">
          {selectedNotif.message}
        </p>

        {selectedNotif.type === "Booking" && selectedNotif.bookingData && (
          <div className="flex max-w-4xl flex-col gap-4 sm:gap-6">
            <div className="border-primary/20 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <h4 className="text-text-secondary/60 mb-4 text-xs font-bold tracking-wider uppercase sm:mb-5">
                Customer Details
              </h4>
              <div className="mb-5 flex flex-1 items-center gap-4 sm:mb-6">
                <div className="bg-primary/10 text-primary-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-lg">
                  {selectedNotif.bookingData.customerName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-primary-dark truncate text-base font-semibold sm:text-lg">
                    {selectedNotif.bookingData.customerName}
                  </p>
                  <p className="text-text-secondary truncate text-sm">
                    {selectedNotif.bookingData.customerPhone}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <a
                  href={`tel:${selectedNotif.bookingData.customerPhone}`}
                  className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex h-11 items-center justify-center rounded-xl border bg-white transition-all sm:h-auto sm:rounded-2xl sm:p-3"
                  title="Call"
                >
                  <Phone className="h-4 w-4" />
                </a>
                <a
                  href={`sms:${selectedNotif.bookingData.customerPhone}`}
                  className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex h-11 items-center justify-center rounded-xl border bg-white transition-all sm:h-auto sm:rounded-2xl sm:p-3"
                  title="Message"
                >
                  <MessageSquare className="h-4 w-4" />
                </a>
                <a
                  href={`https://wa.me/${selectedNotif.bookingData.customerPhone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex h-11 items-center justify-center rounded-xl border bg-white transition-all sm:h-auto sm:rounded-2xl sm:p-3"
                  title="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4" />
                </a>
                <a
                  href={`mailto:${selectedNotif.bookingData.customerName.replace(/\s+/g, ".").toLowerCase()}@example.com`}
                  className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex h-11 items-center justify-center rounded-xl border bg-white transition-all sm:h-auto sm:rounded-2xl sm:p-3"
                  title="Email"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="border-primary/20 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6">
              <div className="mb-4 flex items-center justify-between sm:mb-5">
                <h4 className="text-text-secondary/60 text-xs font-bold tracking-wider uppercase">
                  Session Details
                </h4>
                <span
                  className={`rounded-md px-2 py-1 text-[10px] font-bold tracking-wider uppercase ${
                    selectedNotif.bookingData.status === "Confirmed"
                      ? "bg-primary/10 text-primary border-primary/20 border"
                      : selectedNotif.bookingData.status === "Cancelled"
                        ? "text-text-secondary border-primary/20 border bg-white"
                        : "text-primary-dark border-primary/20 border bg-white"
                  }`}
                >
                  {selectedNotif.bookingData.status}
                </span>
              </div>

              <div className="flex-1 space-y-4">
                <div className="border-primary/10 border-b pb-4">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-primary-dark text-base font-semibold">
                      {selectedNotif.bookingData.serviceName}
                    </p>
                    <span className="text-primary-dark shrink-0 text-base font-bold">
                      {selectedNotif.bookingData.price} QAR
                    </span>
                  </div>
                  <div className="text-text-secondary flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="bg-primary/5 border-primary/10 rounded-md border px-2 py-0.5">
                      {selectedNotif.bookingData.duration}
                    </span>
                    {selectedNotif.bookingData.options?.map((option, idx) => (
                      <span
                        key={idx}
                        className="bg-primary/5 border-primary/10 rounded-md border px-2 py-0.5"
                      >
                        + {option}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <CalendarCheck className="text-primary/60 h-4 w-4 shrink-0" />
                    <span className="truncate">
                      {selectedNotif.bookingData.date}
                    </span>
                  </div>
                  <div className="text-text-secondary flex items-center gap-2 text-sm">
                    <Clock className="text-primary/60 h-4 w-4 shrink-0" />
                    <span>{selectedNotif.bookingData.time}</span>
                  </div>
                </div>
              </div>

              {selectedNotif.bookingData.status === "Pending" && (
                <div className="border-primary/10 mt-5 flex flex-col gap-2 border-t pt-5 sm:mt-6 sm:flex-row sm:gap-3 sm:pt-6">
                  <button
                    type="button"
                    onClick={() => confirmBooking(selectedNotif.id)}
                    className="bg-primary hover:bg-primary/90 shadow-primary/20 h-11 flex-1 rounded-2xl text-sm font-semibold text-white shadow-md transition-all sm:py-3"
                  >
                    Confirm Booking
                  </button>
                  <button
                    type="button"
                    onClick={() => declineBooking(selectedNotif.id)}
                    className="text-primary border-primary/30 hover:bg-primary/5 h-11 rounded-2xl border bg-white px-6 text-sm font-semibold transition-colors sm:py-3"
                  >
                    Decline
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedNotif.type !== "Booking" && selectedNotif.actionUrl && (
          <Link
            href={selectedNotif.actionUrl}
            className="bg-primary hover:bg-primary/90 shadow-primary/20 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold text-white shadow-md transition-all sm:px-8 sm:py-3.5"
          >
            Manage {selectedNotif.type} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function NotificationsPanel({
  loading,
  error,
  filter,
  setFilter,
  selectedId,
  filtered,
  unreadCount,
  selectedNotif,
  markAllAsRead,
  handleSelect,
  confirmBooking,
  declineBooking,
  toggleStar,
  onRetry,
  onBack,
}: NotificationsPanelProps) {
  const showMobileDetail = Boolean(selectedNotif);

  return (
    <div className="border-primary/20 flex h-full overflow-hidden rounded-2xl border bg-white shadow-sm sm:rounded-[32px]">
      {/* Inbox list */}
      <div
        className={`border-primary/20 flex w-full shrink-0 flex-col border-r bg-white md:w-[400px] lg:w-[450px] ${
          showMobileDetail ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-primary/10 border-b p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
            <h1 className="text-primary-dark font-serif text-xl sm:text-2xl">
              Inbox
            </h1>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0 || loading}
              className="text-text-secondary hover:text-primary flex h-10 shrink-0 items-center gap-1.5 rounded-full px-3 text-[10px] font-bold tracking-wider uppercase transition-colors disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Mark all read</span>
              <span className="sm:hidden">Read all</span>
            </button>
          </div>

          <div className="scrollbar-hide -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
            {["All", "Starred", "Booking", "Stock"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setFilter(type as NotificationType | "All" | "Starred")
                }
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                  filter === type
                    ? "bg-primary shadow-primary/20 text-white shadow-md"
                    : "text-primary/60 border-primary/20 hover:border-primary/40 hover:text-primary border bg-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="scrollbar-hide divide-primary/10 flex-1 divide-y overflow-auto">
          {loading ? (
            <div className="text-text-secondary flex h-full min-h-48 flex-col items-center justify-center p-6 text-center sm:p-8">
              <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center p-6 text-center sm:p-8">
              <AlertCircle className="mb-4 h-8 w-8 text-red-500" />
              <p className="text-primary-dark mb-1 text-sm font-semibold">
                Couldn&apos;t load notifications
              </p>
              <p className="text-text-secondary mb-5 max-w-xs text-sm">
                {error}
              </p>
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="border-primary text-primary hover:bg-primary/5 inline-flex h-10 items-center gap-2 rounded-full border px-5 text-sm font-semibold"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try again
                </button>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full min-h-48 flex-col items-center justify-center p-6 text-center sm:p-8">
              <Bell className="text-primary/20 mb-4 h-10 w-10" />
              <p className="text-primary-dark mb-1 text-sm font-semibold">
                {filter === "Starred"
                  ? "No starred notifications"
                  : filter === "All"
                    ? "You're all caught up"
                    : `No ${filter} notifications`}
              </p>
              <p className="text-text-secondary max-w-xs text-xs sm:text-sm">
                {filter === "Starred"
                  ? "Star important items to find them quickly."
                  : "New alerts will appear here when they arrive."}
              </p>
            </div>
          ) : (
            filtered.map((notification) => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelect(notification.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(notification.id);
                  }
                }}
                className={`relative flex cursor-pointer gap-3 p-4 transition-all duration-300 sm:gap-4 sm:p-5 ${
                  selectedId === notification.id
                    ? "bg-primary/5 shadow-[inset_4px_0_0_0_rgba(200,169,156,1)]"
                    : notification.status === "Unread"
                      ? "hover:bg-primary/5 active:bg-primary/10 bg-white"
                      : "hover:bg-primary/5 active:bg-primary/10 opacity-70"
                }`}
              >
                <div className="border-primary/20 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <div className="mb-1 flex items-baseline justify-between gap-2">
                    <h3
                      className={`flex-1 truncate pr-2 text-sm ${
                        notification.status === "Unread"
                          ? "text-primary-dark font-bold"
                          : "text-primary-dark/80 font-medium"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex shrink-0 items-center gap-2">
                      {notification.isStarred && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                      <span className="text-primary/60 text-[10px] font-semibold whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`truncate pr-6 text-xs ${
                      notification.status === "Unread"
                        ? "text-text-secondary font-medium"
                        : "text-text-secondary/70"
                    }`}
                  >
                    {notification.message}
                  </p>
                </div>

                {notification.status === "Unread" &&
                  selectedId !== notification.id && (
                    <div className="bg-primary absolute top-1/2 right-3 h-2 w-2 -translate-y-1/2 rounded-full sm:right-4" />
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div
        className={`relative flex flex-1 flex-col overflow-hidden bg-white ${
          showMobileDetail ? "flex" : "hidden md:flex"
        }`}
      >
        {selectedNotif ? (
          <NotificationDetail
            selectedNotif={selectedNotif}
            toggleStar={toggleStar}
            confirmBooking={confirmBooking}
            declineBooking={declineBooking}
            onBack={onBack}
          />
        ) : (
          <div className="bg-primary/5 flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="border-primary/10 mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border bg-white shadow-sm sm:h-24 sm:w-24">
              <Bell className="text-primary/30 h-10 w-10" />
            </div>
            <h3 className="text-primary-dark mb-2 font-serif text-lg sm:text-xl">
              Select a notification
            </h3>
            <p className="text-text-secondary max-w-xs text-sm">
              Choose an item from the inbox to view its details here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
