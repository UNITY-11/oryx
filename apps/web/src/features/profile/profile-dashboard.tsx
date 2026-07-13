"use client";

import { useState, useEffect } from "react";
import { useUserStore } from "@/shared/store";
import { UserCircle2, Settings, LogOut, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

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
        <div className="flex-1 px-6 pt-12 pb-32 flex flex-col justify-center bg-[#faf6f3]">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-primary/10 space-y-6">
            <h3 className="font-serif text-2xl text-primary-dark text-center">Login / Register</h3>
            <p className="text-sm text-text-secondary text-center">Enter your details to verify via OTP.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-3 block">Receive OTP Via</label>
                <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
                  <button 
                    type="button"
                    onClick={() => setChannel("WhatsApp")}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${channel === "WhatsApp" ? "bg-primary text-white shadow-sm" : "bg-transparent text-text-secondary"}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${channel === "SMS" ? "bg-primary text-white shadow-sm" : "bg-transparent text-text-secondary"}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-medium mt-6 shadow-md transition-opacity hover:opacity-90">
                Send OTP & Login
              </button>
              <button type="button" onClick={() => setIsLoginMode(false)} className="w-full py-2 text-text-secondary text-sm font-medium mt-2 hover:text-primary">
                Cancel
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center px-6 bg-[#faf6f3]">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
          <UserCircle2 className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-3xl text-primary-dark">Welcome to ORYX</h2>
          <p className="text-text-secondary text-sm mt-3 max-w-[260px] mx-auto leading-relaxed">Log in to view your session history and manage your account.</p>
        </div>
        <button onClick={() => setIsLoginMode(true)} className="w-full py-4 rounded-2xl bg-primary text-white font-medium shadow-md max-w-xs transition-opacity hover:opacity-90">
          Login or Register
        </button>
      </div>
    );
  }

  if (isEditMode) {
    return (
      <div className="flex-1 px-6 pt-12 pb-32 flex flex-col bg-[#faf6f3]">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-primary/10 space-y-6">
          <h3 className="font-serif text-2xl text-primary-dark text-center">Edit Profile</h3>
          
          <form onSubmit={handleEditSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Mobile Number</label>
              <input 
                type="tel" 
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Email ID</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#9a8276] uppercase tracking-wider mb-2 block">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-medium mt-6 shadow-md transition-opacity hover:opacity-90">
              Save Changes
            </button>
            <button type="button" onClick={() => setIsEditMode(false)} className="w-full py-2 text-text-secondary text-sm font-medium mt-2 hover:text-primary">
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#faf6f3] flex flex-col overflow-hidden">
      {/* Premium Header - Fixed */}
      <div className="bg-white px-6 pt-12 pb-8 rounded-b-[40px] shadow-sm border-b border-primary/10 shrink-0 z-10">
        <div className="flex items-center space-x-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
              <UserCircle2 className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute bottom-0 right-0 bg-[#C8A24A] text-white p-1 rounded-full border-2 border-white">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-medium text-primary-dark tracking-tight">{user.name}</h2>
            <p className="text-sm text-text-secondary mt-1">{user.phone}</p>
            {(user.email || user.age) && (
              <p className="text-xs text-text-secondary mt-0.5">
                {user.email} {user.email && user.age && "•"} {user.age ? `${user.age} yrs` : ""}
              </p>
            )}
            <div className="inline-flex items-center mt-3 text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary px-3 py-1.5 rounded-full">
              Verified via {user.channel}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-32 space-y-8">


        {/* Settings Actions */}
        <section>
          <div className="bg-white rounded-[24px] shadow-sm border border-primary/10 overflow-hidden">
            <button onClick={openEditMode} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-b border-gray-100 group">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                  <Settings className="w-5 h-5 text-text-secondary" />
                </div>
                <span className="text-sm font-medium text-text-primary">Account Settings</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300" />
            </button>

            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-5 transition-colors hover:bg-primary/5 group"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center mr-4 group-hover:bg-white transition-colors">
                  <LogOut className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-primary">Log Out</span>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
