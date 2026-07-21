"use client";

import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Settings, ShoppingBag } from "lucide-react";

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
      className="group flex items-center gap-4 rounded-2xl border border-transparent bg-gray-50 hover:bg-primary/5 hover:border-primary/20 p-4 transition-all"
    >
      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 group-hover:border-primary flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-sm">
          {title}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

export default function NotFound() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-primary/10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border bg-white shadow-sm relative items-center justify-center">
        
        {/* Background glow for branding effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] opacity-30 pointer-events-none" />

        <div className="flex items-center justify-center w-full max-w-[1400px] px-4 h-full gap-4 md:gap-12 relative z-10 overflow-hidden py-12">
          
          {/* Left '4' */}
          <div className="hidden md:flex flex-1 items-center justify-end h-full">
            <svg viewBox="0 0 200 300" className="h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-md text-primary">
              <path d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z" fill="currentColor" />
            </svg>
          </div>

          {/* Center Card '0' */}
          <div className="w-full max-w-[420px] bg-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-center relative z-30 shadow-[0_20px_50px_rgba(69,44,30,0.1)] border border-primary/20 shrink-0">
            {/* Decorative Arrow (Top Left) */}
            <div className="hidden md:block absolute -top-8 -left-12 z-20 text-primary animate-pulse">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <path d="M20 20 L80 80 M80 80 L80 30 M80 80 L30 80" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <div className="text-center space-y-3 mb-8">
              <p className="text-sm font-semibold tracking-widest text-primary uppercase">... 404 error ...</p>
              <h1 className="text-4xl font-serif font-bold text-primary leading-tight">
                Sorry, page not found
              </h1>
              <p className="text-sm text-gray-500 pt-1">
                Return to the admin sections
              </p>
            </div>

            <div className="space-y-3 mb-8">
              <NavLink 
                href="/" 
                title="Dashboard" 
                desc="View overall statistics" 
                icon={<LayoutDashboard className="w-5 h-5" />}
              />
              <NavLink 
                href="/products" 
                title="Products" 
                desc="Manage your inventory" 
                icon={<ShoppingBag className="w-5 h-5" />}
              />
              <NavLink 
                href="/settings" 
                title="Settings" 
                desc="Configure the platform" 
                icon={<Settings className="w-5 h-5" />}
              />
            </div>

            <div className="flex justify-center">
              <Link
                href="/"
                className="group inline-flex items-center gap-2 rounded-full bg-primary text-white px-8 py-3 text-sm font-semibold transition-all hover:bg-primary-dark shadow-md"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
              </Link>
            </div>

            {/* Decorative Arrow (Bottom Right) */}
            <div className="hidden md:block absolute -bottom-8 -right-12 z-20 text-primary animate-pulse">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <path d="M80 80 L20 20 M20 20 L20 70 M20 20 L70 20" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Right '4' */}
          <div className="hidden md:flex flex-1 items-center justify-start h-full">
            <svg viewBox="0 0 200 300" className="h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-md text-primary">
              <path d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z" fill="currentColor" />
            </svg>
          </div>

        </div>
      </div>
    </div>
  );
}
