import { NextResponse } from "next/server";
import { BOOKINGS_LIST_QUERY } from "@/features/bookings/sanity-queries";
import { CUSTOMERS_LIST_QUERY } from "@/features/customers/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

const ANALYTICS_SERVICES_QUERY = `*[_type == "service"]{
  name,
  category,
  "price": coalesce(price, pricingTiers[0].price, 0),
  options[]{ name, price }
}`;

type RangeKey = "7d" | "30d" | "1y";

const RANGE_DAYS: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "1y": 365,
};

const CATEGORY_COLORS: Record<string, string> = {
  Massage: "#c8a99c",
  Facial: "#e3d2cc",
  "Body Treatment": "#a78a7c",
  Hair: "#8a6d5f",
  Nails: "#d4b8a8",
  Package: "#6b5344",
  Other: "#e5e7eb",
};

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseBookingDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatChartDate(dateKey: string, range: RangeKey): string {
  const d = new Date(`${dateKey}T12:00:00`);
  if (range === "1y") {
    return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatHourLabel(time: string | undefined): string {
  if (!time) return "Unknown";
  const [hStr] = time.split(":");
  const h = Number(hStr);
  if (Number.isNaN(h)) return time;
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const suffix = h >= 12 ? "PM" : "AM";
  return `${hour12} ${suffix}`;
}

function growthPct(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function bookingAmount(
  booking: any,
  servicePriceMap: Record<
    string,
    { price: number; options: Record<string, number>; category: string }
  >
): number {
  if (typeof booking.amount === "number" && booking.amount > 0) {
    return booking.amount;
  }

  return (booking.services || []).reduce((sum: number, svc: any) => {
    const catalog = servicePriceMap[svc.name];
    if (!catalog) return sum;
    const optionsTotal = (svc.options || []).reduce(
      (s: number, optName: string) => s + (catalog.options[optName] || 0),
      0
    );
    return sum + catalog.price + optionsTotal;
  }, 0);
}

function summarize(
  bookings: any[],
  servicePriceMap: Record<
    string,
    { price: number; options: Record<string, number>; category: string }
  >
) {
  let revenue = 0;
  let count = 0;
  for (const b of bookings) {
    revenue += bookingAmount(b, servicePriceMap);
    count += 1;
  }
  return { revenue, count };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range");
    const range: RangeKey =
      rangeParam === "7d" || rangeParam === "1y" ? rangeParam : "30d";
    const days = RANGE_DAYS[range];

    const [bookings, services, customers] = await Promise.all([
      sanityClient.fetch(BOOKINGS_LIST_QUERY),
      sanityClient.fetch(ANALYTICS_SERVICES_QUERY),
      sanityClient.fetch(CUSTOMERS_LIST_QUERY),
    ]);

    const servicePriceMap: Record<
      string,
      { price: number; options: Record<string, number>; category: string }
    > = {};
    for (const s of services as any[]) {
      const options: Record<string, number> = {};
      for (const opt of s.options || []) {
        options[opt.name] = opt.price || 0;
      }
      servicePriceMap[s.name] = {
        price: s.price || 0,
        options,
        category: s.category || "Other",
      };
    }

    const customerByPhone: Record<string, any> = {};
    const customerByName: Record<string, any> = {};
    for (const c of customers as any[]) {
      if (c.phone) customerByPhone[String(c.phone).replace(/\s+/g, "")] = c;
      if (c.name) customerByName[String(c.name).toLowerCase().trim()] = c;
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));
    const prevEnd = new Date(rangeStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - (days - 1));

    const rangeStartKey = toDateKey(rangeStart);
    const rangeEndKey = toDateKey(today);
    const prevStartKey = toDateKey(prevStart);
    const prevEndKey = toDateKey(prevEnd);

    // Only finished (Completed) bookings count toward analytics
    const activeBookings = (bookings as any[]).filter(
      (b) => b.status === "Completed"
    );

    const inRange = activeBookings.filter((b) => {
      const key = b.date;
      return key && key >= rangeStartKey && key <= rangeEndKey;
    });

    const inPrev = activeBookings.filter((b) => {
      const key = b.date;
      return key && key >= prevStartKey && key <= prevEndKey;
    });

    const current = summarize(inRange, servicePriceMap);
    const previous = summarize(inPrev, servicePriceMap);
    const avgSessionValue =
      current.count > 0 ? Math.round(current.revenue / current.count) : 0;
    const prevAvg =
      previous.count > 0 ? Math.round(previous.revenue / previous.count) : 0;

    // Daily revenue (fill every day / month bucket for 1y)
    const revenueByDate: Record<string, { revenue: number; bookings: number }> =
      {};

    if (range === "1y") {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        revenueByDate[key] = { revenue: 0, bookings: 0 };
      }
      for (const booking of inRange) {
        const monthKey = String(booking.date).slice(0, 7);
        if (!revenueByDate[monthKey]) {
          revenueByDate[monthKey] = { revenue: 0, bookings: 0 };
        }
        revenueByDate[monthKey].revenue += bookingAmount(
          booking,
          servicePriceMap
        );
        revenueByDate[monthKey].bookings += 1;
      }
    } else {
      for (let i = 0; i < days; i++) {
        const d = new Date(rangeStart);
        d.setDate(rangeStart.getDate() + i);
        revenueByDate[toDateKey(d)] = { revenue: 0, bookings: 0 };
      }
      for (const booking of inRange) {
        const key = booking.date;
        if (!revenueByDate[key]) {
          revenueByDate[key] = { revenue: 0, bookings: 0 };
        }
        revenueByDate[key].revenue += bookingAmount(booking, servicePriceMap);
        revenueByDate[key].bookings += 1;
      }
    }

    const revenueData = Object.keys(revenueByDate)
      .sort()
      .map((key) => {
        const day = revenueByDate[key]!;
        return {
          date:
            range === "1y"
              ? new Date(`${key}-01T12:00:00`).toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })
              : formatChartDate(key, range),
          fullDate: key,
          revenue: Math.round(day.revenue),
          bookings: day.bookings,
        };
      });

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};
    const peakHours: Record<number, number> = {};

    for (const booking of inRange) {
      for (const svc of booking.services || []) {
        const catalog = servicePriceMap[svc.name];
        const cat = catalog?.category || "Other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        if (svc.name) {
          serviceCounts[svc.name] = (serviceCounts[svc.name] || 0) + 1;
        }
      }

      if (booking.time) {
        const h = Number(String(booking.time).split(":")[0]);
        if (!Number.isNaN(h)) {
          peakHours[h] = (peakHours[h] || 0) + 1;
        }
      }
    }

    const totalCategoryBookings = Object.values(categoryCounts).reduce(
      (s, n) => s + n,
      0
    );

    const categoryData = Object.keys(categoryCounts)
      .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0))
      .map((name) => {
        const count = categoryCounts[name] || 0;
        const pct =
          totalCategoryBookings > 0
            ? Math.round((count / totalCategoryBookings) * 1000) / 10
            : 0;
        return {
          name,
          value: pct,
          count,
          color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
        };
      });

    const topServiceEntry = Object.entries(serviceCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    // Peak hours — always show a sensible day window
    const hourKeys =
      Object.keys(peakHours).length > 0
        ? Object.keys(peakHours)
            .map(Number)
            .sort((a, b) => a - b)
        : [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

    const minH = Math.min(...hourKeys, 9);
    const maxH = Math.max(...hourKeys, 20);
    const peakHoursData = [];
    for (let h = minH; h <= maxH; h++) {
      peakHoursData.push({
        hour: formatHourLabel(`${h}:00`),
        bookings: peakHours[h] || 0,
      });
    }

    // Top customers by revenue in range
    const customerAgg: Record<
      string,
      { name: string; phone: string; revenue: number; bookings: number }
    > = {};

    for (const booking of inRange) {
      const phone = String(booking.phone || "").replace(/\s+/g, "");
      const name = String(booking.customerName || "Unknown").trim();
      const key = phone || name.toLowerCase();
      if (!key) continue;

      if (!customerAgg[key]) {
        customerAgg[key] = {
          name,
          phone: booking.phone || "",
          revenue: 0,
          bookings: 0,
        };
      }
      customerAgg[key].revenue += bookingAmount(booking, servicePriceMap);
      customerAgg[key].bookings += 1;
      if (name && name !== "Unknown") customerAgg[key].name = name;
    }

    const topCustomers = Object.values(customerAgg)
      .sort((a, b) => b.revenue - a.revenue || b.bookings - a.bookings)
      .slice(0, 5)
      .map((c) => {
        const match =
          (c.phone && customerByPhone[String(c.phone).replace(/\s+/g, "")]) ||
          customerByName[c.name.toLowerCase().trim()];
        return {
          name: match?.name || c.name,
          phone: match?.phone || c.phone,
          avatar: match?.avatar || null,
          tier: match?.tier || "Bronze",
          bookings: c.bookings,
          revenue: Math.round(c.revenue),
        };
      });

    return NextResponse.json({
      range,
      overview: {
        totalRevenue: Math.round(current.revenue),
        totalBookings: current.count,
        avgSessionValue,
        topService: topServiceEntry?.[0] || "N/A",
        revenueGrowth: growthPct(current.revenue, previous.revenue),
        bookingsGrowth: growthPct(current.count, previous.count),
        avgGrowth: growthPct(avgSessionValue, prevAvg),
      },
      revenueData,
      categoryData,
      peakHoursData,
      topCustomers,
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
