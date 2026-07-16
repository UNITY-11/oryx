"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUserStore } from "@/shared/store";
import {
  CheckCircle2,
  ChevronRight,
  LogOut,
  Settings,
  UserCircle2,
} from "lucide-react";

export function ProfileDashboard() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      setUser({ id: "u2", name, phone, channel });
      setIsLoginMode(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user && name && phone) {
      setUser({ ...user, name, phone, email, age });
      setIsEditMode(false);
    }
  };

  const openEditMode = () => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setEmail(user.email || "");
      setAge(user.age || "");
      setIsEditMode(true);
    }
  };

  if (!isMounted) {
    return <div className="flex-1 bg-[#faf6f3]" />;
  }

  if (!user) {
    if (isLoginMode) {
      return (
        <div className="flex flex-1 flex-col justify-center bg-[#faf6f3] px-6 pt-12 pb-32">
          <div className="border-primary/10 space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
            <h3 className="text-primary-dark text-center font-serif text-2xl">
              Login / Register
            </h3>
            <p className="text-text-secondary text-center text-sm">
              Enter your details to verify via OTP.
            </p>

            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-3 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                  Receive OTP Via
                </label>
                <div className="flex rounded-xl border border-gray-100 bg-gray-50 p-1">
                  <button
                    type="button"
                    onClick={() => setChannel("WhatsApp")}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${channel === "WhatsApp" ? "bg-primary text-white shadow-sm" : "text-text-secondary bg-transparent"}`}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`flex-1 rounded-lg py-3 text-sm font-medium transition-all ${channel === "SMS" ? "bg-primary text-white shadow-sm" : "text-text-secondary bg-transparent"}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="bg-primary mt-6 w-full rounded-2xl py-4 font-medium text-white shadow-md transition-opacity hover:opacity-90"
              >
                Send OTP & Login
              </button>
              <button
                type="button"
                onClick={() => setIsLoginMode(false)}
                className="text-text-secondary hover:text-primary mt-2 w-full py-2 text-sm font-medium"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-6 bg-[#faf6f3] px-6 text-center">
        <div className="bg-primary/10 mb-2 flex h-24 w-24 items-center justify-center rounded-full">
          <UserCircle2 className="text-primary h-12 w-12" />
        </div>
        <div>
          <h2 className="text-primary-dark font-serif text-3xl">
            Welcome to ORYX
          </h2>
          <p className="text-text-secondary mx-auto mt-3 max-w-[260px] text-sm leading-relaxed">
            Log in to view your session history and manage your account.
          </p>
        </div>
        <button
          onClick={() => setIsLoginMode(true)}
          className="bg-primary w-full max-w-xs rounded-2xl py-4 font-medium text-white shadow-md transition-opacity hover:opacity-90"
        >
          Login or Register
        </button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="flex flex-1 flex-col bg-[#faf6f3] px-6 pt-12 pb-32">
        <div className="border-primary/10 space-y-6 rounded-[32px] border bg-white p-8 shadow-sm">
          <h3 className="text-primary-dark text-center font-serif text-2xl">
            Edit Profile
          </h3>

          <form onSubmit={handleEditSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                Email ID
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-wider text-[#9a8276] uppercase">
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="focus:ring-primary w-full rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3.5 text-sm focus:ring-2 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-primary mt-6 w-full rounded-2xl py-4 font-medium text-white shadow-md transition-opacity hover:opacity-90"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditMode(false)}
              className="text-text-secondary hover:text-primary mt-2 w-full py-2 text-sm font-medium"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#faf6f3]">
      {/* Premium Header - Fixed */}
      <div className="border-primary/10 z-10 shrink-0 rounded-b-[40px] border-b bg-white px-6 pt-12 pb-8 shadow-sm">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="bg-primary/10 border-primary/20 flex h-20 w-20 items-center justify-center rounded-full border-2">
              <span className="text-primary text-4xl font-semibold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="absolute right-0 bottom-0 rounded-full border-2 border-white bg-[#A87434] p-1 text-white">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-primary-dark font-serif text-2xl font-medium tracking-tight">
              {user.name}
            </h2>
            <p className="text-text-secondary mt-1 text-sm">{user.phone}</p>
            {(user.email || user.age) && (
              <p className="text-text-secondary mt-0.5 text-xs">
                {user.email} {user.email && user.age && "•"}{" "}
                {user.age ? `${user.age} yrs` : ""}
              </p>
            )}
            <div className="bg-primary/10 text-primary mt-3 inline-flex items-center rounded-full px-3 py-1.5 text-[10px] font-bold tracking-wider uppercase">
              Verified via {user.channel}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 space-y-8 overflow-y-auto px-6 pt-6 pb-32">
        {/* Settings Actions */}
        <section>
          <div className="border-primary/10 overflow-hidden rounded-[24px] border bg-white shadow-sm">
            <button
              onClick={openEditMode}
              className="group flex w-full items-center justify-between border-b border-gray-100 p-5 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center">
                <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-white">
                  <Settings className="text-text-secondary h-5 w-5" />
                </div>
                <span className="text-text-primary text-sm font-medium">
                  Account Settings
                </span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </button>

            <button
              onClick={logout}
              className="hover:bg-primary/5 group flex w-full items-center justify-between p-5 transition-colors"
            >
              <div className="flex items-center">
                <div className="bg-primary/5 mr-4 flex h-10 w-10 items-center justify-center rounded-full transition-colors group-hover:bg-white">
                  <LogOut className="text-primary h-5 w-5" />
                </div>
                <span className="text-primary text-sm font-medium">
                  Log Out
                </span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
