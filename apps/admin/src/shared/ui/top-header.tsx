"use client";

import { Bell, Search, UserCircle2, Menu } from "lucide-react";

export function TopHeader() {
  return (
    <div className="px-4 md:px-8 pt-4 md:pt-8 pb-4">
      <header className="w-full h-20 bg-white/90 backdrop-blur-xl border border-primary/10 rounded-3xl shadow-sm flex items-center justify-between px-6 lg:px-10 shrink-0 z-30">
        <div className="flex items-center space-x-4 flex-1">
          <button className="md:hidden p-2 -ml-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <div className="hidden md:flex relative w-64 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <input
              type="text"
              placeholder="Search bookings, customers..."
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-2.5 pl-11 pr-4 text-sm placeholder:text-primary focus:ring-2 focus:ring-primary outline-none transition-shadow"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 md:space-x-5 shrink-0">
          <button className="relative p-2 text-primary hover:bg-primary/5 rounded-full transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>

          <div className="flex items-center space-x-3 pl-3 md:pl-5 border-l border-primary/10">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-primary-dark">Admin User</span>
              <span className="text-xs text-text-secondary">Manager</span>
            </div>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors">
              <UserCircle2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
