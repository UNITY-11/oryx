"use client";

import { useState } from "react";
import { useUserStore } from "@/shared/store";
import { UserCircle2, Settings, History, LogOut } from "lucide-react";

export function ProfileDashboard() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const logout = useUserStore((state) => state.logout);

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState<"SMS" | "WhatsApp">("WhatsApp");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone) {
      setUser({ id: "u2", name, phone, channel });
      setIsLoginMode(false);
    }
  };

  if (!user) {
    if (isLoginMode) {
      return (
        <div className="flex-1 px-6 pt-12 pb-32 flex flex-col justify-center">
          <div className="bg-white p-6 rounded-3xl shadow-spa space-y-6 border border-gray-100">
            <h3 className="font-serif text-2xl text-primary-dark text-center">Login / Register</h3>
            <p className="text-sm text-text-secondary text-center">Enter your details to verify via OTP.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-text-secondary uppercase mb-2 block">Receive OTP Via</label>
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={() => setChannel("WhatsApp")}
                    className={`flex-1 py-3 rounded-2xl text-sm font-medium border ${channel === "WhatsApp" ? "bg-primary text-white border-primary shadow-md" : "bg-transparent text-text-secondary border-gray-200"}`}
                  >
                    WhatsApp
                  </button>
                  <button 
                    type="button"
                    onClick={() => setChannel("SMS")}
                    className={`flex-1 py-3 rounded-2xl text-sm font-medium border ${channel === "SMS" ? "bg-primary text-white border-primary shadow-md" : "bg-transparent text-text-secondary border-gray-200"}`}
                  >
                    SMS
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-4 rounded-2xl bg-primary text-white font-medium mt-4 shadow-lg shadow-primary/30">
                Send OTP & Login
              </button>
              <button type="button" onClick={() => setIsLoginMode(false)} className="w-full py-2 text-text-secondary text-sm font-medium mt-2">
                Cancel
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center px-6">
        <UserCircle2 className="w-24 h-24 text-gray-200" />
        <div>
          <h2 className="font-serif text-2xl text-primary-dark">Welcome to ORYX</h2>
          <p className="text-text-secondary text-sm mt-2 max-w-xs mx-auto">Log in to view your session history and manage your account.</p>
        </div>
        <button onClick={() => setIsLoginMode(true)} className="w-full py-4 rounded-2xl bg-primary text-white font-medium shadow-lg shadow-primary/30 max-w-xs">
          Login or Register
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 space-y-8 overflow-y-auto pb-32">
      {/* Profile Header */}
      <div className="flex items-center space-x-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-medium text-text-primary">{user.name}</h2>
          <p className="text-sm text-text-secondary">{user.phone}</p>
          <span className="inline-block mt-2 text-[10px] font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Verified via {user.channel}
          </span>
        </div>
      </div>

      {/* Bookings */}
      <section>
        <h3 className="font-serif text-lg text-primary-dark mb-4 flex items-center">
          <History className="w-5 h-5 mr-2" /> Session History
        </h3>
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border-l-4 border-primary shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm text-text-primary">Signature ORYX Massage</h4>
                <p className="text-xs text-text-secondary mt-1">Today, 02:00 PM</p>
              </div>
              <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-md">Upcoming</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 opacity-70">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-sm text-text-primary">Radiance Facial</h4>
                <p className="text-xs text-text-secondary mt-1">Aug 14, 11:30 AM</p>
              </div>
              <span className="text-xs font-medium bg-gray-100 text-gray-500 px-2 py-1 rounded-md">Completed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Actions */}
      <section className="space-y-3">
        <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <span className="flex items-center text-sm font-medium"><Settings className="w-5 h-5 mr-3 text-gray-400" /> Account Settings</span>
        </button>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <span className="flex items-center text-sm font-medium"><LogOut className="w-5 h-5 mr-3" /> Log Out</span>
        </button>
      </section>
    </div>
  );
}
