"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { Staff } from "@features/staff/types";
import { Check, ChevronsUpDown, Search, UserRound, X } from "lucide-react";
import { createPortal } from "react-dom";

export type StaffSelectOption = {
  id: string;
  name: string;
  role?: string;
  inactive?: boolean;
};

type StaffSelectProps = {
  value: string;
  staffList: Staff[];
  /** Keep showing a previously assigned person who is no longer in the active list */
  fallback?: { id: string; name: string } | null;
  onChange: (staffId: string, staffName: string | undefined) => void;
  disabled?: boolean;
  hasError?: boolean;
  placeholder?: string;
};

type MenuPos = { top: number; left: number; width: number; maxHeight: number };

export function StaffSelect({
  value,
  staffList,
  fallback = null,
  onChange,
  disabled,
  hasError,
  placeholder = "Select staff",
}: StaffSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [menuPos, setMenuPos] = useState<MenuPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const options = useMemo<StaffSelectOption[]>(() => {
    const list: StaffSelectOption[] = staffList.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
    }));
    if (value && fallback?.id === value && !list.some((o) => o.id === value)) {
      list.unshift({
        id: fallback.id,
        name: fallback.name,
        inactive: true,
      });
    }
    return list;
  }, [staffList, value, fallback]);

  const selected = options.find((o) => o.id === value) ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        (o.role?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const updateMenuPos = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom - gap - 12;
    const spaceAbove = rect.top - gap - 12;
    const preferred = Math.min(280, Math.max(spaceBelow, 160));
    const placeAbove = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(
      140,
      Math.min(280, placeAbove ? spaceAbove : preferred)
    );
    const top = placeAbove
      ? Math.max(12, rect.top - gap - maxHeight)
      : rect.bottom + gap;
    setMenuPos({
      top,
      left: rect.left,
      width: rect.width,
      maxHeight,
    });
  };

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    updateMenuPos();
    const onScrollOrResize = () => updateMenuPos();
    window.addEventListener("resize", onScrollOrResize);
    // Capture scroll from nested containers too
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
      setQuery("");
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  const handleSelect = (opt: StaffSelectOption) => {
    onChange(opt.id, opt.name);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", undefined);
    setOpen(false);
    setQuery("");
  };

  const menu =
    open && !disabled && mounted && menuPos
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: menuPos.maxHeight,
            }}
            className="border-primary/10 z-[200] flex flex-col overflow-hidden rounded-2xl border bg-white shadow-lg shadow-black/10"
          >
            <div className="border-primary/10 shrink-0 border-b p-2">
              <div className="relative">
                <Search className="text-text-secondary absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                <input
                  ref={searchRef}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search staff…"
                  className="text-primary-dark placeholder:text-text-secondary w-full rounded-xl border-0 bg-[#fcf4f0] py-2 pr-3 pl-9 text-sm outline-none"
                />
              </div>
            </div>

            <ul
              role="listbox"
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
            >
              {filtered.length === 0 ? (
                <li className="text-text-secondary px-3 py-6 text-center text-sm">
                  {options.length === 0
                    ? "No active staff found"
                    : "No staff match your search"}
                </li>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.id === value;
                  return (
                    <li key={opt.id} role="option" aria-selected={isSelected}>
                      <button
                        type="button"
                        onClick={() => handleSelect(opt)}
                        className={[
                          "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                          isSelected ? "bg-primary/10" : "hover:bg-[#fcf4f0]",
                        ].join(" ")}
                      >
                        <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                          {opt.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="text-primary-dark block truncate text-sm font-medium">
                            {opt.name}
                            {opt.inactive ? " (inactive)" : ""}
                          </span>
                          {opt.role ? (
                            <span className="text-text-secondary block truncate text-xs">
                              {opt.role}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <Check className="text-primary h-4 w-4 shrink-0" />
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => {
          if (disabled) return;
          setOpen((v) => !v);
        }}
        className={[
          "flex w-full items-center gap-2 rounded-xl border bg-white px-3 py-2.5 text-left text-sm transition-colors outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          hasError
            ? "border-red-400 ring-1 ring-red-400/20"
            : open
              ? "border-primary/40 ring-primary/10 ring-4"
              : "border-primary/15 hover:border-primary/30",
        ].join(" ")}
      >
        <span className="bg-primary/10 text-primary flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
          <UserRound className="h-3.5 w-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          {selected ? (
            <>
              <span className="text-primary-dark block truncate font-medium">
                {selected.name}
                {selected.inactive ? " (inactive)" : ""}
              </span>
              {selected.role ? (
                <span className="text-text-secondary block truncate text-xs">
                  {selected.role}
                </span>
              ) : null}
            </>
          ) : (
            <span className="text-text-secondary">{placeholder}</span>
          )}
        </span>
        {selected && !disabled ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={handleClear}
            className="text-text-secondary hover:bg-primary/5 hover:text-primary-dark flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            aria-label="Clear staff"
          >
            <X className="h-3.5 w-3.5" />
          </span>
        ) : null}
        <ChevronsUpDown className="text-text-secondary h-4 w-4 shrink-0" />
      </button>
      {menu}
    </div>
  );
}
