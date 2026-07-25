"use client";

import { useState } from "react";
import { Lock, Loader2, X } from "lucide-react";

export function ActionPinModal({ 
  onSuccess, 
  onCancel 
}: { 
  onSuccess: () => void; 
  onCancel: () => void; 
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const verifyPin = async (currentPin: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: currentPin }),
      });
      
      if (res.ok) {
        onSuccess();
      } else {
        setError(true);
        setPin("");
      }
    } catch (e) {
      setError(true);
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent backdrop-blur-md p-4">
      <div className={`relative flex flex-col items-center max-w-md w-full bg-white rounded-[2rem] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-100 transition-all duration-300 ${error ? "scale-105 shadow-red-500/10" : ""}`}>
        <button onClick={onCancel} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
        
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          <div className="relative w-20 h-20 bg-gradient-to-br from-primary/5 to-primary/10 text-primary rounded-full flex items-center justify-center border border-primary/20 shadow-inner">
            <Lock className="w-9 h-9" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Authorization</h2>
        <p className="text-gray-500 text-sm text-center mb-8 px-4 leading-relaxed">Please enter your 4-digit administrator PIN to securely confirm this update.</p>
        
        <div className="w-full flex flex-col items-center gap-4">
          <div className="relative flex gap-3 sm:gap-4 justify-center w-full">
            <input
              type="tel"
              autoFocus
              maxLength={4}
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 4) {
                  setPin(val);
                  setError(false);
                  if (val.length === 4) {
                    verifyPin(val);
                  }
                }
              }}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
            />
            {[0, 1, 2, 3].map((index) => {
              const isActive = pin.length === index;
              const isFilled = pin.length > index;
              return (
                <div 
                  key={index} 
                  className={`w-14 h-16 sm:w-16 sm:h-20 flex items-center justify-center rounded-2xl text-4xl font-bold transition-all duration-200 ${
                    error ? 'border-2 border-red-500 bg-red-50 text-red-500 shadow-sm' :
                    isActive ? 'border-2 border-primary bg-white shadow-md scale-105' :
                    isFilled ? 'border-2 border-primary/50 bg-primary/5 text-gray-800' :
                    'border-2 border-gray-100 bg-gray-50/50'
                  }`}
                >
                  {isFilled ? '•' : ''}
                </div>
              );
            })}
          </div>
          
          <div className="h-8 mt-4 flex items-center justify-center w-full">
            {loading && <div className="flex items-center text-primary text-sm font-medium"><Loader2 className="w-4 h-4 animate-spin mr-2" /> Authenticating...</div>}
            {error && <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 px-6 rounded-xl border border-red-100">Incorrect PIN. Please try again.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
