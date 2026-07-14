"use client";

import { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Award, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star
} from "lucide-react";
import { 
  MOCK_REVENUE_DATA, 
  MOCK_CATEGORY_DATA, 
  MOCK_PEAK_HOURS,
  MOCK_STAFF_PERFORMANCE,
  OVERVIEW_STATS,
  ServiceCategoryStats 
} from "@/features/analytics/mock-data";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="flex flex-col h-full bg-[#fcf4f0] space-y-6 pt-4 overflow-y-auto scrollbar-hide pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-serif text-primary-dark">Analytics & Insights</h1>
          <p className="text-text-secondary text-sm mt-1">Comprehensive view of your spa's performance and growth.</p>
        </div>
        <div className="flex bg-white rounded-full p-1 border border-primary/10 shadow-sm self-start">
          <button 
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${timeRange === '7d' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark hover:bg-primary/5'}`}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${timeRange === '30d' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark hover:bg-primary/5'}`}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all ${timeRange === '1y' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark hover:bg-primary/5'}`}
            onClick={() => setTimeRange('1y')}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 shrink-0">
        {/* Total Revenue */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#fcf4f0] flex items-center justify-center border border-primary/20">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              {OVERVIEW_STATS.revenueGrowth}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-3xl font-bold text-primary-dark mt-2">QAR {OVERVIEW_STATS.totalRevenue}</h3>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#fcf4f0] flex items-center justify-center border border-primary/20">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
              {OVERVIEW_STATS.bookingsGrowth}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Total Bookings</p>
            <h3 className="text-3xl font-bold text-primary-dark mt-2">{OVERVIEW_STATS.totalBookings}</h3>
          </div>
        </div>

        {/* Avg Session Value */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#fcf4f0] flex items-center justify-center border border-primary/20">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full">
              <ArrowDownRight className="w-3.5 h-3.5 mr-1" />
              -2.1%
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Avg. Session Value</p>
            <h3 className="text-3xl font-bold text-primary-dark mt-2">QAR {OVERVIEW_STATS.avgSessionValue}</h3>
          </div>
        </div>

        {/* Top Service */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-colors">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 rounded-full bg-[#fcf4f0] flex items-center justify-center border border-primary/20">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Top Service</p>
            <h3 className="text-xl font-bold text-primary-dark mt-2 leading-snug">{OVERVIEW_STATS.topService}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 shrink-0">
        
        {/* Revenue Over Time Chart */}
        <div className="xl:col-span-2 bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold text-primary-dark">Revenue Trend</h3>
            <p className="text-sm text-text-secondary mt-1">Daily revenue generated across all services</p>
          </div>
          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c8a99c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#c8a99c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9e6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#8a6d5f', fontWeight: 500 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#8a6d5f', fontWeight: 500 }} 
                  tickFormatter={(val) => `QAR ${val}`}
                  dx={-10}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: '1px solid rgba(200,169,156,0.3)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px 20px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#4a3f3a', marginBottom: '8px', fontSize: '14px' }}
                  itemStyle={{ color: '#c8a99c', fontWeight: 'bold', fontSize: '16px' }}
                  formatter={(value: number) => [`QAR ${value}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c8a99c" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories Pie Chart */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-xl font-serif font-bold text-primary-dark">Service Categories</h3>
            <p className="text-sm text-text-secondary mt-1">Booking distribution by type</p>
          </div>
          <div className="flex-1 w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_CATEGORY_DATA.map((entry: ServiceCategoryStats, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: '1px solid rgba(200,169,156,0.3)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                  itemStyle={{ color: '#4a3f3a', fontWeight: 'bold', fontSize: '15px' }}
                  formatter={(value: number) => [`${value}%`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-bold text-primary-dark">{OVERVIEW_STATS.totalBookings}</span>
              <span className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">Bookings</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="mt-6 space-y-4">
            {MOCK_CATEGORY_DATA.map((category: ServiceCategoryStats, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-2xl bg-[#fcf4f0]/50 border border-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full shadow-inner" style={{ backgroundColor: category.fill }} />
                  <span className="text-sm font-semibold text-text-secondary">{category.name}</span>
                </div>
                <span className="text-base font-bold text-primary-dark">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours Bar Chart */}
        <div className="xl:col-span-2 bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-serif font-bold text-primary-dark">Peak Booking Hours</h3>
            <p className="text-sm text-text-secondary mt-1">Identify your busiest times of day</p>
          </div>
          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_PEAK_HOURS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0e9e6" />
                <XAxis 
                  dataKey="hour" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#8a6d5f', fontWeight: 500 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 13, fill: '#8a6d5f', fontWeight: 500 }} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#fcf4f0' }}
                  contentStyle={{ borderRadius: '20px', border: '1px solid rgba(200,169,156,0.3)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px 20px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#4a3f3a', marginBottom: '8px', fontSize: '14px' }}
                  itemStyle={{ color: '#c8a99c', fontWeight: 'bold', fontSize: '16px' }}
                  formatter={(value: number) => [`${value} Bookings`, 'Volume']}
                />
                <Bar 
                  dataKey="bookings" 
                  fill="#c8a99c" 
                  radius={[8, 8, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Staff Performance */}
        <div className="bg-white rounded-[32px] p-8 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-serif font-bold text-primary-dark">Top Specialists</h3>
            <p className="text-sm text-text-secondary mt-1">Staff performance by revenue</p>
          </div>
          <div className="flex flex-col space-y-4">
            {MOCK_STAFF_PERFORMANCE.map((staff, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-primary/10 hover:border-primary/30 hover:shadow-sm transition-all bg-white">
                <div className="flex items-center gap-4">
                  <img src={staff.avatar} alt={staff.name} className="w-12 h-12 rounded-full border-2 border-[#fcf4f0] object-cover" />
                  <div>
                    <h4 className="font-bold text-primary-dark text-sm">{staff.name}</h4>
                    <div className="flex items-center text-xs font-semibold text-yellow-500 mt-1">
                      <Star className="w-3.5 h-3.5 fill-yellow-500 mr-1" />
                      {staff.rating}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-text-secondary mb-1">Generated</p>
                  <p className="font-bold text-primary-dark text-sm">QAR {staff.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
