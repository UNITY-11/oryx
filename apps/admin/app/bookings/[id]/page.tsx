"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer, MessageCircle, FileText, Calendar, Clock, User, CheckCircle2 } from "lucide-react";
import { MOCK_BOOKINGS, Booking, BookingStatus } from "../../../src/features/bookings/mock-data";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Load from mock data (simulate fetch)
  const original = MOCK_BOOKINGS.find((b) => b.id === id) || {
    // Fallback mock if coming from a random session ID
    id,
    customerName: "Unknown Customer",
    phone: "+974 0000 0000",
    service: "Unknown Service",
    addons: [],
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    status: "Pending" as BookingStatus,
    amount: 0,
  };

  const [booking, setBooking] = useState<Booking>(original);
  const [saved, setSaved] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);

  const update = <K extends keyof Booking>(key: K, value: Booking[K]) =>
    setBooking((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    // Simulate API save
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppBill = () => {
    const billText = `*Oryx Spa - Invoice*\n\n` +
      `Invoice #: ${booking.id}\n` +
      `Date: ${booking.date}\n` +
      `Customer: ${booking.customerName}\n\n` +
      `*Services:*\n` +
      `- ${booking.service}\n` +
      booking.addons.map(a => `  + ${a}\n`).join("") +
      `\n*Total:* QAR ${booking.amount}\n\n` +
      `Thank you for visiting Oryx Spa! We look forward to seeing you again.`;
    
    const waUrl = `https://wa.me/${booking.phone.replace(/\D/g, '')}?text=${encodeURIComponent(billText)}`;
    window.open(waUrl, "_blank");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative print:bg-white print:static print:h-auto print:overflow-visible">
      <div className={`bg-white rounded-[32px] border border-primary/10 shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden print:border-none print:shadow-none print:rounded-none`}>
        
        {/* Top Bar - Hidden when printing */}
        <div className="px-6 md:px-8 py-5 border-b border-primary/10 flex items-center justify-between shrink-0 print:hidden">
          <button
            onClick={() => checkoutMode ? setCheckoutMode(false) : router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-primary-dark transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {checkoutMode ? "Back to Booking" : "Back"}
          </button>

          {!checkoutMode ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCheckoutMode(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Checkout / Final Bill
              </button>

              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium shadow-sm transition-all ${
                  saved ? "bg-green-500 text-white" : "bg-primary text-white hover:opacity-90"
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium border border-primary text-primary hover:bg-primary/5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Bill
              </button>

              <button
                onClick={handleWhatsAppBill}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-[#25D366] text-white hover:bg-[#20b858] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Send via WhatsApp
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="overflow-auto scrollbar-hide flex-1 p-6 md:p-8 print:p-0 print:overflow-visible">
          {!checkoutMode ? (
            // ============================
            // EDIT MODE
            // ============================
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-serif text-primary-dark mb-1">Booking Details</h1>
                  <p className="text-text-secondary">Manage session {booking.id}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Status</span>
                  <select
                    value={booking.status}
                    onChange={(e) => update("status", e.target.value as BookingStatus)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border outline-none appearance-none cursor-pointer ${
                      booking.status === 'Confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                      booking.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                      booking.status === 'Completed' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                      'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Card */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex items-center gap-5">
                <div className="w-14 h-14 rounded-full bg-white text-primary flex items-center justify-center text-xl font-serif border border-primary/20 shrink-0">
                  {booking.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-dark">{booking.customerName}</h3>
                  <p className="text-text-secondary text-sm">{booking.phone}</p>
                </div>
              </div>

              {/* Booking Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    value={booking.date}
                    onChange={(e) => update("date", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </label>
                  <input
                    type="time"
                    value={booking.time}
                    onChange={(e) => update("time", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Service</label>
                  <input
                    type="text"
                    value={booking.service}
                    onChange={(e) => update("service", e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">Amount (QAR)</label>
                  <input
                    type="number"
                    value={booking.amount}
                    onChange={(e) => update("amount", Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-2xl border border-primary/40 bg-transparent focus:outline-none focus:border-primary text-primary-dark font-medium text-lg"
                  />
                </div>
              </div>

            </div>
          ) : (
            // ============================
            // CHECKOUT / INVOICE MODE
            // ============================
            <div className="max-w-2xl mx-auto bg-white p-10 border border-primary/10 rounded-2xl shadow-sm print:border-none print:shadow-none print:p-0">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-12 border-b border-primary/20 pb-8">
                <div>
                  <div className="text-3xl font-serif text-primary-dark mb-1">Oryx Spa</div>
                  <div className="text-xs text-text-secondary tracking-widest uppercase">Luxury Beauty & Wellness</div>
                  <div className="text-sm text-text-secondary mt-4">
                    123 Pearl Boulevard<br />
                    Doha, Qatar<br />
                    +974 4444 0000<br />
                    CR: 123456789
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-2xl font-bold text-primary-dark mb-1">INVOICE</h2>
                  <div className="text-sm text-text-secondary font-mono">{booking.id}</div>
                  <div className="mt-4">
                    <span className="text-xs text-text-secondary uppercase tracking-wider mr-2">Date:</span>
                    <span className="text-sm font-medium text-primary-dark">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="mb-10">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Billed To</h3>
                <div className="text-lg font-bold text-primary-dark">{booking.customerName}</div>
                <div className="text-sm text-text-secondary">{booking.phone}</div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left mb-10">
                <thead>
                  <tr className="border-b-2 border-primary/20 text-xs font-bold uppercase tracking-wider text-text-secondary">
                    <th className="py-3">Description</th>
                    <th className="py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/10 text-sm">
                  <tr>
                    <td className="py-4 font-medium text-primary-dark">
                      {booking.service}
                    </td>
                    <td className="py-4 text-right font-medium text-primary-dark">
                      {/* Assuming service is a portion of the amount if addons exist. For simplicity, showing total here or splitting if we had rich data */}
                      QAR {booking.amount - booking.addons.length * 20 /* mock split */}
                    </td>
                  </tr>
                  {booking.addons.map((addon, idx) => (
                    <tr key={idx}>
                      <td className="py-4 text-text-secondary pl-4 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-primary/60" /> {addon}
                      </td>
                      <td className="py-4 text-right text-text-secondary">
                        QAR 20 {/* mock addon price */}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end border-t-2 border-primary/20 pt-6">
                <div className="w-64">
                  <div className="flex justify-between items-center mb-3 text-sm text-text-secondary">
                    <span>Subtotal</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3 text-sm text-text-secondary">
                    <span>Tax (0%)</span>
                    <span>QAR 0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-primary/20 text-xl font-bold text-primary-dark">
                    <span>Total</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 text-center text-xs text-text-secondary">
                <p>Thank you for choosing Oryx Spa.</p>
                <p className="mt-1">For any inquiries, please contact us at hello@oryxspa.qa</p>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
