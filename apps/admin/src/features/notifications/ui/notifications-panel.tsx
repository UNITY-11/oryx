import Link from "next/link";
import {
  AlertCircle,
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
  Star,
} from "lucide-react";
import { NotificationType, Notification } from "../mock-data";

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
}: NotificationsPanelProps) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "Booking":
        return <Calendar className="h-5 w-5" />;
      case "Stock":
        return <Package className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  return (
    <div className="border-primary/20 flex h-full overflow-hidden rounded-[32px] border bg-white shadow-sm">
      <div className="border-primary/20 flex w-full shrink-0 flex-col border-r bg-white md:w-[400px] lg:w-[450px]">
        <div className="border-primary/10 border-b p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-primary-dark font-serif text-2xl">Inbox</h1>
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-text-secondary hover:text-primary flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase transition-colors disabled:opacity-40"
            >
              <Check className="h-3.5 w-3.5" />
              Mark all read
            </button>
          </div>

          <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto">
            {["All", "Starred", "Booking", "Stock"].map((type) => (
              <button
                key={type}
                onClick={() =>
                  setFilter(type as NotificationType | "All" | "Starred")
                }
                className={`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
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
            <div className="text-text-secondary flex h-full flex-col items-center justify-center p-8 text-center">
              <Loader2 className="text-primary mb-4 h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center text-red-500">
              <AlertCircle className="mb-4 h-8 w-8" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <Bell className="text-primary/20 mb-4 h-10 w-10" />
              <p className="text-primary-dark text-sm font-medium">
                You're all caught up
              </p>
            </div>
          ) : (
            filtered.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleSelect(notification.id)}
                className={`relative flex cursor-pointer gap-4 p-5 transition-all duration-300 ${
                  selectedId === notification.id
                    ? "bg-primary/5 shadow-[inset_4px_0_0_0_rgba(200,169,156,1)]"
                    : notification.status === "Unread"
                      ? "hover:bg-primary/5 bg-white"
                      : "hover:bg-primary/5 opacity-70"
                }`}
              >
                <div className="border-primary/20 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-white">
                  {getIcon(notification.type)}
                </div>

                <div className="min-w-0 flex-1 pr-2">
                  <div className="mb-1 flex items-baseline justify-between">
                    <h3
                      className={`flex-1 truncate pr-2 text-sm ${notification.status === "Unread" ? "text-primary-dark font-bold" : "text-primary-dark/80 font-medium"}`}
                    >
                      {notification.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      {notification.isStarred && (
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      )}
                      <span className="text-primary/60 text-[10px] font-semibold whitespace-nowrap">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                  <p
                    className={`truncate pr-6 text-xs ${notification.status === "Unread" ? "text-text-secondary font-medium" : "text-text-secondary/70"}`}
                  >
                    {notification.message}
                  </p>
                </div>

                {notification.status === "Unread" &&
                  selectedId !== notification.id && (
                    <div className="bg-primary absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full" />
                  )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative hidden flex-1 flex-col overflow-hidden bg-white md:flex">
        {selectedNotif ? (
          <div className="scrollbar-hide flex flex-1 flex-col overflow-auto">
            <div className="border-primary/10 relative flex items-start gap-5 border-b bg-white p-10">
              <button
                onClick={(e) => toggleStar(e, selectedNotif.id)}
                className={`absolute top-10 right-10 rounded-full p-2 transition-all ${selectedNotif.isStarred ? "bg-amber-50 text-amber-500" : "bg-primary/5 text-primary/40 hover:text-primary hover:bg-primary/10"}`}
              >
                <Star
                  className={`h-5 w-5 ${selectedNotif.isStarred ? "fill-amber-400 text-amber-400" : ""}`}
                />
              </button>

              <div className="border-primary/20 text-primary flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] border bg-white">
                {getIcon(selectedNotif.type)}
              </div>
              <div className="flex-1 pr-12">
                <span className="border-primary/20 text-primary mb-3 inline-block rounded-full border bg-white px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                  {selectedNotif.type}
                </span>
                <h2 className="text-primary-dark mb-2 font-serif text-3xl">
                  {selectedNotif.title}
                </h2>
                <p className="text-text-secondary/70 flex items-center gap-2 text-sm">
                  <Clock className="text-primary/60 h-3.5 w-3.5" /> Received{" "}
                  {selectedNotif.timestamp}
                </p>
              </div>
            </div>

            <div className="flex-1 p-10">
              <p className="text-primary-dark/80 mb-10 max-w-3xl text-lg leading-relaxed">
                {selectedNotif.message}
              </p>

              {selectedNotif.type === "Booking" &&
                selectedNotif.bookingData && (
                  <div className="flex max-w-4xl flex-col gap-6">
                    <div className="border-primary/20 flex flex-col rounded-3xl border bg-white p-6 shadow-sm">
                      <h4 className="text-text-secondary/60 mb-5 text-xs font-bold tracking-wider uppercase">
                        Customer Details
                      </h4>
                      <div className="mb-6 flex flex-1 items-center gap-4">
                        <div className="bg-primary/10 text-primary-dark flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-serif text-lg">
                          {selectedNotif.bookingData.customerName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-primary-dark text-lg font-semibold">
                            {selectedNotif.bookingData.customerName}
                          </p>
                          <p className="text-text-secondary text-sm">
                            {selectedNotif.bookingData.customerPhone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${selectedNotif.bookingData.customerPhone}`}
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex flex-1 items-center justify-center rounded-2xl border bg-white p-3 transition-all"
                          title="Call"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <a
                          href={`sms:${selectedNotif.bookingData.customerPhone}`}
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex flex-1 items-center justify-center rounded-2xl border bg-white p-3 transition-all"
                          title="Message"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </a>
                        <a
                          href={`https://wa.me/${selectedNotif.bookingData.customerPhone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex flex-1 items-center justify-center rounded-2xl border bg-white p-3 transition-all"
                          title="WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </a>
                        <a
                          href={`mailto:${selectedNotif.bookingData.customerName.replace(/\s+/g, ".").toLowerCase()}@example.com`}
                          className="border-primary/20 hover:bg-primary/5 hover:border-primary/40 text-primary flex flex-1 items-center justify-center rounded-2xl border bg-white p-3 transition-all"
                          title="Email"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                      </div>
                    </div>

                    <div className="border-primary/20 flex flex-col rounded-3xl border bg-white p-6 shadow-sm">
                      <div className="mb-5 flex items-center justify-between">
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
                          <div className="mb-1 flex items-start justify-between">
                            <p className="text-primary-dark text-base font-semibold">
                              {selectedNotif.bookingData.serviceName}
                            </p>
                            <span className="text-primary-dark ml-2 text-base font-bold">
                              {selectedNotif.bookingData.price} QAR
                            </span>
                          </div>
                          <div className="text-text-secondary flex items-center gap-2 text-xs font-medium">
                            <span className="bg-primary/5 border-primary/10 rounded-md border px-2 py-0.5">
                              {selectedNotif.bookingData.duration}
                            </span>
                            {selectedNotif.bookingData.addons?.map(
                              (addon, idx) => (
                                <span
                                  key={idx}
                                  className="bg-primary/5 border-primary/10 rounded-md border px-2 py-0.5"
                                >
                                  + {addon}
                                </span>
                              )
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                        <div className="border-primary/10 mt-6 flex gap-3 border-t pt-6">
                          <button
                            onClick={() => confirmBooking(selectedNotif.id)}
                            className="bg-primary hover:bg-primary/90 shadow-primary/20 flex-1 rounded-2xl py-3 text-sm font-semibold text-white shadow-md transition-all"
                          >
                            Confirm Booking
                          </button>
                          <button
                            onClick={() => declineBooking(selectedNotif.id)}
                            className="text-primary border-primary/30 hover:bg-primary/5 rounded-2xl border bg-white px-6 py-3 text-sm font-semibold transition-colors"
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
                  className="bg-primary hover:bg-primary/90 shadow-primary/20 inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all"
                >
                  Manage {selectedNotif.type} <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-primary/5 flex h-full flex-col items-center justify-center text-center">
            <div className="border-primary/10 mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border bg-white shadow-sm">
              <Bell className="text-primary/30 h-10 w-10" />
            </div>
            <h3 className="text-primary-dark mb-2 font-serif text-xl">
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
