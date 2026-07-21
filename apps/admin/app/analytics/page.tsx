"use client";

import { useEffect, useState } from "react";
import { ServiceCategoryStats } from "@/features/analytics/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  Menu,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  const revenueData = data?.revenueData || [];
  const categoryData = data?.categoryData || [];
  const peakHoursData = data?.peakHoursData || [];

  const totalRevenue = revenueData.reduce(
    (sum: number, item: any) => sum + item.revenue,
    0
  );
  const totalBookings = revenueData.reduce(
    (sum: number, item: any) => sum + item.bookings,
    0
  );
  const avgSessionValue =
    totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;

  // Fake staff data since we don't have staff in Sanity yet
  const mockStaffPerformance = [
    {
      name: "Sarah J.",
      avatar: "https://i.pravatar.cc/150?img=1",
      rating: 4.9,
      revenue: 15200,
    },
    {
      name: "Michael R.",
      avatar: "https://i.pravatar.cc/150?img=33",
      rating: 4.8,
      revenue: 12450,
    },
    {
      name: "Elena V.",
      avatar: "https://i.pravatar.cc/150?img=47",
      rating: 4.9,
      revenue: 11800,
    },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent pt-4">
      {/* Header Bar */}
      <div className="shrink-0 pb-4">
        <header className="border-primary/10 z-30 flex h-20 w-full shrink-0 items-center justify-between rounded-3xl border bg-white/90 px-6 shadow-sm backdrop-blur-xl lg:px-10">
          <div className="flex flex-1 items-center space-x-4">
            <button className="text-primary hover:bg-primary/5 -ml-2 rounded-full p-2 transition-colors md:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden md:flex">
              <h1 className="text-primary font-serif text-2xl font-medium">
                Analytics & Insights
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center space-x-3">
            <div className="bg-surface border-primary/10 flex rounded-xl border p-1">
              <button
                className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${timeRange === "7d" ? "text-primary-dark bg-white shadow-sm" : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"}`}
                onClick={() => setTimeRange("7d")}
              >
                7 Days
              </button>
              <button
                className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${timeRange === "30d" ? "text-primary-dark bg-white shadow-sm" : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"}`}
                onClick={() => setTimeRange("30d")}
              >
                30 Days
              </button>
              <button
                className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${timeRange === "1y" ? "text-primary-dark bg-white shadow-sm" : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"}`}
                onClick={() => setTimeRange("1y")}
              >
                1 Year
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Scrollable Content Wrapper */}
      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto rounded-4xl pb-10">
        {/* Overview Cards */}
        <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {/* Total Revenue */}
          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <CreditCard className="text-primary h-6 w-6" />
              </div>
              <span className="flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                +12%
              </span>
            </div>
            <div>
              <p className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                Total Revenue
              </p>
              <h3 className="text-primary-dark mt-2 text-3xl font-bold">
                QAR {totalRevenue.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <Users className="text-primary h-6 w-6" />
              </div>
              <span className="flex items-center rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700">
                <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
                +8%
              </span>
            </div>
            <div>
              <p className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                Total Bookings
              </p>
              <h3 className="text-primary-dark mt-2 text-3xl font-bold">
                {totalBookings.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Avg Session Value */}
          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
              <span className="flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
                -2.1%
              </span>
            </div>
            <div>
              <p className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                Avg. Session Value
              </p>
              <h3 className="text-primary-dark mt-2 text-3xl font-bold">
                QAR {avgSessionValue.toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Top Service */}
          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <Award className="text-primary h-6 w-6" />
              </div>
            </div>
            <div>
              <p className="text-text-secondary text-sm font-semibold tracking-wider uppercase">
                Top Service
              </p>
              <h3 className="text-primary-dark mt-2 text-xl leading-snug font-bold">
                {categoryData.length > 0
                  ? [...categoryData].sort((a, b) => b.value - a.value)[0].name
                  : "N/A"}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Charts Area */}
        <div className="grid shrink-0 grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Revenue Over Time Chart */}
          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm xl:col-span-2">
            <div className="mb-8">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Revenue Trend
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Daily revenue generated across all services
              </p>
            </div>
            <div className="min-h-[350px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#c8a99c" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#c8a99c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0e9e6"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#8a6d5f", fontWeight: 500 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#8a6d5f", fontWeight: 500 }}
                    tickFormatter={(val) => `QAR ${val}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid rgba(200,169,156,0.3)",
                      boxShadow:
                        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                      padding: "12px 20px",
                    }}
                    labelStyle={{
                      fontWeight: "bold",
                      color: "#4a3f3a",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                    itemStyle={{
                      color: "#c8a99c",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                    formatter={(value: any) => [`QAR ${value}`, "Revenue"]}
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
          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="mb-2">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Service Categories
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Booking distribution by type
              </p>
            </div>
            <div className="relative min-h-[300px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={6}
                    cornerRadius={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid rgba(200,169,156,0.3)",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      padding: "12px 16px",
                    }}
                    itemStyle={{
                      color: "#4a3f3a",
                      fontWeight: "bold",
                      fontSize: "15px",
                    }}
                    formatter={(value: any) => [`${value}%`, "Share"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-primary-dark text-4xl font-bold">
                  {totalBookings}
                </span>
                <span className="text-text-secondary mt-1 text-xs font-bold tracking-widest uppercase">
                  Bookings
                </span>
              </div>
            </div>
            {/* Custom Legend */}
            <div className="mt-6 space-y-4">
              {categoryData.map((category: any, index: number) => (
                <div
                  key={index}
                  className="bg-surface/50 border-primary/5 flex items-center justify-between rounded-2xl border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full shadow-inner"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-text-secondary text-sm font-semibold">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-primary-dark text-base font-bold">
                    {category.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Peak Hours Bar Chart */}
          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm xl:col-span-2">
            <div className="mb-8">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Peak Booking Hours
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Identify your busiest times of day
              </p>
            </div>
            <div className="min-h-[350px] w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakHoursData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0e9e6"
                  />
                  <XAxis
                    dataKey="hour"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#8a6d5f", fontWeight: 500 }}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 13, fill: "#8a6d5f", fontWeight: 500 }}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "#fcf4f0" }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid rgba(200,169,156,0.3)",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      padding: "12px 20px",
                    }}
                    labelStyle={{
                      fontWeight: "bold",
                      color: "#4a3f3a",
                      marginBottom: "8px",
                      fontSize: "14px",
                    }}
                    itemStyle={{
                      color: "#c8a99c",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                    formatter={(value: any) => [`${value} Bookings`, "Volume"]}
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
          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Top Specialists
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Staff performance by revenue
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              {mockStaffPerformance.map((staff, idx) => (
                <div
                  key={idx}
                  className="border-primary/10 hover:border-primary/30 flex items-center justify-between rounded-2xl border bg-white p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="border-surface h-12 w-12 rounded-full border-2 object-cover"
                    />
                    <div>
                      <h4 className="text-primary-dark text-sm font-bold">
                        {staff.name}
                      </h4>
                      <div className="mt-1 flex items-center text-xs font-semibold text-yellow-500">
                        <Star className="mr-1 h-3.5 w-3.5 fill-yellow-500" />
                        {staff.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                      Generated
                    </p>
                    <p className="text-primary-dark text-sm font-bold">
                      QAR {staff.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
