import { useRef, useState } from "react";
import { getBookingDisplayId } from "@features/bookings/types";
import { Check, Printer, X } from "lucide-react";

import {
  BillingBooking,
  buildInvoiceHTML,
  ThermalSize,
} from "../api/use-billing-data";

const THERMAL_SIZES: {
  id: ThermalSize;
  label: string;
  desc: string;
  previewPx: number;
}[] = [
  { id: "58mm", label: "58 mm", desc: "Mini / handheld", previewPx: 180 },
  { id: "80mm", label: "80 mm", desc: "Standard POS", previewPx: 248 },
  { id: "110mm", label: "110 mm", desc: "Wide receipt", previewPx: 340 },
];

export function PrintModal({
  booking,
  lines,
  total,
  onClose,
}: {
  booking: BillingBooking;
  lines: {
    name: string;
    base: number;
    options: { name: string; price: number }[];
  }[];
  total: number;
  onClose: () => void;
}) {
  const [thermalSize, setThermalSize] = useState<ThermalSize>("80mm");
  const [printing, setPrinting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedMeta = THERMAL_SIZES.find((s) => s.id === thermalSize)!;

  const handleConfirmPrint = () => {
    setPrinting(true);
    const html = buildInvoiceHTML(booking, lines, total, thermalSize);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setPrinting(false);
    };
  };

  const currentDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="bg-primary/5 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] shadow-2xl sm:rounded-[32px]"
        style={{ background: "#fff" }}
      >
        <div className="border-primary/10 flex shrink-0 items-center justify-between gap-3 border-b px-4 py-4 sm:px-7 sm:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
              <Printer className="text-primary h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-text-primary truncate text-base leading-tight font-bold">
                Print Invoice
              </p>
              <p className="text-text-secondary mt-0.5 truncate font-mono text-xs">
                {getBookingDisplayId(booking)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-primary/10 text-text-secondary hover:text-text-primary hover:bg-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <div className="border-primary/10 scrollbar-hide flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b p-4 sm:gap-5 sm:p-5 md:w-52 md:border-r md:border-b-0">
            <div>
              <p className="text-text-secondary mb-2.5 text-[9px] font-bold tracking-widest uppercase sm:mb-3">
                Roll Width
              </p>
              <div className="grid grid-cols-3 gap-1.5 md:grid-cols-1">
                {THERMAL_SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setThermalSize(s.id)}
                    className={`flex items-center justify-between rounded-2xl px-2.5 py-2.5 text-left transition-all sm:px-3.5 sm:py-3 ${
                      thermalSize === s.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-primary/5 text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs leading-tight font-bold sm:text-sm">
                        {s.label}
                      </p>
                      <p
                        className={`mt-0.5 hidden truncate text-[10px] sm:block ${
                          thermalSize === s.id
                            ? "text-white/70"
                            : "text-text-secondary"
                        }`}
                      >
                        {s.desc}
                      </p>
                    </div>
                    {thermalSize === s.id && (
                      <Check className="ml-1 hidden h-4 w-4 shrink-0 md:block" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-primary/10 hidden border-t md:block" />

            <div className="hidden space-y-2.5 md:block">
              <p className="text-text-secondary text-[9px] font-bold tracking-widest uppercase">
                Details
              </p>
              {[
                { label: "Client", value: booking.customerName },
                { label: "Invoice", value: getBookingDisplayId(booking) },
                { label: "Date", value: currentDate },
                { label: "Total", value: `QAR ${total}` },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-2"
                >
                  <span className="text-text-secondary shrink-0 text-[11px]">
                    {label}
                  </span>
                  <span className="text-text-primary max-w-[90px] truncate text-right text-[11px] font-semibold">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className="scrollbar-hide flex min-h-0 flex-1 items-start justify-center overflow-y-auto p-3 sm:mr-0 sm:p-4 md:mr-5"
            style={{
              background:
                "linear-gradient(160deg, var(--color-primary) 0%, #ffceb0ff 100%)",
            }}
          >
            <div
              className="w-full max-w-full flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{
                width: Math.min(selectedMeta.previewPx, 340),
                maxWidth: "100%",
              }}
            >
              <div className="bg-primary/10 border-primary/20 flex flex-col items-center border-b px-4 py-4 text-center">
                <img
                  src="/images/oryx-logo.png"
                  alt="Oryx Spa"
                  className="h-8 w-auto object-contain brightness-75 contrast-125"
                />
                <p className="text-text-secondary mt-1 text-[7px] font-medium tracking-widest uppercase">
                  Luxury Beauty & Wellness
                </p>
                <p className="text-text-secondary mt-1 text-[8px] leading-snug">
                  123 Pearl Blvd, Doha · +974 4444 0000
                </p>
              </div>

              <div className="border-primary/20 border-b border-dashed px-4 py-3 text-center">
                <p className="text-text-primary text-xs font-bold tracking-widest">
                  INVOICE
                </p>
                <p className="text-text-secondary font-mono text-[9px]">
                  {getBookingDisplayId(booking)}
                </p>
                <p className="text-text-secondary mt-0.5 text-[9px]">
                  {currentDate}
                </p>
                <span className="bg-primary mt-1.5 inline-block rounded-full px-2 py-0.5 text-[7px] font-bold tracking-wider text-white uppercase">
                  {booking.status}
                </span>
              </div>

              <div className="border-primary/20 border-b border-dashed px-4 py-3">
                <p className="text-primary mb-1 text-[7px] font-bold tracking-widest uppercase">
                  Billed To
                </p>
                <p className="text-text-primary text-[10px] font-bold">
                  {booking.customerName}
                </p>
                <p className="text-text-secondary text-[8px]">
                  {booking.phone}
                </p>
                <p className="text-text-secondary mt-0.5 text-[8px]">
                  {booking.date} · {booking.time}
                </p>
              </div>

              <div className="border-primary/20 border-b border-dashed px-4 py-3">
                <div className="text-text-secondary border-primary/20 flex justify-between border-b pb-1.5 text-[7px] font-bold tracking-widest uppercase">
                  <span>Description</span>
                  <span>Amt</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {lines.map((svc, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-text-primary text-[9px] leading-tight font-bold">
                        {svc.name}
                      </div>
                      {svc.options.length === 0
                        ? null
                        : svc.options.map((a, j) => (
                            <div
                              key={j}
                              className="flex justify-between gap-2 pl-1.5"
                            >
                              <span className="text-text-primary min-w-0 text-[8px] break-words">
                                {a.name}
                              </span>
                              <span className="text-text-primary shrink-0 text-[8px] font-semibold">
                                {a.price}
                              </span>
                            </div>
                          ))}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-primary/20 flex items-center justify-between border-b border-dashed px-4 py-3">
                <span className="text-text-secondary text-[8px] font-bold tracking-widest uppercase">
                  Total Due
                </span>
                <span className="text-text-primary text-sm font-bold">
                  QAR {total}
                </span>
              </div>

              <div className="px-4 py-3 text-center">
                <p className="text-text-secondary text-[8px] leading-snug">
                  Thank you for choosing
                  <br />
                  <strong>Oryx Spa</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-primary/10 flex shrink-0 flex-col gap-3 border-t bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-4">
          <p className="text-text-secondary text-center text-xs tabular-nums sm:text-left">
            {selectedMeta.label} roll · {selectedMeta.desc} · 1 page
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-text-secondary bg-primary/10 hover:bg-primary/20 h-11 flex-1 rounded-xl px-5 text-sm font-semibold transition-colors sm:h-auto sm:flex-none sm:py-2.5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPrint}
              disabled={printing}
              className="bg-primary flex h-11 flex-[1.4] items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 sm:h-auto sm:flex-none sm:px-6 sm:py-2.5"
            >
              <Printer className="h-4 w-4" />
              {printing ? "Sending…" : "Print Invoice"}
            </button>
          </div>
        </div>
      </div>
      <iframe ref={iframeRef} className="hidden" title="print-frame" />
    </div>
  );
}
