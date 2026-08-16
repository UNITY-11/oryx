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

// Bottom nav order: Services · Home · Contact
const tabletNavItems = [navItems[1], navItems[0], navItems[2]];

/** Minimal text link — large screens only */
function DesktopNavLink({
  href,
  name,
  isActive,
}: {
  href: string;
  name: string;
  isActive: boolean;
}) {
  return (
    <Link href={href} className="group relative py-1">
      <span
        className={`font-serif text-[15px] tracking-[0.04em] transition-colors duration-200 xl:text-base ${
          isActive
            ? "text-primary-dark font-semibold"
            : "text-primary-dark/80 group-hover:text-primary-dark"
        }`}
      >
        {name}
      </span>
      <span
        className={`bg-primary absolute -bottom-1 left-1/2 h-px -translate-x-1/2 transition-all duration-300 ease-out ${
          isActive
            ? "w-full opacity-100"
            : "w-0 opacity-0 group-hover:w-3/4 group-hover:opacity-60"
        }`}
      />
    </Link>
  );
}

function DesktopNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav
      className="hidden items-center gap-8 lg:flex xl:gap-10"
      aria-label="Main navigation"
    >
      {navItems.map((item) => (
        <DesktopNavLink
          key={item.href}
          href={item.href}
          name={item.name}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  );
}

function MobileTab({
  href,
  name,
  icon: Icon,
  isActive,
  variant = "default",
}: {
  href: string;
  name: string;
  icon: typeof Home;
  isActive: boolean;
  variant?: "default" | "center";
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2.5 transition-colors focus:outline-none ${
        isActive ? "text-primary" : "text-background hover:text-primary"
      }`}
    >
      <div className="flex h-10 w-10 items-center justify-center">
        {variant === "center" ? (
          <div className="shadow-spa bg-background flex h-10 w-10 items-center justify-center rounded-full">
            <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
        ) : (
          <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
        )}
      </div>
      <span className="text-[10px] leading-none font-medium">{name}</span>
    </Link>
  );
}

function SearchField({
  query,
  onChange,
  onClear,
  className = "",
  minimal = false,
}: {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  className?: string;
  minimal?: boolean;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <Search
        className={`text-text-secondary/70 pointer-events-none absolute top-1/2 -translate-y-1/2 ${
          minimal ? "left-3.5 h-4 w-4" : "left-3.5 h-4 w-4 lg:left-4"
        }`}
        strokeWidth={2}
      />
      <input
        type="text"
        placeholder="Search treatments..."
        value={query}
        onChange={(e) => onChange(e.target.value)}
        className={`border-primary/12 text-primary-dark placeholder:text-text-secondary/50 focus:border-primary/30 w-full rounded-full border bg-white py-2.5 pr-9 text-sm transition-colors outline-none focus:ring-0 ${
          minimal
            ? "pl-10"
            : "pl-10 shadow-sm focus:shadow-md lg:py-3 lg:pr-10 lg:pl-11 lg:text-[15px]"
        }`}
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="text-text-secondary hover:text-primary-dark absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

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

  if (pathname.startsWith("/service/")) {
    return null;
  }

  return (
    <>
      {/* Tablet: compact top bar */}
      <nav
        aria-label="Main navigation"
        className="border-primary/10 relative z-50 mx-auto mt-4 hidden w-[calc(100%-2rem)] max-w-3xl items-center justify-between gap-4 rounded-full border bg-white/95 px-5 py-2.5 shadow-sm backdrop-blur-md md:flex lg:hidden"
      >
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
          <img
            src="/images/oryx-logo.png"
            alt="ORYX Logo"
            className="h-9 w-auto object-contain brightness-75 contrast-125"
          />
        </Link>
        <SearchField
          query={query}
          onChange={handleSearchChange}
          onClear={() => setQuery("")}
          className="max-w-[15rem] sm:max-w-xs"
        />
      </nav>

      {/* Large screens: links left, logo center, search right */}
      <header className="border-primary/10 relative z-50 hidden border-b bg-white/70 backdrop-blur-lg lg:block">
        <div className="mx-auto grid h-16 max-w-7xl grid-cols-3 items-center px-8 xl:h-[4.25rem] xl:max-w-[90rem] xl:px-12">
          <DesktopNavLinks pathname={pathname} />

          <Link
            href="/"
            className="flex justify-center transition-opacity hover:opacity-80"
          >
            <img
              src="/images/oryx-logo.png"
              alt="ORYX Logo"
              className="h-11 w-auto object-contain brightness-75 contrast-125 xl:h-[3.25rem]"
            />
          </Link>

          <div className="flex justify-end">
            <SearchField
              query={query}
              onChange={handleSearchChange}
              onClear={() => setQuery("")}
              minimal
              className="w-[220px] xl:w-[260px]"
            />
          </div>
        </div>
      </header>

      {/* Tablet: bottom dock */}
      <nav
        aria-label="Main navigation"
        className="border-primary/15 fixed bottom-5 left-1/2 z-[100] hidden -translate-x-1/2 items-center gap-1 rounded-full border bg-white/95 p-1.5 shadow-lg backdrop-blur-md md:flex lg:hidden"
      >
        {tabletNavItems.map((item, index) => (
          <MobileTab
            key={item.href}
            href={item.href}
            name={item.name}
            icon={item.icon}
            isActive={pathname === item.href}
            variant={index === 1 ? "center" : "default"}
          />
        ))}
      </nav>
    </>
  );
}
