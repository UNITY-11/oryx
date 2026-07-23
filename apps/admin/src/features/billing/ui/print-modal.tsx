import { useState, useRef } from "react";
import { Check, Printer, X } from "lucide-react";
import { buildInvoiceHTML, BillingBooking, ThermalSize } from "../api/use-billing-data";

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
  lines: { name: string; base: number; options: { name: string; price: number }[] }[];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="bg-primary/5 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative z-10 mx-4 flex w-full max-w-4xl flex-col overflow-hidden rounded-[32px] shadow-2xl"
        style={{ maxHeight: "92vh", background: "#fff" }}
      >
        <div className="border-primary/10 flex shrink-0 items-center justify-between border-b px-7 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-2xl">
              <Printer className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-text-primary text-base leading-tight font-bold">
                Print Invoice
              </p>
              <p className="text-text-secondary mt-0.5 font-mono text-xs">
                {booking.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-primary/10 text-text-secondary hover:text-text-primary hover:bg-primary/20 flex h-9 w-9 items-center justify-center rounded-xl transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="border-primary/10 scrollbar-hide flex w-52 shrink-0 flex-col gap-6 overflow-y-auto border-r p-5">
            <div>
              <p className="text-text-secondary mb-3 text-[9px] font-bold tracking-widest uppercase">
                Roll Width
              </p>
              <div className="flex flex-col gap-1.5">
                {THERMAL_SIZES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setThermalSize(s.id)}
                    className={`flex items-center justify-between rounded-2xl px-3.5 py-3 text-left transition-all ${
                      thermalSize === s.id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-primary/5 text-text-secondary hover:bg-primary/10 hover:text-text-primary"
                    }`}
                  >
                    <div>
                      <p className="text-sm leading-tight font-bold">
                        {s.label}
                      </p>
                      <p
                        className={`mt-0.5 text-[10px] ${thermalSize === s.id ? "text-white/70" : "text-text-secondary"}`}
                      >
                        {s.desc}
                      </p>
                    </div>
                    {thermalSize === s.id && (
                      <Check className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-primary/10 border-t" />

            <div className="space-y-2.5">
              <p className="text-text-secondary text-[9px] font-bold tracking-widest uppercase">
                Details
              </p>
              {[
                { label: "Client", value: booking.customerName },
                { label: "Invoice", value: booking.id },
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
            className="scrollbar-hide mr-5 flex flex-1 items-start justify-center overflow-y-auto rounded-4xl p-4"
            style={{
              background:
                "linear-gradient(160deg, var(--color-primary) 0%, #ffceb0ff 100%)",
            }}
          >
            <div
              className="flex-shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_24px_64px_rgba(0,0,0,0.25)] transition-all duration-300"
              style={{ width: selectedMeta.previewPx }}
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
                  {booking.id}
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
                    <div key={i}>
                      <div className="flex justify-between">
                        <span className="text-text-primary text-[9px] leading-tight font-semibold">
                          {svc.name}
                        </span>
                        <span className="text-text-primary ml-1 shrink-0 text-[9px] font-semibold">
                          {svc.base}
                        </span>
                      </div>
                      {svc.options.map((a, j) => (
                         <div key={j} className="flex justify-between pl-2">
                          <span className="text-text-secondary text-[8px]">
                            ↳ {a.name}
                          </span>
                          <span className="text-text-secondary text-[8px]">
                            +{a.price}
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
                  <strong>Oryx Spa</strong> 🌸
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-primary/10 flex shrink-0 items-center justify-between border-t bg-white px-7 py-4">
          <p className="text-text-secondary text-xs tabular-nums">
            {selectedMeta.label} roll · {selectedMeta.desc} · 1 page
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-text-secondary bg-primary/10 hover:bg-primary/20 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPrint}
              disabled={printing}
              className="bg-primary flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
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
