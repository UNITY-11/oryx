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
  RefreshCw,
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
      <span className="border-primary/10 bg-primary/5 text-primary-dark flex items-center rounded-full border px-2 py-1 text-[10px] font-bold sm:px-3 sm:py-1.5 sm:text-xs">
        —
      </span>
    );
  }

  const positive = value >= 0;
  return (
    <span
      className={`flex items-center rounded-full border px-2 py-1 text-[10px] font-bold sm:px-3 sm:py-1.5 sm:text-xs ${
        positive
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {positive ? (
        <ArrowUpRight className="mr-0.5 h-3 w-3 sm:mr-1 sm:h-3.5 sm:w-3.5" />
      ) : (
        <ArrowDownRight className="mr-0.5 h-3 w-3 sm:mr-1 sm:h-3.5 sm:w-3.5" />
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
      <div className="text-text-secondary flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading analytics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-red-500">{error}</p>
        <button
          type="button"
          onClick={() => {
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
              .then(setData)
              .catch((err) =>
                setError(
                  err instanceof Error
                    ? err.message
                    : "Failed to load analytics"
                )
              )
              .finally(() => setLoading(false));
          }}
          className="border-primary text-primary hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
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

  const reload = () => {
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
      .then(setData)
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        )
      )
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden pt-4">
      {/* Header */}
      <div className="shrink-0 pb-3 sm:pb-4">
        <header className="border-primary/10 z-30 flex w-full shrink-0 flex-col gap-3 rounded-2xl border bg-white/90 px-3 py-3 shadow-sm backdrop-blur-xl sm:rounded-3xl sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <MobileMenuButton />
            <h1 className="text-primary-dark truncate font-serif text-lg font-medium sm:text-xl md:text-2xl">
              <span className="md:hidden">Analytics</span>
              <span className="hidden md:inline">Analytics & Insights</span>
            </h1>
            {loading && (
              <Loader2 className="text-primary h-4 w-4 shrink-0 animate-spin" />
            )}
          </div>

          <div className="scrollbar-hide -mx-1 flex items-center gap-1 overflow-x-auto px-1">
            <div className="bg-surface border-primary/10 flex shrink-0 rounded-xl border p-0.5 sm:p-1">
              {(["7d", "30d", "1y"] as RangeKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-all sm:px-4 sm:py-2 sm:text-xs ${
                    timeRange === key
                      ? "text-primary-dark bg-white shadow-sm"
                      : "text-text-secondary hover:text-primary-dark hover:bg-primary/5"
                  }`}
                  onClick={() => setTimeRange(key)}
                >
                  <span className="sm:hidden">
                    {key === "7d" ? "7D" : key === "30d" ? "30D" : "1Y"}
                  </span>
                  <span className="hidden sm:inline">
                    {key === "7d"
                      ? "7 Days"
                      : key === "30d"
                        ? "30 Days"
                        : "1 Year"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </header>
      </div>

      <div className="scrollbar-hide min-h-0 flex-1 space-y-4 overflow-y-auto pb-6 sm:space-y-5 sm:pb-8 md:space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {[
            {
              label: "Total Revenue",
              value: `QAR ${totalRevenue.toLocaleString()}`,
              icon: CreditCard,
              growth: overview?.revenueGrowth,
            },
            {
              label: "Total Bookings",
              value: totalBookings.toLocaleString(),
              icon: Users,
              growth: overview?.bookingsGrowth,
            },
            {
              label: "Avg. Session Value",
              value: `QAR ${avgSessionValue.toLocaleString()}`,
              icon: TrendingUp,
              growth: overview?.avgGrowth,
            },
            {
              label: "Top Service",
              value: topService,
              icon: Award,
              growth: null,
              compact: true,
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="border-primary/10 flex flex-col justify-between rounded-2xl border bg-white p-3.5 shadow-sm sm:rounded-[28px] sm:p-5 md:p-6 xl:p-8"
              >
                <div className="mb-3 flex items-start justify-between gap-2 sm:mb-5">
                  <div className="bg-surface border-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border sm:h-11 sm:w-11">
                    <Icon className="text-primary h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  {card.growth !== null && <GrowthBadge value={card.growth} />}
                </div>
                <div className="min-w-0">
                  <p className="text-text-secondary text-[10px] font-semibold tracking-wider uppercase sm:text-xs">
                    {card.label}
                  </p>
                  <h3
                    className={`text-primary-dark mt-1 font-bold ${
                      card.compact
                        ? "line-clamp-2 text-sm leading-snug sm:text-lg md:text-xl"
                        : "truncate text-lg sm:text-2xl md:text-3xl"
                    }`}
                  >
                    {card.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-3">
          {/* Revenue */}
          <div className="border-primary/10 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8 xl:col-span-2">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-primary-dark font-serif text-base font-bold sm:text-lg md:text-xl">
                Revenue Trend
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs sm:text-sm">
                {timeRange === "1y" ? "Monthly" : "Daily"} revenue from
                completed bookings
              </p>
            </div>
            <div className="h-[240px] w-full sm:h-[300px] md:h-[350px]">
              {revenueData.length === 0 || totalRevenue === 0 ? (
                <div className="text-text-secondary flex h-full items-center justify-center text-sm">
                  No revenue in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 8, right: 4, left: 0, bottom: 8 }}
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
                          stopColor="#8f5c45"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8f5c45"
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
                      tick={{ fontSize: 11, fill: "#8a6d5f", fontWeight: 500 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      width={48}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#8a6d5f", fontWeight: 500 }}
                      tickFormatter={(val) =>
                        val >= 1000 ? `${Math.round(val / 1000)}k` : String(val)
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(200,169,156,0.3)",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                        padding: "10px 14px",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [
                        `QAR ${Number(value ?? 0).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8f5c45"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="border-primary/10 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8">
            <div className="mb-2">
              <h3 className="text-primary-dark font-serif text-base font-bold sm:text-lg md:text-xl">
                Service Categories
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs sm:text-sm">
                Booking distribution by type
              </p>
            </div>
            {categoryData.length === 0 ? (
              <div className="text-text-secondary flex flex-1 items-center justify-center py-12 text-sm">
                No category data yet
              </div>
            ) : (
              <>
                <div className="relative mx-auto h-[220px] w-full max-w-[280px] sm:h-[260px] sm:max-w-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius="55%"
                        outerRadius="78%"
                        paddingAngle={6}
                        cornerRadius={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "1px solid rgba(200,169,156,0.3)",
                          padding: "10px 14px",
                          fontSize: "13px",
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
                    <span className="text-primary-dark text-2xl font-bold sm:text-3xl md:text-4xl">
                      {totalBookings}
                    </span>
                    <span className="text-text-secondary mt-0.5 text-[10px] font-bold tracking-widest uppercase sm:text-xs">
                      Bookings
                    </span>
                  </div>
                </div>
                <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
                  {categoryData.map((category, index) => (
                    <div
                      key={index}
                      className="bg-surface/50 border-primary/5 flex items-center justify-between gap-2 rounded-xl border p-2.5 sm:rounded-2xl sm:p-3"
                    >
                      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <div
                          className="h-3 w-3 shrink-0 rounded-full sm:h-4 sm:w-4"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-text-secondary truncate text-xs font-semibold sm:text-sm">
                          {category.name}
                        </span>
                      </div>
                      <span className="text-primary-dark shrink-0 text-xs font-bold sm:text-sm">
                        {category.count} · {category.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Peak hours */}
          <div className="border-primary/10 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8 xl:col-span-2">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-primary-dark font-serif text-base font-bold sm:text-lg md:text-xl">
                Peak Booking Hours
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs sm:text-sm">
                Identify your busiest times of day
              </p>
            </div>
            <div className="h-[240px] w-full sm:h-[300px] md:h-[350px]">
              {peakHoursData.every((h) => h.bookings === 0) ? (
                <div className="text-text-secondary flex h-full items-center justify-center text-sm">
                  No booking times in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={peakHoursData}
                    margin={{ top: 8, right: 4, left: 0, bottom: 8 }}
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
                      tick={{ fontSize: 10, fill: "#8a6d5f", fontWeight: 500 }}
                      dy={8}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      width={28}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#8a6d5f", fontWeight: 500 }}
                    />
                    <Tooltip
                      cursor={{ fill: "#fcf4f0" }}
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid rgba(200,169,156,0.3)",
                        padding: "10px 14px",
                        fontSize: "13px",
                      }}
                      formatter={(value) => [
                        `${value ?? 0} Bookings`,
                        "Volume",
                      ]}
                    />
                    <Bar
                      dataKey="bookings"
                      fill="#8f5c45"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top customers */}
          <div className="border-primary/10 flex flex-col rounded-2xl border bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-6 md:p-8">
            <div className="mb-4 sm:mb-5">
              <h3 className="text-primary-dark font-serif text-base font-bold sm:text-lg md:text-xl">
                Top Customers
              </h3>
              <p className="text-text-secondary mt-0.5 text-xs sm:text-sm">
                Highest spend from completed bookings
              </p>
            </div>
            <div className="flex flex-col space-y-2.5 sm:space-y-3">
              {topCustomers.length === 0 ? (
                <div className="text-text-secondary py-8 text-center text-sm">
                  No customer bookings in this period
                </div>
              ) : (
                topCustomers.map((customer, idx) => (
                  <div
                    key={`${customer.phone || customer.name}-${idx}`}
                    className="border-primary/10 flex items-center justify-between gap-3 rounded-xl border bg-white p-3 sm:rounded-2xl sm:p-4"
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <div className="border-surface bg-primary/5 relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 sm:h-12 sm:w-12">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle2 className="text-primary/40 h-6 w-6" />
                        )}
                        <span className="bg-primary absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white sm:h-5 sm:w-5 sm:text-[10px]">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-primary-dark truncate text-xs font-bold sm:text-sm">
                          {customer.name}
                        </h4>
                        <p className="text-text-secondary mt-0.5 truncate text-[10px] font-medium sm:text-xs">
                          {customer.bookings} booking
                          {customer.bookings === 1 ? "" : "s"}
                          {customer.tier ? ` · ${customer.tier}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-text-secondary mb-0.5 text-[9px] font-semibold tracking-wider uppercase sm:text-[10px]">
                        Spent
                      </p>
                      <p className="text-primary-dark text-xs font-bold sm:text-sm">
                        QAR {customer.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {error && data && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-500">
            <span>{error}</span>
            <button type="button" onClick={reload} className="underline">
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
