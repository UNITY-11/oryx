import { NextResponse } from "next/server";
import { BOOKINGS_LIST_QUERY } from "@/features/bookings/sanity-queries";
import { SERVICES_LIST_QUERY } from "@/features/services/sanity-queries";
import { sanityClient } from "@/shared/lib/sanity/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [bookings, services] = await Promise.all([
      sanityClient.fetch(BOOKINGS_LIST_QUERY),
      sanityClient.fetch(SERVICES_LIST_QUERY),
    ]);

    // Build a map of service name -> category
    const serviceCategoryMap: Record<string, string> = {};
    services.forEach((s: any) => {
      serviceCategoryMap[s.name] = s.category;
    });

    // 1. Calculate Revenue Data by Date (Last 30 days roughly, or just from all data grouped by date)
    const revenueByDate: Record<
      string,
      { revenue: number; bookings: number; categories: Record<string, number> }
    > = {};
    const categoryCounts: Record<string, number> = {};
    const peakHours: Record<string, number> = {};

    bookings.forEach((booking: any) => {
      const date = booking.date || new Date().toISOString().slice(0, 10);
      if (!revenueByDate[date]) {
        revenueByDate[date] = { revenue: 0, bookings: 0, categories: {} };
      }

      const dayData = revenueByDate[date];
      dayData.revenue += booking.amount || 0;
      dayData.bookings += 1;

      // Group categories
      booking.services?.forEach((svc: any) => {
        const cat = serviceCategoryMap[svc.name] || "Other";
        dayData.categories[cat] = (dayData.categories[cat] || 0) + 1;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      // Group peak hours
      const hour = booking.time ? booking.time.split(":")[0] + ":00" : "12:00";
      peakHours[hour] = (peakHours[hour] || 0) + 1;
    });

    // Convert objects to arrays for charts
    const revenueData = Object.keys(revenueByDate)
      .sort()
      .map((date) => {
        // Format date nicely like "Jul 21"
        const d = new Date(date);
        const formattedDate = d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        const dayData = revenueByDate[date]!;
        return {
          date: formattedDate,
          revenue: dayData.revenue,
          bookings: dayData.bookings,
          categories: dayData.categories,
        };
      });

    const categoryColors: Record<string, string> = {
      Massage: "#9c7c54",
      Facial: "#d1bfae",
      Nails: "#e8dcd0",
      "Body Treatment": "#2c363f",
      Hair: "#5c5c5c",
      Other: "#e5e7eb",
    };

    const categoryData = Object.keys(categoryCounts).map((name) => ({
      name,
      value: categoryCounts[name],
      color: categoryColors[name] || "#9c7c54",
    }));

    const peakHoursData = Object.keys(peakHours)
      .sort()
      .map((time) => ({
        time,
        visitors: peakHours[time],
      }));

    // If there's no data, return some default empty arrays so charts don't break
    return NextResponse.json({
      revenueData: revenueData.length > 0 ? revenueData : [],
      categoryData: categoryData.length > 0 ? categoryData : [],
      peakHoursData: peakHoursData.length > 0 ? peakHoursData : [],
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
