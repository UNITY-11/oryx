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
      className="group flex items-center justify-between rounded-2xl bg-gray-50 hover:bg-primary/5 p-4 sm:p-5 transition-colors"
    >
      <div>
        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-lg">
          {title}
        </h3>
        <p className="text-sm text-gray-400 mt-1">{desc}</p>
      </div>
      <div className="w-8 h-8 rounded-full border border-gray-200 group-hover:border-primary group-hover:bg-primary flex items-center justify-center transition-all group-hover:text-white text-gray-400">
        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform" />
      </div>
    </Link>
  );
}

export default function NotFound() {
  return (
    <div className="absolute inset-0 z-[100] min-h-screen bg-background flex items-center justify-center overflow-hidden selection:bg-white/30">
      
      {/* Background glow for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full blur-[120px] opacity-60 pointer-events-none" />

      <div className="flex items-center justify-center w-full max-w-[1400px] px-4 h-full min-h-[600px] gap-4 md:gap-12 relative z-10 overflow-hidden py-12">
        
        {/* Left '4' */}
        <div className="hidden md:flex flex-1 items-center justify-end h-full">
          <svg viewBox="0 0 200 300" className="h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-xl text-white">
            <path d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z" fill="currentColor" />
          </svg>
        </div>

        {/* Center Card '0' */}
        <div className="w-full max-w-[420px] bg-white rounded-[32px] p-8 sm:p-10 flex flex-col justify-center relative z-30 shadow-[0_20px_60px_rgba(69,44,30,0.1)] shrink-0">
          {/* Decorative Arrow (Top Left) */}
          <div className="hidden md:block absolute -top-8 -left-12 z-20 text-primary animate-pulse">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <path d="M20 20 L80 80 M80 80 L80 30 M80 80 L30 80" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="text-center space-y-3 mb-8">
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">... 404 error ...</p>
            <h1 className="text-4xl font-serif font-bold text-primary leading-tight">
              Sorry, page not found
            </h1>
            <p className="text-sm text-gray-500 pt-1">
              Go to other sections to learn more about ORYX
            </p>
          </div>

          <div className="space-y-3">
            <NavLink 
              href="/" 
              title="Homepage" 
              desc="Return to the main page" 
            />
            <NavLink 
              href="/services" 
              title="Services" 
              desc="Explore our treatments & offerings" 
            />
            <NavLink 
              href="/products" 
              title="Shop" 
              desc="Browse our exclusive products" 
            />
          </div>

          {/* Decorative Arrow (Bottom Right) */}
          <div className="hidden md:block absolute -bottom-8 -right-12 z-20 text-primary animate-pulse">
            <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
              <path d="M80 80 L20 20 M20 20 L20 70 M20 20 L70 20" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Right '4' */}
        <div className="hidden md:flex flex-1 items-center justify-start h-full">
          <svg viewBox="0 0 200 300" className="h-[50vh] max-h-[400px] min-h-[200px] w-auto drop-shadow-xl text-white">
            <path d="M140 0h60v300h-60z M0 0h60v240h-60z M60 180h80v60h-80z" fill="currentColor" />
          </svg>
        </div>

      </div>
    </div>
  );
}
