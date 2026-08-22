"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  LayoutDashboard,
  ShoppingBag,
} from "lucide-react";

interface NavLinkProps {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

function NavLink({ href, title, desc, icon }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="group hover:bg-primary/5 hover:border-primary/20 flex items-center gap-4 rounded-2xl border border-transparent bg-gray-50 p-4 transition-all"
    >
      <div className="group-hover:border-primary group-hover:text-primary flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="group-hover:text-primary text-sm font-semibold text-gray-900 transition-colors">
          {title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}

export default function NotFound() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-[32px] border bg-white shadow-sm">
        {/* Background glow for branding effect */}
        <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30 blur-[100px]" />

        <div className="relative z-10 flex h-full w-full max-w-[1400px] items-center justify-center gap-4 overflow-hidden px-4 py-12 md:gap-12">
          {/* Left '4' */}
          <div className="hidden h-full flex-1 items-center justify-end md:flex">
            <svg
              viewBox="0 0 200 300"
              className="text-primary h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-md"
            >
              <path
                d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z"
                fill="currentColor"
              />
            </svg>
          </div>

          {/* Center Card '0' */}
          <div className="border-primary/20 relative z-30 flex w-full max-w-[420px] shrink-0 flex-col justify-center rounded-[32px] border bg-white p-8 shadow-[0_20px_50px_rgba(69,44,30,0.1)] sm:p-10">
            {/* Decorative Arrow (Top Left) */}
            <div className="text-primary absolute -top-8 -left-12 z-20 hidden animate-pulse md:block">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
              >
                <path
                  d="M20 20 L80 80 M80 80 L80 30 M80 80 L30 80"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mb-8 space-y-3 text-center">
              <p className="text-primary text-sm font-semibold tracking-widest uppercase">
                ... 404 error ...
              </p>
              <h1 className="text-primary font-serif text-4xl leading-tight font-bold">
                Sorry, page not found
              </h1>
              <p className="pt-1 text-sm text-gray-500">
                Return to the admin sections
              </p>
            </div>

            <div className="mb-8 space-y-3">
              <NavLink
                href="/"
                title="Dashboard"
                desc="View overall statistics"
                icon={<LayoutDashboard className="h-5 w-5" />}
              />
              <NavLink
                href="/products"
                title="Products"
                desc="Manage your inventory"
                icon={<ShoppingBag className="h-5 w-5" />}
              />
              <NavLink
                href="/company"
                title="Company"
                desc="Business profile details"
                icon={<Building2 className="h-5 w-5" />}
              />
            </div>

            <div className="flex justify-center">
              <Link
                href="/"
                className="group bg-primary hover:bg-primary-dark inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-md transition-all"
              >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
              </Link>
            </div>

            {/* Decorative Arrow (Bottom Right) */}
            <div className="text-primary absolute -right-12 -bottom-8 z-20 hidden animate-pulse md:block">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
              >
                <path
                  d="M80 80 L20 20 M20 20 L20 70 M20 20 L70 20"
                  stroke="currentColor"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Right '4' */}
          <div className="hidden h-full flex-1 items-center justify-start md:flex">
            <svg
              viewBox="0 0 200 300"
              className="text-primary h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-md"
            >
              <path
                d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
