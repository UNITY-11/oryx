import { useEffect, useState } from "react";
import { useSanityListener } from "@shared/hooks/use-sanity-listener";

import { fetchBookings, updateBooking } from "../../bookings/api";
import { Booking } from "../../bookings/types";
import { fetchServices } from "../../services/api";
import { Service } from "../../services/types";

export type FilterStatus = "All" | "Started" | "Completed";
export type BillingBooking = Booking;
export type ThermalSize = "58mm" | "80mm" | "110mm";

export function getServiceLineItems(
  booking: BillingBooking,
  catalog: Service[]
) {
  return booking.services.map((svc) => {
    const obj = catalog.find((r) => r.name === svc.name);
    const base = obj?.price || 0;
    const addonItems = svc.options.map((aName) => {
      const a = obj?.options.find((ad) => ad.name === aName);
      return { name: aName, price: a?.price || 0 };
    });
    return { name: svc.name, base, options: addonItems };
  });
}

export function getTotal(booking: BillingBooking, catalog: Service[]) {
  return getServiceLineItems(booking, catalog).reduce(
    (sum, s) => sum + s.base + s.options.reduce((a, ad) => a + ad.price, 0),
    0
  );
}

export function buildInvoiceHTML(
  booking: BillingBooking,
  lines: ReturnType<typeof getServiceLineItems>,
  total: number,
  thermalSize: ThermalSize
) {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const rollWidth =
    thermalSize === "58mm"
      ? "58mm"
      : thermalSize === "110mm"
        ? "110mm"
        : "80mm";
  const lineItemsHtml = lines
    .map(
      (svc) =>
        `<div style="display:flex;justify-content:space-between;margin-bottom:8px;">
      <span style="font-weight:600;color:#452c1e;">${svc.name}</span>
      <span style="font-weight:600;color:#452c1e;">QAR ${svc.base}</span>
    </div>` +
        svc.options
          .map(
            (a) =>
              `<div style="display:flex;justify-content:space-between;padding-left:12px;margin-bottom:4px;">
        <span style="font-size:11px;color:#86634f;">↳ ${a.name}</span>
        <span style="font-size:11px;color:#86634f;">+QAR ${a.price}</span>
      </div>`
          )
          .join("")
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${booking.id}</title>
  <style>
    @page { size: ${rollWidth} auto; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, "Inter", sans-serif; background: white; width: ${rollWidth}; }
    .wrap { padding: 12px; }
    .logo { height: 36px; object-fit: contain; filter: brightness(0.75) contrast(1.25); display: block; margin: 0 auto 4px; }
    .center { text-align: center; }
    .brand { font-size: 8px; letter-spacing: 0.15em; text-transform: uppercase; color: #86634f; }
    .addr { font-size: 9px; color: #86634f; line-height: 1.5; margin-top: 4px; }
    .inv-num { font-size: 10px; font-family: monospace; color: #86634f; margin-top: 2px; }
    .dash { border: none; border-top: 1px dashed #cf8563; margin: 8px 0; }
    .label { font-size: 8px; font-weight: 700; color: #cf8563; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 2px; }
    .val { font-size: 11px; font-weight: 700; color: #452c1e; }
    .sub { font-size: 9px; color: #86634f; }
    .row { display: flex; justify-content: space-between; }
    .th { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #86634f; padding-bottom: 4px; border-bottom: 1px solid #cf8563; }
    .total-label { font-size: 9px; font-weight: 700; text-transform: uppercase; color: #86634f; }
    .total-val { font-size: 18px; font-weight: 700; color: #452c1e; }
    .footer { text-align: center; font-size: 9px; color: #86634f; margin-top: 8px; }
    .pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 8px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; background: #cf8563; color: white; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="center">
      <img src="/images/oryx-logo.png" class="logo" alt="Oryx Spa" />
      <div class="brand">Luxury Beauty &amp; Wellness</div>
      <div class="addr">123 Pearl Boulevard, Doha, Qatar<br/>+974 4444 0000</div>
    </div>
    <hr class="dash"/>
    <div class="center">
      <div style="font-size:13px;font-weight:700;color:#452c1e;">INVOICE</div>
      <div class="inv-num">${booking.id}</div>
      <div style="font-size:9px;color:#86634f;margin-top:2px;">${date}</div>
      <span class="pill" style="margin-top:4px;display:inline-block;">${booking.status}</span>
    </div>
    <hr class="dash"/>
    <div class="label">Billed To</div>
    <div class="val">${booking.customerName}</div>
    <div class="sub">${booking.phone}</div>
    <div style="margin-top:4px;" class="sub">${booking.date} · ${booking.time}</div>
    <hr class="dash"/>
    <div class="row th"><span>Description</span><span>Amount</span></div>
    <div style="margin-top:6px;">${lineItemsHtml}</div>
    <hr class="dash"/>
    <div class="row" style="align-items:center;">
      <span class="total-label">Total Due</span>
      <span class="total-val">QAR ${total}</span>
    </div>
    <hr class="dash"/>
    <div class="footer">Thank you for choosing <strong>Oryx Spa</strong> 🌸</div>
  </div>
</body>
</html>`;
}

export function useBillingData() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("All");
  const [selected, setSelected] = useState<BillingBooking | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadBookings = () => {
    Promise.all([fetchBookings(), fetchServices()])
      .then(([b, s]) => {
        setBookings(b);
        setServices(s);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reloadBookings();
  }, []);

  useSanityListener('*[_type == "booking"]', () => {
    fetchBookings().then(setBookings).catch(console.error);
  });

  const handleComplete = async (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "Completed" } : b))
    );
    try {
      await updateBooking(id, { status: "Completed" });
    } catch {
      // best-effort
    }
  };

  const handleWhatsApp = (booking: BillingBooking) => {
    const lines = getServiceLineItems(booking, services);
    const servicesText = lines
      .map((s) => {
        const addonsText = s.options
          .map((a) => `   ↳ ${a.name}: QAR ${a.price}`)
          .join("\n");
        return `• ${s.name}: QAR ${s.base}${addonsText ? "\n" + addonsText : ""}`;
      })
      .join("\n");
    const total = getTotal(booking, services);
    const bill =
      `*🌿 Oryx Spa — Invoice*\n\n` +
      `Invoice #: ${booking.id}\n` +
      `Date: ${booking.date}  |  Time: ${booking.time}\n` +
      `Client: ${booking.customerName}\n\n` +
      `*Services:*\n${servicesText}\n\n` +
      `*Total: QAR ${total}*\n\n` +
      `Thank you for choosing Oryx Spa! We look forward to seeing you again. 🌸`;
    const phone = booking.phone.replace(/\D/g, "");
    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(bill)}`,
      "_blank"
    );
  };

  const billable = bookings
    .filter((b) => {
      const matchStatus =
        filter === "All"
          ? b.status === "Started" || b.status === "Completed"
          : b.status === filter;
      const matchSearch =
        !search ||
        b.customerName.toLowerCase().includes(search.toLowerCase()) ||
        b.id.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      if (a.status === b.status) return b.date.localeCompare(a.date);
      return a.status === "Started" ? -1 : 1;
    });

  const totalRevenue = bookings
    .filter((b) => b.status === "Started" || b.status === "Completed")
    .reduce((s, b) => s + getTotal(b, services), 0);
  const startedCount = bookings.filter((b) => b.status === "Started").length;
  const completedCount = bookings.filter(
    (b) => b.status === "Completed"
  ).length;

  const selectedLines = selected ? getServiceLineItems(selected, services) : [];
  const selectedTotal = selected ? getTotal(selected, services) : 0;

  return {
    search,
    setSearch,
    filter,
    setFilter,
    selected,
    setSelected,
    showPrintModal,
    setShowPrintModal,
    bookings,
    services,
    loading,
    error,
    handleComplete,
    handleWhatsApp,
    billable,
    totalRevenue,
    startedCount,
    completedCount,
    selectedLines,
    selectedTotal,
  };
}
