"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildPhoneValue,
  DEFAULT_PHONE_COUNTRY,
  detectCountryFromValue,
  getNationalNumber,
  getPhoneCountryOptions,
  type CountryCode,
  type PhoneCountryOption,
} from "@/shared/lib/phone";
import { ChevronDown, Search } from "lucide-react";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  onCountryChange?: (country: CountryCode) => void;
  id?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  className?: string;
  defaultCountry?: CountryCode;
  placeholder?: string;
  onBlur?: () => void;
};

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  id,
  disabled,
  readOnly,
  hasError,
  className = "",
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  placeholder,
  onBlur,
}: PhoneInputProps) {
  const [country, setCountry] = useState<CountryCode>(() =>
    detectCountryFromValue(value, defaultCountry)
  );
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const options = useMemo(() => getPhoneCountryOptions(), []);
  const selected =
    options.find((o) => o.code === country) ||
    options.find((o) => o.code === defaultCountry)!;

  const national = getNationalNumber(value, country);

  useEffect(() => {
    onCountryChange?.(country);
  }, [country, onCountryChange]);

  useEffect(() => {
    if (!value?.trim()) return;
    const detected = detectCountryFromValue(value, country);
    if (detected !== country) setCountry(detected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.dialCode.includes(q) ||
        o.code.toLowerCase().includes(q)
    );
  }, [options, query]);

  const handleCountrySelect = (opt: PhoneCountryOption) => {
    setCountry(opt.code);
    setOpen(false);
    setQuery("");
    const digits = national.replace(/\D/g, "");
    onChange(buildPhoneValue(digits, opt.code));
  };

  const handleNationalChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    onChange(buildPhoneValue(digits, country));
  };

  const shellClass = [
    "flex w-full items-stretch overflow-hidden border bg-transparent transition-colors rounded-xl",
    hasError
      ? "border-red-400 focus-within:border-red-500"
      : "border-primary focus-within:ring-primary/50 focus-within:ring-1",
    disabled || readOnly ? "cursor-not-allowed opacity-60" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className="relative w-full">
      <div className={shellClass}>
        <button
          type="button"
          disabled={disabled || readOnly}
          onClick={() => setOpen((v) => !v)}
          className="text-text-primary hover:bg-primary/5 flex shrink-0 items-center gap-1.5 border-r border-inherit px-3 py-3 text-sm font-medium disabled:pointer-events-none"
          aria-label="Select country"
          aria-expanded={open}
        >
          <span className="text-base leading-none" aria-hidden>
            {selected.flag}
          </span>
          <span className="tabular-nums">{selected.dialCode}</span>
          <ChevronDown
            className={`h-3.5 w-3.5 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          disabled={disabled}
          readOnly={readOnly}
          value={national}
          onChange={(e) => handleNationalChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder || "WhatsApp number"}
          className="text-text-primary min-w-0 flex-1 bg-transparent px-3 py-3 text-sm outline-none placeholder:text-gray-300 disabled:cursor-not-allowed"
        />
      </div>

      {open && (
        <div className="border-primary/10 absolute z-50 mt-2 w-full max-w-sm overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="border-primary/10 relative border-b p-2.5">
            <Search className="text-text-secondary absolute top-1/2 left-5 h-4 w-4 -translate-y-1/2" />
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country..."
              className="text-text-primary w-full rounded-xl bg-gray-50 py-2.5 pr-3 pl-10 text-sm outline-none placeholder:text-gray-400"
            />
          </div>
          <ul className="scrollbar-hide max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="text-text-secondary px-4 py-3 text-sm">
                No countries found
              </li>
            ) : (
              filtered.map((opt) => (
                <li key={opt.code}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(opt)}
                    className={`hover:bg-primary/5 flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      opt.code === country
                        ? "bg-primary/5 text-primary font-semibold"
                        : "text-text-primary"
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden>
                      {opt.flag}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{opt.name}</span>
                    <span className="text-text-secondary shrink-0 tabular-nums">
                      {opt.dialCode}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
