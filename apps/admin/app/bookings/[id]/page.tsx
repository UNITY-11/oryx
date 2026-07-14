"use client";

import { use, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Printer, MessageCircle, FileText, Calendar, Clock, User, CheckCircle2, ChevronRight, Check, X, Clock8 } from "lucide-react";
import { MOCK_BOOKINGS, Booking, BookingStatus } from "../../../src/features/bookings/mock-data";
import { MOCK_SERVICES as REAL_SERVICES } from "../../../src/features/services/mock-data";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  // Load from mock data
  const original = MOCK_BOOKINGS.find((b) => b.id === id) || {
    id,
    customerName: "Unknown Customer",
    phone: "+974 0000 0000",
    service: "Unknown Service",
    addons: [] as string[],
    date: new Date().toISOString().split('T')[0] || new Date().toISOString().substring(0, 10),
    time: "10:00",
    status: "Pending" as BookingStatus,
    amount: 0,
  };

  const [booking, setBooking] = useState<Booking>(original);
  const [saved, setSaved] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState(false);

  // POS State
  const [posState, setPosState] = useState<'services' | 'addons'>('services');

  // Find the currently selected service from REAL_SERVICES based on name matching
  const currentServiceObject = useMemo(() => {
    return REAL_SERVICES.find(s => s.name === booking.service);
  }, [booking.service]);

  // Find base price of the service (default to first tier or amount minus addons)
  const basePrice = currentServiceObject?.pricingTiers[0]?.price ?? booking.amount;

  const update = <K extends keyof Booking>(key: K, value: Booking[K]) =>
    setBooking((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
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

  const selectService = (serviceId: string) => {
    const service = REAL_SERVICES.find(s => s.id === serviceId);
    if (!service) return;

    setBooking(prev => ({
      ...prev,
      service: service.name,
      addons: [],
      amount: service.pricingTiers[0]?.price || 0 // reset to base price
    }));
    setPosState('addons');
  };

  const toggleAddon = (addonName: string, addonPrice: number) => {
    setBooking(prev => {
      const hasAddon = prev.addons.includes(addonName);
      let newAddons;
      let newAmount;
      if (hasAddon) {
        newAddons = prev.addons.filter(a => a !== addonName);
        newAmount = prev.amount - addonPrice;
      } else {
        newAddons = [...prev.addons, addonName];
        newAmount = prev.amount + addonPrice;
      }
      return {
        ...prev,
        addons: newAddons,
        amount: newAmount
      };
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden relative print:bg-white print:static print:h-auto print:overflow-visible">
      
      {/* Top Action Bar */}
      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm px-6 md:px-8 py-5 flex items-center justify-between shrink-0 mb-4 print:hidden">
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col print:overflow-visible">
        {!checkoutMode ? (
          // ============================
          // EDIT MODE (POS STYLE)
          // ============================
          <div className="flex h-full w-full gap-4">
            
            {/* LEFT PANE: Booking Summary & Details */}
            <div className="w-full lg:w-[400px] xl:w-[480px] bg-white rounded-[32px] border border-primary/10 flex flex-col shrink-0 overflow-y-auto scrollbar-hide shadow-sm">
              <div className="p-6 md:p-8 space-y-8 flex flex-col h-full">
                <div>
                  <h1 className="text-3xl font-serif text-primary-dark mb-1">Booking Cart</h1>
                  <p className="text-text-secondary font-mono text-xs uppercase tracking-wider">{booking.id}</p>
                </div>

                {/* Customer Card */}
                <div className="bg-[#fcf4f0] border border-primary/10 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white text-primary flex items-center justify-center text-lg font-serif shrink-0 border border-primary/10">
                    {booking.customerName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-primary-dark">{booking.customerName}</h3>
                    <p className="text-text-secondary text-xs">{booking.phone}</p>
                  </div>
                </div>

                {/* Schedule Controls */}
                <div className="bg-white rounded-2xl border border-primary/10 p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-primary/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">Status</span>
                    <select
                      value={booking.status}
                      onChange={(e) => update("status", e.target.value as BookingStatus)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border outline-none appearance-none cursor-pointer ${
                        booking.status === 'Confirmed' ? 'bg-primary/20 border-primary text-primary-dark' : 
                        booking.status === 'Pending' ? 'bg-primary/5 border-primary/40 text-primary-dark border-dashed' : 
                        booking.status === 'Completed' ? 'bg-primary border-primary-dark text-white' : 
                        'bg-white border-primary/20 text-text-secondary opacity-70'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Date
                      </label>
                      <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => update("date", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-[#fcf4f0] focus:outline-none focus:border-primary text-primary-dark font-medium text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-text-secondary mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Time
                      </label>
                      <input
                        type="time"
                        value={booking.time}
                        onChange={(e) => update("time", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-primary/20 bg-[#fcf4f0] focus:outline-none focus:border-primary text-primary-dark font-medium text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Cart Items */}
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Selected Services</h3>
                  <div className="bg-[#fcf4f0] border border-primary/10 rounded-2xl p-5">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-primary-dark">{booking.service}</span>
                      <span className="font-semibold text-primary-dark">
                        QAR {basePrice}
                      </span>
                    </div>
                    
                    {booking.addons.length > 0 ? (
                      <div className="space-y-2 mt-3 pt-3 border-t border-primary/10">
                        {booking.addons.map((addon, idx) => {
                          const matchedAddon = currentServiceObject?.addons.find(a => a.name === addon);
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-text-secondary flex items-center gap-2">
                                <ChevronRight className="w-3 h-3 text-primary/40" /> {addon}
                              </span>
                              <span className="text-text-secondary">{matchedAddon ? `+ QAR ${matchedAddon.price}` : '+'}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-text-secondary italic mt-2">No add-ons selected.</div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-primary-dark text-white rounded-2xl p-6 shadow-md mt-auto">
                  <div className="flex justify-between items-center mb-2 opacity-80 text-sm">
                    <span>Subtotal</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 opacity-80 text-sm pb-4 border-b border-white/20">
                    <span>Tax</span>
                    <span>QAR 0</span>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Total</span>
                    <span>QAR {booking.amount}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* RIGHT PANE: Interactive Catalog */}
            <div className="flex-1 bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-y-auto scrollbar-hide p-6 md:p-10 relative">
              
              {posState === 'services' && (
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="mb-8">
                    <h2 className="text-2xl font-serif text-primary-dark mb-2">Service Catalog</h2>
                    <p className="text-text-secondary text-sm">Select a primary service to build the session.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
                    {REAL_SERVICES.map((service) => (
                      <div 
                        key={service.id}
                        onClick={() => selectService(service.id)}
                        className={`rounded-2xl border transition-all cursor-pointer group hover:shadow-lg overflow-hidden flex flex-col ${
                          booking.service === service.name 
                            ? "border-primary ring-2 ring-primary bg-primary/5"
                            : "border-primary/10 hover:border-primary/40 bg-white"
                        }`}
                      >
                        <div className="relative h-40 bg-primary/10 overflow-hidden shrink-0">
                          {service.image ? (
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-primary/40 bg-primary/5">
                              <span className="font-serif text-lg opacity-50">Oryx Spa</span>
                            </div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                            {service.category}
                          </div>
                          
                          {/* Selection Checkmark Overlay */}
                          <div className={`absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] transition-opacity ${booking.service === service.name ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                              <CheckCircle2 className="w-6 h-6" />
                            </div>
                          </div>
                        </div>

                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-semibold text-lg text-primary-dark mb-2">{service.name}</h3>
                          <div className="flex items-center gap-4 text-xs font-medium text-text-secondary mt-auto">
                            <span className="flex items-center gap-1">
                              <Clock8 className="w-4 h-4 text-primary/60" />
                              {service.pricingTiers[0]?.duration || 60} min
                            </span>
                            <span className="text-primary-dark font-bold text-base ml-auto">
                              QAR {service.pricingTiers[0]?.price || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {posState === 'addons' && currentServiceObject && (
                <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                  <button 
                    onClick={() => setPosState('services')}
                    className="flex items-center gap-2 text-sm font-semibold text-primary mb-8 hover:opacity-80 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Services
                  </button>
                  
                  <div className="mb-8 pb-8 border-b border-primary/10 flex items-center gap-6">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 shrink-0 border border-primary/20">
                      {currentServiceObject.image ? (
                        <img src={currentServiceObject.image} alt={currentServiceObject.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/40 font-serif text-xs">Oryx</div>
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif text-primary-dark mb-2">{currentServiceObject.name}</h2>
                      <p className="text-text-secondary text-sm">Enhance this service with premium add-ons.</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">Available Add-ons</h3>
                  
                  {currentServiceObject.addons.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {currentServiceObject.addons.map((addon) => {
                        const isSelected = booking.addons.includes(addon.name);
                        return (
                          <div 
                            key={addon.id}
                            onClick={() => toggleAddon(addon.name, addon.price)}
                            className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                              isSelected 
                                ? "border-primary bg-primary text-white shadow-md ring-1 ring-primary"
                                : "border-primary/10 hover:border-primary/40 bg-white hover:shadow-sm"
                            }`}
                          >
                            <div>
                              <h4 className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-primary-dark'}`}>{addon.name}</h4>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>+ QAR {addon.price}</span>
                                <span className={`text-[10px] flex items-center gap-1 ${isSelected ? 'text-white/80' : 'text-text-secondary'}`}>
                                  <Clock8 className="w-3 h-3" /> {addon.duration}m
                                </span>
                              </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected ? 'border-white bg-white/20' : 'border-primary/20'
                            }`}>
                              {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center border border-primary/10 border-dashed rounded-2xl bg-primary/5">
                      <p className="text-primary-dark font-medium mb-1">No Add-ons Available</p>
                      <p className="text-text-secondary text-sm">This service does not have any additional enhancements.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          // ============================
          // CHECKOUT / INVOICE MODE
          // ============================
          <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm p-6 md:p-10 overflow-y-auto h-full scrollbar-hide print:border-none print:shadow-none print:p-0">
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
                      QAR {basePrice}
                    </td>
                  </tr>
                  {booking.addons.map((addon, idx) => {
                    const matchedAddon = currentServiceObject?.addons.find(a => a.name === addon);
                    return (
                      <tr key={idx}>
                        <td className="py-4 text-text-secondary pl-4 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3 text-primary/60" /> {addon}
                        </td>
                        <td className="py-4 text-right text-text-secondary">
                          QAR {matchedAddon ? matchedAddon.price : 0}
                        </td>
                      </tr>
                    )
                  })}
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
          </div>
        )}
      </div>
    </div>
  );
}
