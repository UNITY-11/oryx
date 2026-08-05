"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSearch } from "@/shared/providers/search-provider";
import { Home, Phone, Scissors, Search, X } from "lucide-react";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Services", href: "/services", icon: Scissors },
  { name: "Contact", href: "/contact", icon: Phone },
];

const PAGES_WITH_SEARCH = ["/", "/services"];

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { query, setQuery } = useSearch();

  const handleSearchChange = (value: string) => {
    setQuery(value);
    if (value.trim() && !PAGES_WITH_SEARCH.includes(pathname)) {
      router.push("/");
    }
  };

  const handleClearSearch = () => {
    setQuery("");
  };

  if (pathname.startsWith("/service/")) {
    return null;
  }

  return (
    <nav className="border-primary/10 relative z-50 hidden w-full shrink-0 items-center justify-between gap-4 border-b bg-white/95 px-5 py-3 shadow-sm backdrop-blur-md md:mx-auto md:mt-5 md:flex md:w-[calc(100%-3rem)] md:rounded-full md:border md:px-6 md:py-3.5 lg:mx-0 lg:mt-0 lg:w-full lg:rounded-none lg:border-x-0 lg:border-t-0 lg:px-10 lg:py-4 xl:px-14">
      {/* Desktop nav links */}
      <div className="hidden flex-1 lg:flex">
        <div className="border-primary/15 bg-surface/60 flex items-center gap-1 rounded-full border p-1.5 shadow-sm">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-200 xl:px-5 xl:py-2.5 xl:text-[15px] ${
                  isActive
                    ? "text-primary-dark bg-white shadow-sm"
                    : "text-text-secondary hover:text-primary-dark hover:bg-white/60"
                }`}
              >
                <Icon
                  className="h-4 w-4 shrink-0 xl:h-[18px] xl:w-[18px]"
                  strokeWidth={isActive ? 2.25 : 2}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Logo */}
      <div className="flex flex-1 shrink-0 justify-start lg:flex-none lg:justify-center">
        <Link href="/" className="transition-opacity hover:opacity-85">
          <img
            src="/images/oryx-logo.png"
            alt="ORYX Logo"
            className="h-11 w-auto object-contain brightness-75 contrast-125 md:h-12 lg:h-[52px] xl:h-14"
          />
        </Link>
      </div>

      {/* Search */}
      <div className="flex flex-1 justify-end lg:flex-1">
        <div className="group relative w-full max-w-[11rem] sm:max-w-xs md:max-w-[15rem] lg:max-w-sm xl:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 lg:pl-4">
            <span className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full lg:h-8 lg:w-8">
              <Search
                className="text-primary h-3.5 w-3.5 lg:h-4 lg:w-4"
                strokeWidth={2.25}
              />
            </span>
          </div>
          <input
            type="text"
            placeholder="Search treatments..."
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="border-primary/15 text-primary-dark placeholder:text-text-secondary/70 focus:border-primary/35 focus:ring-primary/20 w-full rounded-full border bg-white py-2.5 pr-10 pl-12 text-sm shadow-sm transition-all outline-none focus:shadow-md focus:ring-2 md:py-2.5 lg:py-3 lg:pr-11 lg:pl-[3.25rem] lg:text-[15px] xl:py-3.5 xl:pl-14 xl:text-base"
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-text-secondary hover:text-primary-dark hover:bg-primary/10 absolute inset-y-0 right-2 my-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors lg:right-2.5 lg:h-8 lg:w-8"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tablet floating dock (md only) */}
      <div className="border-primary/15 fixed bottom-5 left-1/2 z-[100] hidden -translate-x-1/2 items-center gap-1 rounded-full border bg-white/95 p-1.5 shadow-lg backdrop-blur-md md:flex lg:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[4.5rem] flex-col items-center justify-center rounded-full px-3 py-2 transition-all ${
                isActive
                  ? "bg-primary/12 text-primary-dark shadow-sm"
                  : "text-text-secondary hover:bg-surface/80 hover:text-primary-dark"
              }`}
            >
              <Icon className="mb-1 h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-[10px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
