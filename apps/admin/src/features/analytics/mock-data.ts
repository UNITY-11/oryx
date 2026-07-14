export interface DailyRevenue {
  date: string;
  revenue: number;
  bookings: number;
}

export interface ServiceCategoryStats {
  name: string;
  value: number;
  fill: string;
}

export interface PeakHourStats {
  hour: string;
  bookings: number;
}

export interface StaffPerformance {
  name: string;
  revenue: number;
  rating: number;
  avatar: string;
}

export const MOCK_REVENUE_DATA: DailyRevenue[] = [
  { date: "Jul 1", revenue: 4500, bookings: 12 },
  { date: "Jul 2", revenue: 5200, bookings: 15 },
  { date: "Jul 3", revenue: 4800, bookings: 14 },
  { date: "Jul 4", revenue: 6100, bookings: 18 },
  { date: "Jul 5", revenue: 5900, bookings: 17 },
  { date: "Jul 6", revenue: 7500, bookings: 22 },
  { date: "Jul 7", revenue: 8200, bookings: 25 },
  { date: "Jul 8", revenue: 6800, bookings: 19 },
  { date: "Jul 9", revenue: 7100, bookings: 20 },
  { date: "Jul 10", revenue: 6400, bookings: 18 },
  { date: "Jul 11", revenue: 8900, bookings: 26 },
  { date: "Jul 12", revenue: 9500, bookings: 28 },
  { date: "Jul 13", revenue: 8100, bookings: 24 },
  { date: "Jul 14", revenue: 10200, bookings: 30 },
];

export const MOCK_CATEGORY_DATA: ServiceCategoryStats[] = [
  { name: "Massage Therapy", value: 45, fill: "#c8a99c" },
  { name: "Facial Treatments", value: 30, fill: "#e3d2cc" },
  { name: "Body Treatments", value: 15, fill: "#a78a7c" },
  { name: "Hair Removal", value: 10, fill: "#8a6d5f" },
];

export const MOCK_PEAK_HOURS: PeakHourStats[] = [
  { hour: "9 AM", bookings: 4 },
  { hour: "10 AM", bookings: 8 },
  { hour: "11 AM", bookings: 12 },
  { hour: "12 PM", bookings: 15 },
  { hour: "1 PM", bookings: 10 },
  { hour: "2 PM", bookings: 8 },
  { hour: "3 PM", bookings: 18 },
  { hour: "4 PM", bookings: 22 },
  { hour: "5 PM", bookings: 28 },
  { hour: "6 PM", bookings: 25 },
  { hour: "7 PM", bookings: 16 },
  { hour: "8 PM", bookings: 6 },
];

export const MOCK_STAFF_PERFORMANCE: StaffPerformance[] = [
  { name: "Sarah J.", revenue: 12500, rating: 4.9, avatar: "https://i.pravatar.cc/150?u=sarah" },
  { name: "Elena M.", revenue: 11200, rating: 4.8, avatar: "https://i.pravatar.cc/150?u=elena" },
  { name: "Maria C.", revenue: 9800, rating: 4.7, avatar: "https://i.pravatar.cc/150?u=maria" },
  { name: "Anna K.", revenue: 8500, rating: 4.9, avatar: "https://i.pravatar.cc/150?u=anna" },
];

export const OVERVIEW_STATS = {
  totalRevenue: "99,200",
  revenueGrowth: "+12.5%",
  totalBookings: "288",
  bookingsGrowth: "+8.2%",
  avgSessionValue: "344",
  topService: "Signature ORYX Massage",
};
