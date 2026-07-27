"use client";

import { useEffect, useState } from "react";
import type { AnalyticsResponse } from "@/features/analytics/types";
import { MobileMenuButton } from "@/shared/ui/sidebar-context";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CreditCard,
  Loader2,
  TrendingUp,
  UserCircle2,
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

type RangeKey = "7d" | "30d" | "1y";

function GrowthBadge({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) {
    return (
      <span className="border-primary/10 bg-primary/5 text-primary-dark flex items-center rounded-full border px-3 py-1.5 text-xs font-bold">
        —
      </span>
    );
  }

  const positive = value >= 0;
  return (
    <span
      className={`flex items-center rounded-full border px-3 py-1.5 text-xs font-bold ${
        positive
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
      ) : (
        <ArrowDownRight className="mr-1 h-3.5 w-3.5" />
      )}
      {positive ? "+" : ""}
      {value}%
    </span>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<RangeKey>("30d");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/analytics?range=${timeRange}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load analytics");
        }
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error(err);
          setError(
            err instanceof Error ? err.message : "Failed to load analytics"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [timeRange]);

  if (loading && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const overview = data?.overview;
  const revenueData = data?.revenueData || [];
  const categoryData = data?.categoryData || [];
  const peakHoursData = data?.peakHoursData || [];
  const topCustomers = data?.topCustomers || [];

  const totalRevenue = overview?.totalRevenue ?? 0;
  const totalBookings = overview?.totalBookings ?? 0;
  const avgSessionValue = overview?.avgSessionValue ?? 0;
  const topService = overview?.topService || "N/A";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-transparent pt-4">
      <div className="shrink-0 pb-4">
        <header className="border-primary/10 z-30 flex h-20 w-full shrink-0 items-center justify-between rounded-3xl border bg-white/90 px-6 shadow-sm backdrop-blur-xl lg:px-10">
          <div className="flex flex-1 items-center space-x-4">
            <MobileMenuButton />
            <div className="min-w-0 md:hidden">
              <h1 className="text-primary truncate font-serif text-lg font-medium">
                Analytics
              </h1>
            </div>
            <div className="hidden md:flex">
              <h1 className="text-primary font-serif text-2xl font-medium">
                Analytics & Insights
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center space-x-3">
            {loading && (
              <Loader2 className="text-primary h-4 w-4 animate-spin" />
            )}
            <div className="bg-surface border-primary/10 flex rounded-xl border p-1">
              {(["7d", "30d", "1y"] as RangeKey[]).map((key) => (
                <button
                  key={key}
                  className={`rounded-lg px-5 py-2 text-xs font-semibold transition-all ${
                    timeRange === key
                      ? "text-primary-dark bg-white shadow-sm"
                      : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"
                  }`}
                  onClick={() => setTimeRange(key)}
                >
                  {key === "7d"
                    ? "7 Days"
                    : key === "30d"
                      ? "30 Days"
                      : "1 Year"}
                </button>
              ))}
            </div>
          </div>
        </header>
      </div>

      <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto rounded-4xl pb-10">
        <div className="grid shrink-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <CreditCard className="text-primary h-6 w-6" />
              </div>
              <GrowthBadge value={overview?.revenueGrowth} />
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

          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <Users className="text-primary h-6 w-6" />
              </div>
              <GrowthBadge value={overview?.bookingsGrowth} />
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

          <div className="border-primary/10 hover:border-primary/30 flex flex-col justify-between rounded-[32px] border bg-white p-8 shadow-sm transition-colors">
            <div className="mb-6 flex items-start justify-between">
              <div className="bg-surface border-primary/20 flex h-12 w-12 items-center justify-center rounded-full border">
                <TrendingUp className="text-primary h-6 w-6" />
              </div>
              <GrowthBadge value={overview?.avgGrowth} />
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
                {topService}
              </h3>
            </div>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm xl:col-span-2">
            <div className="mb-8">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Revenue Trend
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                {timeRange === "1y" ? "Monthly" : "Daily"} revenue from
                completed bookings
              </p>
            </div>
            <div className="min-h-[350px] w-full flex-1">
              {revenueData.length === 0 || totalRevenue === 0 ? (
                <div className="text-text-secondary flex h-full min-h-[350px] items-center justify-center text-sm">
                  No revenue in this period
                </div>
              ) : (
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
                        <stop
                          offset="5%"
                          stopColor="#c8a99c"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#c8a99c"
                          stopOpacity={0}
                        />
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
                      formatter={(value) => [
                        `QAR ${Number(value ?? 0).toLocaleString()}`,
                        "Revenue",
                      ]}
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
              )}
            </div>
          </div>

          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="mb-2">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Service Categories
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Booking distribution by type
              </p>
            </div>
            {categoryData.length === 0 ? (
              <div className="text-text-secondary flex flex-1 items-center justify-center py-16 text-sm">
                No category data yet
              </div>
            ) : (
              <>
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
                        {categoryData.map((entry, index) => (
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
                        formatter={(value, _name, item) => {
                          const count =
                            (item?.payload as { count?: number })?.count ?? 0;
                          return [`${value ?? 0}% (${count})`, "Share"];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-primary-dark text-4xl font-bold">
                      {totalBookings}
                    </span>
                    <span className="text-text-secondary mt-1 text-xs font-bold tracking-widest uppercase">
                      Bookings
                    </span>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {categoryData.map((category, index) => (
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
                        {category.count} · {category.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

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
              {peakHoursData.every((h) => h.bookings === 0) ? (
                <div className="text-text-secondary flex h-full min-h-[350px] items-center justify-center text-sm">
                  No booking times in this period
                </div>
              ) : (
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
                      allowDecimals={false}
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
                      formatter={(value) => [
                        `${value ?? 0} Bookings`,
                        "Volume",
                      ]}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#c8a99c"
                      radius={[8, 8, 0, 0]}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="border-primary/10 flex flex-col rounded-[32px] border bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-primary-dark font-serif text-xl font-bold">
                Top Customers
              </h3>
              <p className="text-text-secondary mt-1 text-sm">
                Highest spend from completed bookings
              </p>
            </div>
            <div className="flex flex-col space-y-4">
              {topCustomers.length === 0 ? (
                <div className="text-text-secondary py-10 text-center text-sm">
                  No customer bookings in this period
                </div>
              ) : (
                topCustomers.map((customer, idx) => (
                  <div
                    key={`${customer.phone || customer.name}-${idx}`}
                    className="border-primary/10 hover:border-primary/30 flex items-center justify-between rounded-2xl border bg-white p-4 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="border-surface bg-primary/5 relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle2 className="text-primary/40 h-7 w-7" />
                        )}
                        <span className="bg-primary absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white">
                          {idx + 1}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-primary-dark text-sm font-bold">
                          {customer.name}
                        </h4>
                        <p className="text-text-secondary mt-0.5 text-xs font-medium">
                          {customer.bookings} booking
                          {customer.bookings === 1 ? "" : "s"}
                          {customer.tier ? ` · ${customer.tier}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-secondary mb-1 text-[10px] font-semibold tracking-wider uppercase">
                        Spent
                      </p>
                      <p className="text-primary-dark text-sm font-bold">
                        QAR {customer.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
