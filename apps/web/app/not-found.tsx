"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface NavLinkProps {
  href: string;
  title: string;
  desc: string;
}

function NavLink({ href, title, desc }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="group hover:bg-primary/5 flex items-center justify-between rounded-2xl bg-gray-50 p-4 transition-colors sm:p-5"
    >
      <div>
        <h3 className="group-hover:text-primary text-lg font-semibold text-gray-900 transition-colors">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-400">{desc}</p>
      </div>
      <div className="group-hover:border-primary group-hover:bg-primary flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all group-hover:text-white">
        <ArrowRight className="h-4 w-4 -rotate-45 transition-transform group-hover:rotate-0" />
      </div>
    </Link>
  );
}

export default function NotFound() {
  return (
    <div className="bg-background absolute inset-0 z-[100] flex min-h-screen items-center justify-center overflow-hidden selection:bg-white/30">
      {/* Background glow for depth */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-60 blur-[120px]" />

      <div className="relative z-10 flex h-full min-h-[600px] w-full max-w-[1400px] items-center justify-center gap-4 overflow-hidden px-4 py-12 md:gap-12">
        {/* Left '4' */}
        <div className="hidden h-full flex-1 items-center justify-end md:flex">
          <svg
            viewBox="0 0 200 300"
            className="h-[50vh] max-h-[400px] min-h-[200px] w-auto text-white drop-shadow-xl"
          >
            <path
              d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z"
              fill="currentColor"
            />
          </svg>
        </div>

        {/* Center Card '0' */}
        <div className="relative z-30 flex w-full max-w-[420px] shrink-0 flex-col justify-center rounded-[32px] bg-white p-8 shadow-[0_20px_60px_rgba(69,44,30,0.1)] sm:p-10">
          {/* Decorative Arrow (Top Left) */}
          <div className="text-primary absolute -top-8 -left-12 z-20 hidden animate-pulse md:block">
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
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
              Go to other sections to learn more about ORYX
            </p>
          </div>

          <div className="space-y-3">
            <NavLink href="/" title="Homepage" desc="Return to the main page" />
            <NavLink
              href="/services"
              title="Services"
              desc="Explore our treatments & offerings"
            />
            {/* Products disabled for now
            <NavLink 
              href="/products" 
              title="Shop" 
              desc="Browse our exclusive products" 
            />
            */}
          </div>

          {/* Decorative Arrow (Bottom Right) */}
          <div className="text-primary absolute -right-12 -bottom-8 z-20 hidden animate-pulse md:block">
            <svg
              width="60"
              height="60"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
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
            className="h-[50vh] max-h-[400px] min-h-[200px] w-auto text-white drop-shadow-xl"
          >
            <path
              d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
