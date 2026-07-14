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
  ArrowDownRight
} from "lucide-react";
import { 
  MOCK_REVENUE_DATA, 
  MOCK_CATEGORY_DATA, 
  OVERVIEW_STATS,
  ServiceCategoryStats 
} from "@/features/analytics/mock-data";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  const COLORS = ["#c8a99c", "#e3d2cc", "#a78a7c", "#8a6d5f"];

  return (
    <div className="flex flex-col h-full bg-[#fcf4f0] space-y-6 pt-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-primary-dark">Analytics Overview</h1>
          <p className="text-text-secondary text-sm mt-1">Track your spa's performance and bookings.</p>
        </div>
        <div className="flex bg-white rounded-full p-1 border border-primary/10 shadow-sm self-start">
          <button 
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === '7d' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark'}`}
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </button>
          <button 
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === '30d' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark'}`}
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </button>
          <button 
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${timeRange === '1y' ? 'bg-primary text-white shadow-md' : 'text-text-secondary hover:text-primary-dark'}`}
            onClick={() => setTimeRange('1y')}
          >
            1 Year
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-[24px] p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {OVERVIEW_STATS.revenueGrowth}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Revenue</p>
            <h3 className="text-2xl font-bold text-primary-dark mt-1">QAR {OVERVIEW_STATS.totalRevenue}</h3>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-[24px] p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              {OVERVIEW_STATS.bookingsGrowth}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Total Bookings</p>
            <h3 className="text-2xl font-bold text-primary-dark mt-1">{OVERVIEW_STATS.totalBookings}</h3>
          </div>
        </div>

        {/* Avg Session Value */}
        <div className="bg-white rounded-[24px] p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              -2.1%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Avg. Session Value</p>
            <h3 className="text-2xl font-bold text-primary-dark mt-1">QAR {OVERVIEW_STATS.avgSessionValue}</h3>
          </div>
        </div>

        {/* Top Service */}
        <div className="bg-white rounded-[24px] p-6 border border-primary/10 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-secondary">Top Service</p>
            <h3 className="text-lg font-bold text-primary-dark mt-1 leading-tight">{OVERVIEW_STATS.topService}</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        
        {/* Revenue Over Time Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-primary-dark">Revenue Over Time</h3>
            <p className="text-xs text-text-secondary">Daily revenue for the selected period</p>
          </div>
          <div className="flex-1 w-full h-[300px]">
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
                  tick={{ fontSize: 12, fill: '#8a6d5f' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#8a6d5f' }} 
                  tickFormatter={(val) => `QAR ${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(200,169,156,0.2)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#4a3f3a', marginBottom: '4px' }}
                  itemStyle={{ color: '#c8a99c', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#c8a99c" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories Pie Chart */}
        <div className="bg-white rounded-[32px] p-6 border border-primary/10 shadow-sm flex flex-col">
          <div className="mb-2">
            <h3 className="text-lg font-bold text-primary-dark">Services Breakdown</h3>
            <p className="text-xs text-text-secondary">Bookings by category</p>
          </div>
          <div className="flex-1 w-full h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={MOCK_CATEGORY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {MOCK_CATEGORY_DATA.map((entry: ServiceCategoryStats, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid rgba(200,169,156,0.2)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#4a3f3a', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-primary-dark">{OVERVIEW_STATS.totalBookings}</span>
              <span className="text-[10px] text-text-secondary font-medium uppercase tracking-wider">Bookings</span>
            </div>
          </div>
          {/* Custom Legend */}
          <div className="mt-4 space-y-3">
            {MOCK_CATEGORY_DATA.map((category: ServiceCategoryStats, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.fill }} />
                  <span className="text-sm font-medium text-text-secondary">{category.name}</span>
                </div>
                <span className="text-sm font-bold text-primary-dark">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
