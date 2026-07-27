export interface DailyRevenue {
  date: string;
  fullDate: string;
  revenue: number;
  bookings: number;
}

export interface ServiceCategoryStats {
  name: string;
  value: number;
  count: number;
  color: string;
}

export interface PeakHourStats {
  hour: string;
  bookings: number;
}

export interface TopCustomer {
  name: string;
  phone: string;
  avatar: string | null;
  tier: string;
  bookings: number;
  revenue: number;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalBookings: number;
  avgSessionValue: number;
  topService: string;
  revenueGrowth: number | null;
  bookingsGrowth: number | null;
  avgGrowth: number | null;
}

export interface AnalyticsResponse {
  overview: AnalyticsOverview;
  revenueData: DailyRevenue[];
  categoryData: ServiceCategoryStats[];
  peakHoursData: PeakHourStats[];
  topCustomers: TopCustomer[];
  range: "7d" | "30d" | "1y";
}
