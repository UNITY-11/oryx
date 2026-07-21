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
  { date: "Jul 1", revenue: 8500, bookings: 22 },
  { date: "Jul 2", revenue: 9200, bookings: 25 },
  { date: "Jul 3", revenue: 8800, bookings: 23 },
  { date: "Jul 4", revenue: 11100, bookings: 29 },
  { date: "Jul 5", revenue: 15900, bookings: 42 },
  { date: "Jul 6", revenue: 17500, bookings: 48 },
  { date: "Jul 7", revenue: 14200, bookings: 38 },
  { date: "Jul 8", revenue: 9800, bookings: 26 },
  { date: "Jul 9", revenue: 10100, bookings: 27 },
  { date: "Jul 10", revenue: 9400, bookings: 24 },
  { date: "Jul 11", revenue: 12900, bookings: 35 },
  { date: "Jul 12", revenue: 18500, bookings: 51 },
  { date: "Jul 13", revenue: 19100, bookings: 54 },
  { date: "Jul 14", revenue: 16200, bookings: 45 },
];

export const MOCK_CATEGORY_DATA: ServiceCategoryStats[] = [
  { name: "Moroccan Bath & Hammam", value: 38, fill: "#c8a99c" },
  { name: "Signature Massages", value: 27, fill: "#e3d2cc" },
  { name: "Luxury Facials", value: 20, fill: "#a78a7c" },
  { name: "Nail Spa & Care", value: 15, fill: "#8a6d5f" },
];

export const MOCK_PEAK_HOURS: PeakHourStats[] = [
  { hour: "9 AM", bookings: 8 },
  { hour: "10 AM", bookings: 14 },
  { hour: "11 AM", bookings: 18 },
  { hour: "12 PM", bookings: 22 },
  { hour: "1 PM", bookings: 19 },
  { hour: "2 PM", bookings: 15 },
  { hour: "3 PM", bookings: 25 },
  { hour: "4 PM", bookings: 35 },
  { hour: "5 PM", bookings: 42 },
  { hour: "6 PM", bookings: 48 },
  { hour: "7 PM", bookings: 38 },
  { hour: "8 PM", bookings: 24 },
];

export const MOCK_STAFF_PERFORMANCE: StaffPerformance[] = [
  {
    name: "Fatima A.",
    revenue: 28500,
    rating: 4.9,
    avatar: "https://i.pravatar.cc/150?u=fatima",
  },
  {
    name: "Layla M.",
    revenue: 24200,
    rating: 4.9,
    avatar: "https://i.pravatar.cc/150?u=layla",
  },
  {
    name: "Sarah J.",
    revenue: 21800,
    rating: 4.8,
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Amira K.",
    revenue: 19500,
    rating: 4.7,
    avatar: "https://i.pravatar.cc/150?u=amira",
  },
];

export const OVERVIEW_STATS = {
  totalRevenue: "181,200",
  revenueGrowth: "+18.5%",
  totalBookings: "489",
  bookingsGrowth: "+14.2%",
  avgSessionValue: "370",
  topService: "Royal Moroccan Hammam",
};
