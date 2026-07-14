"use client";

import { Calendar, Users, ShoppingBag, DollarSign, ArrowUpRight } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Bookings", value: "248", change: "+12%", icon: Calendar },
    { label: "Revenue", value: "QAR 12,450", change: "+8%", icon: DollarSign },
    { label: "Active Customers", value: "1,204", change: "+5%", icon: Users },
    { label: "Products Sold", value: "89", change: "-2%", icon: ShoppingBag },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-8 pb-4 md:pb-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          return (
            <div key={i} className="bg-white p-6 rounded-[32px] border border-primary/10 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{stat.change}</span>
                  {isPositive && <ArrowUpRight className="w-4 h-4" />}
                </div>
              </div>
              <h3 className="text-3xl font-serif text-primary-dark mb-1">{stat.value}</h3>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-[32px] border border-primary/10 shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="p-6 md:p-8 border-b border-primary/10 shrink-0">
          <h2 className="font-serif text-2xl font-medium text-primary-dark m-0">Recent Bookings</h2>
        </div>
        
        <div className="overflow-auto scrollbar-hide flex-1">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead className="sticky top-0 bg-[#fcf4f0] z-10">
              <tr className="border-b border-primary/10 text-xs uppercase tracking-wider text-text-secondary">
                <th className="py-4 font-medium pl-6 md:pl-8">Customer</th>
                <th className="py-4 font-medium">Service</th>
                <th className="py-4 font-medium">Date & Time</th>
                <th className="py-4 font-medium">Status</th>
                <th className="py-4 font-medium text-right pr-6 md:pr-8">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {[
                { name: "Sarah Al M.", service: "Signature Massage", date: "Today, 2:30 PM", status: "Confirmed", amount: "QAR 120" },
                { name: "Fatima K.", service: "Gold Facial", date: "Today, 4:00 PM", status: "Pending", amount: "QAR 180" },
                { name: "Jessica R.", service: "Hot Stone Therapy", date: "Tomorrow, 10:00 AM", status: "Confirmed", amount: "QAR 150" },
              ].map((booking, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                  <td className="py-4 font-medium text-primary-dark pl-6 md:pl-8">{booking.name}</td>
                  <td className="py-4 text-text-secondary">{booking.service}</td>
                  <td className="py-4 text-text-secondary">{booking.date}</td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-4 text-right font-medium text-primary-dark pr-6 md:pr-8">{booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
